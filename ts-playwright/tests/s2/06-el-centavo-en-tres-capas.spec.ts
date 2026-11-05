/**
 * EJEMPLO 6 · Un bug, tres capas: ¿quién lo atrapa y qué tan rápido?
 *
 * Lab: en demo-banco/reglas.js cambia Math.round por Math.floor (línea marcada LÍNEA DEL LAB).
 * Antes de correr, vota: ¿qué capas van a fallar?
 *   npx playwright test 06-el-centavo --project=s2
 * Mira los tiempos de cada capa. Después revierte el cambio.
 *
 * 125.125 × 4 / 1000 = 500,5 → con Math.round son $501; con Math.floor, $500.
 */
import { test, expect } from '@playwright/test';
import { calcularGmf } from '../../demo-banco/reglas';
import { abrirConSesion, iniciarSesionPorApi } from './ayudas/sesion';

const MONTO = 125125;
const GMF_ESPERADO = 501;

test('UNIT · la regla sola, sin navegador ni servidor', () => {
  expect(calcularGmf(MONTO)).toBe(GMF_ESPERADO);
  expect(calcularGmf(100000)).toBe(400);
});

test('API · el servicio aplica la regla', async ({ request }) => {
  const { token } = await iniciarSesionPorApi(request);
  const respuesta = await request.post('/api/transferencias', {
    headers: { Authorization: `Bearer ${token}` },
    data: { origen: '1000000001', destino: '2000000001', monto: MONTO },
  });

  expect((await respuesta.json()).gmf).toBe(GMF_ESPERADO);
});

test('UI · el usuario ve el valor correcto', async ({ page, request }) => {
  await abrirConSesion(page, request);
  await page.goto('/transferir');
  await page.getByLabel('Cuenta destino').fill('2000000001');
  await page.getByLabel('Monto').fill(String(MONTO));
  await page.getByLabel('Acepto el cobro del 4x1000').check();
  await page.getByRole('button', { name: 'Transferir' }).click();

  await expect(page.locator('#gmf')).toHaveText(`$${GMF_ESPERADO}`);
});
