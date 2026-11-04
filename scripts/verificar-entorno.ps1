# Verifica el entorno del Bootcamp QA en Windows. No instala nada.
# Uso, desde la raiz del repo:
#   powershell -ExecutionPolicy Bypass -File scripts\verificar-entorno.ps1
#
# Este archivo es solo ASCII a proposito: Windows PowerShell 5.1 lee como ANSI los
# archivos sin BOM, y los bytes de un emoji pueden convertirse en comillas y romper
# el script. No le agregues tildes ni emojis.
$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

function Write-Ok($t)    { Write-Host "[OK]    $t" -ForegroundColor Green }
function Write-Aviso($t) { Write-Host "[AVISO] $t" -ForegroundColor Yellow }
function Write-Falta($t) { Write-Host "[FALTA] $t" -ForegroundColor Red }

function Get-Salida($Comando) {
  # Se pide por cmd porque java escribe la version en stderr.
  try { return (& cmd /c "$Comando 2>&1") -join ' ' } catch { return '' }
}

function Test-Version($Nombre, $Comando, $Minimo) {
  $salida = Get-Salida $Comando
  $m = [regex]::Match($salida, '\d+(\.\d+)+')
  if (-not $m.Success) { Write-Falta "$Nombre no encontrado"; return }
  $major = [int]($m.Value.Split('.')[0])
  if ($Minimo -and $major -lt $Minimo) { Write-Aviso "$Nombre $($m.Value) (se necesita $Minimo o superior)" }
  else { Write-Ok "$Nombre $($m.Value)" }
}

Write-Host '== Comun =='
Test-Version 'Git' 'git --version' $null

Write-Host '== Track A: Java + Selenium =='
Test-Version 'Java' 'java -version' 17
$salidaMaven = Get-Salida 'mvn -v'
if ($salidaMaven -match 'JAVA_HOME') {
  Write-Falta "Maven no arranca: JAVA_HOME apunta a una carpeta incorrecta ($env:JAVA_HOME)"
} else {
  Test-Version 'Maven' 'mvn -v' 3
  $javaDeMaven = [regex]::Match($salidaMaven, 'Java version: (\d+)')
  if ($javaDeMaven.Success -and [int]$javaDeMaven.Groups[1].Value -lt 17) {
    Write-Aviso "Maven usa Java $($javaDeMaven.Groups[1].Value): se necesita 17 o superior. Ajusta JAVA_HOME."
  }
}
$chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ }
if ($chrome) { Write-Ok 'Chrome' } else { Write-Aviso 'Chrome no encontrado (Selenium Manager intentara descargarlo)' }

Write-Host '== Track B: TypeScript + Playwright =='
Test-Version 'Node' 'node -v' 20
Test-Version 'npm' 'npm -v' $null

Write-Host '== Windows =='
$politica = Get-ExecutionPolicy
if ($politica -in @('Restricted', 'AllSigned', 'Undefined')) {
  Write-Aviso "La politica de ejecucion es $politica: npm y npx pueden fallar en PowerShell. Solucion: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned"
} else { Write-Ok "Politica de ejecucion: $politica" }
if ((Get-Location).Path -match 'OneDrive') {
  Write-Aviso 'El repo esta dentro de OneDrive. La sincronizacion puede bloquear archivos: mejor clonalo en una carpeta como $HOME\dev.'
}

Write-Host '== Red =='
foreach ($u in @(
  'https://github.com',
  'https://repo.maven.apache.org/maven2/',
  'https://registry.npmjs.org/',
  'https://cdn.playwright.dev/',
  'https://www.saucedemo.com',
  'https://dummyjson.com/products/1'
)) {
  try {
    Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop | Out-Null
    Write-Ok $u
  } catch {
    # Si el servidor respondio, aunque sea con un error HTTP, hay conexion.
    if ($_.Exception.Response) { Write-Ok $u } else { Write-Falta "$u (revisa el proxy)" }
  }
}
if ($env:HTTPS_PROXY) { Write-Host "Proxy detectado: $env:HTTPS_PROXY" }

Write-Host ''
Write-Host 'Basta con que uno de los dos tracks este en [OK]. Si ves [FALTA], pega este resultado en el chat del curso.'
