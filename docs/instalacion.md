# Guía de instalación · Bootcamp QA & Automatización

**Knot Academy × Accenture** · tiempo estimado: 20–40 min · hazlo **antes** de la sesión 1 si puedes.

Instala **un solo track**. Si no sabes cuál elegir: si tu proyecto es Java o trabajas en banca, elige **A**. Si quieres velocidad o usas IA a diario, elige **B**.

| | Track A · Java + Selenium | Track B · TypeScript + Playwright |
|---|---|---|
| Lenguaje | Java 17+ (recomendado: 21 LTS) | Node.js 20+ (recomendado: 22 LTS) |
| Build | Maven 3.9+ | npm (viene con Node) |
| Navegador | Google Chrome | Chromium de Playwright (se descarga) |
| IDE | IntelliJ IDEA Community o VS Code + *Extension Pack for Java* | VS Code + *Playwright Test for VSCode* |

**Para los dos:** Git, una cuenta de GitHub y VS Code (o tu IDE).

---

## Paso 0 · Comunes

### macOS

```bash
# Homebrew (si no lo tienes): https://brew.sh
brew install git
brew install --cask visual-studio-code
```

### Windows (PowerShell)

```powershell
winget install --id Git.Git -e
winget install --id Microsoft.VisualStudioCode -e
```

Configura Git una vez:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

---

## Track A · Java + Selenium

### macOS

```bash
brew install --cask temurin@21
brew install maven
brew install --cask google-chrome   # si no lo tienes
```

### Windows

```powershell
winget install --id EclipseAdoptium.Temurin.21.JDK -e
winget install --id Google.Chrome -e
```

**Maven en Windows** (no viene en winget de forma oficial):

1. Descarga el *Binary zip archive* de [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi).
2. Descomprímelo en `C:\tools\apache-maven-3.9.x`.
3. Variables de entorno → *Path* → agrega `C:\tools\apache-maven-3.9.x\bin`.
4. Cierra y abre la terminal.

*Alternativa con Chocolatey:* `choco install maven`

### Verifica

```bash
java -version    # 17 o superior
mvn -v           # 3.9 o superior, y debe mostrar Java 17+
```

### Prueba de humo

```bash
git clone https://github.com/coach1-knotacademy/knot-qa-starter.git
cd knot-qa-starter/java-selenium
mvn test -Dgroups=unit     # la primera vez descarga dependencias (2–5 min)
mvn test -Dgroups=ui       # debe abrir Chrome y pasar
```

---

## Track B · TypeScript + Playwright

### macOS

```bash
brew install node@22
# o con nvm: nvm install 22 && nvm use 22
```

### Windows

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

Si PowerShell bloquea `npx` o `npm` con un error de *execution policy*:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Verifica

```bash
node -v    # v20 o superior
npm -v
```

### Prueba de humo

```bash
git clone https://github.com/coach1-knotacademy/knot-qa-starter.git
cd knot-qa-starter/ts-playwright
npm ci
npx playwright install chromium
npm run test:unit
npm run test:ui
```

Extensión recomendada: **Playwright Test for VSCode** (Microsoft). Permite correr, depurar y grabar pruebas desde el editor.

---

## Verificación automática

Desde la raíz del repo:

```bash
./scripts/verificar-entorno.sh                                      # macOS / Linux
powershell -ExecutionPolicy Bypass -File scripts\verificar-entorno.ps1   # Windows
```

Pega el resultado en el chat del curso si aparece algún 🔴.

---

## Red corporativa (proxy) · el bloqueo más común

Pide a tu equipo de soporte la URL del proxy, por ejemplo `http://proxy.empresa.com:8080`.

**Maven:** crea o edita `~/.m2/settings.xml` (en Windows: `C:\Users\<tu-usuario>\.m2\settings.xml`):

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

**Descarga de navegadores de Playwright:**

```bash
# macOS / Linux
export HTTPS_PROXY=http://proxy.empresa.com:8080
npx playwright install chromium
```

```powershell
# Windows
$env:HTTPS_PROXY="http://proxy.empresa.com:8080"
npx playwright install chromium
```

Si no te dejan descargar navegadores, usa el Chrome instalado: en `playwright.config.ts`, proyecto `ui`, agrega `channel: 'chrome'` dentro de `use`.

**Selenium Manager** (descarga el chromedriver automáticamente) también respeta `HTTPS_PROXY`. Si aun así falla, descarga el chromedriver de tu versión de Chrome desde [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/) y corre con `-Dwebdriver.chrome.driver=/ruta/chromedriver`.

---

## Plan B · sin permisos de instalación: GitHub Codespaces

1. Abre el repo en GitHub → botón **Code** → pestaña **Codespaces** → **Create codespace on main**.
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
| `mvn: command not found` | Maven no está en el PATH | Revisa el paso 3 de Maven en Windows y reabre la terminal |
| `release version 17 not supported` | Maven usa un JDK viejo | `mvn -v` debe mostrar Java 17+; ajusta `JAVA_HOME` |
| `Could not transfer artifact` | Proxy o repositorio bloqueado | Configura `settings.xml` (sección Red corporativa) |
| `SessionNotCreatedException` | Chrome y chromedriver no coinciden | Actualiza Chrome; Selenium Manager descarga el driver correcto |
| `Executable doesn't exist … ms-playwright` | Faltan los navegadores de Playwright | `npx playwright install chromium` |
| `npx: running scripts is disabled` | Execution policy de PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Las pruebas UI fallan por tiempo de espera | Red lenta o VPN | Vuelve a correr; si persiste, avísanos en el chat |
