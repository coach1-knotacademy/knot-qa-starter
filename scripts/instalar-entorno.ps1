# Instala el entorno del Bootcamp QA en Windows 10/11. Solo instala lo que falta.
#
# Uso, desde la raiz del repo:
#   powershell -ExecutionPolicy Bypass -File scripts\instalar-entorno.ps1
#
# Opciones:
#   -Track java | playwright | ambos   Evita la pregunta inicial
#   -SinProyecto                       No prepara el proyecto ni corre la prueba de humo
#   -Simular                           Muestra lo que haria, sin instalar nada
#
# Este archivo es solo ASCII a proposito: Windows PowerShell 5.1 lee como ANSI los
# archivos sin BOM, y los bytes de un emoji pueden convertirse en comillas y romper
# el script. No le agregues tildes ni emojis.
[CmdletBinding()]
param(
  [ValidateSet('', 'java', 'playwright', 'ambos')][string]$Track = '',
  [switch]$SinProyecto,
  [switch]$Simular
)

$MavenVersion = '3.9.16'
$ProgressPreference = 'SilentlyContinue'   # sin esto, las descargas son muy lentas en PowerShell 5.1
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

$script:Pendientes = New-Object System.Collections.ArrayList

function Write-Ok($t)    { Write-Host "[OK]    $t" -ForegroundColor Green }
function Write-Aviso($t) { Write-Host "[AVISO] $t" -ForegroundColor Yellow }
function Write-Falta($t) { Write-Host "[FALTA] $t" -ForegroundColor Red; [void]$script:Pendientes.Add($t) }
function Write-Paso($t)  { Write-Host ""; Write-Host "== $t ==" -ForegroundColor Cyan }

function Update-SessionPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($machine -or $user) { $env:Path = (@($machine, $user) | Where-Object { $_ }) -join ';' }
}

function Get-MajorVersion($Comando) {
  # La version se pide por cmd porque java escribe en stderr. Devuelve $null si no esta.
  try {
    $salida = (& cmd /c "$Comando 2>&1") -join ' '
    $m = [regex]::Match($salida, '\d+(\.\d+)+')
    if ($m.Success) { return [int]($m.Value.Split('.')[0]) }
  } catch { }
  return $null
}

function Install-Paquete($Nombre, $Id) {
  if ($Simular) { Write-Host "        (simulado) winget install --id $Id -e"; return }
  Write-Host "        Instalando $Nombre. Windows puede pedir confirmacion de administrador."
  & winget install --id $Id -e --source winget --accept-source-agreements --accept-package-agreements
  $codigo = $LASTEXITCODE
  Update-SessionPath
  # -1978335189: no hay actualizacion aplicable. -1978335135: ya estaba instalado.
  if ($codigo -ne 0 -and $codigo -ne -1978335189 -and $codigo -ne -1978335135) {
    Write-Aviso "winget termino con el codigo $codigo al instalar $Nombre."
  }
}

function Confirm-Comando($Nombre, $Id, $VersionCmd, $Minimo) {
  $major = Get-MajorVersion $VersionCmd
  if ($major -and (-not $Minimo -or $major -ge $Minimo)) { Write-Ok "$Nombre ya esta instalado (version $major)"; return }
  if ($major) { Write-Aviso "$Nombre $major es muy antiguo: se necesita $Minimo o superior." }
  Install-Paquete $Nombre $Id
  if ($Simular) { return }
  $major = Get-MajorVersion $VersionCmd
  if ($major -and (-not $Minimo -or $major -ge $Minimo)) { Write-Ok "$Nombre instalado (version $major)" }
  else { Write-Falta "$Nombre no quedo disponible. Cierra y abre la terminal, y corre este script de nuevo." }
}

function Install-Maven {
  $major = Get-MajorVersion 'mvn -v'
  if ($major -ge 3) { Write-Ok "Maven ya esta instalado (version $major)"; return }
  $destino = Join-Path $env:USERPROFILE 'tools'
  $bin = Join-Path $destino "apache-maven-$MavenVersion\bin"
  $base = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
  if ($Simular) { Write-Host "        (simulado) descargar $base y agregar $bin al PATH del usuario"; return }

  # winget no trae Maven: se descarga de Apache, en la carpeta del usuario, sin pedir administrador.
  if (-not (Test-Path $bin)) {
    Write-Host "        Descargando Maven $MavenVersion de Apache..."
    $zip = Join-Path ([IO.Path]::GetTempPath()) "apache-maven-$MavenVersion-bin.zip"
    try {
      Invoke-WebRequest -Uri $base -OutFile $zip -UseBasicParsing -ErrorAction Stop
      # Se guarda en archivo: en PowerShell 5.1, .Content puede devolver bytes segun el tipo de contenido.
      Invoke-WebRequest -Uri "$base.sha512" -OutFile "$zip.sha512" -UseBasicParsing -ErrorAction Stop
      $esperado = (Get-Content -Path "$zip.sha512" -Raw).Trim().Split(' ')[0]
      $real = (Get-FileHash -Path $zip -Algorithm SHA512).Hash
      if ($esperado -ine $real) { throw "el archivo descargado no coincide con su checksum SHA-512" }
      New-Item -ItemType Directory -Force -Path $destino | Out-Null
      Expand-Archive -Path $zip -DestinationPath $destino -Force
    } catch {
      Write-Falta "No se pudo instalar Maven: $($_.Exception.Message). Si estas detras de un proxy, ve a 'Red corporativa' en docs\instalacion.md."
      return
    } finally {
      Remove-Item $zip, "$zip.sha512" -Force -ErrorAction SilentlyContinue
    }
  }

  $sep = [IO.Path]::PathSeparator
  $pathUsuario = [Environment]::GetEnvironmentVariable('Path', 'User')
  if (-not (($pathUsuario -split $sep) -contains $bin)) {
    $nuevo = (@($pathUsuario, $bin) | Where-Object { $_ }) -join $sep
    [Environment]::SetEnvironmentVariable('Path', $nuevo, 'User')
  }
  if (-not (($env:Path -split $sep) -contains $bin)) { $env:Path = "$bin$sep$env:Path" }

  $major = Get-MajorVersion 'mvn -v'
  if ($major -ge 3) { Write-Ok "Maven $MavenVersion instalado en $destino" }
  else { Write-Falta "Maven quedo en $bin, pero no responde. Revisa que Java este instalado." }
}

function Confirm-Chrome {
  $rutas = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
  )
  if ($rutas | Where-Object { Test-Path $_ }) { Write-Ok 'Google Chrome ya esta instalado'; return }
  Install-Paquete 'Google Chrome' 'Google.Chrome'
  if ($Simular) { return }
  if ($rutas | Where-Object { Test-Path $_ }) { Write-Ok 'Google Chrome instalado' }
  else { Write-Aviso 'No encontre Chrome. Selenium Manager intentara descargar uno al correr las pruebas de UI.' }
}

function Get-Herramienta($Nombre) {
  # npm.cmd y npx.cmd funcionan aunque la politica de ejecucion bloquee npm.ps1.
  $cmdFile = Get-Command "$Nombre.cmd" -ErrorAction SilentlyContinue
  if ($cmdFile) { return $cmdFile.Source }
  return $Nombre
}

function Invoke-Paso($Descripcion, [scriptblock]$Accion) {
  Write-Host "        $Descripcion"
  & $Accion | Out-Host   # sin Out-Host, la salida del comando se mezclaria con el valor que devuelve la funcion
  if ($LASTEXITCODE -eq 0) { Write-Ok $Descripcion; return $true }
  Write-Falta "$Descripcion (codigo $LASTEXITCODE)"
  return $false
}

Write-Host ''
Write-Host 'Bootcamp QA y Automatizacion: instalador para Windows' -ForegroundColor Cyan

if (-not $Track) {
  Write-Host ''
  Write-Host 'Que track vas a usar?'
  Write-Host '  1) Java + Selenium'
  Write-Host '  2) TypeScript + Playwright'
  Write-Host '  3) Los dos'
  $opcion = Read-Host 'Escribe 1, 2 o 3'
  switch ($opcion.Trim()) {
    '1' { $Track = 'java' }
    '2' { $Track = 'playwright' }
    '3' { $Track = 'ambos' }
    default { Write-Host 'Opcion no valida. Corre el script de nuevo.' -ForegroundColor Red; exit 2 }
  }
}

if (-not (Get-Command winget -ErrorAction SilentlyContinue) -and -not $Simular) {
  Write-Host ''
  Write-Host '[FALTA] Este equipo no tiene winget.' -ForegroundColor Red
  Write-Host '        1. Instala "Instalador de aplicacion" (App Installer) desde Microsoft Store y corre este script de nuevo.'
  Write-Host '        2. Si tu empresa lo bloquea, sigue la instalacion manual de docs\instalacion.md.'
  Write-Host '        3. Si tampoco puedes instalar programas, usa GitHub Codespaces (plan B de la guia).'
  exit 1
}

Write-Paso 'Comunes'
Confirm-Comando 'Git' 'Git.Git' 'git --version' $null
if (Get-Command code -ErrorAction SilentlyContinue) { Write-Ok 'VS Code ya esta instalado' }
else { Install-Paquete 'Visual Studio Code' 'Microsoft.VisualStudioCode' }

if ($Track -in @('java', 'ambos')) {
  Write-Paso 'Track A: Java + Selenium'
  Confirm-Comando 'Java' 'EclipseAdoptium.Temurin.21.JDK' 'java -version' 17
  Install-Maven
  Confirm-Chrome
}
if ($Track -in @('playwright', 'ambos')) {
  Write-Paso 'Track B: TypeScript + Playwright'
  Confirm-Comando 'Node.js' 'OpenJS.NodeJS.LTS' 'node -v' 20
}

if (-not $Simular -and (Get-Command git -ErrorAction SilentlyContinue) -and -not (& git config --global user.name)) {
  Write-Paso 'Identidad de Git (se usa en cada commit)'
  try {
    $nombre = Read-Host 'Tu nombre'
    $correo = Read-Host 'Tu correo'
    if ($nombre) { & git config --global user.name $nombre }
    if ($correo) { & git config --global user.email $correo }
  } catch { Write-Aviso 'Configurala despues con: git config --global user.name "Tu Nombre"' }
}

$raiz = Split-Path $PSScriptRoot -Parent
if ($raiz -match 'OneDrive') {
  Write-Aviso 'El repo esta dentro de OneDrive. La sincronizacion puede bloquear archivos: mejor clonalo en una carpeta como $HOME\dev.'
}

if (-not $SinProyecto -and -not $Simular -and $script:Pendientes.Count -eq 0) {
  if ($Track -in @('java', 'ambos') -and (Test-Path (Join-Path $raiz 'java-selenium\pom.xml'))) {
    Write-Paso 'Prueba de humo: Java (la primera vez tarda de 2 a 5 minutos)'
    Push-Location (Join-Path $raiz 'java-selenium')
    $mvn = Get-Herramienta 'mvn'
    [void](Invoke-Paso 'mvn test -Dgroups=unit' { & $mvn -q test -Dgroups=unit })
    Pop-Location
  }
  if ($Track -in @('playwright', 'ambos') -and (Test-Path (Join-Path $raiz 'ts-playwright\package.json'))) {
    Write-Paso 'Prueba de humo: Playwright'
    Push-Location (Join-Path $raiz 'ts-playwright')
    $npm = Get-Herramienta 'npm'
    $npx = Get-Herramienta 'npx'
    if (Invoke-Paso 'npm ci' { & $npm ci --no-audit --no-fund }) {
      if (Invoke-Paso 'npx playwright install chromium' { & $npx playwright install chromium }) {
        [void](Invoke-Paso 'npm run test:unit' { & $npm run test:unit })
      }
    }
    Pop-Location
  }
}

Write-Paso 'Resultado'
if ($Simular) {
  Write-Host 'Simulacion terminada: no se instalo nada.'
  exit 0
}
if ($script:Pendientes.Count -gt 0) {
  Write-Host 'Quedo pendiente:' -ForegroundColor Red
  $script:Pendientes | ForEach-Object { Write-Host "  - $_" }
  Write-Host ''
  Write-Host 'Pega este resultado en el chat del curso. Si no se resuelve en 5 minutos, usa Codespaces.'
  exit 1
}
Write-Host 'Listo.' -ForegroundColor Green
Write-Host 'Cierra esta terminal y abre una nueva para que tome los programas instalados. Despues corre:'
Write-Host '  powershell -ExecutionPolicy Bypass -File scripts\verificar-entorno.ps1'
exit 0
