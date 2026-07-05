# Paleta de Colores - Modo Oscuro Detallado

**Documento completo de colores, transparencias y usos en la paleta oscura de Porerekua**

---

## 🎨 Colores Base del Modo Oscuro

### 1. Color Principal de Fondo: Noche Selva

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Noche Selva |
| **Hex** | `#1a1f2e` |
| **RGB** | `rgb(26, 31, 46)` |
| **Tailwind** | `dark:bg-noche-selva` |
| **Descripción** | Fondo oscuro principal, muy usado en overlays y fondos de secciones |

### 2. Color de Texto Principal: Beige Arena

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Beige Arena |
| **Hex** | `#c9c4b8` |
| **RGB** | `rgb(201, 196, 184)` |
| **Tailwind** | `dark:text-beige-arena` |
| **Descripción** | Texto principal en modo oscuro, cálido y legible sobre fondos oscuros |

### 3. Color Secundario: Carbon

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Carbon |
| **Hex** | `#312F2A` |
| **RGB** | `rgb(49, 47, 42)` |
| **Tailwind** | `dark:text-carbon` |
| **Descripción** | Texto sobre superficies claras, se mantiene igual en modo oscuro |

### 4. Color Terciario: Gris Piedra

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Gris Piedra |
| **Hex** | `#78716C` |
| **RGB** | `rgb(120, 113, 108)` |
| **Tailwind** | `dark:text-gris-piedra` |
| **Descripción** | Texto secundario y elementos inactivos |

### 5. Color de Acento: Verde Brote

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Verde Brote |
| **Hex** | `#22c55e` |
| **RGB** | `rgb(34, 197, 94)` |
| **Tailwind** | `text-verde-brote` |
| **Descripción** | Identidad, estados activos, iconos importantes, selección |

### 6. Color de Acción: Naranja Vibrante

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Naranja Vibrante |
| **Hex** | `#F39C12` |
| **RGB** | `rgb(243, 156, 18)` |
| **Tailwind** | `text-naranja-vibrante` |
| **Descripción** | Hover, foco, acciones principales, CTAs |

### 7. Color de Acción Secundaria: Terracota

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Terracota |
| **Hex** | `#e67e5a` |
| **RGB** | `rgb(230, 126, 90)` |
| **Tailwind** | `text-terracota` |
| **Descripción** | Secciones, títulos, detalles cálidos |

---

## 🎭 Variantes con Transparencia (Noche Selva)

### Panel Fondos

| Clase Tailwind | Valor RGBA | Opacidad | Uso |
|---|---|---|---|
| `dark:bg-noche-selva/40` | `rgba(26, 31, 46, 0.4)` | 40% | Overlays muy sutiles |
| `dark:bg-noche-selva/55` | `rgba(26, 31, 46, 0.55)` | 55% | Paneles de sección grandes |
| `dark:bg-noche-selva/60` | `rgba(26, 31, 46, 0.6)` | 60% | Cards y paneles de contenido |
| `dark:bg-noche-selva/70` | `rgba(26, 31, 46, 0.7)` | 70% | Panel "Explorar Proyectos" |
| `dark:bg-noche-selva/75` | `rgba(26, 31, 46, 0.75)` | 75% | Panel "Quiénes Somos" |

### Texto con Opacidad

| Clase Tailwind | Valor | Opacidad | Uso |
|---|---|---|---|
| `dark:text-beige-arena/40` | `rgba(201, 196, 184, 0.4)` | 40% | Texto muy atenuado |
| `dark:text-beige-arena/80` | `rgba(201, 196, 184, 0.8)` | 80% | Texto secundario, párrafos |
| `dark:text-beige-arena/90` | `rgba(201, 196, 184, 0.9)` | 90% | Texto principal en secciones |

---

## 📐 Patrones de Uso en Modo Oscuro

### Patrón 1: Card Básica
```css
bg-blanco-puro/95 dark:bg-noche-selva/60
backdrop-blur-md
border border-carbon/10 dark:border-white/10
shadow-medium
rounded-lg
text-carbon dark:text-beige-arena
```
**Ejemplos:** Cards en DataPage, ProjectCard, FoundationCard

### Patrón 2: Panel de Sección Grande
```css
bg-beige-arena/80 dark:bg-noche-selva/55
backdrop-blur-md
rounded-2xl
border border-white/40 dark:border-beige-arena/10
shadow-medium
```
**Ejemplos:** Panel "Datos de la Red", "Únete a la Causa"

### Patrón 3: Panel "Proyectos que Transforman"
```css
bg-blanco-puro/85 dark:bg-noche-selva/60
backdrop-blur-md
rounded-xl
border border-carbon/10 dark:border-white/10
shadow-medium
```

### Patrón 4: Panel "Quiénes Somos"
```css
bg-blanco-puro/95 dark:bg-noche-selva/75
p-8 md:p-10
rounded-lg
shadow-medium
border border-carbon/10 dark:border-white/10
```

### Patrón 5: Panel "Explorar Proyectos"
```css
bg-beige-arena/95 dark:bg-noche-selva/70
backdrop-blur-md
border border-white/40 dark:border-beige-arena/10
shadow-medium
rounded-2xl
```

### Patrón 6: Overlay de Fondo (Secciones)
```css
/* Modo claro: sin fondo */
/* Modo oscuro: */
dark:bg-noche-selva/55
dark:backdrop-blur-md
dark:rounded-2xl
dark:border dark:border-white/40
dark:border-beige-arena/10
dark:shadow-medium
```
**Ejemplos:** Secciones CONSERVACIÓN, DESARROLLO COMUNITARIO, Únete a la Causa

---

## 🎯 Casos de Uso Específicos

### Fondos de Secciones Principales
- **Noche Selva @ 55%**: Secciones con overlay y contenido centrado
- **Noche Selva @ 60%**: Cards y paneles contenedores

### Textos sobre Fondos Oscuros
- **Beige Arena puro**: Títulos principales, alta legibilidad
- **Beige Arena/90%**: Texto en secciones con overlay oscuro
- **Beige Arena/80%**: Párrafos secundarios, descripciones
- **Beige Arena/40%**: Textos muy sutiles, ayudas

### Bordes en Modo Oscuro
- **white/10**: Bordes sutiles, muy transparentes
- **beige-arena/10**: Bordes en paneles principales

### Sombras en Modo Oscuro
- **shadow-medium**: Estándar para cards y paneles
- **shadow-subtle**: Para elementos pequeños
- **shadow-lg**: Para énfasis o hover

---

## 🔄 Comparativa Modo Claro vs Oscuro

### Fondos de Paneles

| Elemento | Modo Claro | Modo Oscuro |
|----------|-----------|------------|
| Cards básicas | `bg-blanco-puro/95` | `dark:bg-noche-selva/60` |
| Paneles sección | `bg-beige-arena/80` | `dark:bg-noche-selva/55` |
| Quiénes Somos | `bg-blanco-puro/95` | `dark:bg-noche-selva/75` |
| Explorar Proyectos | `bg-beige-arena/95` | `dark:bg-noche-selva/70` |
| Overlay secciones | *Sin fondo* | `dark:bg-noche-selva/55` |

### Textos

| Elemento | Modo Claro | Modo Oscuro |
|----------|-----------|------------|
| Títulos principales | `text-carbon` | `dark:text-beige-arena` |
| Títulos (Nuestro Propósito) | `text-beige-arena` | `dark:text-beige-arena` |
| Texto primario | `text-carbon` | `dark:text-beige-arena` |
| Texto secundario | `text-gris-piedra` | `dark:text-beige-arena/80` |
| Texto en secciones overlay | N/A | `text-beige-arena` |

---

## 💡 Recomendaciones de Aplicación

### Para Nuevos Componentes en Modo Oscuro:

1. **Fondo**: Usa `dark:bg-noche-selva` con opacidades:
   - `/55` para paneles grandes
   - `/60` para cards
   - `/70` para paneles especiales (Explorar Proyectos)
   - `/75` para paneles con más prominencia (Quiénes Somos)

2. **Texto**: Usa `dark:text-beige-arena` como base:
   - Puro para títulos
   - `/90` para texto principal en secciones
   - `/80` para párrafos y descripciones
   - `/40` para textos muy sutiles

3. **Bordes**: Usa `dark:border-white/10` para bordes sutiles

4. **Backdrop**: Siempre aplica `backdrop-blur-md` junto con transparencias para efecto glassmorphism

5. **Acentos**: Mantén `text-verde-brote` para elementos activos e iconos importantes

---

## 📱 Checklist para Implementación

- [ ] Todos los paneles en modo oscuro usan `dark:bg-noche-selva` con `/55`, `/60`, `/70` o `/75`
- [ ] Textos en modo oscuro usan `dark:text-beige-arena` base
- [ ] Bordes en modo oscuro usan `dark:border-white/10` o `dark:border-beige-arena/10`
- [ ] Todos los paneles con fondo oscuro tienen `backdrop-blur-md`
- [ ] Sombras consistentes con `shadow-medium`
- [ ] Overlays de secciones sin fondo en modo claro, con overlay en oscuro
- [ ] Verde brote usado solo para elementos activos e iconos
- [ ] Contraste verificado entre texto y fondo

---

**Actualizado:** 2026-05-04
**Versión:** 1.0
**Autor:** Porerekua Design System
