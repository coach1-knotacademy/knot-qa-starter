/**
 * EJEMPLO 9 · La prueba "flaky": a veces pasa, a veces no
 * Las dos pruebas verifican lo mismo. Los saldos tardan 600 ms en llegar.
 * test.fail() indica que la primera DEBE fallar: así la suite sigue en verde mientras la estudias.
 */
import { test, expect } from '@playwright/test';
import { abrirConSesion } from './ayudas/sesion';

test('MAL: lee la tabla sin esperar a que llegue', async ({ page, request }) => {
  test.fail();
  await abrirConSesion(page, request);
  await page.goto('/inicio');

  // allTextContents() lee lo que haya en este instante. En este momento todavía no hay filas.
  const filas = await page.getByRole('row').allTextContents();
  expect(filas.length).toBeGreaterThan(0);
});

test('BIEN: expect espera solo hasta que la condición se cumple', async ({ page, request }) => {
  await abrirConSesion(page, request);
  await page.goto('/inicio');

  // Sin pausas fijas. Encabezado + 2 cuentas = 3 filas.
  await expect(page.getByRole('row')).toHaveCount(3);
});
