/**
 * EJEMPLO 10 · La IA escribe rápido; la revisión la haces tú
 * Punto de partida: una prueba generada por un asistente de IA. Copiada tal cual, tiene 4 problemas.
 *
 *   await page.fill('#usuario', 'ana');          // 1. Depende de un id interno
 *   await page.fill('#clave', 'Clave123');
 *   await page.click('button');                  // 2. "El primer botón": se rompe si agregan otro
 *   await page.waitForTimeout(3000);             // 3. Pausa fija: lenta y, aun así, inestable
 *   expect(await page.title()).toContain('Banco'); // 4. Pasa también si el login falló
 *
 * Esta es la misma prueba después de revisarla con la lista de docs/s2-ia-copilot.md.
 */
import { test, expect } from '@playwright/test';

test('con datos correctos llega a la pantalla del código', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('Clave123');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByRole('heading', { name: 'Confirma que eres tú' })).toBeVisible();
});
