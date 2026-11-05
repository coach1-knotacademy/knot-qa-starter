# Automatizar con IA, sin perder el criterio

La IA escribe la prueba en segundos. Decidir qué probar y si la prueba sirve sigue siendo tu trabajo.

> ⚠️ **Antes de pegar nada:** no uses nombres de clientes, URLs internas, usuarios, claves ni datos reales. Usa solo herramientas autorizadas por tu proyecto.

## Tres formas de usarla

### 0. Para llenar tu tabla, sin programar

```text
Soy tester. Dame filas de prueba separadas por ; con estas columnas:
id;caso;tipo;usuario;cuenta_origen;destino;monto;resultado_esperado;gmf_esperado;saldo_despues_esperado

Reglas: monto mínimo $1.000, máximo $2.000.000. El 4x1000 es el monto x 4 / 1000, redondeado.
Se debita del saldo el monto más el 4x1000. Usuario ana. Origen 1000000001, con saldo 1500000.
Destino de 10 dígitos, distinto al de origen. Si es válida, resultado_esperado es: exitosa.
Dame 5 filas válidas o de valores límite. Sin explicaciones.
```

Revisa cada fila antes de usarla: **la IA puede equivocarse en el saldo esperado**. Si una fila sale en rojo, decide tú quién tiene la razón.

### 1. Para pensar casos, antes de automatizar

```text
Soy tester de una banca web. La regla es:
una transferencia debe ser de mínimo $1.000 y máximo $2.000.000, y no puede superar el saldo.
Lístame casos de prueba en una tabla: caso, entrada, resultado esperado.
Incluye valores límite y casos negativos. No escribas código.
```

### 2. Para convertir tu caso manual en una prueba

```text
Escribe una prueba en Playwright con TypeScript para este caso manual.

Sistema: http://127.0.0.1:4000
Pasos:
1. Ingresar a /transferir con sesión abierta.
2. Escribir la cuenta destino 2000000001 y el monto 50000.
3. Marcar "Acepto el cobro del 4x1000" y dar clic en Transferir.
Resultado esperado: aparece "Transferencia exitosa" y el 4x1000 es $200.

Reglas:
- Usa getByRole y getByLabel. No uses selectores CSS.
- No uses waitForTimeout.
- Verifica el resultado con expect.
- Para la sesión, usa abrirConSesion de ./ayudas/sesion.
```

### 3. Para entender algo que no conoces

```text
Explícame esta prueba línea por línea, como a alguien que prueba a mano y nunca ha programado.
```

## Lista de chequeo: antes de aceptar lo que escribió

| # | Revisa | Señal de problema |
|---|---|---|
| 1 | ¿Tiene un resultado esperado que importe? | Sin `expect`, o verifica algo que pasa aunque el caso falle, como el título de la página |
| 2 | ¿Espera de la forma correcta? | `waitForTimeout(3000)` |
| 3 | ¿Busca los elementos como los ve una persona? | `#id-123`, `.btn-primary`, `div > div:nth-child(3)` |
| 4 | ¿Prueba lo que pediste? | Pasos que no pediste, o se saltó el paso importante |
| 5 | ¿Inventó cosas? | Campos, botones o rutas que no existen en el sistema |
| 6 | ¿Falla cuando debe fallar? | **Daña el resultado esperado a propósito y córrela.** Si sigue en verde, no sirve |
| 7 | ¿La entiendes? | Si no puedes explicarla, no la entregues |
| 8 | ¿Hay datos sensibles? | Claves, nombres o URLs reales dentro del código |

## Lo que se automatiza con y sin IA

| | Sin IA | Con IA |
|---|---|---|
| **Grabar** | `codegen`: reproduce lo que tú hiciste | — |
| **Escribir** | Tú escribes, con los ejemplos de base | Le das el caso y el contexto, y revisas |
| **Lo mejor para** | Entender y tener control | Ir rápido en lo repetitivo y pensar casos |
| **El riesgo** | Tarda más al inicio | Pruebas que pasan pero no prueban nada |

La IA no da siempre la misma respuesta. Por eso la prueba final debe ser código revisado: ese sí da el mismo resultado en cada corrida.
