import { test, expect } from '@playwright/test';
import { subtotal, tax, total, type Item } from '../../src/price-calculator';

/**
 * CAPA UNITARIA: probamos la regla de negocio directamente, sin red ni navegador.
 * Son las pruebas más rápidas y baratas: deberían ser la mayoría.
 */

// Tabla de casos (pruebas dirigidas por datos): agregar un caso = agregar una fila.
const casos: { nombre: string; items: Item[]; subtotal: number; tax: number; total: number }[] = [
  {
    nombre: 'un producto de 29.99',
    items: [{ price: 29.99, quantity: 1 }],
    subtotal: 29.99,
    tax: 2.4,
    total: 32.39,
  },
  {
    nombre: 'dos productos (29.99 + 9.99)',
    items: [
      { price: 29.99, quantity: 1 },
      { price: 9.99, quantity: 1 },
    ],
    subtotal: 39.98,
    tax: 3.2,
    total: 43.18,
  },
  {
    nombre: 'carrito vacío',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  },
  {
    // Frontera de redondeo: 7 centavos × 8 % = 0.56 centavos → redondea a 1 centavo.
    nombre: 'frontera de redondeo (0.07)',
    items: [{ price: 0.07, quantity: 1 }],
    subtotal: 0.07,
    tax: 0.01,
    total: 0.08,
  },
  {
    nombre: 'producto gratis (precio 0)',
    items: [{ price: 0, quantity: 1 }],
    subtotal: 0,
    tax: 0,
    total: 0,
  },
];

test.describe('Calculadora de precios', { tag: '@unit' }, () => {
  for (const caso of casos) {
    test(`calcula subtotal, impuesto y total: ${caso.nombre}`, () => {
      expect(subtotal(caso.items)).toBe(caso.subtotal);
      expect(tax(caso.items)).toBe(caso.tax);
      expect(total(caso.items)).toBe(caso.total);
    });
  }

  test('lanza error si la cantidad es 0', () => {
    expect(() => subtotal([{ price: 10, quantity: 0 }])).toThrow();
  });

  test('lanza error si el precio es negativo', () => {
    expect(() => subtotal([{ price: -1, quantity: 1 }])).toThrow();
  });
});
