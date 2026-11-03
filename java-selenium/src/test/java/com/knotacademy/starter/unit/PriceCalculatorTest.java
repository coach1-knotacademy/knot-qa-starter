package com.knotacademy.starter.unit;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.SoftAssertions.assertSoftly;

import com.knotacademy.starter.PriceCalculator;
import com.knotacademy.starter.PriceCalculator.Item;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * CAPA UNIT (base de la pirámide).
 * Prueba la regla de negocio directamente, sin red ni navegador: es la capa más rápida y barata.
 */
@Tag("unit")
@DisplayName("Unit · PriceCalculator")
class PriceCalculatorTest {

    /** Casos: descripción, ítems, subtotal, impuesto y total esperados. */
    static Stream<Arguments> carritos() {
        return Stream.of(
                Arguments.of("Un producto de 29.99",
                        List.of(Item.of("29.99", 1)), "29.99", "2.40", "32.39"),
                Arguments.of("Dos productos: 29.99 + 9.99",
                        List.of(Item.of("29.99", 1), Item.of("9.99", 1)), "39.98", "3.20", "43.18"),
                Arguments.of("Carrito vacío",
                        List.of(), "0.00", "0.00", "0.00"),
                Arguments.of("Frontera de redondeo: 0.07 → impuesto 0.0056 sube a 0.01",
                        List.of(Item.of("0.07", 1)), "0.07", "0.01", "0.08"),
                Arguments.of("Precio 0 permitido",
                        List.of(Item.of("0", 1)), "0.00", "0.00", "0.00")
        );
    }

    @ParameterizedTest(name = "{0} → subtotal {2}, impuesto {3}, total {4}")
    @MethodSource("carritos")
    @DisplayName("Calcula subtotal, impuesto (8 %) y total")
    void calculaSubtotalImpuestoYTotal(String descripcion, List<Item> items,
                                       String subtotal, String impuesto, String total) {
        // Comparamos BigDecimal con isEqualTo para exigir también la escala (2 decimales).
        // assertSoftly reporta TODAS las diferencias (subtotal, impuesto y total), no solo la primera.
        assertSoftly(softly -> {
            softly.assertThat(PriceCalculator.subtotal(items)).as("subtotal").isEqualTo(new BigDecimal(subtotal));
            softly.assertThat(PriceCalculator.tax(items)).as("impuesto").isEqualTo(new BigDecimal(impuesto));
            softly.assertThat(PriceCalculator.total(items)).as("total").isEqualTo(new BigDecimal(total));
        });
    }

    @Test
    @DisplayName("Cantidad 0 lanza IllegalArgumentException")
    void cantidadCeroLanzaExcepcion() {
        List<Item> items = List.of(Item.of("10.00", 0));

        assertThatThrownBy(() -> PriceCalculator.subtotal(items))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cantidad");
    }

    @Test
    @DisplayName("Precio negativo lanza IllegalArgumentException")
    void precioNegativoLanzaExcepcion() {
        List<Item> items = List.of(Item.of("-1.00", 1));

        assertThatThrownBy(() -> PriceCalculator.total(items))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("precio");
    }
}
