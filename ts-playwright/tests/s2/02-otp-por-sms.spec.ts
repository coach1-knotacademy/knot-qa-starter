/**
 * EJEMPLO 2 · El código OTP que llega por SMS
 * Problema real: "sin ese código no puedo avanzar, ¿cómo automatizo eso?"
 *
 * Tres caminos, de mejor a peor opción:
 * A. Leer el código en la herramienta interna donde ya se consulta (esta prueba).
 * B. Si solo interesa navegar, entrar una vez y reutilizar la sesión (ejemplos 3 en adelante).
 * C. Pedir a desarrollo un código fijo SOLO en ambiente de pruebas. Nunca en producción.
 */
import { test, expect } from '@playwright/test';

test('ingresa leyendo el código en el buzón, en otra pestaña', async ({ page, context }) => {
  await test.step('escribir usuario y clave', async () => {
    await page.goto('/');
    await page.getByLabel('Usuario').fill('ana');
    await page.getByLabel('Clave').fill('Clave123');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/otp$/);
  });

  const codigo = await test.step('abrir el buzón y leer el código', async () => {
    const buzon = await context.newPage();
    await buzon.goto('/buzon');
    await buzon.getByLabel('Usuario').fill('ana');
    await buzon.getByRole('button', { name: 'Buscar' }).click();

    const mensaje = buzon.getByRole('cell', { name: /código de seguridad/ }).first();
    await expect(mensaje).toBeVisible();
    const texto = await mensaje.innerText();
    await buzon.close();

    // Del mensaje solo nos interesan los 6 dígitos.
    return texto.match(/\d{6}/)![0];
  });

  await test.step('escribir el código e ingresar', async () => {
    await page.getByLabel('Código de seguridad').fill(codigo);
    await page.getByRole('button', { name: 'Validar' }).click();
    await expect(page.getByRole('heading', { name: 'Mis cuentas' })).toBeVisible();
    await expect(page.getByText('Ana Pérez')).toBeVisible();
  });
});

test('con un código equivocado no deja ingresar', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('Clave123');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await page.getByLabel('Código de seguridad').fill('000000');
  await page.getByRole('button', { name: 'Validar' }).click();

  await expect(page.getByRole('alert')).toHaveText('Código incorrecto');
});
