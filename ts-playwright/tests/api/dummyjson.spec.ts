import { test, expect } from '@playwright/test';
import { subtotal } from '../../src/price-calculator';

/**
 * CAPA DE API: hablamos HTTP directo con DummyJSON usando el fixture `request`
 * (sin navegador). Más lentas que las unitarias (hay red), mucho más rápidas
 * que las de UI. La baseURL viene del proyecto "api" en playwright.config.ts.
 */

test.describe('API DummyJSON', { tag: '@api' }, () => {
  test('GET /products/1 devuelve el producto 1 con título y precio válidos', async ({ request }) => {
    const respuesta = await request.get('/products/1');
    expect(respuesta.status()).toBe(200);

    const producto = await respuesta.json();
    expect(producto.id).toBe(1);
    expect(typeof producto.title).toBe('string');
    expect(producto.title.length).toBeGreaterThan(0);
    expect(producto.price).toBeGreaterThan(0);
  });

  test('GET /carts/1: los totales del carrito coinciden con nuestra calculadora', async ({ request }) => {
    const respuesta = await request.get('/carts/1');
    expect(respuesta.status()).toBe(200);

    const carrito = await respuesta.json();
    const productos: { title: string; price: number; quantity: number; total: number }[] = carrito.products;
    expect(productos.length).toBeGreaterThan(0);

    // Cada línea: total de la API == precio × cantidad según nuestra regla (el "oráculo").
    for (const p of productos) {
      expect(p.total, `total de la línea "${p.title}"`).toBe(
        subtotal([{ price: p.price, quantity: p.quantity }]),
      );
    }

    // Total del carrito == subtotal de todos los productos.
    // Nota: esta API NO calcula impuesto, así que aquí no se valida tax().
    const itemsCarrito = productos.map((p) => ({ price: p.price, quantity: p.quantity }));
    expect(carrito.total).toBe(subtotal(itemsCarrito));
  });

  test('POST /auth/login con credenciales válidas devuelve un accessToken', async ({ request }) => {
    const respuesta = await request.post('/auth/login', {
      data: { username: 'emilys', password: 'emilyspass' },
    });
    expect(respuesta.status()).toBe(200);

    const cuerpo = await respuesta.json();
    expect(typeof cuerpo.accessToken).toBe('string');
    expect(cuerpo.accessToken.length).toBeGreaterThan(0);
  });

  test('POST /auth/login con contraseña incorrecta devuelve 400', async ({ request }) => {
    const respuesta = await request.post('/auth/login', {
      data: { username: 'emilys', password: 'contrasena-incorrecta' },
    });
    expect(respuesta.status()).toBe(400);
  });
});
