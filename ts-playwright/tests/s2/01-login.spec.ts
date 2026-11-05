/**
 * EJEMPLO 1 · Del caso manual a la prueba
 *
 * CASO MANUAL                                  PLAYWRIGHT
 * 1. Abrir la página de ingreso           →    page.goto
 * 2. Escribir usuario y clave             →    getByLabel(...).fill
 * 3. Clic en Ingresar                     →    getByRole('button').click
 * 4. Resultado esperado: ...              →    expect(...)
 */
import { test, expect } from '@playwright/test';

test.describe('Ingreso a la banca', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('con datos correctos pide el código de seguridad', async ({ page }) => {
    await page.getByLabel('Usuario').fill('ana');
    await page.getByLabel('Clave').fill('Clave123');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page).toHaveURL(/\/otp$/);
    await expect(page.getByRole('heading', { name: 'Confirma que eres tú' })).toBeVisible();
  });

  test('con clave errada muestra el error y no avanza', async ({ page }) => {
    await page.getByLabel('Usuario').fill('ana');
    await page.getByLabel('Clave').fill('otra');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByRole('alert')).toHaveText('Usuario o clave incorrectos');
    await expect(page).toHaveURL('/');
  });

  test('un usuario bloqueado ve el mensaje de bloqueo', async ({ page }) => {
    await page.getByLabel('Usuario').fill('bloqueado');
    await page.getByLabel('Clave').fill('Clave123');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByRole('alert')).toContainText('bloqueado');
  });
});
