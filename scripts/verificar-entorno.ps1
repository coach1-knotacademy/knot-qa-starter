# Verifica el entorno para el Bootcamp QA (Windows PowerShell). No instala nada.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\verificar-entorno.ps1
function Check($name, $cmd, $min) {
  try {
    $out = (& cmd /c "$cmd 2>&1") -join " "
    if ($LASTEXITCODE -ne 0 -and -not $out) { throw "x" }
    $m = [regex]::Match($out, '\d+(\.\d+)+')
    if (-not $m.Success) { throw "x" }
    $major = [int]($m.Value.Split('.')[0])
    if ($min -and $major -lt $min) { Write-Host "🟡 $name $($m.Value) (se necesita $min+)" }
    else { Write-Host "🟢 $name $($m.Value)" }
  } catch { Write-Host "🔴 $name no encontrado" }
}
Write-Host "== Común =="
Check "Git" "git --version" $null
Write-Host "== Track A · Java + Selenium =="
Check "Java" "java -version" 17
Check "Maven" "mvn -v" 3
$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ }
if ($chrome) { Write-Host "🟢 Chrome" } else { Write-Host "🟡 Chrome no encontrado (Selenium Manager intentará descargarlo)" }
Write-Host "== Track B · TypeScript + Playwright =="
Check "Node" "node -v" 20
Check "npm" "npm -v" $null
Write-Host "== Red =="
foreach ($u in @("https://repo.maven.apache.org/maven2/", "https://registry.npmjs.org/", "https://www.saucedemo.com", "https://dummyjson.com/products/1")) {
  try { Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 8 | Out-Null; Write-Host "🟢 $u" } catch { Write-Host "🔴 $u (¿proxy?)" }
}
if ($env:HTTPS_PROXY) { Write-Host "ℹ️  Proxy detectado: $env:HTTPS_PROXY" }
Write-Host ""
Write-Host "Con que uno de los dos tracks esté en 🟢 es suficiente. Pega este resultado en el chat si ves 🔴."
