/**
 * EJEMPLO 7 · La evidencia se genera sola
 * Sin pegar pantallazos en un documento: cada paso queda con su nombre y su captura.
 * Córrela y luego abre el reporte con: npm run report
 */
import { test, expect } from '@playwright/test';
import { abrirConSesion } from './ayudas/sesion';

test('transferencia con evidencia paso a paso', async ({ page, request }, testInfo) => {
  await abrirConSesion(page, request);

  const evidencia = async (nombre: string) => {
    await testInfo.attach(nombre, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  };

  await test.step('1. Consultar los saldos', async () => {
    await page.goto('/inicio');
    await expect(page.getByRole('table')).toBeVisible();
    await evidencia('saldos antes');
  });

  await test.step('2. Llenar la transferencia', async () => {
    await page.goto('/transferir');
    await page.getByLabel('Cuenta destino').fill('2000000001');
    await page.getByLabel('Monto').fill('100000');
    await page.getByLabel('Acepto el cobro del 4x1000').check();
    await evidencia('formulario lleno');
  });

  await test.step('3. Confirmar y revisar el comprobante', async () => {
    await page.getByRole('button', { name: 'Transferir' }).click();
    await expect(page.getByRole('status')).toContainText('Transferencia exitosa');
    await evidencia('comprobante');
  });
});
