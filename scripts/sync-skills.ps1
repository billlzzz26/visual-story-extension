# Sync skills from .agents/skills/ to all AI agent directories
# Run: .\scripts\sync-skills.ps1
#
# Source of truth: .agents/skills/
# Targets:
#   .qwen/skills/     — Qwen Code
#   .claude/skills/   — Claude Code
#   skills/           — Gemini CLI (auto-discover)
#   .kilo/skills/     — Kilo Code
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root '.agents\skills'
$targets = @(
    @{ path = (Join-Path $root '.qwen\skills');     type = 'skills' },
    @{ path = (Join-Path $root '.claude\skills');   type = 'skills' },
    @{ path = (Join-Path $root 'skills');           type = 'skills' }
)

Write-Host "Syncing skills from agents/skills/ to all agent directories..." -ForegroundColor Cyan

foreach ($target in $targets) {
    if (-not (Test-Path $target.path)) {
        New-Item -ItemType Directory -Path $target.path -Force | Out-Null
    }

    Get-ChildItem -Path $source | ForEach-Object {
        $dest = Join-Path $target.path $_.Name
        if (Test-Path $dest) {
            # Try to remove, ignore errors if permission denied
            Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue
            if (Test-Path $dest) {
                Write-Host "  ⚠️ Skipped $($_.Name) (permission issue - update manually)" -ForegroundColor Yellow
                return
            }
        }
        Copy-Item -Path $_.FullName -Destination $target.path -Recurse -Force
        Write-Host "  -> $($target.path)/$($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`nDone! Skills synced from .agents/skills/ to all agent directories." -ForegroundColor Cyan
