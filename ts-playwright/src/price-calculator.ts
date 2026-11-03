/**
 * Calculadora de precios: la regla de negocio que probamos en las TRES capas
 * de la pirámide (unitaria, API y UI).
 *
 * Decisiones de diseño:
 * - Internamente trabajamos en CENTAVOS ENTEROS para evitar errores de punto
 *   flotante (por ejemplo, 0.1 + 0.2 !== 0.3 en JavaScript).
 * - Los precios llegan en unidades de moneda con máximo 2 decimales (29.99).
 * - El impuesto es 8 %, igual que en SauceDemo.
 * - TODO el redondeo de negocio pasa por UNA sola función: redondearCentavos().
 */

export type Item = { price: number; quantity: number };

/** Tasa de impuesto expresada en puntos porcentuales (8 %). */
const TASA_IMPUESTO_PORCENTAJE = 8;

/**
 * ÚNICO punto de redondeo de negocio (redondeo "half-up" a centavos).
 *
 * Recibe una cantidad de centavos que puede tener fracción (ej. 239.92) y
 * devuelve centavos enteros. Para valores positivos, Math.round redondea
 * x.5 hacia arriba, que es justo el "half-up" que pide la regla.
 *
 * >>> LAB "Siembra un bug": cambia Math.round por Math.floor en la línea de
 * >>> abajo. Ejemplo: 29.99 → impuesto 239.92 centavos → Math.round = 240
 * >>> ($2.40, correcto) vs. Math.floor = 239 ($2.39, bug).
 */
function redondearCentavos(centavos: number): number {
  return Math.round(centavos); // <-- LÍNEA DEL LAB: Math.round → Math.floor
}

/**
 * Convierte un precio (ej. 29.99) a centavos enteros (2999).
 * Ojo: 29.99 * 100 = 2998.9999999999995 en punto flotante; toFixed(0) lo
 * corrige. NO es redondeo de negocio, por eso no usa redondearCentavos().
 */
function aCentavos(precio: number): number {
  return Number((precio * 100).toFixed(0));
}

/** Valida un ítem: cantidad >= 1 y precio >= 0 (precio 0 sí se permite). */
function validarItem(item: Item): void {
  if (!Number.isFinite(item.quantity) || item.quantity < 1) {
    throw new Error(`Cantidad inválida: ${item.quantity}. Debe ser mayor o igual a 1.`);
  }
  if (!Number.isFinite(item.price) || item.price < 0) {
    throw new Error(`Precio inválido: ${item.price}. No puede ser negativo.`);
  }
}

function subtotalEnCentavos(items: Item[]): number {
  let suma = 0;
  for (const item of items) {
    validarItem(item);
    suma += aCentavos(item.price) * item.quantity;
  }
  return redondearCentavos(suma);
}

function impuestoEnCentavos(subtotalCentavos: number): number {
  return redondearCentavos((subtotalCentavos * TASA_IMPUESTO_PORCENTAJE) / 100);
}

/** Σ precio × cantidad, redondeado a 2 decimales. Lista vacía → 0. */
export function subtotal(items: Item[]): number {
  return subtotalEnCentavos(items) / 100;
}

/** subtotal × 8 %, redondeado a 2 decimales (half-up). */
export function tax(items: Item[]): number {
  return impuestoEnCentavos(subtotalEnCentavos(items)) / 100;
}

/** subtotal + impuesto, con 2 decimales. */
export function total(items: Item[]): number {
  const sub = subtotalEnCentavos(items);
  return (sub + impuestoEnCentavos(sub)) / 100;
}
