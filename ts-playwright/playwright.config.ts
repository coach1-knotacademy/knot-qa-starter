import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración mínima (a propósito) con TRES proyectos, uno por capa de la
 * pirámide de pruebas. Cada proyecto se ejecuta con --project=<nombre>.
 */
export default defineConfig({
  // En local no reintentamos (queremos ver la falla de una); en CI, 2 veces.
  retries: process.env.CI ? 2 : 0,

  // Reporte en consola + reporte HTML (se abre con `npm run report`).
  reporter: [['list'], ['html', { open: 'never' }]],

  projects: [
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
