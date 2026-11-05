# Elige tu ruta para la clase

**Todas llegan a lo mismo:** ver tus casos convertidos en pruebas, con reporte y pantallazos. No hay una ruta mejor: usa la que tu equipo permita.

| Ruta | Necesitas | Qué haces | Tiempo |
|---|---|---|---|
| **1 · En tu equipo** | Poder ejecutar programas | Corres las pruebas en tu computador | 5 min |
| **2 · En la nube** | Abrir github.com y una cuenta personal | Editas una tabla en el navegador y la nube corre las pruebas | 5 min |
| **3 · Solo navegador** | Un navegador | Buscas bugs a mano, dictas tus casos y ves la evidencia | 1 min |

## ¿Cuál me toca?

Empieza por la **Ruta 1**. Si en 5 minutos no funciona, **no sigas insistiendo**: pasa a la 2. Si GitHub tampoco abre, ve a la 3. Nadie se queda por fuera.

**Mientras decides, ya puedes empezar:** [abre el Banco Demo](https://coach1-knotacademy.github.io/knot-qa-starter/banco/index.html) y busca bugs (`ana` / `Clave123`).

---

## Ruta 1 · En tu equipo

1. Descarga el proyecto: [Download ZIP](https://github.com/coach1-knotacademy/knot-qa-starter/archive/refs/heads/main.zip).
2. **Clic derecho en el ZIP → Propiedades → Desbloquear → Aceptar.** Luego *Extraer todo*, ojalá fuera de OneDrive.
3. Abre la carpeta y haz **doble clic en `preparar.cmd`**. Si Windows avisa, elige *Más información → Ejecutar de todas formas*. Si tu política no lo permite, pasa a la Ruta 2.
4. Cuando diga **LISTO**, escribe en el chat: `RUTA 1 LISTA`. **No cierres esa ventana.**

Para trabajar, en esa ventana:

```powershell
npm.cmd run casos         # corre tus casos
npm.cmd run evidencias    # crea evidencias.html: ábrelo con doble clic
```

Edita los casos con el Bloc de notas o VS Code: `ts-playwright\tests\s2\casos\transferencias.csv`.

**Si falla:**

| Mensaje | Qué hacer |
|---|---|
| *Bloqueado por el administrador* o *directiva* | Ruta 2 |
| *No se pudo descargar Node* | Instala Node desde el **Portal de Empresa**, reinicia y repite. Mientras tanto, Ruta 2 |
| *npm ci falló* | La red bloquea las dependencias: Ruta 2 |

## Ruta 2 · En la nube, sin instalar

1. Entra a [github.com](https://github.com) con una cuenta **personal** gratuita. Sin datos ni código del cliente.
2. Abre [el proyecto](https://github.com/coach1-knotacademy/knot-qa-starter) y pulsa **Use this template → Create a new repository**. Ponle un nombre y pulsa **Create repository**.
3. En tu repositorio nuevo, abre `ts-playwright/tests/s2/casos/transferencias.csv` y pulsa el **lápiz ✏️**.
4. Agrega tu caso al final, como una fila más. Pulsa **Commit changes**.
5. Ve a la pestaña **Actions** y abre la corrida. En unos 2 minutos verás cada caso en ✅ o ❌.
6. Abajo, en **Artifacts**, descarga **`evidencias.html`** y ábrelo: están los pantallazos.

Escribe en el chat: `RUTA 2 LISTA`.

**Si falla:** si Actions dice *Workflows aren't being run*, pulsa **Enable**. Si no puedes crear la cuenta o GitHub no abre, Ruta 3.

## Ruta 3 · Solo navegador

1. Abre el [Banco Demo](https://coach1-knotacademy.github.io/knot-qa-starter/banco/index.html) y prueba a mano, como lo haces siempre.
2. Dicta tu caso en el chat, con este formato:

   ```text
   CASO: monto exacto de 1000 | Corriente | destino 2000000001 | monto 1000 | esperado: exitosa
   ```

3. El instructor lo agrega a la tabla. En unos minutos aparece en las [evidencias](https://coach1-knotacademy.github.io/knot-qa-starter/evidencias.html), con tus pantallazos.

**¿No abre el enlace?** Si pudiste bajar el ZIP, abre `banco-sin-instalar\index.html` con doble clic. Si tampoco, pídele el archivo al instructor, usa tu celular con datos móviles o trabaja con un compañero. **Ningún dato del cliente:** es un banco de mentira.

Escribe en el chat: `RUTA 3 LISTA`.

---

## Las filas de la tabla

`transferencias.csv` tiene estas columnas, separadas por `;`:

| Columna | Ejemplo | Qué es |
|---|---|---|
| `id` | `T07` | Número de tu caso |
| `caso` | `Monto exacto del mínimo` | Lo que pruebas |
| `tipo` | `límite` | límite, seguridad, cálculo o validación |
| `usuario` | `ana` | Quién hace la transferencia |
| `cuenta_origen` | `1000000002` | Ahorros `1000000001` o Corriente `1000000002` |
| `destino` | `2000000001` | Cuenta de 10 dígitos |
| `monto` | `1000` | Sin puntos ni signo $ |
| `resultado_esperado` | `exitosa` | `exitosa`, o el mensaje exacto de error |
| `gmf_esperado` | `4` | El 4x1000 esperado. Opcional |
| `saldo_despues_esperado` | `149600` | El saldo esperado después. Opcional |

Ejemplo de fila:

```text
T07;Monto exacto del mínimo;límite;ana;1000000001;2000000001;1000;exitosa;4;1498996
```

**Una fila en rojo no es un error tuyo.** O la fila está mal escrita, o encontraste un hallazgo. Decidirlo es tu trabajo como tester.
