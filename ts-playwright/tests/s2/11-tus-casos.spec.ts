/**
 * EJEMPLO 11 · Tus casos, sin programar
 * Las pruebas salen de dos tablas: tests/s2/casos/transferencias.csv e ingresos.csv.
 * Para agregar un caso, agrega una fila. No hay que tocar este archivo.
 *
 * Una fila en rojo no es un error tuyo: es un caso cuyo resultado no fue el que esperabas.
 * Puede ser un error en la fila o un hallazgo en el sistema. Ese es tu criterio de tester.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { abrirConSesion } from './ayudas/sesion';

function leerTabla(archivo: string) {
  const texto = readFileSync(join(__dirname, 'casos', archivo), 'utf8').replace(/^﻿/, '');
  const [encabezado, ...filas] = texto.split(/\r?\n/).filter((linea) => linea.trim());
  const columnas = encabezado.split(';').map((c) => c.trim());
  return filas.map((fila) => {
    const valores = fila.split(';').map((v) => v.trim());
    return Object.fromEntries(columnas.map((c, i) => [c, valores[i] ?? '']));
  });
}

const soloDigitos = (texto: string) => texto.replace(/\D/g, '');

test.describe('Transferencias', () => {
  for (const caso of leerTabla('transferencias.csv')) {
    test(`${caso.id} · ${caso.caso}`, async ({ page, request }, testInfo) => {
      await abrirConSesion(page, request, caso.usuario || 'ana');
      await page.goto('/transferir');
      await page.getByLabel('Cuenta de origen').selectOption(caso.cuenta_origen);
      await page.getByLabel('Cuenta destino').fill(caso.destino);
      await page.getByLabel('Monto').fill(caso.monto);
      await page.getByLabel('Acepto el cobro del 4x1000').check();
      await page.getByRole('button', { name: 'Transferir' }).click();

      if (caso.resultado_esperado.toLowerCase() !== 'exitosa') {
        await expect(page.getByRole('alert')).toHaveText(caso.resultado_esperado);
        return;
      }

      await expect(page.getByRole('status')).toContainText('Transferencia exitosa');
      await testInfo.attach('comprobante', { body: await page.screenshot(), contentType: 'image/png' });

      if (caso.gmf_esperado) {
        expect(soloDigitos(await page.locator('#gmf').innerText()), '4x1000 del comprobante').toBe(caso.gmf_esperado);
      }
      if (caso.saldo_despues_esperado) {
        await page.goto('/inicio');
        const fila = page.getByRole('row', { name: new RegExp(caso.cuenta_origen) });
        await expect(fila).toBeVisible();
        expect(soloDigitos(await fila.getByRole('cell').last().innerText()), 'saldo después de transferir').toBe(caso.saldo_despues_esperado);
      }
    });
  }
});

test.describe('Ingresos', () => {
  for (const caso of leerTabla('ingresos.csv')) {
    test(`${caso.id} · ${caso.caso}`, async ({ page }) => {
      await page.goto('/');
      await page.getByLabel('Usuario').fill(caso.usuario);
      await page.getByLabel('Clave').fill(caso.clave);
      await page.getByRole('button', { name: 'Ingresar' }).click();

      if (caso.resultado_esperado.toUpperCase() === 'ENTRA') {
        await expect(page.getByRole('heading', { name: 'Confirma que eres tú' })).toBeVisible();
      } else {
        await expect(page.getByRole('alert')).toHaveText(caso.resultado_esperado);
      }
    });
  }
});
