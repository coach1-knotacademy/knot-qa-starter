import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración mínima (a propósito) con TRES proyectos, uno por capa de la
 * pirámide de pruebas. Cada proyecto se ejecuta con --project=<nombre>.
 */
export default defineConfig({
  // En local no reintentamos (queremos ver la falla de una); en CI, 2 veces.
  retries: process.env.CI ? 2 : 0,

  // Reporte en consola + reporte HTML (se abre con `npm run report`).
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'resultados.json' }]],

  // Banco Demo: el sistema local de la S2. Se inicia solo y no necesita internet.
  webServer: {
    command: 'node demo-banco/server.js',
    url: 'http://127.0.0.1:4000/api/salud',
    reuseExistingServer: true,
    timeout: 60_000,
  },

  projects: [
    {
      // Ejemplos de la S2 contra el Banco Demo. Un archivo por tipo de automatización.
      name: 's2',
      testDir: 'tests/s2',
      // Uno a la vez, para poder seguirlos con la vista en clase.
      workers: 1,
      // Una fila en rojo es un hallazgo: no se reintenta.
      retries: 0,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4000',
        // En equipos que no dejan descargar Chromium: PW_CHANNEL=msedge usa el Edge instalado.
        channel: process.env.PW_CHANNEL,
        screenshot: 'on',
        trace: 'on',
      },
    },
    {
      // Capa 1 (base de la pirámide): pruebas unitarias. No abren navegador.
      name: 'unit',
      testDir: 'tests/unit',
    },
    {
      // Capa 2 (medio): pruebas de API contra DummyJSON con el fixture `request`.
      name: 'api',
      testDir: 'tests/api',
      use: {
        baseURL: 'https://dummyjson.com',
      },
    },
    {
      // Capa 3 (punta): pruebas de UI end-to-end contra SauceDemo en Chromium.
      name: 'ui',
      testDir: 'tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
        // SauceDemo marca sus elementos con data-test="..." → page.getByTestId('...')
        testIdAttribute: 'data-test',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
  ],
});
