# knot-qa-starter · Java + Selenium

Proyecto inicial del bootcamp de QA — **Sesión 1: Pirámide de pruebas y estrategia alineada al SDLC**.

## Qué es esto

Una **misma regla de negocio** (calcular subtotal, impuesto del 8 % y total de un carrito) probada en las **tres capas de la pirámide**, para comparar velocidad, costo y tipo de retroalimentación:

| Capa | Clase de prueba | Qué prueba | Contra qué |
|------|-----------------|------------|------------|
| **Unit** (base) | `unit/PriceCalculatorTest` | La regla directamente, en memoria | `PriceCalculator.java` |
| **API** (mitad) | `api/DummyJsonApiTest` | Que los totales de un carrito real cumplan la regla | https://dummyjson.com |
| **UI** (punta) | `ui/SauceDemoUiTest` | Que el checkout muestre subtotal, impuesto y total correctos | https://www.saucedemo.com |

La regla vive en `src/main/java/com/knotacademy/starter/PriceCalculator.java`:

- `subtotal(items)` = Σ precio × cantidad, con 2 decimales (lista vacía → `0.00`).
- `tax(items)` = subtotal × 0.08, redondeado a 2 decimales con `HALF_UP` (igual que SauceDemo).
- `total(items)` = subtotal + impuesto.
- Cantidad < 1 o precio < 0 → `IllegalArgumentException`. Precio 0 sí está permitido.

En las capas API y UI, `PriceCalculator` actúa como **oráculo**: los valores esperados **se calculan con la regla**, no se escriben a mano en la prueba. Por eso un bug en la regla también se nota en la UI.

Existe un proyecto gemelo en **TypeScript + Playwright** con exactamente el mismo contrato (mismos casos y los mismos datos), para comparar herramientas.

```
java-selenium/
├── pom.xml
├── README.md
├── .gitignore
└── src/
    ├── main/java/com/knotacademy/starter/
    │   └── PriceCalculator.java          ← regla de negocio (y el "oráculo")
    └── test/
        ├── java/com/knotacademy/starter/
        │   ├── unit/PriceCalculatorTest.java   @Tag("unit")
        │   ├── api/DummyJsonApiTest.java       @Tag("api")
        │   └── ui/SauceDemoUiTest.java         @Tag("ui")
        └── resources/config.properties   ← ui.baseUrl, api.baseUrl
```

## Requisitos

- **Java 17 o superior** (el proyecto compila con `release 17`; funciona también con JDK 21). Verifica con `java -version`.
- **Maven 3.9+**. Verifica con `mvn -v`.
- **Google Chrome** instalado (cualquier versión reciente). No necesitas descargar chromedriver: **Selenium Manager** lo resuelve solo.
- **Git**.
- Conexión a internet (la primera vez Maven descarga dependencias; las capas API y UI usan sitios públicos).

Versiones usadas: JUnit 5.11.4 · AssertJ 3.27.3 · Selenium 4.28.1 · REST Assured 5.5.7 · Surefire 3.5.2.

## Cómo correr por capa

Desde la carpeta `java-selenium/`:

| Comando | Qué corre | Tiempo aprox.* |
|---------|-----------|----------------|
| `mvn test -Dgroups=unit` | Solo unit (7 pruebas) | ~7 s (pruebas: < 0.5 s) |
| `mvn test -Dgroups=api` | Solo API (4 pruebas) | ~13 s (pruebas: ~6 s) |
| `mvn test -Dgroups=ui` | Solo UI con navegador visible (3 pruebas) | ~25 s (pruebas: ~17 s) |
| `mvn test -Dgroups=ui -Dheadless=true` | Solo UI sin ventana (3 pruebas) | ~22 s (pruebas: ~19 s) |
| `mvn test` | Todo (14 pruebas) | ~32 s |

\* Medido en una MacBook (Apple Silicon, JDK 21, Chrome 156) con buena conexión. El primer tiempo incluye ~5 s fijos de arranque de Maven; entre paréntesis está el tiempo que reporta Surefire solo para las pruebas. **La primera ejecución es más lenta** porque Maven descarga dependencias y Selenium Manager descarga el chromedriver. Con la máquina ocupada (otras apps, videollamada) los tiempos pueden duplicarse; lo que importa es la **proporción** entre capas.

Tips:

- Agrega `-q` para una salida más limpia: `mvn -q test -Dgroups=unit` (si todo pasa, no imprime nada).
- **Headless**: `-Dheadless=true|false` manda. Si no lo indicas, es `false` en tu máquina (ves el navegador) y `true` automáticamente si existe la variable de entorno `CI` (pipelines).
- **URLs**: están en `src/test/resources/config.properties` y se pueden sobrescribir: `mvn test -Dgroups=api "-Dapi.baseUrl=https://otra-url.com"`. Las comillas son necesarias en PowerShell, porque el nombre lleva un punto.
- Los reportes XML/TXT quedan en `target/surefire-reports/`.

## Tabla para registrar tiempos

Corre cada capa y anota tus resultados en [`retos/S01.md`](../retos/S01.md) (Lab 1). La columna de "referencia" es lo que medimos al preparar el proyecto.

| Capa | # tests | Tiempo (referencia) | Tiempo (tú) | ¿Qué detecta? |
|------|---------|---------------------|-------------|---------------|
| Unit | 7 | ~7 s total · < 0.5 s pruebas | | |
| API  | 4 | ~13 s total · ~6 s pruebas | | |
| UI   | 3 | ~22 s total · ~19 s pruebas (headless) | | |
| Todo | 14 | ~32 s | | |

Preguntas para la discusión:

1. ¿Cuántas veces más lenta es una prueba UI que una unit? ¿Y por prueba individual?
2. Si una prueba falla, ¿en cuál capa es más fácil saber **por qué** falló?
3. ¿Qué capa se rompe si SauceDemo cambia un botón? ¿Y si DummyJSON está caído?

## Lab "Siembra un bug"

Objetivo: ver **qué capa detecta un error en la regla de negocio y qué tan rápido**.

1. Abre `src/main/java/com/knotacademy/starter/PriceCalculator.java` y busca la línea marcada con `LAB "Siembra un bug"`:

   ```java
   public static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
   ```

   Cámbiala por:

   ```java
   public static final RoundingMode ROUNDING_MODE = RoundingMode.DOWN;
   ```

   Ahora el impuesto de 29.99 (2.3992) se trunca a **2.39** en lugar de redondearse a **2.40**.

2. Corre las tres capas y anota cuáles fallan y cuánto tardaron:

   ```bash
   mvn test -Dgroups=unit
   mvn test -Dgroups=api
   mvn test -Dgroups=ui -Dheadless=true
   ```

3. Resultado esperado (verificado):

   | Capa | ¿Falla? | Detalle |
   |------|---------|---------|
   | Unit | **Sí** — 3 de 7 | `[impuesto] expected: 2.40 but was: 2.39`, `[total] expected: 32.39 but was: 32.38`, y lo mismo para 39.98 (3.20→3.19) y 0.07 (0.01→0.00). Falla en menos de 1 s. |
   | API  | **No** — 4 de 4 pasan | |
   | UI   | **Sí** — 1 de 3 (checkout) | `expected: "Tax: $2.39" but was: "Tax: $2.40"`. Tarda ~20 s en avisarte. |

4. **Punto de discusión:** ¿por qué la capa API **no** detecta el bug? Porque el API de carritos de DummyJSON **no calcula impuestos**: solo validamos `precio × cantidad`, y esa parte de la regla sigue correcta. Una prueba solo detecta lo que de verdad ejercita. ¿Qué nos dice esto sobre la cobertura de cada capa? ¿Dónde conviene probar el redondeo?

5. **Revierte el cambio** (`DOWN` → `HALF_UP`) y confirma que todo vuelve a verde:

   ```bash
   mvn test -Dheadless=true
   ```

## Deuda técnica intencional

Este proyecto es **pequeño y plano a propósito**: hoy el foco es la pirámide, no la arquitectura. Entre las sesiones 3 y 6 vamos a refactorizar:

- **Localizadores dentro de las pruebas**: los `By.cssSelector("[data-test=...]")` están en `SauceDemoUiTest`. → Los moveremos a **Page Objects** (POM).
- **Sin capa de configuración**: solo un `config.properties` y un método `config(...)` duplicado en dos clases de prueba. → Clase de configuración única, perfiles por ambiente.
- **Sin reportes**: solo la salida de consola y los XML de Surefire. → Reportes HTML (p. ej. Allure), capturas de pantalla al fallar.
- **Sin driver factory**: el `ChromeDriver` se crea dentro de la prueba, solo Chrome. → **DriverFactory** (varios navegadores, remoto/Grid, ejecución en paralelo).
- Utilidades (`login`, `click`, `type`, `money`) viven dentro de cada clase de prueba.

## Problemas comunes

**Proxy corporativo: Maven no descarga dependencias** (`Could not transfer artifact`, `PKIX path building failed`, timeouts).
Configura el proxy en `settings.xml`, en `C:\Users\<tu-usuario>\.m2\` (Windows) o `~/.m2/` (macOS):

```xml
<settings>
  <proxies>
    <proxy>
      <id>corp</id>
      <active>true</active>
      <protocol>https</protocol>
      <host>proxy.tuempresa.com</host>
      <port>8080</port>
      <!-- <username>usuario</username> <password>clave</password> -->
      <nonProxyHosts>localhost|127.0.0.1</nonProxyHosts>
    </proxy>
  </proxies>
</settings>
```

Si tu empresa tiene un repositorio interno (Nexus/Artifactory), configúralo como `<mirror>` en el mismo archivo. Si el error es de certificados (`PKIX`), pide a soporte el certificado raíz corporativo e impórtalo al `cacerts` de tu JDK.

**Selenium Manager sin red: no puede descargar chromedriver** (`SessionNotCreatedException`, `Unable to obtain driver`).
Descarga manualmente el chromedriver de la **misma versión mayor** que tu Chrome desde https://googlechromelabs.github.io/chrome-for-testing/ y apúntalo así:

```bash
# Las comillas son necesarias en PowerShell. En Windows, la ruta es C:\ruta\chromedriver.exe
mvn test -Dgroups=ui "-Dwebdriver.chrome.driver=/ruta/a/chromedriver"
```

En macOS, si aparece "no se puede verificar el desarrollador": `xattr -d com.apple.quarantine /ruta/a/chromedriver`.

**Chrome no instalado** (`cannot find Chrome binary`).
Instala Google Chrome desde https://www.google.com/chrome/. Mientras tanto puedes trabajar con las capas que no lo necesitan: `mvn test -Dgroups=unit` y `mvn test -Dgroups=api`.

**Advertencia `Unable to find CDP implementation matching NNN`.**
Inofensiva: Selenium 4.28.1 trae soporte CDP hasta Chrome ~132 y no usamos CDP. La silenciamos en `SauceDemoUiTest`.

**Popups de contraseñas de Chrome** ("Cambia tu contraseña" / filtración de datos) en SauceDemo.
Ya están desactivados con preferencias de Chrome (`credentials_enable_service`, `profile.password_manager_enabled`, `profile.password_manager_leak_detection`) en `SauceDemoUiTest`.

**Java 17 vs 21.** Cualquier JDK 17+ sirve. Si `mvn -v` muestra un Java menor a 17, ajusta `JAVA_HOME`.
