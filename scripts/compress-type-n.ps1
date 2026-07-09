# Compress Type N sample images to ~100KB
$files = Get-ChildItem "src/renderer/Sample/*TypeN*compressed*"
foreach ($f in $files) {
    ffmpeg -i $f.FullName -vf "scale=1200:-1" -q:v 10 -y $f.FullName 2>$null
    $size = [math]::Round((Get-Item $f.FullName).Length / 1024, 1)
    Write-Host "$($f.Name): ${size}KB"
}