# Paleta de Colores Amazónica - Guía de Implementación

## Filosofía General

La nueva paleta se aleja de los colores corporativos fríos y se basa en tonos terrosos, naturales y vibrantes. El objetivo es transmitir:

- **Confianza y Serenidad**: A través de tonos suaves y orgánicos
- **Vitalidad y Esperanza**: Mediante acentos de color brillantes que simbolizan la vida
- **Profesionalismo y Claridad**: Asegurando una legibilidad y usabilidad impecables

## Colores Principales

### 🌾 `fibra-natural` (#F0EAD6) - El Lienzo Orgánico
**Inspiración**: Fibras de palma sin tratar, arena de río y la luz del sol filtrándose a través de las hojas.
- **Tema Claro**: Color de fondo principal
- **Tema Oscuro**: Color principal del texto
- **Uso**: Fondos, texto principal en modo oscuro

### 🌑 `carbon` (#312F2A) - La Tierra Fértil
**Inspiración**: El carbón vegetal, la tierra rica y húmeda del suelo amazónico.
- **Tema Claro**: Color principal para el texto
- **Tema Oscuro**: Color de fondo principal
- **Uso**: Texto principal en modo claro, fondos en modo oscuro

### 🍃 `verde-hoja-seca` (#585C45) - El Sostén del Ecosistema
**Inspiración**: Hojas secas en el suelo del bosque, musgo en las cortezas.
- **Tema Claro**: Elementos secundarios, bordes sutiles
- **Tema Oscuro**: Color principal para tarjetas y superficies elevadas
- **Uso**: Tarjetas, bordes, elementos estructurales

## Colores de Acento

### 🌱 `verde-brote` (#7CB342) - La Vitalidad de la Vida Nueva
**Inspiración**: Un brote nuevo que emerge en el bosque.
- **Uso**: Botones principales, enlaces, íconos activos, estados hover/focus
- **Efectos**: `shadow-verde-glow` para interacciones

### 🏺 `terracota` (#B4654A) - La Arcilla del Río
**Inspiración**: Arcilla rica en minerales de las orillas de los ríos amazónicos.
- **Uso**: Botones secundarios, alertas, categorías específicas
- **Efectos**: `shadow-terracota-glow` para interacciones

## Colores Complementarios

### `gris-piedra` (#4A4741)
Tono más claro de carbon para texto secundario

### `beige-arena` (#F0EAD6)
Alias de fibra-natural para consistencia en tema oscuro

### `blanco-puro` (#FFFFFF)
Para contraste máximo en tema claro

## Aplicación por Temas

### 🌅 Tema Claro: Luz del Día en la Selva
```css
--theme-background: #F0EAD6 (fibra-natural)
--theme-text-primary: #312F2A (carbon)
--theme-text-secondary: #4A4741 (gris-piedra)
--theme-surface: #FFFFFF (blanco-puro)
--theme-accent-primary: #7CB342 (verde-brote)
--theme-accent-secondary: #B4654A (terracota)
```

### 🌙 Tema Oscuro: Noche Amazónica Inmersiva
```css
--theme-background: #312F2A (carbon)
--theme-text-primary: #F0EAD6 (fibra-natural)
--theme-surface: #585C45 (verde-hoja-seca)
--theme-accent-primary: #7CB342 (verde-brote)
--theme-accent-secondary: #B4654A (terracota)
```

## Clases CSS Disponibles

### Colores de Texto
- `text-fibra-natural`
- `text-carbon`
- `text-verde-hoja-seca`
- `text-verde-brote`
- `text-terracota`
- `text-gris-piedra`

### Colores de Fondo
- `bg-fibra-natural`
- `bg-carbon`
- `bg-verde-hoja-seca`
- `bg-verde-brote`
- `bg-terracota`

### Efectos Especiales
- `shadow-verde-glow`: Sombra verde brillante para elementos interactivos
- `shadow-terracota-glow`: Sombra terracota para elementos secundarios

### Clases Temáticas (reaccionan automáticamente al tema)
- `theme-reactive`: Color de texto que se adapta al tema
- `theme-text-secondary`: Texto secundario adaptativo
- `theme-bg-reactive`: Fondo adaptativo
- `theme-surface`: Superficie adaptativa
- `theme-accent-primary`: Color de acento primario
- `theme-accent-secondary`: Color de acento secundario

## Ejemplo de Uso

```tsx
// Botón principal
<button className="bg-verde-brote text-fibra-natural hover:shadow-verde-glow">
  Acción Principal
</button>

// Tarjeta con superficie adaptativa
<div className="theme-surface p-6 rounded-lg">
  <h3 className="theme-accent-primary">Título</h3>
  <p className="theme-reactive">Contenido que se adapta al tema</p>
</div>

// Input con la nueva paleta
<input className="bg-fibra-natural/60 border-verde-hoja-seca focus:border-verde-brote" />
```

## Migración desde Paleta Anterior

Los colores antiguos han sido mapeados para compatibilidad:
- `brand-jungle-deep` → `carbon`
- `brand-leaf-vibrant` → `verde-brote`
- `brand-sand-light` → `fibra-natural`
- `brand-clay-alert` → `terracota`
- `brand-river-mist` → `verde-hoja-seca`
- `brand-earth-brown` → `carbon`

Se recomienda migrar gradualmente a los nuevos nombres para mayor claridad semántica.