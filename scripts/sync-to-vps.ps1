param(
    [string]$LocalRoot = 'C:\dev\ORI-OS-PROJECTS\ORI-OS2.0',
    [string]$RemoteHost = 'orios-vps',
    [string]$RemoteRoot = '/opt/orios-app'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$stage = Join-Path $env:TEMP 'orios-sync-stage'
$archive = Join-Path $env:TEMP 'orios-sync.tar.gz'
$includeDirs = @(
    'apps',
    'packages',
    'scripts'
)
$includeFiles = @(
    '.dockerignore',
    '.env.example',
    '.npmrc',
    '.nvmrc',
    'Caddyfile',
    'docker-compose.dev.yml',
    'docker-compose.host-nginx.yml',
    'docker-compose.prod.remote-sync.yml',
    'docker-compose.prod.yml',
    'docker-compose.yml',
    'Dockerfile.api',
    'Dockerfile.web',
    'Dockerfile.worker',
    'eslint.config.mjs',
    'package-lock.json',
    'package.json',
    'README.md',
    'tsconfig.base.json',
    'turbo.json'
)

Write-Host "Preparing staging copy from $LocalRoot..."
Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $archive -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $stage | Out-Null

Write-Host "Copying production source roots into a clean staging area..."
foreach ($dir in $includeDirs) {
    $sourceDir = Join-Path $LocalRoot $dir
    if (Test-Path $sourceDir) {
        $targetDir = Join-Path $stage $dir
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        $robocopyArgs = @(
            $sourceDir,
            $targetDir,
            '/E',
            '/XD',
            'node_modules',
            '.next',
            '.turbo',
            'coverage',
            'dist',
            '.vscode',
            '/XF',
            '.env',
            '.env.*',
            '*.log',
            '*.tmp',
            '*.cache',
            '/NFL',
            '/NDL',
            '/NJH',
            '/NJS',
            '/NP'
        )
        & robocopy @robocopyArgs | Out-Null
        if ($LASTEXITCODE -ge 8) {
            throw "Robocopy failed while copying $dir with exit code $LASTEXITCODE"
        }
    }
}

foreach ($file in $includeFiles) {
    $sourceFile = Join-Path $LocalRoot $file
    if (Test-Path $sourceFile) {
        Copy-Item $sourceFile (Join-Path $stage $file) -Force
    }
}

Write-Host "Creating transfer archive..."
tar -czf $archive -C $stage .

Write-Host "Uploading archive to VPS..."
scp $archive "${RemoteHost}:/tmp/orios-sync.tar.gz"

Write-Host "Extracting on VPS and running host-nginx deploy..."
ssh $RemoteHost "mkdir -p $RemoteRoot && tar -xzf /tmp/orios-sync.tar.gz -C $RemoteRoot && rm -f /tmp/orios-sync.tar.gz && cd $RemoteRoot && bash ./scripts/deploy-host-nginx.sh"

Write-Host "Sync and deploy finished."
