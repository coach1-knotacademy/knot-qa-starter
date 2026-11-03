import { test, expect } from '@playwright/test';
import { subtotal, tax, total } from '../../src/price-calculator';

/**
 * CAPA DE UI (end-to-end): navegador real contra SauceDemo. Son las pruebas
 * más lentas y frágiles, pero las únicas que validan lo que ve el usuario.
 *
 * Deuda técnica intencional: los localizadores viven dentro de cada prueba
 * (sin Page Object Model). Lo refactorizamos en las sesiones 3 a 6.
 * getByTestId('x') busca data-test="x" (ver testIdAttribute en la config).
 */

test.describe('SauceDemo', { tag: '@ui' }, () => {
  test('login exitoso con standard_user muestra el inventario', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  test('usuario bloqueado (locked_out_user) ve el mensaje de error', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('locked_out_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();

    await expect(page.getByTestId('error')).toContainText('Sorry, this user has been locked out.');
  });

  test('checkout: subtotal, impuesto y total coinciden con la calculadora', async ({ page }) => {
    // 1. Login
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();

    // 2. Agregar la mochila al carrito e ir al checkout
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('shopping-cart-link').click();
    await page.getByTestId('checkout').click();

    // 3. Datos del comprador
    await page.getByTestId('firstName').fill('Ana');
    await page.getByTestId('lastName').fill('Pérez');
    await page.getByTestId('postalCode').fill('110111');
    await page.getByTestId('continue').click();

    // 4. En el resumen leemos los precios que muestra la página ("$29.99" → 29.99).
    //    SauceDemo no permite cantidades > 1, por eso quantity = 1.
    //    allTextContents() NO espera: lee lo que haya en ese instante. Por eso
    //    primero esperamos (con una aserción web-first) a que el resumen cargue.
    await expect(page).toHaveURL(/checkout-step-two/);
    const precios = page.getByTestId('inventory-item-price');
    await expect(precios.first()).toBeVisible();
    const preciosTexto = await precios.allTextContents();
    const items = preciosTexto.map((texto) => ({
      price: Number(texto.replace('$', '').trim()),
      quantity: 1,
    }));

    // 5. El ORÁCULO: los valores esperados salen de nuestra calculadora, no
    //    están quemados. Por eso un bug sembrado en price-calculator.ts
    //    también hace fallar esta prueba.
    //    toFixed(2) porque la página siempre muestra 2 decimales ($2.40, no $2.4).
    const esperadoSubtotal = subtotal(items).toFixed(2);
    const esperadoImpuesto = tax(items).toFixed(2);
    const esperadoTotal = total(items).toFixed(2);

    await expect(page.getByTestId('subtotal-label')).toHaveText(`Item total: $${esperadoSubtotal}`);
    await expect(page.getByTestId('tax-label')).toHaveText(`Tax: $${esperadoImpuesto}`);
    await expect(page.getByTestId('total-label')).toHaveText(`Total: $${esperadoTotal}`);
  });
});
