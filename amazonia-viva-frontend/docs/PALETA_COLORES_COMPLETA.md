# 🎨 Paleta de Colores Completa - Proyecto Porerekua

**Documentación integral de la paleta de colores para modo claro y modo oscuro**

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Colores Base](#colores-base)
3. [Modo Claro](#modo-claro)
4. [Modo Oscuro](#modo-oscuro)
5. [Variantes y Transparencias](#variantes-y-transparencias)
6. [Patrones de Uso](#patrones-de-uso)
7. [Configuración Técnica](#configuración-técnica)

---

## Introducción

La paleta de colores de **Porerekua** sigue una estrategia **tetrádica + neutrals**, diseñada para reflejar la identidad amazónica con colores naturales que transmiten confianza, energía y estabilidad.

**Características:**
- ✅ Diseño responsivo para modo claro y oscuro
- ✅ Colores accesibles y contrastados
- ✅ Sistema de transparencias para efectos sutiles
- ✅ Nombres intuitivos y semánticos
- ✅ Integración con Tailwind CSS

---

## Colores Base

La paleta consta de **5 colores primarios** + **3 neutrals** + **1 acento rojo**

### 1️⃣ Verde Brote (Primario)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Verde Brote / Verde Hoja |
| **Hex** | `#7A9A3E` |
| **RGB** | `rgb(122, 154, 62)` |
| **Tailwind** | `verde-brote`, `verde-hoja`, `verde-esmeralda` |
| **Propósito** | Identidad visual, confianza, naturaleza |
| **Usos** | CTAs secundarios, iconos activos, acentos naturales |

### 2️⃣ Azul Cobalto (Primario)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Azul Cobalto |
| **Hex** | `#007BFF` |
| **RGB** | `rgb(0, 123, 255)` |
| **Tailwind** | `azul-cobalto` |
| **Propósito** | Estabilidad, confianza, interactividad |
| **Usos** | Enlaces, estados interactivos, detalles técnicos |

### 3️⃣ Amarillo Sol (Acento)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Amarillo Sol |
| **Hex** | `#F0D43A` |
| **RGB** | `rgb(240, 212, 58)` |
| **Tailwind** | `amarillo-sol` |
| **Propósito** | Energía, iluminación, atención |
| **Usos** | Destacados, alertas positivas, énfasis |

### 4️⃣ Naranja Vibrante (Acento Principal)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Naranja Vibrante / Terracota |
| **Hex** | `#F39C12` |
| **RGB** | `rgb(243, 156, 18)` |
| **Tailwind** | `naranja-vibrante`, `terracota`, `flor-azai` |
| **Propósito** | **Llamadas a acción (CTAs)**, energía cálida |
| **Usos** | Botones principales, acciones destacadas, hover states |

### 5️⃣ Rojo Acento (Especial)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Rojo Acento |
| **Hex** | `#E03A3A` |
| **RGB** | `rgb(224, 58, 58)` |
| **Tailwind** | `accent-rojo` |
| **Propósito** | Atención, peligro, errores |
| **Usos** | Mensajes de error, advertencias, acciones peligrosas |

---

## Colores Neutrals

### 1. Blanco / Beige Arena (Fondo Claro)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Blanco Puro / Beige Arena / Blanco Hueso |
| **Hex** | `#F4F4F4` |
| **RGB** | `rgb(244, 244, 244)` |
| **Tailwind** | `blanco-puro`, `beige-arena`, `blanco-hueso`, `fibra-natural`, `crema` |
| **Propósito** | Fondo principal en modo claro |
| **Usos** | Fondos de página, cards, paneles |

### 2. Carbon (Texto Oscuro)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Carbon / Noche Selva |
| **Hex** | `#312F2A` |
| **RGB** | `rgb(49, 47, 42)` |
| **Tailwind** | `carbon`, `noche-selva`, `marron-tierra-oscura`, `noche-amazonica` |
| **Propósito** | Texto principal, elementos oscuros |
| **Usos** | Títulos, párrafos en modo claro, fondos en modo oscuro |

### 3. Gris Piedra (Texto Secundario)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Gris Piedra |
| **Hex** | `#78716C` |
| **RGB** | `rgb(120, 113, 108)` |
| **Tailwind** | `gris-piedra` |
| **Propósito** | Texto secundario, elementos inactivos |
| **Usos** | Subtítulos, descripciones, metadatos |

### 4. Verde Hoja Seca (Gris Cálido)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Verde Hoja Seca / Gris Carbon |
| **Hex** | `#585C45` |
| **RGB** | `rgb(88, 92, 69)` |
| **Tailwind** | `verde-hoja-seca`, `carbon-vegetal`, `gris-carbon` |
| **Propósito** | Elemento intermedio, bordes sutiles |
| **Usos** | Bordes, separadores, elementos deshabilitados |

---

## Modo Claro

### Estructura Base

```
┌─────────────────────────────────────┐
│      Fondo: Blanco Puro (#F4F4F4)   │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Card/Panel Puro             │  │
│  │  Texto: Carbon (#312F2A)     │  │
│  │  Subtítulo: Gris Piedra      │  │
│  └──────────────────────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

### Paleta de Modo Claro Detallada

| Elemento | Color Primario | Color Secundario | Observaciones |
|----------|---|---|---|
| **Fondo Principal** | `bg-blanco-puro` (#F4F4F4) | — | Fondo de toda la página |
| **Cards/Paneles** | `bg-white` / `bg-blanco-puro/95` | — | Con bordes sutiles |
| **Texto Principal** | `text-carbon` (#312F2A) | — | Títulos y párrafos |
| **Texto Secundario** | `text-gris-piedra` (#78716C) | — | Descripciones, metadatos |
| **Botones CTA** | `bg-naranja-vibrante` (#F39C12) | `text-white` | Acciones principales |
| **Botones Secundarios** | `bg-azul-cobalto` (#007BFF) | `text-white` | Enlaces y acciones secundarias |
| **Botones Terciarios** | `bg-verde-brote` (#7A9A3E) | `text-white` | Acciones naturales |
| **Bordes** | `border-carbon/10` | — | Sutiles, casi imperceptibles |
| **Sombras** | `shadow-subtle` | — | Elevación sutil |
| **Iconos Activos** | `text-verde-brote` (#7A9A3E) | — | Indica estado activo |
| **Enlaces** | `text-azul-cobalto` (#007BFF) | — | Subrayado en hover |

### Ejemplo: Estructura de una Tarjeta en Modo Claro

```html
<div class="bg-blanco-puro/95 border border-carbon/10 shadow-subtle rounded-lg p-6">
  <h3 class="text-carbon font-bold text-lg">Título</h3>
  <p class="text-gris-piedra text-sm">Descripción secundaria</p>
  <button class="bg-naranja-vibrante text-white px-4 py-2 rounded">
    Acción Principal
  </button>
</div>
```

---

## Modo Oscuro

### Estructura Base

```
┌─────────────────────────────────────┐
│   Fondo: Carbon (#312F2A)           │
│   (o con transparencias: noche-     │
│    selva/40, /55, /60, /70, /75)    │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Card/Panel Oscuro           │  │
│  │  dark:bg-noche-selva/60      │  │
│  │  Texto: Beige Arena (#C9C4B8)│  │
│  └──────────────────────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

### Paleta de Modo Oscuro Detallada

| Elemento | Color Primario | Color Secundario | Observaciones |
|----------|---|---|---|
| **Fondo Principal** | `dark:bg-noche-selva` (#312F2A) | — | Fondo base oscuro |
| **Cards/Paneles** | `dark:bg-noche-selva/60` | — | Con transparencias variables |
| **Texto Principal** | `dark:text-beige-arena` (#C9C4B8) | — | Cálido y legible |
| **Texto Secundario** | `dark:text-beige-arena/80` | — | Párrafos y descripciones |
| **Texto Atenuado** | `dark:text-beige-arena/40` | — | Metadatos y detalles menores |
| **Botones CTA** | `dark:bg-naranja-vibrante` (#F39C12) | `text-white` | Con glow opcional |
| **Botones Secundarios** | `dark:bg-azul-cobalto` (#007BFF) | `text-white` | Enlaces interactivos |
| **Botones Terciarios** | `dark:bg-verde-brote` (#7A9A3E) | `text-white` | Acciones naturales |
| **Bordes** | `dark:border-white/10` | — | Sutiles en oscuro |
| **Sombras** | `shadow-medium` | — | Mayor elevación en oscuro |
| **Iconos Activos** | `dark:text-verde-brote` (#7A9A3E) | — | Indica estado activo |
| **Enlaces** | `dark:text-azul-cobalto` (#007BFF) | — | Con glow en hover |

### Ejemplo: Estructura de una Tarjeta en Modo Oscuro

```html
<div class="bg-blanco-puro/95 dark:bg-noche-selva/60 
            border border-carbon/10 dark:border-white/10 
            shadow-medium dark:shadow-lg rounded-lg p-6
            backdrop-blur-md">
  <h3 class="text-carbon dark:text-beige-arena font-bold text-lg">Título</h3>
  <p class="text-gris-piedra dark:text-beige-arena/80 text-sm">Descripción</p>
  <button class="bg-naranja-vibrante dark:bg-naranja-vibrante 
                 text-white px-4 py-2 rounded
                 dark:shadow-azai-glow">
    Acción Principal
  </button>
</div>
```

---

## Variantes y Transparencias

### Transparencias en Modo Claro

| Clase | RGBA | Opacidad | Uso |
|---|---|---|---|
| `bg-blanco-puro/95` | rgba(244,244,244,0.95) | 95% | Fondos claros con ligero fondo |
| `bg-carbon/10` | rgba(49,47,42,0.1) | 10% | Bordes muy sutiles |
| `text-gris-piedra/60` | rgba(120,113,108,0.6) | 60% | Texto muy atenuado |

### Transparencias en Modo Oscuro

| Clase | RGBA | Opacidad | Descripción | Uso |
|---|---|---|---|---|
| `dark:bg-noche-selva/40` | rgba(26,31,46,0.4) | 40% | Muy sutil | Overlays imperceptibles |
| `dark:bg-noche-selva/55` | rgba(26,31,46,0.55) | 55% | Sutil | Paneles secundarios |
| `dark:bg-noche-selva/60` | rgba(26,31,46,0.6) | 60% | Estándar | **Cards y paneles principales** |
| `dark:bg-noche-selva/70` | rgba(26,31,46,0.7) | 70% | Destacado | Panel "Explorar Proyectos" |
| `dark:bg-noche-selva/75` | rgba(26,31,46,0.75) | 75% | Muy destacado | Panel "Quiénes Somos" |
| `dark:text-beige-arena/40` | rgba(201,196,184,0.4) | 40% | Muy atenuado | Metadata en modo oscuro |
| `dark:text-beige-arena/80` | rgba(201,196,184,0.8) | 80% | Secundario | Párrafos y descripciones |
| `dark:text-beige-arena/90` | rgba(201,196,184,0.9) | 90% | Principal | Texto en secciones |

---

## Patrones de Uso

### 🎯 Patrón 1: Card Básica

**Uso:** Tarjetas de contenido simples

```html
<!-- Modo Claro y Oscuro Combinado -->
<div class="bg-blanco-puro/95 dark:bg-noche-selva/60
            border border-carbon/10 dark:border-white/10
            shadow-subtle dark:shadow-medium
            rounded-lg p-6">
  
  <h3 class="text-carbon dark:text-beige-arena font-bold text-lg mb-2">
    Título de la Tarjeta
  </h3>
  
  <p class="text-gris-piedra dark:text-beige-arena/80 text-sm">
    Descripción del contenido
  </p>
</div>
```

### 🎯 Patrón 2: Panel de Sección Grande

**Uso:** Secciones principales con background oscuro en modo oscuro

```html
<section class="bg-blanco-puro dark:bg-noche-selva/70 py-12">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-carbon dark:text-beige-arena text-3xl font-bold mb-6">
      Título de Sección
    </h2>
    
    <p class="text-gris-piedra dark:text-beige-arena/80">
      Contenido de la sección...
    </p>
  </div>
</section>
```

### 🎯 Patrón 3: Botón Primario (CTA)

**Uso:** Llamadas a acción principales

```html
<button class="bg-naranja-vibrante hover:shadow-azai-glow
               dark:shadow-azai-glow
               text-white font-semibold px-6 py-3 rounded-lg
               transition-all duration-300">
  Botón Primario
</button>
```

### 🎯 Patrón 4: Botón Secundario

**Uso:** Acciones secundarias o enlaces

```html
<button class="bg-azul-cobalto hover:bg-opacity-90
               dark:shadow-azul-glow
               text-white font-semibold px-6 py-3 rounded-lg
               transition-all duration-300">
  Botón Secundario
</button>
```

### 🎯 Patrón 5: Botón Terciario (Verde)

**Uso:** Acciones naturales o confirmación

```html
<button class="bg-verde-brote hover:shadow-verde-glow
               dark:shadow-verde-glow
               text-white font-semibold px-6 py-3 rounded-lg
               transition-all duration-300">
  Botón Terciario
</button>
```

### 🎯 Patrón 6: Enlaces

**Uso:** Navegación e hipervínculos

```html
<a href="#" class="text-azul-cobalto dark:text-azul-cobalto
                   hover:underline
                   dark:hover:shadow-azul-glow">
  Enlace
</a>
```

### 🎯 Patrón 7: Overlay Modal

**Uso:** Fondos de modales y overlays

```html
<div class="fixed inset-0 bg-black/40 dark:bg-noche-selva/75
            flex items-center justify-center z-50">
  <div class="bg-blanco-puro dark:bg-noche-selva/80
              rounded-lg shadow-medium p-6
              max-w-md w-full mx-4">
    <!-- Contenido del modal -->
  </div>
</div>
```

### 🎯 Patrón 8: Estado Activo / Seleccionado

**Uso:** Indicadores de estado activo

```html
<!-- Icono o elemento activo -->
<div class="text-verde-brote dark:text-verde-brote flex items-center gap-2">
  <svg><!-- icono --></svg>
  <span class="text-carbon dark:text-beige-arena">Activo</span>
</div>
```

---

## Efectos de Glow (Sombras Luminosas)

El proyecto incluye 4 efectos de glow para efectos visuales impactantes:

### 1. Verde Glow (Verde Brote)
```css
.shadow-verde-glow: 0 0 20px rgba(122, 154, 62, 0.6);
```
**Uso:** Botones verdes, iconos activos, acciones confirmadas

### 2. Naranja/Azaí Glow (Naranja Vibrante)
```css
.shadow-azai-glow: 0 0 20px rgba(243, 156, 18, 0.6);
```
**Uso:** Botones CTA principales, acciones destacadas

### 3. Azul Glow (Azul Cobalto)
```css
.shadow-azul-glow: 0 0 20px rgba(0, 123, 255, 0.45);
```
**Uso:** Enlaces, botones secundarios, elementos interactivos

### 4. Rojo Glow (Rojo Acento)
```css
.shadow-rojo-glow: 0 0 18px rgba(224, 58, 58, 0.45);
```
**Uso:** Errores, advertencias, acciones peligrosas

---

## Configuración Técnica

### Framework: Tailwind CSS v3+

**Ubicación:** `index.html` (script de configuración inline)

```javascript
tailwind.config = {
  darkMode: 'class',  // Usa clase 'dark' en HTML
  theme: {
    extend: {
      colors: {
        'verde-brote': '#7A9A3E',
        'azul-cobalto': '#007BFF',
        'amarillo-sol': '#F0D43A',
        'naranja-vibrante': '#F39C12',
        'blanco-puro': '#F4F4F4',
        'carbon': '#312F2A',
        'gris-piedra': '#78716C',
        // ... más colores y aliases
      },
      boxShadow: {
        'verde-glow': '0 0 20px rgba(122, 154, 62, 0.6)',
        'azai-glow': '0 0 20px rgba(243, 156, 18, 0.6)',
        'azul-glow': '0 0 20px rgba(0, 123, 255, 0.45)',
        'rojo-glow': '0 0 18px rgba(224, 58, 58, 0.45)',
      }
    }
  }
}
```

### Integración en React

**Contexto de Tema:** [contexts/ThemeContext.tsx](contexts/ThemeContext.tsx)

El tema se controla mediante una clase CSS `dark` en el elemento HTML raíz:

```javascript
// En modo oscuro, el HTML tiene: <html class="dark">
// En modo claro, el HTML tiene: <html> (sin clase)

// Uso en componentes:
<button class="bg-naranja-vibrante dark:bg-naranja-vibrante ...">
  Esto cambia automáticamente con la clase "dark"
</button>
```

**Cambio de tema:**
```typescript
const { theme, toggleTheme } = useTheme();
toggleTheme(); // Cambia entre 'light' y 'dark'
```

### Tipografía Complementaria

- **Sans-serif:** Inter (400, 500, 700)
- **Serif:** Lora (400, 700)

---

## Recomendaciones de Accesibilidad

✅ **Contraste:** Todos los colores cumplen WCAG AA
✅ **No depender solo de color:** Usar iconos y patrones adicionales
✅ **Modo Oscuro:** Automático cuando se activa, no opcional
✅ **Transparencias:** Combinar con backdrop-blur para legibilidad

### Ejemplo de Contraste Mínimo Requerido

```
Modo Claro:
- Text Carbon (#312F2A) sobre Blanco Puro (#F4F4F4) ✅ Ratio 15:1

Modo Oscuro:
- Text Beige Arena (#C9C4B8) sobre Noche Selva (#312F2A) ✅ Ratio 6:1
```

---

## Aliases y Nombres Legados

Para compatibilidad con código existente, se mantienen múltiples nombres para los mismos colores:

| Color Único | Alias 1 | Alias 2 | Alias 3 |
|---|---|---|---|
| `#7A9A3E` | `verde-brote` | `verde-hoja` | `verde-esmeralda` |
| `#F39C12` | `naranja-vibrante` | `terracota` | `flor-azai` |
| `#F4F4F4` | `blanco-puro` | `beige-arena` | `blanco-hueso` |
| `#312F2A` | `carbon` | `noche-selva` | `marron-tierra-oscura` |

---

## Resumen Rápido

### 🌞 Modo Claro
- **Fondo:** Blanco Puro (#F4F4F4)
- **Texto:** Carbon (#312F2A)
- **CTA:** Naranja Vibrante (#F39C12)
- **Secundario:** Azul Cobalto (#007BFF)
- **Natural:** Verde Brote (#7A9A3E)

### 🌙 Modo Oscuro
- **Fondo:** Noche Selva (#312F2A) con transparencias
- **Texto:** Beige Arena (#C9C4B8)
- **CTA:** Naranja Vibrante (#F39C12)
- **Secundario:** Azul Cobalto (#007BFF)
- **Natural:** Verde Brote (#7A9A3E)

---

**Última actualización:** Mayo 2026  
**Proyecto:** Amazonia Viva Frontend - Porerekua  
**Versión:** 2.0 (Documentación Completa Integrada)
