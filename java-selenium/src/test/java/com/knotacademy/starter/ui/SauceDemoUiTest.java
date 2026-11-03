package com.knotacademy.starter.ui;

import static org.assertj.core.api.Assertions.assertThat;

import com.knotacademy.starter.PriceCalculator;
import com.knotacademy.starter.PriceCalculator.Item;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * CAPA UI (punta de la pirámide).
 * Prueba de punta a punta en https://www.saucedemo.com con Selenium + Chrome.
 * Es la capa más lenta y frágil, pero la que más se parece a lo que hace el usuario.
 *
 * <p>Deuda técnica intencional: los localizadores viven dentro de la prueba y el driver
 * se crea aquí mismo. En las sesiones 3–6 lo refactorizamos a Page Objects y una DriverFactory.
 */
@Tag("ui")
@DisplayName("UI · SauceDemo")
class SauceDemoUiTest {

    /*
     * Selenium 4.28.1 trae soporte CDP hasta Chrome ~132. Con Chrome más nuevo imprime la advertencia
     * "Unable to find CDP implementation matching NNN". Es inofensiva (no usamos CDP), así que la silenciamos.
     * Guardamos los Logger en campos estáticos para que el recolector de basura no descarte la configuración.
     */
    private static final Logger CDP_LOGGER = Logger.getLogger("org.openqa.selenium.devtools");
    private static final Logger CHROMIUM_LOGGER = Logger.getLogger("org.openqa.selenium.chromium");

    static {
        CDP_LOGGER.setLevel(Level.SEVERE);
        CHROMIUM_LOGGER.setLevel(Level.SEVERE);
    }

    private WebDriver driver;
    private WebDriverWait wait;
    private String baseUrl;

    @BeforeEach
    void abrirNavegador() {
        baseUrl = config("ui.baseUrl");

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--window-size=1366,900");
        if (isHeadless()) {
            options.addArguments("--headless=new");
        }
        // Evita los popups del gestor de contraseñas de Chrome (p. ej. "Cambia tu contraseña"),
        // que aparecen en SauceDemo porque sus credenciales son públicas.
        Map<String, Object> prefs = new HashMap<>();
        prefs.put("credentials_enable_service", false);
        prefs.put("profile.password_manager_enabled", false);
        prefs.put("profile.password_manager_leak_detection", false);
        options.setExperimentalOption("prefs", prefs);
        options.addArguments("--disable-features=PasswordLeakDetection,PasswordManagerOnboarding");

        // Selenium Manager descarga/resuelve el chromedriver correcto automáticamente
        driver = new ChromeDriver(options);
        // Esperas explícitas: nada de Thread.sleep
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void cerrarNavegador() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @DisplayName("Login con standard_user lleva al inventario (Products)")
    void loginExitoso() {
        login("standard_user", "secret_sauce");

        wait.until(ExpectedConditions.urlContains("inventory.html"));
        WebElement title = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-test='title']")));

        assertThat(driver.getCurrentUrl()).contains("inventory.html");
        assertThat(title.getText()).isEqualTo("Products");
    }

    @Test
    @DisplayName("Login con locked_out_user muestra mensaje de usuario bloqueado")
    void loginUsuarioBloqueado() {
        login("locked_out_user", "secret_sauce");

        WebElement error = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-test='error']")));

        assertThat(error.getText()).contains("Sorry, this user has been locked out.");
    }

    @Test
    @DisplayName("Checkout: subtotal, impuesto y total coinciden con PriceCalculator (oráculo)")
    void checkoutCoincideConElOraculo() {
        login("standard_user", "secret_sauce");

        // 1. Agregar la mochila al carrito
        click(By.cssSelector("[data-test='add-to-cart-sauce-labs-backpack']"));

        // 2. Ir al carrito y pasar a checkout
        click(By.cssSelector("[data-test='shopping-cart-link']"));
        click(By.cssSelector("[data-test='checkout']"));

        // 3. Datos del comprador
        type(By.cssSelector("[data-test='firstName']"), "Ana");
        type(By.cssSelector("[data-test='lastName']"), "Pérez");
        type(By.cssSelector("[data-test='postalCode']"), "110111");
        click(By.cssSelector("[data-test='continue']"));

        // 4. En el resumen (overview) leemos los precios que muestra la UI
        wait.until(ExpectedConditions.urlContains("checkout-step-two.html"));
        List<WebElement> priceElements = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector("[data-test='inventory-item-price']")));
        // SauceDemo agrega cada producto con cantidad 1
        List<Item> items = priceElements.stream()
                .map(e -> new Item(new BigDecimal(e.getText().replace("$", "").trim()), 1))
                .toList();
        assertThat(items).as("debe haber al menos un producto en el resumen").isNotEmpty();

        // 5. Los valores esperados salen del ORÁCULO (PriceCalculator), no están quemados en la prueba.
        //    Por eso, si se siembra un bug en PriceCalculator, esta prueba también lo detecta.
        BigDecimal subtotal = PriceCalculator.subtotal(items);
        BigDecimal tax = PriceCalculator.tax(items);
        BigDecimal total = PriceCalculator.total(items);

        assertThat(textOf(By.cssSelector("[data-test='subtotal-label']"))).isEqualTo("Item total: $" + subtotal);
        assertThat(textOf(By.cssSelector("[data-test='tax-label']"))).isEqualTo("Tax: $" + tax);
        assertThat(textOf(By.cssSelector("[data-test='total-label']"))).isEqualTo("Total: $" + total);
    }

    // ---------- utilidades (deuda técnica intencional: viven dentro de la clase de prueba) ----------

    private void login(String username, String password) {
        driver.get(baseUrl);
        type(By.cssSelector("[data-test='username']"), username);
        type(By.cssSelector("[data-test='password']"), password);
        click(By.cssSelector("[data-test='login-button']"));
    }

    private void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    private void type(By locator, String text) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        input.clear();
        input.sendKeys(text);
    }

    private String textOf(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getText();
    }

    /**
     * Headless: -Dheadless=true|false manda. Si no se indica, es true cuando existe la variable
     * de entorno CI (pipelines) y false en local (para ver el navegador).
     */
    private static boolean isHeadless() {
        String prop = System.getProperty("headless");
        if (prop != null && !prop.isBlank()) {
            return Boolean.parseBoolean(prop);
        }
        return System.getenv("CI") != null;
    }

    /** Lee una clave: primero -Dclave=valor, si no existe, config.properties. */
    private static String config(String key) {
        String fromSystem = System.getProperty(key);
        if (fromSystem != null && !fromSystem.isBlank()) {
            return fromSystem;
        }
        Properties props = new Properties();
        try (InputStream in = SauceDemoUiTest.class.getResourceAsStream("/config.properties")) {
            props.load(in);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo leer config.properties", e);
        }
        return props.getProperty(key);
    }
}
