package com.knotacademy.starter.api;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

import com.knotacademy.starter.PriceCalculator;
import com.knotacademy.starter.PriceCalculator.Item;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.path.json.config.JsonPathConfig;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * CAPA API (mitad de la pirámide).
 * Prueba contra https://dummyjson.com usando REST Assured. Más lenta que unit (hay red),
 * pero mucho más rápida y estable que UI.
 */
@Tag("api")
@DisplayName("API · DummyJSON")
class DummyJsonApiTest {

    /**
     * IMPORTANTE: por defecto REST Assured convierte los decimales JSON a float y se pierde precisión
     * (11999.97 como float NO es exacto). Le pedimos que los entregue como BigDecimal.
     */
    private static final JsonPathConfig BIG_DECIMAL =
            JsonPathConfig.jsonPathConfig().numberReturnType(JsonPathConfig.NumberReturnType.BIG_DECIMAL);

    @BeforeAll
    static void configurar() {
        RestAssured.baseURI = config("api.baseUrl");
        // Si una prueba falla, imprime la petición y la respuesta para depurar
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    @Test
    @DisplayName("GET /products/1 responde 200 con id 1, título y precio > 0")
    void obtenerProducto() {
        JsonPath json = given()
                .when()
                    .get("/products/1")
                .then()
                    .statusCode(200)
                    .extract().jsonPath(BIG_DECIMAL);

        assertThat(json.getInt("id")).isEqualTo(1);
        assertThat(json.getString("title")).isNotBlank();
        assertThat(money(json.get("price"))).isPositive();
    }

    @Test
    @DisplayName("GET /carts/1: los totales del carrito coinciden con PriceCalculator (oráculo)")
    void totalesDelCarritoCoincidenConElOraculo() {
        JsonPath json = given()
                .when()
                    .get("/carts/1")
                .then()
                    .statusCode(200)
                    .extract().jsonPath(BIG_DECIMAL);

        List<Map<String, Object>> products = json.getList("products");
        assertThat(products).as("el carrito debe tener productos").isNotEmpty();

        List<Item> todos = new ArrayList<>();
        for (Map<String, Object> p : products) {
            Item item = new Item(money(p.get("price")), ((Number) p.get("quantity")).intValue());
            todos.add(item);

            // Cada línea: product.total == precio × cantidad (según nuestra regla de negocio)
            assertThat(money(p.get("total")))
                    .as("total del producto '%s'", p.get("title"))
                    .isEqualTo(PriceCalculator.subtotal(List.of(item)));
        }

        // Total del carrito == subtotal de todos los productos
        assertThat(money(json.get("total")))
                .as("total del carrito")
                .isEqualTo(PriceCalculator.subtotal(todos));
    }

    @Test
    @DisplayName("POST /auth/login con credenciales válidas responde 200 y un accessToken")
    void loginValido() {
        String token = given()
                    .contentType(ContentType.JSON)
                    .body("{\"username\":\"emilys\",\"password\":\"emilyspass\"}")
                .when()
                    .post("/auth/login")
                .then()
                    .statusCode(200)
                    .extract().path("accessToken");

        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("POST /auth/login con contraseña incorrecta responde 400")
    void loginConPasswordIncorrecto() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"username\":\"emilys\",\"password\":\"clave-incorrecta\"}")
            .when()
                .post("/auth/login")
            .then()
                .statusCode(400);
    }

    // ---------- utilidades (deuda técnica intencional: viven dentro de la clase de prueba) ----------

    /** Convierte un número JSON (entero o decimal) a BigDecimal con 2 decimales. */
    private static BigDecimal money(Object value) {
        return new BigDecimal(String.valueOf(value)).setScale(2, RoundingMode.HALF_UP);
    }

    /** Lee una clave: primero -Dclave=valor, si no existe, config.properties. */
    private static String config(String key) {
        String fromSystem = System.getProperty(key);
        if (fromSystem != null && !fromSystem.isBlank()) {
            return fromSystem;
        }
        Properties props = new Properties();
        try (InputStream in = DummyJsonApiTest.class.getResourceAsStream("/config.properties")) {
            props.load(in);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo leer config.properties", e);
        }
        return props.getProperty(key);
    }
}
