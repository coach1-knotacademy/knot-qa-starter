# Guía de instalación · Bootcamp QA & Automatización

**Knot Academy × Accenture** · Windows y macOS · entre 20 y 40 minutos. Lo hacemos en los primeros minutos de la sesión 1, mientras avanza la teoría; no hace falta adelantarlo.

Instala **un solo track**. Si tu proyecto es Java o trabajas en banca, elige **A**. Si quieres velocidad o usas IA a diario, elige **B**.

| | Track A · Java + Selenium | Track B · TypeScript + Playwright |
|---|---|---|
| Lenguaje | Java 17 o superior (se instala el 21) | Node.js 20 o superior |
| Build | Maven 3.9 o superior | npm (viene con Node) |
| Navegador | Google Chrome | Chromium de Playwright (se descarga) |
| Editor | IntelliJ IDEA Community o VS Code + *Extension Pack for Java* | VS Code + *Playwright Test for VSCode* |

**Para los dos:** Git y VS Code (o tu editor). La cuenta de GitHub solo hace falta para usar Codespaces y, más adelante, para tu repo propio.

---

## Opción rápida · instalador automático

Instala solo lo que te falta, y al final corre una prueba de humo para confirmar que quedó bien.

### Windows (PowerShell)

Abre **PowerShell** (no hace falta que sea como administrador) y copia estos comandos uno por uno:

```powershell
winget install --id Git.Git -e --source winget
```

Cierra y abre PowerShell para que reconozca `git`. Luego:

```powershell
mkdir $HOME\dev -Force
cd $HOME\dev
git clone https://github.com/coach1-knotacademy/knot-qa-starter.git
cd knot-qa-starter
powershell -ExecutionPolicy Bypass -File scripts\instalar-entorno.ps1
```

El instalador te pregunta el track. Windows puede pedirte confirmar como administrador para Java, Node o Chrome. Al terminar, **cierra y abre la terminal**.

¿No tienes `winget`? Instala *Instalador de aplicación* desde Microsoft Store o sigue la [instalación manual](#windows-instalación-manual). Sin permisos de instalación, ve directo al [plan B](#plan-b--sin-permisos-de-instalación-github-codespaces).

### macOS (Terminal)

Necesitas [Homebrew](https://brew.sh).

```bash
brew install git
mkdir -p ~/dev && cd ~/dev
git clone https://github.com/coach1-knotacademy/knot-qa-starter.git
cd knot-qa-starter
./scripts/instalar-entorno.sh
```

---

## Antes de seguir en Windows

- **Terminal.** Todos los comandos de esta guía funcionan en PowerShell, que es la terminal por defecto de VS Code en Windows. Ábrela en VS Code con *Terminal → New Terminal*.
- **`&&` no funciona en Windows PowerShell 5.1.** Si un ejemplo trae varios comandos, córrelos en líneas separadas o únelos con `;`.
- **Clona fuera de OneDrive.** Si el Escritorio o Documentos están sincronizados, OneDrive puede bloquear archivos mientras corren las pruebas. Usa `$HOME\dev`, como en el ejemplo.
- **Después de instalar, abre una terminal nueva.** Las terminales abiertas no ven los programas recién instalados. En VS Code, cierra la ventana completa.

---

## Windows · instalación manual

Si prefieres no usar el instalador, o quieres ver cada paso.

### Comunes

```powershell
winget install --id Git.Git -e --source winget
winget install --id Microsoft.VisualStudioCode -e --source winget
```

### Track A · Java + Selenium

```powershell
winget install --id EclipseAdoptium.Temurin.21.JDK -e --source winget
winget install --id Google.Chrome -e --source winget
```

**Maven** no está en winget. Se instala en tu carpeta de usuario, sin permisos de administrador:

1. Descarga `apache-maven-3.9.16-bin.zip` desde [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi).
2. Descomprímelo en `C:\Users\<tu-usuario>\tools\`.
3. Agrégalo al `Path` de tu usuario:

   ```powershell
   $bin = "$HOME\tools\apache-maven-3.9.16\bin"
   [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ";$bin", 'User')
   ```

4. Cierra y abre la terminal.

Verifica:

```powershell
java -version    # 17 o superior
mvn -v           # 3.9 o superior, y debe mostrar Java 17 o superior
```

### Track B · TypeScript + Playwright

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget
```

Verifica, en una terminal nueva:

```powershell
node -v    # v20 o superior
npm -v
```

**Sin `winget` o sin permisos de administrador**, instala Node solo para tu usuario:

```powershell
$v = (Invoke-RestMethod https://nodejs.org/dist/index.json | Where-Object { $_.lts } | Select-Object -First 1).version
$zip = "$env:TEMP\node.zip"
Invoke-WebRequest "https://nodejs.org/dist/$v/node-$v-win-x64.zip" -OutFile $zip -UseBasicParsing
Expand-Archive $zip "$HOME\tools" -Force
$bin = "$HOME\tools\node-$v-win-x64"
[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ";$bin", 'User')
$env:Path += ";$bin"
node -v
```

Si PowerShell responde *"la ejecución de scripts está deshabilitada"*:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Si tu empresa no permite cambiarla, usa `npm.cmd` y `npx.cmd` en lugar de `npm` y `npx`. Por ejemplo: `npm.cmd run test:unit`.

---

## macOS · instalación manual

### Comunes

```bash
brew install git
brew install --cask visual-studio-code
```

### Track A · Java + Selenium

```bash
brew install --cask temurin@21
brew install maven
brew install --cask google-chrome   # si no lo tienes
```

### Track B · TypeScript + Playwright

```bash
brew install node@22
brew link --overwrite --force node@22
```

El `brew link` es necesario: sin él, Homebrew instala `node@22` pero el comando `node` no queda disponible.

---

## Configura Git (Windows y macOS, una sola vez)

El instalador te lo pregunta si falta. Se usa en cada commit:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

---

## Prueba de humo

Los comandos son iguales en Windows y macOS. El instalador ya corre la capa unitaria; aquí puedes probar también la UI.

**Track A:**

```bash
cd knot-qa-starter/java-selenium
mvn test -Dgroups=unit     # la primera vez descarga dependencias (2–5 min)
mvn test -Dgroups=ui       # debe abrir Chrome y pasar
```

**Track B:**

```bash
cd knot-qa-starter/ts-playwright
npm ci
npx playwright install chromium
npm run test:unit
npm run test:ui
```

Extensión recomendada para el track B: **Playwright Test for VSCode** (Microsoft). Permite correr, depurar y grabar pruebas desde el editor.

---

## Verificación automática

Desde la raíz del repo:

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\verificar-entorno.ps1
```

```bash
# macOS / Linux
./scripts/verificar-entorno.sh
```

Si aparece `[FALTA]` o 🔴, pega el resultado en el chat del curso.

---

## Red corporativa (proxy) · el bloqueo más común

Pide a tu equipo de soporte la URL del proxy, por ejemplo `http://proxy.empresa.com:8080`.

**Maven:** crea o edita `settings.xml` en `C:\Users\<tu-usuario>\.m2\` (Windows) o `~/.m2/` (macOS):

```xml
<settings>
  <proxies>
    <proxy>
      <id>corp</id>
      <active>true</active>
      <protocol>https</protocol>
      <host>proxy.empresa.com</host>
      <port>8080</port>
      <nonProxyHosts>localhost|127.0.0.1</nonProxyHosts>
    </proxy>
  </proxies>
</settings>
```

**npm:**

```bash
npm config set proxy http://proxy.empresa.com:8080
npm config set https-proxy http://proxy.empresa.com:8080
```

**Descarga de navegadores de Playwright y del instalador:**

```powershell
# Windows, solo para esta terminal
$env:HTTPS_PROXY = "http://proxy.empresa.com:8080"
npx playwright install chromium

# Windows, permanente para tu usuario (abre una terminal nueva después)
[Environment]::SetEnvironmentVariable('HTTPS_PROXY', 'http://proxy.empresa.com:8080', 'User')
```

```bash
# macOS / Linux
export HTTPS_PROXY=http://proxy.empresa.com:8080
npx playwright install chromium
```

Si no te dejan descargar navegadores, usa el Chrome instalado: en `playwright.config.ts`, proyecto `ui`, agrega `channel: 'chrome'` dentro de `use`.

**Selenium Manager** (descarga el chromedriver automáticamente) también respeta `HTTPS_PROXY`. Si aun así falla, descarga el chromedriver de tu versión de Chrome desde [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/) y córrelo con la ruta entre comillas. Las comillas son necesarias en PowerShell porque el nombre de la propiedad lleva puntos:

```powershell
mvn test -Dgroups=ui "-Dwebdriver.chrome.driver=C:\ruta\chromedriver.exe"
```

**Errores de certificado** (`PKIX path building failed`, `SELF_SIGNED_CERT_IN_CHAIN`, `UNABLE_TO_VERIFY_LEAF_SIGNATURE`): tu empresa inspecciona el tráfico con un certificado propio. Pide a soporte el certificado raíz y:

```powershell
# Maven y Java: en una terminal como administrador
keytool -importcert -alias empresa -file C:\ruta\certificado.cer -cacerts -storepass changeit -noprompt

# npm y Playwright: permanente para tu usuario
[Environment]::SetEnvironmentVariable('NODE_EXTRA_CA_CERTS', 'C:\ruta\certificado.pem', 'User')
```

No desactives la validación de certificados (`strict-ssl false`) para salir del paso. Si no se resuelve en 5 minutos, usa Codespaces.

---

## Plan B · sin permisos de instalación: GitHub Codespaces

Funciona igual desde Windows o macOS, porque todo corre en el navegador. Necesitas una cuenta de GitHub.

1. Abre el [repo en GitHub](https://github.com/coach1-knotacademy/knot-qa-starter) → botón **Code** → pestaña **Codespaces** → **Create codespace on main**.
2. Espera de 3 a 5 minutos: el contenedor instala Java 21, Maven, Node 22 y Chromium.
3. En la terminal del Codespace:

```bash
cd java-selenium && mvn test -Dheadless=true
# o
cd ts-playwright && npm test
```

Las cuentas personales de GitHub incluyen horas gratuitas de Codespaces al mes, suficientes para el bootcamp si apagas el Codespace al terminar.

---

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `'mvn' no se reconoce…` / `mvn: command not found` | Maven no está en el PATH, o la terminal es anterior a la instalación | Abre una terminal nueva. Si sigue, corre el instalador de nuevo o revisa el paso 3 de Maven |
| `'npm' no se reconoce…` / `El término 'npm' no se reconoce` | Node no está instalado, o la terminal es anterior a la instalación | `winget install --id OpenJS.NodeJS.LTS -e --source winget` y abre una terminal nueva. Sin permisos: instalación para tu usuario, en *Windows · instalación manual* |
| `'java' no se reconoce…` | Java no está en el PATH | Abre una terminal nueva; si sigue, reinstala con `winget install --id EclipseAdoptium.Temurin.21.JDK -e` |
| `JAVA_HOME environment variable is not defined correctly` | `JAVA_HOME` apunta a un JDK que ya no existe | Corrígela en *Variables de entorno* o bórrala: Maven usará el `java` del PATH |
| `release version 17 not supported` | Maven usa un JDK viejo | `mvn -v` debe mostrar Java 17 o superior; ajusta `JAVA_HOME` |
| `The token '&&' is not a valid statement separator` | Windows PowerShell 5.1 no acepta `&&` | Corre los comandos en líneas separadas o únelos con `;` |
| `la ejecución de scripts está deshabilitada` (`running scripts is disabled`) | Política de ejecución de PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, o usa `npm.cmd` y `npx.cmd` |
| `Unknown lifecycle phase ".chrome.driver=…"` o parecido | PowerShell partió un `-D` con puntos | Pon el argumento entre comillas: `"-Dwebdriver.chrome.driver=…"` |
| `winget` no se reconoce | Falta *Instalador de aplicación* | Instálalo desde Microsoft Store o sigue la instalación manual |
| `Filename too long` al clonar | Límite de rutas largas en Windows | `git config --global core.longpaths true` y clona en `$HOME\dev` |
| `EPERM` o `EBUSY` en `npm ci` | OneDrive o el antivirus tienen archivos bloqueados | Clona fuera de OneDrive, cierra VS Code y reintenta |
| Windows pide permisos de administrador y no los tienes | Política de la empresa | Usa [Codespaces](#plan-b--sin-permisos-de-instalación-github-codespaces) |
| `Could not transfer artifact` | Proxy o repositorio bloqueado | Configura `settings.xml` (sección Red corporativa) |
| `PKIX path building failed`, `SELF_SIGNED_CERT_IN_CHAIN` | La empresa inspecciona el tráfico | Sección Red corporativa → Errores de certificado |
| `SessionNotCreatedException` | Chrome y chromedriver no coinciden | Actualiza Chrome; Selenium Manager descarga el driver correcto |
| `Executable doesn't exist … ms-playwright` | Faltan los navegadores de Playwright | `npx playwright install chromium` |
| `Could not read package.json` / no encuentra `pom.xml` | Estás en la raíz del repo | `cd ts-playwright` o `cd java-selenium` |
| `playwright` no se reconoce | Faltó `npm ci` | Córrelo dentro de `ts-playwright` |
| Las pruebas UI fallan por tiempo de espera | Red lenta o VPN | Vuelve a correr; si persiste, avísanos en el chat |
