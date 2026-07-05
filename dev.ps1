# OneFrame NAS 开发脚本
# 用法: .\dev.ps1
# 自动更新 sample-manifest.json 并启动 Docker 开发环境

Write-Host "Generating sample-manifest.json..." -ForegroundColor Cyan

$files = Get-ChildItem "src/renderer/Sample/*_compressed*"
$samples = @{}
foreach ($f in $files) {
  if ($f.Name -match '^(\d+)-Type([A-Z])-sample_compressed') {
    $id = $matches[1]; $type = "Type$($matches[2])"
    if (-not $samples[$type]) { $samples[$type] = @() }
    $samples[$type] += $id
  }
}
@{ version = 1; generated = (Get-Date -Format 'yyyy-MM-dd'); samples = $samples } |
  ConvertTo-Json -Depth 3 | Set-Content "src/renderer/sample-manifest.json" -Encoding UTF8

Write-Host "Manifest updated ($($files.Count) files)" -ForegroundColor Green

Write-Host "Starting Docker dev environment..." -ForegroundColor Cyan
docker compose up --build -d