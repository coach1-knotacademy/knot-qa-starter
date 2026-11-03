package com.knotacademy.starter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

/**
 * Regla de negocio del bootcamp: cálculo de subtotal, impuesto y total de un carrito.
 *
 * <p>Es la MISMA regla que se prueba en las tres capas de la pirámide:
 * <ul>
 *   <li>Unit: {@code PriceCalculatorTest} la llama directamente (milisegundos).</li>
 *   <li>API: {@code DummyJsonApiTest} la usa como "oráculo" para validar los totales de un carrito real.</li>
 *   <li>UI: {@code SauceDemoUiTest} la usa como "oráculo" para validar el resumen del checkout.</li>
 * </ul>
 *
 * <p>Usamos {@link BigDecimal} (nunca double/float) porque el dinero debe ser exacto.
 */
public final class PriceCalculator {

    /** Tasa de impuesto: 8 %, igual a la que aplica SauceDemo en su checkout. */
    public static final BigDecimal TAX_RATE = new BigDecimal("0.08");

    /** Cantidad de decimales para valores de dinero. */
    public static final int MONEY_SCALE = 2;

    // >>> LAB "Siembra un bug": cambia HALF_UP por DOWN en la siguiente línea, corre las 3 capas y compara. <<<
    // Con DOWN, el impuesto de 29.99 pasa de 2.40 a 2.39. ¡Recuerda revertirlo al terminar!
    public static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    private PriceCalculator() {
        // Clase utilitaria: no se instancia.
    }

    /**
     * Ítem del carrito: precio unitario y cantidad.
     *
     * @param price    precio unitario (debe ser mayor o igual a 0)
     * @param quantity cantidad (debe ser mayor o igual a 1)
     */
    public record Item(BigDecimal price, int quantity) {

        /** Atajo para escribir pruebas legibles: {@code Item.of("29.99", 1)}. */
        public static Item of(String price, int quantity) {
            return new Item(new BigDecimal(price), quantity);
        }
    }

    /**
     * Subtotal = Σ (precio × cantidad), con 2 decimales. Lista vacía → 0.00.
     *
     * @throws IllegalArgumentException si algún ítem tiene cantidad &lt; 1 o precio &lt; 0
     */
    public static BigDecimal subtotal(List<Item> items) {
        Objects.requireNonNull(items, "La lista de ítems no puede ser null");
        BigDecimal sum = BigDecimal.ZERO;
        for (Item item : items) {
            validate(item);
            sum = sum.add(item.price().multiply(BigDecimal.valueOf(item.quantity())));
        }
        return sum.setScale(MONEY_SCALE, ROUNDING_MODE);
    }

    /** Impuesto = subtotal × 0.08, redondeado a 2 decimales con {@link #ROUNDING_MODE}. */
    public static BigDecimal tax(List<Item> items) {
        return subtotal(items).multiply(TAX_RATE).setScale(MONEY_SCALE, ROUNDING_MODE);
    }

    /** Total = subtotal + impuesto. */
    public static BigDecimal total(List<Item> items) {
        return subtotal(items).add(tax(items));
    }

    private static void validate(Item item) {
        if (item == null) {
            throw new IllegalArgumentException("El ítem no puede ser null");
        }
        if (item.quantity() < 1) {
            throw new IllegalArgumentException("La cantidad debe ser al menos 1, pero fue " + item.quantity());
        }
        if (item.price() == null || item.price().signum() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo ni null, pero fue " + item.price());
        }
    }
}
