/**
 * EJEMPLO 4 · Lo mismo que haces en Postman, pero se repite solo
 *
 * EN POSTMAN                                PLAYWRIGHT
 * Método y URL                         →    request.post('/api/login')
 * Pestaña Body                         →    data: { ... }
 * Pestaña Authorization, Bearer Token  →    headers: { Authorization: ... }
 * Mirar el status y el JSON            →    expect(respuesta.status()).toBe(...)
 * Pegar un valor en la siguiente       →    guardarlo en una constante
 */
import { test, expect } from '@playwright/test';
import { iniciarSesionPorApi } from './ayudas/sesion';

test('login: clave errada responde 401', async ({ request }) => {
  const respuesta = await request.post('/api/login', { data: { usuario: 'ana', clave: 'otra' } });

  expect(respuesta.status()).toBe(401);
  expect(await respuesta.json()).toEqual({ error: 'Usuario o clave incorrectos' });
});

test('login: sin clave responde 400', async ({ request }) => {
  const respuesta = await request.post('/api/login', { data: { usuario: 'ana' } });

  expect(respuesta.status()).toBe(400);
});

test('cuentas: sin token responde 401', async ({ request }) => {
  const respuesta = await request.get('/api/cuentas');

  expect(respuesta.status()).toBe(401);
});

test('flujo encadenado: el token del login sirve para consultar y transferir', async ({ request }) => {
  const { token } = await iniciarSesionPorApi(request);
  const headers = { Authorization: `Bearer ${token}` };

  const cuentas = await request.get('/api/cuentas', { headers });
  expect(cuentas.status()).toBe(200);

  // Contrato: los campos que la pantalla da por hechos.
  const [ahorros] = await cuentas.json();
  expect(ahorros).toEqual({
    numero: expect.stringMatching(/^\d{10}$/),
    tipo: 'Ahorros',
    saldo: expect.any(Number),
  });

  const transferencia = await request.post('/api/transferencias', {
    headers,
    data: { origen: ahorros.numero, destino: '2000000001', monto: 100000 },
  });
  expect(transferencia.status()).toBe(201);
  expect(await transferencia.json()).toMatchObject({ gmf: 400, total: 100400, saldo: ahorros.saldo - 100400 });
});
