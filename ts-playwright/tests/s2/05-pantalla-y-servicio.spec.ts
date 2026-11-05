/**
 * EJEMPLO 5 · El inspector de red, pero automático
 * Probando a mano, muchos dejan abierta la pestaña Red (F12) para ver si el servicio respondió.
 * Playwright puede hacer lo mismo y además simular fallas que a mano son difíciles de provocar.
 */
import { test, expect } from '@playwright/test';
import { abrirConSesion } from './ayudas/sesion';

test('valida al tiempo el servicio y lo que ve el usuario', async ({ page, request }) => {
  await abrirConSesion(page, request);

  const servicio = page.waitForResponse('**/api/cuentas');
  await page.goto('/inicio');
  const respuesta = await servicio;

  // Lo que mirarías en la pestaña Red
  expect(respuesta.status()).toBe(200);
  const cuentas = await respuesta.json();

  // Lo que mirarías en la pantalla
  await expect(page.getByRole('cell', { name: cuentas[0].numero })).toBeVisible();
});

test('si el servicio se cae, el usuario ve un mensaje claro', async ({ page, request }) => {
  await abrirConSesion(page, request);

  // Simula un error 500 sin pedirle nada a nadie ni dañar el ambiente.
  await page.route('**/api/cuentas', (ruta) => ruta.fulfill({ status: 500, json: { error: 'caído' } }));
  await page.goto('/inicio');

  await expect(page.getByRole('alert')).toHaveText('No pudimos cargar tus saldos. Intenta más tarde.');
});

test('si no hay conexión, tampoco se queda cargando', async ({ page, request }) => {
  await abrirConSesion(page, request);

  await page.route('**/api/cuentas', (ruta) => ruta.abort());
  await page.goto('/inicio');

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText('Cargando saldos…')).toBeHidden();
});

test('con datos simulados se prueba un caso difícil de conseguir: saldo en cero', async ({ page, request }) => {
  await abrirConSesion(page, request);

  await page.route('**/api/cuentas', (ruta) =>
    ruta.fulfill({ json: [{ numero: '1000000009', tipo: 'Ahorros', saldo: 0 }] }),
  );
  await page.goto('/inicio');

  await expect(page.getByRole('row', { name: /1000000009/ })).toContainText('$0');
});
