import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GITHUB_REPO = 'liva-lang/livac';
const INSTALL_DIR = path.join(os.homedir(), '.liva', 'bin');
const VERSION_FILE = path.join(os.homedir(), '.liva', 'version');

interface ReleaseAsset {
    name: string;
    browser_download_url: string;
}

interface ReleaseInfo {
    tag_name: string;
    assets: ReleaseAsset[];
}

/**
 * Get the artifact name for the current platform
 */
function getArtifactName(): string | null {
    const platform = os.platform();
    const arch = os.arch();

    if (platform === 'linux' && arch === 'x64') {
        return 'livac-linux-x64';
    }
    if (platform === 'darwin' && arch === 'x64') {
        return 'livac-darwin-x64';
    }
    if (platform === 'darwin' && arch === 'arm64') {
        return 'livac-darwin-arm64';
    }
    if (platform === 'win32' && arch === 'x64') {
        return 'livac-windows-x64';
    }

    return null;
}

/**
 * Get the expected binary name for the current platform
 */
function getBinaryName(): string {
    return os.platform() === 'win32' ? 'livac.exe' : 'livac';
}

/**
 * Get the full path where the compiler should be installed
 */
export function getInstalledCompilerPath(): string {
    return path.join(INSTALL_DIR, getBinaryName());
}

/**
 * Check if the compiler is available (either in PATH or installed by us)
 */
export async function findCompiler(): Promise<string | null> {
    // 1. Check user-configured path
    const config = vscode.workspace.getConfiguration('liva');
    const configuredPath = config.get<string>('compiler.path', 'livac');

    if (configuredPath !== 'livac') {
        // User set a custom path — check if it exists
        if (fs.existsSync(configuredPath)) {
            return configuredPath;
        }
    }

    // 2. Check if livac is in PATH
    try {
        const cmd = os.platform() === 'win32' ? 'where livac' : 'which livac';
        const { stdout } = await execAsync(cmd);
        const pathResult = stdout.trim();
        if (pathResult) {
            return pathResult;
        }
    } catch {
        // Not in PATH
    }

    // 3. Check our install directory
    const installedPath = getInstalledCompilerPath();
    if (fs.existsSync(installedPath)) {
        return installedPath;
    }

    return null;
}

/**
 * Get the currently installed version (if installed by us)
 */
export function getInstalledVersion(): string | null {
    try {
        if (fs.existsSync(VERSION_FILE)) {
            return fs.readFileSync(VERSION_FILE, 'utf8').trim();
        }
    } catch {
        // ignore
    }
    return null;
}

/**
 * Fetch the latest release info from GitHub
 */
async function fetchLatestRelease(): Promise<ReleaseInfo> {
    return new Promise((resolve, reject) => {
        const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
        const options = {
            headers: {
                'User-Agent': 'liva-vscode-extension',
                'Accept': 'application/vnd.github.v3+json',
            },
        };

        https.get(url, options, (res) => {
            // Handle redirects
            if (res.statusCode === 301 || res.statusCode === 302) {
                const redirectUrl = res.headers.location;
                if (redirectUrl) {
                    https.get(redirectUrl, options, (redirectRes) => {
                        let data = '';
                        redirectRes.on('data', (chunk) => data += chunk);
                        redirectRes.on('end', () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                reject(new Error(`Failed to parse release info: ${e}`));
                            }
                        });
                    }).on('error', reject);
                    return;
                }
            }

            if (res.statusCode !== 200) {
                reject(new Error(`GitHub API returned status ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse release info: ${e}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Download a file from a URL to a local path, with progress
 */
async function downloadFile(url: string, destPath: string, progress: vscode.Progress<{ message?: string; increment?: number }>): Promise<void> {
    return new Promise((resolve, reject) => {
        const doDownload = (downloadUrl: string) => {
            https.get(downloadUrl, { headers: { 'User-Agent': 'liva-vscode-extension' } }, (res) => {
                // Handle redirects (GitHub uses them for asset downloads)
                if (res.statusCode === 301 || res.statusCode === 302) {
                    const redirectUrl = res.headers.location;
                    if (redirectUrl) {
                        doDownload(redirectUrl);
                        return;
                    }
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`Download failed with status ${res.statusCode}`));
                    return;
                }

                const totalSize = parseInt(res.headers['content-length'] || '0', 10);
                let downloadedSize = 0;

                const dir = path.dirname(destPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const fileStream = fs.createWriteStream(destPath);
                res.on('data', (chunk) => {
                    downloadedSize += chunk.length;
                    if (totalSize > 0) {
                        const pct = Math.round((downloadedSize / totalSize) * 100);
                        progress.report({ message: `Downloading... ${pct}%` });
                    }
                });

                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
                fileStream.on('error', reject);
            }).on('error', reject);
        };

        doDownload(url);
    });
}

/**
 * Extract a .tar.gz file (Unix) or .zip file (Windows)
 */
async function extractArchive(archivePath: string, destDir: string): Promise<void> {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    if (archivePath.endsWith('.tar.gz')) {
        await execAsync(`tar xzf "${archivePath}" -C "${destDir}"`);
    } else if (archivePath.endsWith('.zip')) {
        if (os.platform() === 'win32') {
            await execAsync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${destDir}' -Force"`);
        } else {
            await execAsync(`unzip -o "${archivePath}" -d "${destDir}"`);
        }
    } else {
        throw new Error(`Unknown archive format: ${archivePath}`);
    }
}

/**
 * Install the Liva compiler from GitHub Releases
 */
export async function installCompiler(): Promise<string | null> {
    const artifactName = getArtifactName();
    if (!artifactName) {
        vscode.window.showErrorMessage(
            `Unsupported platform: ${os.platform()} ${os.arch()}. ` +
            `Liva currently supports: Linux x64, macOS x64/ARM64, Windows x64.`
        );
        return null;
    }

    const isWindows = os.platform() === 'win32';
    const ext = isWindows ? '.zip' : '.tar.gz';
    const assetFileName = artifactName + ext;

    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Installing Liva Compiler',
            cancellable: false,
        },
        async (progress) => {
            try {
                // 1. Fetch latest release info
                progress.report({ message: 'Checking latest version...' });
                const release = await fetchLatestRelease();
                const version = release.tag_name;

                // 2. Find the right asset
                const asset = release.assets.find(a => a.name === assetFileName);
                if (!asset) {
                    vscode.window.showErrorMessage(
                        `Could not find ${assetFileName} in release ${version}. ` +
                        `Available assets: ${release.assets.map(a => a.name).join(', ')}`
                    );
                    return null;
                }

                // 3. Download
                const tmpDir = os.tmpdir();
                const archivePath = path.join(tmpDir, assetFileName);
                progress.report({ message: `Downloading ${version}...` });
                await downloadFile(asset.browser_download_url, archivePath, progress);

                // 4. Extract
                progress.report({ message: 'Extracting...' });
                await extractArchive(archivePath, INSTALL_DIR);

                // 5. Make executable (Unix)
                const binaryPath = getInstalledCompilerPath();
                if (!isWindows) {
                    fs.chmodSync(binaryPath, 0o755);
                }

                // 6. Verify it works
                progress.report({ message: 'Verifying installation...' });
                try {
                    await execAsync(`"${binaryPath}" --help`);
                } catch {
                    vscode.window.showErrorMessage('Downloaded compiler binary failed verification.');
                    return null;
                }

                // 7. Save version
                fs.writeFileSync(VERSION_FILE, version, 'utf8');

                // 8. Update VS Code setting to point to installed binary
                const config = vscode.workspace.getConfiguration('liva');
                await config.update('compiler.path', binaryPath, vscode.ConfigurationTarget.Global);

                // 9. Cleanup temp file
                try { fs.unlinkSync(archivePath); } catch { /* ignore */ }

                progress.report({ message: `Liva ${version} installed!` });
                vscode.window.showInformationMessage(`Liva compiler ${version} installed successfully!`);

                return binaryPath;

            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to install Liva compiler: ${error.message}`);
                console.error('[Liva Installer]', error);
                return null;
            }
        }
    );
}

/**
 * Check for updates and install if available
 */
export async function checkForUpdates(): Promise<void> {
    try {
        const release = await fetchLatestRelease();
        const latestVersion = release.tag_name;
        const installedVersion = getInstalledVersion();

        if (installedVersion === latestVersion) {
            vscode.window.showInformationMessage(`Liva compiler is up to date (${latestVersion}).`);
            return;
        }

        const action = installedVersion
            ? `Update from ${installedVersion} to ${latestVersion}?`
            : `Install Liva compiler ${latestVersion}?`;

        const choice = await vscode.window.showInformationMessage(
            action,
            'Install',
            'Later'
        );

        if (choice === 'Install') {
            await installCompiler();
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to check for updates: ${error.message}`);
    }
}

/**
 * Prompt user to install if compiler not found.
 * Returns the resolved compiler path, or null if user declined.
 */
export async function ensureCompilerInstalled(): Promise<string | null> {
    const existing = await findCompiler();
    if (existing) {
        return existing;
    }

    const choice = await vscode.window.showWarningMessage(
        'Liva compiler not found. Install it now to enable full language support (compilation, LSP, formatting)?',
        'Install',
        'Configure Path',
        'Later'
    );

    if (choice === 'Install') {
        return await installCompiler();
    }

    if (choice === 'Configure Path') {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'liva.compiler.path');
        return null;
    }

    return null;
}
