/**
 * EJEMPLO 0 · Grabar, sin escribir código
 * Este es el estilo de lo que produce `npm run s2:grabar` al ingresar con una clave errada.
 * Reproduce los clics, pero NO verifica nada hasta que se le agrega la última línea.
 * Grabar te da los pasos; el criterio de prueba lo pones tú.
 */
import { test, expect } from '@playwright/test';

test('grabado: login con clave errada', async ({ page }) => {
  await page.goto('http://127.0.0.1:4000/');
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('ana');
  await page.getByRole('textbox', { name: 'Clave' }).click();
  await page.getByRole('textbox', { name: 'Clave' }).fill('mala');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Esta línea no la graba nadie: es tu resultado esperado.
  await expect(page.getByRole('alert')).toHaveText('Usuario o clave incorrectos');
});
