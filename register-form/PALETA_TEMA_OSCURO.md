# Guía de uso: tema oscuro

Esta guía describe la paleta oscura que está activa en el proyecto y cómo usarla como base para futuras pantallas o proyectos derivados de Porerekua.

## Nota de consistencia

El repositorio contiene dos capas de paleta:

1. Una paleta conceptual documentada previamente en `NUEVA_PALETA_AMAZONICA.md`, con nombres como `fibra-natural`, `verde-brote`, `terracota` y `verde-hoja-seca`.
2. La paleta que realmente está aplicada hoy en el código, definida principalmente en `styles/immersive.css`, `index.html` y `hooks/useDayNightCycle.ts`.

Para nuevos desarrollos, esta guía toma como referencia la paleta activa en código. Si se quiere volver a la paleta conceptual anterior, convendría hacer una migración formal de tokens.

## Paleta activa

Estos son los colores base actualmente disponibles como variables globales o extensiones de Tailwind:

| Token / nombre | Hex | Uso recomendado |
| --- | --- | --- |
| `--color-carbon` | `#312F2A` | Fondo oscuro principal, texto principal sobre superficies claras |
| `--color-blanco-hueso` | `#F4F4F4` | Texto principal en oscuro, superficies claras |
| `--color-gris-piedra` | `#78716C` | Texto secundario neutro, controles inactivos |
| `--color-verde-hoja` | `#7A9A3E` | Identidad, estados activos, selección |
| `--color-amarillo-sol` | `#C9920A` | Detalles cálidos y llamados sutiles |
| `--color-amarillo-sol-muted` | `#D8C764` | Texto secundario cálido en tema oscuro |
| `--color-naranja-vibrante` | `#F39C12` | Acción, hover, foco, CTA |
| `--color-azul-cobalto` | `#007BFF` | Interacción secundaria, preferentemente en tema claro |

En `index.html`, Tailwind también expone algunos nombres equivalentes, aunque `amarillo-sol` allí figura como `#F0D43A`. En la práctica visual actual, la variable CSS `--color-amarillo-sol: #C9920A` es la referencia más cercana al uso real.

## Tema oscuro aplicado

Cuando se activa el tema oscuro, `useDayNightCycle.ts` aplica estos roles:

```css
--theme-background: #312F2A;
--theme-text-primary: #F4F4F4;
--theme-text-secondary: #D8C764;
--theme-primary: #7A9A3E;
--theme-secondary: #F39C12;
--theme-accent: #1ABC9C;
--theme-bg-image: url('/assets/background/bg21_night.jpg');
```

Estos roles deben ser la primera opción para nuevos componentes. Los hex directos deben quedar para casos puntuales.

## Principio visual

El tema oscuro de Porerekua debe sentirse cálido, natural y legible. No busca una estética tecnológica azulada ni un modo negro puro. La base correcta es:

- Carbón cálido para profundidad.
- Blanco hueso para lectura.
- Verde hoja para identidad y estado.
- Naranja vibrante para acción.
- Amarillo muted para apoyo cálido.

## Roles de uso

**Fondo principal**

Usa `--theme-background` para fondos globales, navegación, áreas estructurales y contenedores de aplicación. Evita `#000000`; endurece demasiado la experiencia y se aleja de la identidad visual.

**Texto principal**

Usa `--theme-text-primary` para títulos, navegación principal, labels importantes y contenido de lectura prioritaria. En oscuro equivale a `#F4F4F4`, que es más amable que blanco puro.

**Texto secundario**

Usa `--theme-text-secondary` para subtítulos, ayudas y microcopy. Como en oscuro es `#D8C764`, tiene una presencia cálida. Funciona muy bien para frases breves, pero no debería dominar párrafos largos.

**Identidad y estado**

Usa `--theme-primary` para elementos activos, selección, indicadores, estados completados y acentos institucionales. El verde hoja debe comunicar continuidad, vida y pertenencia.

**Acción e interacción**

Usa `--theme-secondary` o `--color-naranja-vibrante` para hover, foco, acciones principales y llamadas a registro. El naranja debe sentirse como respuesta o invitación, no como color de fondo dominante.

**Acento complementario**

`--theme-accent` actualmente toma `#1ABC9C` en modo oscuro, pero su uso real es limitado. Para futuros proyectos, úsalo solo si necesitas una tercera categoría visual clara. No lo conviertas en color principal sin revisar todo el sistema.

## Combinaciones recomendadas

| Caso | Fondo | Texto / elemento |
| --- | --- | --- |
| Lectura en oscuro | `#312F2A` | `#F4F4F4` |
| Apoyo breve en oscuro | `#312F2A` | `#D8C764` |
| Estado activo | `#312F2A` | `#7A9A3E` |
| Hover o foco | `#312F2A` | `#F39C12` |
| CTA lineal | Transparente | Borde y texto `#F39C12` |
| Superficie clara | `#F4F4F4` o `#FFFFFF` | `#312F2A` |

## Reglas para futuros proyectos

1. Usa tokens semánticos (`--theme-*`) antes que colores directos.
2. Mantén `#312F2A` como fondo oscuro principal.
3. Usa `#F4F4F4` para texto principal, no blanco puro salvo necesidad puntual.
4. Reserva el verde para estados activos, identidad y estructura.
5. Reserva el naranja para interacción, foco y acciones.
6. Usa el amarillo muted para apoyo breve; no lo conviertas en texto secundario masivo.
7. Usa azul o turquesa con mucha moderación en oscuro, porque pueden mover la identidad hacia una estética tecnológica.
8. Si una nueva superficie debe ser oscura, crea o formaliza un token de superficie. Actualmente muchas superficies usan blanco hueso o blanco, lo cual genera una interfaz mixta.
9. Si se decide adoptar la paleta conceptual `fibra-natural / terracota / verde-brote`, primero alinea los tokens de Tailwind, CSS y hook para evitar duplicidad.

## Lectura sobre superficies claras

El proyecto usa con frecuencia superficies claras incluso dentro de experiencias con fondo oscuro. En esos casos:

- Usa `#312F2A` para títulos y cuerpo principal.
- Usa `#78716C` para texto secundario.
- Usa `#7A9A3E` para estado activo.
- Usa `#F39C12` para acción.

No uses `--theme-text-primary` automáticamente sobre una superficie clara si el tema global está oscuro, porque puede convertirse en texto claro sobre fondo claro.

## Resumen

Sí: la paleta oscura correcta del código activo es carbón, blanco hueso, verde hoja, naranja vibrante y amarillo muted. La documentación anterior del proyecto describe una dirección conceptual parecida, pero con nombres y valores distintos. Para futuros proyectos, esta guía recomienda partir de la paleta activa y migrar de forma explícita si se quiere adoptar la nomenclatura anterior.

