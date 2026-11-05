import { APIRequestContext, Page, expect } from '@playwright/test';

/**
 * Inicia sesión por API, incluido el código OTP, y devuelve el token.
 * Sirve para las pruebas cuyo objetivo NO es el login: no repiten la pantalla.
 */
export async function iniciarSesionPorApi(request: APIRequestContext, usuario = 'ana') {
  const login = await request.post('/api/login', { data: { usuario, clave: 'Clave123' } });
  expect(login.status()).toBe(200);
  const { idDesafio } = await login.json();

  const buzon = await request.get('/api/buzon', { params: { usuario } });
  const [ultimo] = await buzon.json();

  const otp = await request.post('/api/otp', { data: { idDesafio, codigo: ultimo.codigo } });
  expect(otp.status()).toBe(200);
  return (await otp.json()) as { token: string; nombre: string };
}

/** Deja el navegador con la sesión abierta, sin pasar por las pantallas de ingreso. */
export async function abrirConSesion(page: Page, request: APIRequestContext, usuario = 'ana') {
  const { token, nombre } = await iniciarSesionPorApi(request, usuario);
  await page.addInitScript(([t, n]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('nombre', n);
  }, [token, nombre]);
  return token;
}
