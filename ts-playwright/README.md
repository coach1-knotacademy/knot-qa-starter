# knot-qa-starter-ts · Playwright + TypeScript

Proyecto inicial para la **Sesión 1 del Bootcamp QA: "Pirámide de pruebas y estrategia alineada al SDLC"**.

## Qué es esto

Un proyecto pequeño y plano que prueba **la misma regla de negocio en las tres capas de la pirámide de pruebas**, para comparar velocidad, costo y tipo de retroalimentación de cada una:

| Capa | Archivo | Contra qué prueba |
|------|---------|-------------------|
| Unitaria | `tests/unit/price-calculator.spec.ts` | La función `src/price-calculator.ts`, sin red ni navegador |
| API | `tests/api/dummyjson.spec.ts` | La API pública [DummyJSON](https://dummyjson.com) (fixture `request`) |
| UI | `tests/ui/saucedemo.spec.ts` | La tienda de demo [SauceDemo](https://www.saucedemo.com) en Chromium |

**La regla de negocio** (`src/price-calculator.ts`):

- `subtotal(items)` = Σ precio × cantidad, redondeado a 2 decimales (half-up). Lista vacía → 0.
- `tax(items)` = subtotal × 8 % (igual que SauceDemo), redondeado a 2 decimales (half-up).
- `total(items)` = subtotal + impuesto.
- Cantidad menor a 1 → error. Precio negativo → error. Precio 0 sí se permite.
- Internamente se calcula en **centavos enteros** para evitar errores de punto flotante.

La calculadora funciona como **oráculo**: las pruebas de API y de UI no tienen los valores esperados quemados, los calculan con ella. Por eso, si alguien daña la regla, lo notan varias capas.

> Existe un proyecto gemelo en Java + Selenium con el mismo contrato (mismas reglas, mismos casos), para comparar herramientas.

```
ts-playwright/
├── src/
│   └── price-calculator.ts        # regla de negocio (el "oráculo")
├── tests/
│   ├── unit/price-calculator.spec.ts
│   ├── api/dummyjson.spec.ts
│   └── ui/saucedemo.spec.ts
├── playwright.config.ts           # 3 proyectos: unit, api, ui
├── tsconfig.json
├── package.json / package-lock.json
└── README.md
```

## Requisitos

- **Node.js 20 o superior** (verifiquen con `node -v`).
- **Git**.
- **VS Code** con la extensión **"Playwright Test for VSCode"** (recomendada: permite correr y depurar pruebas desde el editor).
- Conexión a internet (las pruebas de API y UI usan sitios públicos).

## Instalación

```bash
# 1. Instalar dependencias (usa exactamente las versiones de package-lock.json)
npm ci
#    (si npm ci falla, usen: npm install)

# 2. Descargar el navegador Chromium que usa Playwright
npx playwright install chromium

#    En Linux o GitHub Codespaces instalen también las dependencias del sistema:
npx playwright install --with-deps chromium

# 3. Verificar que todo compila
npm run typecheck
```

Versión probada: **@playwright/test 1.63.0** con Node 22.

## Cómo correr por capa

| Comando | Qué hace |
|---------|----------|
| `npm test` | Corre las tres capas (14 pruebas) |
| `npm run test:unit` | Solo unitarias (no abre navegador) |
| `npm run test:api` | Solo API (DummyJSON) |
| `npm run test:ui` | Solo UI, en modo headless (sin ventana) |
| `npm run test:headed` | UI viendo el navegador |
| `npm run test:ui-mode` | Abre el **UI Mode** de Playwright (interfaz interactiva) |
| `npm run report` | Abre el último reporte HTML |
| `npm run codegen` | Graba acciones en SauceDemo y genera código |
| `npm run typecheck` | Revisa tipos de TypeScript sin ejecutar pruebas |

También se puede filtrar por etiqueta: `npx playwright test --grep @api` (etiquetas: `@unit`, `@api`, `@ui`).

**Tiempos de referencia** (medidos en un MacBook con Apple Silicon, Node 22, red de oficina; el tiempo es el que reporta Playwright al final):

| Capa | # pruebas | Tiempo aprox. | Por prueba |
|------|-----------|---------------|------------|
| Unitaria | 7 | ~1 s | milisegundos (2–10 ms) |
| API | 4 | ~2.5–3.5 s | ~0.4–0.8 s |
| UI | 3 | ~4–5 s | ~0.7–1.3 s |
| Todo (`npm test`, en paralelo) | 14 | ~4–10 s | — |

Sumen 1–2 s de arranque de Node/Playwright al tiempo total del comando. En sus máquinas los números van a variar; lo importante es la **proporción** entre capas. Imaginen esa proporción con 2.000 pruebas en lugar de 14.

## Tabla para registrar tiempos

Anoten **sus** resultados en [`retos/S01.md`](../retos/S01.md) (Lab 1), con este formato:

| Capa | # tests | Tiempo | ¿Qué detecta? |
|------|---------|--------|---------------|
| Unitaria | | | |
| API | | | |
| UI | | | |

## Lab "Siembra un bug"

Objetivo: ver qué capa detecta un error en la regla de negocio, y qué tan rápido.

1. Abran `src/price-calculator.ts` y busquen la función `redondearCentavos` (está marcada con `LAB "Siembra un bug"`).
2. Cambien `Math.round` por `Math.floor` en esa única línea:
   ```ts
   return Math.floor(centavos); // <-- LÍNEA DEL LAB
   ```
   Con esto, el impuesto de 29.99 pasa de **$2.40** (correcto: 239.92 centavos → 240) a **$2.39** (bug: 239.92 → 239).
3. Corran las tres capas por separado y anoten qué falla y cuánto tarda:
   ```bash
   npm run test:unit
   npm run test:api
   npm run test:ui
   ```
4. **Resultado esperado** (lo verificamos al preparar el proyecto):

   | Capa | Resultado | Detalle |
   |------|-----------|---------|
   | Unitaria | **3 fallan**, 4 pasan (~1 s) | `Expected: 2.4 / Received: 2.39`, `3.2 / 3.19` y la frontera `0.01 / 0` |
   | API | **Las 4 pasan** | El bug pasa sin ser detectado |
   | UI | **1 falla** (checkout), 2 pasan (~10 s) | `Expected: "Tax: $2.39" / Received: "Tax: $2.40"` |

   Noten que la prueba de UI que falla tarda **~6 s** en vez de ~1 s: Playwright reintenta la aserción hasta agotar el timeout (5 s) antes de declararla fallida. Fallar en UI también es caro.

5. **Para discutir:**
   - ¿Por qué la capa de API **no** detecta el bug? (Pista: la API de DummyJSON no calcula impuesto; solo se valida el subtotal, y ahí `Math.floor` sobre centavos enteros no cambia nada.) Una prueba que pasa no significa que no haya bugs: significa que **esa** prueba no cubre **ese** riesgo.
   - ¿Qué capa da el mensaje más claro para encontrar la causa?
   - ¿Qué pasaría si las expectativas de UI estuvieran quemadas (`'Tax: $2.40'`) en lugar de venir de la calculadora?
6. **Reviertan el cambio** (`Math.floor` → `Math.round`) y confirmen que `npm test` vuelve a quedar en verde.

## Herramientas que aceleran

- **UI Mode** (`npm run test:ui-mode`): lista de pruebas, modo *watch*, línea de tiempo y DOM de cada paso. Ideal para depurar.
- **Codegen** (`npm run codegen`): graba lo que hacen en el navegador y genera el código de la prueba. Sirve para descubrir localizadores rápido; el código generado se revisa y se limpia, no se pega tal cual.
- **Trace Viewer**: en la config, `trace: 'on-first-retry'` guarda un *trace* cuando una prueba se reintenta (en CI). Para generarlo en local: `npx playwright test --project=ui --trace on` y luego `npm run report` (o `npx playwright show-trace <archivo.zip>`).
- **Asistentes de IA**: Playwright se integra bien con asistentes de IA a través de **Playwright MCP**, que les permite navegar páginas y proponer pruebas o localizadores. Ayuda mucho a ir más rápido, pero **el oráculo y las aserciones siguen siendo criterio del tester**: qué se valida, contra qué valor esperado y por qué.

## Deuda técnica intencional

Este proyecto es plano a propósito para que la Sesión 1 se enfoque en la pirámide, no en arquitectura. Lo vamos a refactorizar en las sesiones 3 a 6:

- **Localizadores dentro de las pruebas**: cada prueba de UI repite `getByTestId('username')`, etc. → los llevaremos a Page Objects (POM).
- **Configuración mínima**: sin ambientes (dev/qa), sin variables de entorno ni timeouts ajustados.
- **Sin fixtures personalizados**: el login se repite en cada prueba → fixture o `storageState`.
- **Sin capa de datos**: usuarios, contraseñas y datos del comprador están escritos en las pruebas → archivos de datos / *builders*.

## Problemas comunes

**Proxy corporativo**

```bash
# npm
npm config set proxy http://usuario:clave@proxy.empresa.com:8080
npm config set https-proxy http://usuario:clave@proxy.empresa.com:8080

# Descarga de navegadores de Playwright (macOS/Linux)
export HTTPS_PROXY=http://usuario:clave@proxy.empresa.com:8080
npx playwright install chromium

# Windows PowerShell
$env:HTTPS_PROXY="http://usuario:clave@proxy.empresa.com:8080"
npx playwright install chromium
```

**No tengo permiso para descargar navegadores**

Usen el Google Chrome que ya tienen instalado. En `playwright.config.ts`, dentro del proyecto `ui`, agreguen `channel: 'chrome'`:

```ts
use: {
  ...devices['Desktop Chrome'],
  channel: 'chrome',
  // ...lo demás igual
},
```

**Windows PowerShell: "la ejecución de scripts está deshabilitada" al usar `npx`**

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

(o usen `npx.cmd playwright test`, o corran los comandos desde CMD / Git Bash).

**Las pruebas de API o UI fallan por red**: DummyJSON y SauceDemo son sitios públicos; si la red de la empresa los bloquea, las pruebas unitarias igual deben pasar. Esa también es una lección de la pirámide.
