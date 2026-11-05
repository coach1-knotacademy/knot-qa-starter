/**
 * EJEMPLO 3 · Tu tabla de casos, convertida en pruebas
 * Cada fila es un caso. Para agregar un caso, agregas una fila: no escribes otra prueba.
 * Además, entra directo con sesión abierta: esta prueba es de transferencias, no de login.
 */
import { test, expect } from '@playwright/test';
import { abrirConSesion } from './ayudas/sesion';

const CASOS_INVALIDOS = [
  { caso: 'destino con 9 dígitos', destino: '123456789', monto: '50000', error: 'La cuenta destino debe tener 10 dígitos' },
  { caso: 'destino con letras', destino: '12345abcde', monto: '50000', error: 'La cuenta destino debe tener 10 dígitos' },
  { caso: 'misma cuenta de origen', destino: '1000000001', monto: '50000', error: 'La cuenta destino debe ser diferente a la de origen' },
  { caso: 'monto en cero', destino: '2000000001', monto: '0', error: 'El monto debe ser un número entero positivo' },
  { caso: 'monto bajo el mínimo (límite)', destino: '2000000001', monto: '999', error: 'El monto mínimo es $1.000' },
  { caso: 'monto sobre el máximo (límite)', destino: '2000000001', monto: '2000001', error: 'El monto máximo por transferencia es $2.000.000' },
  { caso: 'monto mayor al saldo', destino: '2000000001', monto: '1600000', error: 'Saldo insuficiente' },
];

test.describe('Validaciones de la transferencia', () => {
  test.beforeEach(async ({ page, request }) => {
    await abrirConSesion(page, request);
    await page.goto('/transferir');
  });

  for (const { caso, destino, monto, error } of CASOS_INVALIDOS) {
    test(`rechaza: ${caso}`, async ({ page }) => {
      await page.getByLabel('Cuenta destino').fill(destino);
      await page.getByLabel('Monto').fill(monto);
      await page.getByLabel('Acepto el cobro del 4x1000').check();
      await page.getByRole('button', { name: 'Transferir' }).click();

      await expect(page.getByRole('alert')).toHaveText(error);
    });
  }

  test('exige aceptar el 4x1000', async ({ page }) => {
    await page.getByLabel('Cuenta destino').fill('2000000001');
    await page.getByLabel('Monto').fill('50000');
    await page.getByRole('button', { name: 'Transferir' }).click();

    await expect(page.getByRole('alert')).toHaveText('Debes aceptar el cobro del 4x1000');
  });

  test('una transferencia válida entrega comprobante', async ({ page }) => {
    await page.getByLabel('Cuenta de origen').selectOption({ label: 'Corriente · 1000000002' });
    await page.getByLabel('Cuenta destino').fill('2000000001');
    await page.getByLabel('Monto').fill('50000');
    await page.getByLabel('Acepto el cobro del 4x1000').check();
    await page.getByRole('button', { name: 'Transferir' }).click();

    await expect(page.getByRole('status')).toContainText('Transferencia exitosa');
    await expect(page.locator('#numero')).toHaveText(/^\d{6}$/);
  });
});
