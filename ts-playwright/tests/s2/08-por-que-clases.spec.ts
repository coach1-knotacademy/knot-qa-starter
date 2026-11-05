/**
 * EJEMPLO 8 · Por qué usamos clases (programación orientada a objetos)
 * Compara con el ejemplo 1: la prueba se lee como el caso manual y los localizadores
 * viven en un solo archivo. Si el botón cambia de nombre, se ajusta una sola línea.
 *
 * Las clases están en tests/s2/paginas:
 *   PaginaBase       → la clase padre, con lo común
 *   PaginaLogin      → hereda de PaginaBase (herencia)
 *   PaginaTransferir → hereda también, y abrir() la lleva a otra ruta (polimorfismo)
 */
import { test, expect } from '@playwright/test';
import { abrirConSesion } from './ayudas/sesion';
import { PaginaLogin } from './paginas/PaginaLogin';
import { PaginaTransferir } from './paginas/PaginaTransferir';

test('login con clave errada, usando la clase', async ({ page }) => {
  const login = new PaginaLogin(page);

  await login.abrir();
  await login.ingresar('ana', 'otra');

  await expect(login.mensajeDeError).toHaveText('Usuario o clave incorrectos');
});

test('transferencia válida, usando la clase', async ({ page, request }) => {
  await abrirConSesion(page, request);
  const transferir = new PaginaTransferir(page);

  await transferir.abrir();
  await transferir.transferir('2000000001', '100000');

  await expect(transferir.comprobante).toContainText('Transferencia exitosa');
});
