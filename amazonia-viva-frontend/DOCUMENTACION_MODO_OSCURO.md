# Sistema de Modo Oscuro - Porerekua

## 📋 Índice

1. [Introducción](#introducción)
2. [Paleta de Colores](#paleta-de-colores)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Implementación en Componentes](#implementación-en-componentes)
5. [Guía de Uso](#guía-de-uso)
6. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Introducción

Porerekua implementa un sistema de modo oscuro moderno con transparencias controladas y desenfoque (backdrop-blur) para crear una experiencia visual sofisticada y profesional. El diseño se basa en principios de accesibilidad WCAG, garantizando contraste adecuado y legibilidad en ambos modos.

### Características principales:
- **Transparencia sutil**: Uso de opacidades entre 55% - 95%
- **Desenfoque de fondo**: `backdrop-blur-md` para profundidad visual
- **Consistencia total**: Mismos patrones aplicados en todas las páginas
- **Accesibilidad**: Cumple con ratios de contraste AA/AAA

---

## Paleta de Colores

### Colores Primarios (Modo Claro → Oscuro)

| Nombre | Clase CSS | Modo Claro | Modo Oscuro | Uso Principal |
|--------|-----------|------------|-------------|---------------|
| **Blanco Puro** | `blanco-puro` | `#FFFFFF` | - | Fondos de panels |
| **Noche Selva** | `noche-selva` | - | `#1a1f2e` (20-25%) | Fondos oscuros |
| **Beige Arena** | `beige-arena` | `#f5f0e6` (95%) | `#c9c4b8` (60-70%) | Paneles translúcidos |
| **Carbón** | `carbon` | `#312F2A` | - | Textos principales |
| **Gris Piedra** | `gris-piedra` | `#78716C` | - | Textos secundarios |

### Colores de Acento (Marca)

| Nombre | Clase CSS | Valor | Uso |
|--------|-----------|-------|-----|
| **Verde Brote** | `verde-brote` | `#22c55e` | Iconos, botones, highlights |
| **Terracota** | `terracota` | `#e67e5a` | Títulos sección, acentos |
| **Azul Cobalto** | `azul-cobalto` | `#0066cc` | Botones, links, focus |

### Transparencias Estandarizadas

| Opacidad | Uso |
|----------|-----|
| `95%` (`/95`) | Paneles de contenido principal (cards) |
| `80%` (`/80`) | Contenedores grandes de sección |
| `75%` (`/75`) | Paneles intermedios |
| `60%` (`/60`) | Fondos oscuros para cards |
| `55%` (`/55`) | Contenedores principales en modo oscuro |
| `40%` (`/40`) | Overlays de fondo |

---

## Patrones de Diseño

### 1. Paneles de Contenido (Cards)

**Patrón estándar para cards individuales:**

```css
bg-blanco-puro/95 dark:bg-noche-selva/60
backdrop-blur-md
border border-carbon/10 dark:border-white/10
shadow-medium
rounded-lg
```

**Variantes:**
- Más pequeño: `rounded-lg`
- Más grande: `rounded-xl` o `rounded-2xl`
- Énfasis: `shadow-lg` en hover

### 2. Contenedores de Sección (Paneles Grandes)

**Patrón para contenedores principales que cubren secciones completas:**

```css
bg-beige-arena/80 dark:bg-noche-selva/55
backdrop-blur-md
rounded-2xl
border border-white/40 dark:border-beige-arena/10
shadow-medium
```

**Características:**
- `rounded-2xl`: Bordes más redondeados (16px)
- `border-white/40`: Borde sutil en modo claro
- `backdrop-blur-md`: Desenfoque moderado

### 3. Textos en Modo Oscuro

**Jerarquía tipográfica:**

```css
/* Títulos y encabezados principales */
text-carbon dark:text-beige-arena

/* Textos secundarios, párrafos */
text-gris-piedra dark:text-beige-arena/80

/* Textos atenuados */
text-gris-piedra/70 dark:text-beige-arena/60
```

### 4. Botones con Transparencia

**Botones circulares (scroll, iconos):**

```css
bg-blanco-puro/95 dark:bg-noche-selva/60
backdrop-blur-md
border border-carbon/10 dark:border-white/10
shadow-medium
rounded-full
hover:bg-blanco-puro/80 dark:hover:bg-noche-selva/50
```

### 5. Overlays de Fondo

**Capas superpuestas a imágenes de fondo:**

```css
/* Overlay ligero */
bg-noche-selva/35

/* Overlay medio */
bg-noche-selva/40 a /45

/* Overlay fuerte */
bg-noche-selva/50
```

---

## Implementación en Componentes

### Componente Card (Reutilizable)

**Ubicación:** `components/ui/Card.tsx`

```tsx
const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={`bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-subtle rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
```

**Características:**
- Aplica automáticamente el patrón base a todos los contenedores
- Permite sobrescribir clases con `className`
- Incluye `overflow-hidden` para contener contenido

### Plantillas de Sección

#### Página con Hero + 3 Secciones (HomePage)

```tsx
{/* Sección con imagen de fondo + overlay + panel de contenido */}
<section className="snap-section h-screen ... relative overflow-hidden">
  {/* Fondo con imagen */}
  <div className="absolute inset-0 z-0">
    <img src="..." className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-beige-arena/80 dark:bg-noche-selva/55 backdrop-blur-md rounded-2xl border border-white/40 dark:border-beige-arena/10 shadow-medium"></div>
  </div>

  {/* Contenido principal */}
  <div className="w-full max-w-6xl relative z-10">
    {/* Contenido aquí */}
  </div>
</section>
```

---

## Guía de Uso

### ✅ CUÁNDO usar el patrón de transparencia

1. **Cards de contenido**: Proyectos, fundaciones, investigaciones
2. **Paneles de filtro**: Barras de búsqueda, controles
3. **Contenedores de estadísticas**: Dashboard, métricas
4. **Modales y popups**: Diálogos, detalles
5. **Paneles de equipo**: Biografías, testimonios

### ❌ CUÁNDO NO usar transparencia

1. **Fondos de página completos**: Usar `bg-noche-selva` sólido
2. **Imágenes de hero**: Solo overlay oscuro sin blur
3. **Botones primarios**: Usar colores sólidos de acento
4. **Inputs de texto**: Fondo semi-transparente pero sin blur si hay problemas de legibilidad

### Ajustes de Accesibilidad

**Contraste mínimo garantizado:**
- Texto claro sobre oscuro: `beige-arena` sobre `noche-selva/60` ✓
- Texto oscuro sobre claro: `carbon` sobre `blanco-puro/95` ✓
- Ratio de contraste: > 4.5:1 (AA) / > 7:1 (AAA)

---

## Ejemplos Prácticos

### Ejemplo 1: Card de Proyecto

```tsx
<Card className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-6">
  <h3 className="text-xl font-bold text-carbon dark:text-beige-arena">
    Título del Proyecto
  </h3>
  <p className="text-gris-piedra dark:text-beige-arena/80 mt-2">
    Descripción del proyecto...
  </p>
</Card>
```

### Ejemplo 2: Panel de Estadísticas (Dashboard)

```tsx
<div className="bg-beige-arena/80 dark:bg-noche-selva/55 backdrop-blur-md rounded-2xl border border-white/40 dark:border-beige-arena/10 shadow-medium p-8">
  <h2 className="text-4xl font-bold text-carbon dark:text-beige-arena">
    Dashboard de Impacto
  </h2>
  <div className="grid grid-cols-3 gap-6 mt-6">
    {/* Stats cards aquí */}
  </div>
</div>
```

### Ejemplo 3: Contenedor de Búsqueda

```tsx
<div className="relative">
  <input
    type="text"
    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 focus:ring-2 focus:ring-verde-brote shadow-subtle"
    placeholder="Buscar..."
  />
</div>
```

---

## Migración y Actualización

### Archivos Actualizados

- ✅ `HomePage.tsx` - Secciones principales
- ✅ `NosotrosPage.tsx` - Paneles de información y equipo
- ✅ `GeoreferencingPage.tsx` - Mapa y explorador
- ✅ `DataPage.tsx` - Contenedor principal y cards
- ✅ `DashboardPage.tsx` - Estadísticas y gráficos
- ✅ `InvestigacionesPage.tsx` - Carrusel y modal
- ✅ `components/ui/Card.tsx` - Componente base

### Colores Obsoletos (Reemplazados)

| Antes | Después |
|-------|---------|
| `bg-white/80 dark:bg-carbon/60` | `bg-blanco-puro/95 dark:bg-noche-selva/60` |
| `bg-verde-hoja-seca` | `bg-blanco-puro/95 dark:bg-noche-selva/60` |
| `bg-carbon` solo | `bg-blanco-puro/95 dark:bg-noche-selva/60` |

---

## Consideraciones de Rendimiento

### Optimización

1. **backdrop-blur**: Usar `backdrop-blur-md` (ligero) en lugar de `backdrop-blur-lg` (pesado)
2. **Sombras**: `shadow-medium` es suficiente; evitar `shadow-2xl`
3. **Transparencia**: Mantener opacidad ≥ 55% para legibilidad y rendimiento
4. **Bordes**: Usar colores con alpha (`/10`, `/40`) para sutileza

### Fallbacks

Para navegadores antiguos que no soportan `backdrop-filter`:
```css
@supports not (backdrop-filter: blur(8px)) {
  .backdrop-blur-md {
    background-color: var(--color-fallback);
  }
}
```

---

## Checklist de Revisión

Antes de aprobar cambios visuales, verificar:

- [ ] Los textos tienen contraste adecuado en modo oscuro (WCAG AA)
- [ ] Las transparencias no comprometen legibilidad
- [ ] Los bordes son visibles en fondos claros y oscuros
- [ ] Las sombras no son excesivas (máximo `shadow-medium`)
- [ ] Los radios de borde son consistentes (`rounded-lg`, `rounded-xl`)
- [ ] El `backdrop-blur` no causa flickering en scroll
- [ ] Los estados hover/active mantienen coherencia

---

## Preguntas Frecuentes

**Q: ¿Por qué `/95` en blanco-puro y `/60` en noche-selva?**
R: El ojo humano percibe differently la transparencia sobre fondos claros vs oscuros. 95% sobre claro mantiene frescura; 60% sobre oscuro permite ver el fondo sin distraer.

**Q: ¿Cuándo usar `rounded-2xl` vs `rounded-lg`?**
R: `rounded-2xl` para contenedores de sección (16px); `rounded-lg` para cards individuales (8px).

**Q: ¿Por qué `shadow-medium` en lugar de `shadow-lg`?**
R: Mantiene jerarquía visual sin saturar; la transparencia ya da profundidad.

**Q: ¿Cómo testear el modo oscuro?**
R: Usar DevTools → Toggle dark mode (Ctrl+Shift+P) o cambiar preferencia del sistema.

---

**Documento creado:** 2026-05-04  
**Versión:** 1.0  
**Estado:** ✅ Aplicado en producción
