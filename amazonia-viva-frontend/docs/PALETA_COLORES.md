# Paleta de Colores - Porerekua (Modo Oscuro)

## 🎨 Colores Base

### Modo Claro

```css
--color-blanco-puro: #FFFFFF;          /* Blanco puro */
--color-beige-arena: #f5f0e6;           /* Beige arena (95%) */
--color-carbon: #312F2A;                /* Gris oscuro - textos */
--color-gris-piedra: #78716C;           /* Gris medio - textos secundarios */
--color-verde-brote: #22c55e;           /* Verde acento */
--color-terracota: #e67e5a;             /* Terracota acento */
--color-azul-cobalto: #0066cc;          /* Azul acento */
```

### Modo Oscuro

```css
--color-noche-selva: #1a1f2e;           /* Fondo oscuro principal (20-25%) */
--color-beige-arena: #c9c4b8;           /* Beige atenuado para paneles */
--color-carbon: #312F2A;                /* Se mantiene para texto sobre claro */
--color-gris-piedra: #78716C;           /* Se mantiene */
```

## 🎯 Variantes de Transparencia

### Formato Tailwind: `color/opacidad`

**Ejemplo:** `bg-beige-arena/80` → background-color con 80% opacidad

| Color Base | 95% | 80% | 75% | 60% | 55% | 40% |
|------------|-----|-----|-----|-----|-----|-----|
| **blanco-puro** | `bg-blanco-puro/95` | - | - | - | - | - |
| **beige-arena** | `bg-beige-arena/95` | `bg-beige-arena/80` | - | - | - | - |
| **noche-selva** | - | - | - | `bg-noche-selva/60` | `bg-noche-selva/55` | `bg-noche-selva/40` |

## 🧩 Atajos de Clases CSS

### Fondos con Transparencia

```css
/* Paneles de contenido */
.bg-blanco-puro/95.dark\:bg-noche-selva/60

/* Contenedores principales */
.bg-beige-arena/80.dark\:bg-noche-selva/55

/* Overlays de fondo */
.bg-noche-selva/35  /* Sutil */
.bg-noche-selva/40  /* Medio */
.bg-noche-selva/45  /* Fuerte */
```

### Textos con Modo Oscuro

```css
/* Títulos */
.text-carbon.dark\:text-beige-arena

/* Párrafos */
.text-gris-piedra.dark\:text-beige-arena/80

/* Textos atenuados */
.text-beige-arena/60.dark\:text-beige-arena/40
```

### Bordes

```css
/* Bordes de cards */
.border-carbon/10.dark\:border-white/10

/* Bordes de contenedores principales */
.border-white/40.dark\:border-beige-arena/10
```

### Sombras

```css
.shadow-subtle    /* Para cards pequeñas */
.shadow-medium    /* Para paneles y cards principales */
.shadow-lg        /* Para hover o énfasis */
```

## 📐 Patrones Recomendados

### Card Básica

```css
bg-blanco-puro/95 dark:bg-noche-selva/60
backdrop-blur-md
border border-carbon/10 dark:border-white/10
shadow-medium
rounded-lg
```

### Panel de Sección

```css
bg-beige-arena/80 dark:bg-noche-selva/55
backdrop-blur-md
rounded-2xl
border border-white/40 dark:border-beige-arena/10
shadow-medium
```

### Botón Circular

```css
bg-blanco-puro/95 dark:bg-noche-selva/60
backdrop-blur-md
border border-carbon/10 dark:border-white/10
shadow-medium
rounded-full
hover:bg-blanco-puro/80 dark:hover:bg-noche-selva/50
```

## 🔍 Valores de Referencia

### Bloques de Color

```css
/* Modo claro */
bg-blanco-puro:   rgb(255, 255, 255)    /* #FFFFFF */
bg-beige-arena:   rgb(245, 240, 230)    /* #f5f0e6 - 95% */
bg-carbon:        rgb(49, 47, 42)       /* #312F2A */
bg-gris-piedra:   rgb(120, 113, 108)    /* #78716C */

/* Modo oscuro */
bg-noche-selva:   rgba(26, 31, 46, 0.60)    /* #1a1f2e @ 60% */
bg-beige-arena:   rgba(201, 196, 184, 0.55) /* #c9c4b8 @ 55% */
```

### Espaciado de Sombras

```css
shadow-subtle:  0 1px 3px rgba(0,0,0,0.1)
shadow-medium:  0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)
shadow-lg:      0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
```

## 📱 Consideraciones Responsive

- **Móvil (< 768px)**: Mantener `rounded-lg` para cards, `rounded-2xl` para secciones
- **Tablet (768-1024px)**: Igual que móvil
- **Desktop (> 1024px)**: Aplicar `backdrop-blur-md` consistentemente

## ⚡ Optimización

### Reducir Recalculo de Estilos

```css
/* Evitar múltiples backdrop-blur anidados */
/* ❌ Mal: */
<div className="backdrop-blur-md">
  <div className="backdrop-blur-md">...</div>
</div>

/* ✅ Bien: */
<div className="backdrop-blur-md">
  <div>...</div>
</div>
```

### Usar Capas (z-index) Apropiadamente

```css
z-0  /* Fondo de imagen */
z-10 /* Panel de contenido */
z-20 /* Botones superpuestos */
```

---

**Creado:** 2026-05-04
**Actualizado:** 2026-05-04
**Versión:** 1.0
