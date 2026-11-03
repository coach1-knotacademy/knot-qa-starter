# Estrategia de pruebas · [nombre genérico del sistema]

> Una página. Si no cabe, no está clara. Borrador después de la S1 (con tu ficha de caso real) y versión final después de la S2 (con ROI).

**Autor:** · **Fecha:** · **Versión:**

## 1. Contexto

Sistema, usuarios, arquitectura (web, API, móvil), ritmo de entregas. 3 líneas.

## 2. Riesgos (top 5)

| Riesgo | Impacto (1–5) | Probabilidad (1–5) | Prioridad (I×P) |
|---|---|---|---|
| | | | |

## 3. Alcance

- **Se automatiza:**
- **No se automatiza (y por qué):**
- **No se prueba (y quién asume el riesgo):**

## 4. Pirámide objetivo

| Capa | % hoy | % objetivo | Herramienta |
|---|---|---|---|
| Unit | | | |
| API / integración | | | |
| UI / E2E | | | |
| Exploratorio | | | — |

Forma hoy: ______ → forma objetivo: ______

## 5. Mapa SDLC: qué corre y cuándo

| Momento | Qué corre | Presupuesto de tiempo | ¿Bloquea? |
|---|---|---|---|
| Local | | segundos | — |
| Pull request | | < 10 min | merge |
| Merge a main | | < 15 min | deploy |
| Nocturna | | horas | no, alerta |
| Release / producción | | | go / no-go |

## 6. Herramientas y ambientes

Stack, ambientes, datos de prueba, dependencias externas (y cómo se aíslan).

## 7. Criterios de entrada y salida

- **Entrada:** cuándo empezamos a probar.
- **Salida:** cuándo decimos "listo".

## 8. Métricas

Tiempo de la suite, tasa de pruebas flaky, defectos escapados a producción, cobertura de riesgos.
