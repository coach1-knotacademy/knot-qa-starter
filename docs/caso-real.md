# Ficha de caso real · tu proyecto como hilo del bootcamp

> Completa esta ficha en `docs/caso-real.md` de tu repo. Es el insumo del **Lab 2 de la S1** (tu pirámide), de la **S2** (ROI y priorización) y del diseño de arquitectura de la **fase 2**.

## La regla de oro: caso real para diseñar, gemelo público para codificar

| | Caso real (tu proyecto) | Gemelo público |
|---|---|---|
| **Para qué** | Discutir riesgos, estrategia, ROI y decisiones de arquitectura | Escribir y correr el código del framework |
| **Dónde vive** | `docs/caso-real.md` (anonimizado) | Tu repo: pruebas, pages, config, CI |
| **Por qué** | Es lo que te importa y lo que defenderás el 3 de diciembre | No tienes acceso ni permiso para automatizar el sistema del cliente desde un curso |

Al final tendrás un framework funcionando contra un sistema público **con el mismo tipo de riesgos que tu proyecto**, y un documento que explica cómo se trasladaría al sistema real.

## Antes de escribir: anonimiza

- ❌ Nombres de clientes, productos internos, URLs, IPs, usuarios, capturas con datos.
- ❌ Volúmenes o cifras que identifiquen al cliente.
- ✅ "Un banco", "una aseguradora", "el core bancario", "un servicio de scoring de un tercero".
- ✅ Reglas de negocio genéricas: "si el monto supera X se requiere aprobación manual".

Si dudas, pregúntate: *¿podría leer esto alguien de la competencia sin problema?*

---

## 1. Contexto (3 líneas)

- **Industria:**
- **Tipo de sistema:** web / API / móvil / batch / SaaS
- **Usuarios principales:**
- **Releases:** cada ___
- **Equipo:** ___ devs, ___ QA

## 2. El flujo crítico

Describe paso a paso el flujo que más duele si falla.

1.
2.
3.
4.
5.

**Sistemas que toca:** front, servicios, terceros, base de datos, colas…

```
[Usuario] → [Web] → [API de solicitudes] → [Servicio de scoring (tercero)] → [Core]
```

## 3. Reglas de negocio (las que se pueden romper)

| # | Regla | Ejemplo con datos ficticios |
|---|---|---|
| R1 | | |
| R2 | | |
| R3 | | |

## 4. Riesgos (top 5)

| Riesgo | Impacto (1–5) | Probabilidad (1–5) | ¿Cómo se prueba hoy? |
|---|---|---|---|
| | | | |

## 5. Las 10 pruebas (Lab 2)

| # | Prueba | Capa hoy | Capa objetivo | Momento del pipeline | ¿Automatizar? |
|---|---|---|---|---|---|
| 1 | | UI / API / unit / manual | | local / PR / merge / nocturna / release | sí / no / después |

## 6. Forma de tu suite

- **Hoy:** pirámide / cono de helado / reloj de arena / no hay
- **Objetivo:**
- **Primer movimiento** (qué bajarías de capa primero y por qué):

## 7. Tu gemelo público

**Elegí:** ______ **porque** se parece a mi caso en: ______

| Mi caso real | Equivalente en el gemelo |
|---|---|
| Solicitud de crédito | Solicitud de préstamo en ParaBank |
| | |

---

## Catálogo de gemelos públicos

Todos respondieron el 3 de noviembre de 2026. Son ambientes de práctica públicos: **no los satures** (nada de pruebas de carga contra ellos).

| Dominio | Gemelo | Web | API | Qué se parece a la vida real |
|---|---|---|---|---|
| Banca y finanzas | **ParaBank** · parabank.parasoft.com | ✅ | ✅ REST | Registro, cuentas, transferencias, pago de facturas, solicitud de préstamo con aprobación o rechazo |
| Seguros | **ParaBank** (préstamo ≈ cotización) | ✅ | ✅ | Reglas de aprobación según monto, pago inicial y saldo |
| Retail / e-commerce | **Practice Software Testing (Toolshop)** · practicesoftwaretesting.com | ✅ | ✅ REST + Swagger | Catálogo, filtros, carrito, checkout, facturas, roles de usuario y administrador |
| Retail / e-commerce | **SauceDemo + DummyJSON** (el starter del curso) | ✅ | ✅ | Login, carrito, checkout con impuestos |
| Retail / e-commerce | **Automation Exercise** · automationexercise.com | ✅ | ✅ | Registro, productos, carrito, API de productos y usuarios |
| Salud, agendamiento, reservas | **Restful Booker** · restful-booker.herokuapp.com | — | ✅ | CRUD con autenticación por token, fechas, filtros, errores intencionales |
| Microservicios / contratos | **Swagger Petstore** · petstore.swagger.io | — | ✅ OpenAPI | Contrato publicado, validación de esquema |
| RR. HH. / SaaS empresarial | **OrangeHRM demo** · opensource-demo.orangehrmlive.com | ✅ | — | App empresarial: menús, tablas, formularios largos, roles |
| Gobierno, formularios | **DemoQA** · demoqa.com | ✅ | — | Formularios complejos, carga de archivos, tablas, alertas, iframes |
| Móvil | **Sauce Labs My Demo App** (Android) | 📱 | — | Catálogo, carrito, login y checkout en Appium |
| Legacy / batch / datos | Sin gemelo directo | — | — | Diseñamos sobre el caso real y simulamos la interfaz con una API (Restful Booker o DummyJSON) |

> ¿Conoces otro sistema público más parecido a tu caso? Propónlo: si es estable, lo sumamos al catálogo.
