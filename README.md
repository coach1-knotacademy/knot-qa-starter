# knot-qa-starter

Proyecto inicial del **Bootcamp de QA & Automatización · Knot Academy × Accenture**.

Una regla de negocio (`PriceCalculator`: subtotal, impuesto del 8 % y total) probada en las **tres capas de la pirámide** (unit, API y UI) para medir con cronómetro qué detecta cada capa y cuánto cuesta. Es la semilla del framework que presentarás el 3 de diciembre.

## Elige tu track

| | ☕ Track A · `java-selenium/` | 🎭 Track B · `ts-playwright/` |
|---|---|---|
| Stack | Java 17+, Maven, JUnit 5, Selenium 4, REST Assured | Node 20+, TypeScript, Playwright Test |
| Unit | `mvn test -Dgroups=unit` | `npm run test:unit` |
| API | `mvn test -Dgroups=api` | `npm run test:api` |
| UI | `mvn test -Dgroups=ui` | `npm run test:ui` |
| Todo | `mvn test` | `npm test` |
| Instrucciones | [java-selenium/README.md](java-selenium/README.md) | [ts-playwright/README.md](ts-playwright/README.md) |

Los dos tracks tienen **exactamente las mismas pruebas**. Elige uno; los principios de arquitectura que veremos son los mismos.

## Puesta a punto (en la S1, mientras avanza la teoría)

Guía paso a paso por track, macOS y Windows, con proxy corporativo y plan B en la nube: [`docs/instalacion.md`](docs/instalacion.md).

```bash
git clone https://github.com/coach1-knotacademy/knot-qa-starter.git
cd knot-qa-starter

# macOS / Linux
./scripts/verificar-entorno.sh

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\verificar-entorno.ps1
```

¿No tienes permisos de instalación? Abre este repo en **GitHub Codespaces** (*Code → Codespaces → Create codespace*). El contenedor trae Java 21, Maven, Node 22 y Chromium listos. Corre la UI en modo headless: `mvn test -Dheadless=true` o `npm run test:ui`. En Codespaces tu trabajo vive en el codespace: no lo borres.

## Cómo trabajamos: todo en clase

No hay tareas fuera de las sesiones. El framework se construye en vivo, sesión a sesión, en tu copia de este repo. Cada sesión tiene su archivo de retos en [`retos/`](retos/).

| Momento | Qué haces | Comando |
|---|---|---|
| S1, una sola vez | Clonar el repo | `git clone https://github.com/coach1-knotacademy/knot-qa-starter.git` |
| Inicio de cada sesión | Traer lo nuevo del coach (retos y andamiaje) | `git pull --no-rebase --no-edit` |
| Durante la sesión | Resolver el reto del día | `retos/S01.md`, `retos/S02.md`… |
| Cierre de cada sesión | Guardar tu avance | `git add -A && git commit -m "S01: …"` |

### ¿Te atrasaste o faltaste a una sesión?

Cada sesión arranca desde un punto de partida etiquetado (`s01`, `s02`…) que ya incluye lo construido en la sesión anterior. Si `git pull` te da conflictos o te quedaste atrás:

```bash
git stash -u                      # guarda lo que tengas a medias
git fetch --tags
git switch -c mi-s03 s03          # arrancas desde el punto de partida de la S3
git checkout main -- docs/        # recuperas tu ficha y tu estrategia
```

### Tu propio repo en GitHub (lo hacemos juntos, en clase)

Mientras tanto basta con tu copia local y tus commits. Cuando lo necesitemos (a más tardar en la S10, para CI/CD), lo creamos en vivo:

```bash
git remote rename origin knot
git remote add origin https://github.com/TU-USUARIO/mi-framework-qa.git
git push -u origin main
# desde ahí, lo nuevo del coach se trae con: git pull knot main --no-rebase --no-edit
```

## Qué se prueba

| Capa | Contra qué | Qué valida |
|---|---|---|
| Unit | `PriceCalculator` | Redondeo, bordes, errores |
| API | [DummyJSON](https://dummyjson.com) | Producto, totales del carrito con la regla, login 200 y 400 |
| UI | [SauceDemo](https://www.saucedemo.com) | Login, usuario bloqueado, checkout con subtotal, impuesto y total |

Las pruebas de API y UI usan `PriceCalculator` como **oráculo**: el valor esperado se calcula, no se escribe a mano.

## Tu caso real

SauceDemo es solo el punto de partida común. El bootcamp gira alrededor de **tu caso real**:

- [`docs/caso-real.md`](docs/caso-real.md): ficha del caso (anonimizado) y catálogo de **gemelos públicos** para codificar.
- [`docs/estrategia-de-pruebas.md`](docs/estrategia-de-pruebas.md): tu estrategia en una página.

## Deuda técnica intencional

Este proyecto es plano a propósito: locators dentro de las pruebas, sin Page Objects, configuración mínima, sin reportes ni CI. Entre la S3 y la S10 lo convertimos en un framework por capas.
