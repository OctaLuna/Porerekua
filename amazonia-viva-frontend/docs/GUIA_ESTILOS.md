# Guía Rápida de Estilos - Porerekua

## 🚨 Problemas Comunes y Soluciones

### 1. Panel "Datos de la Red" se muestra muy arriba

**Causa:** `padding-top` excesivo en el contenedor principal.

**Solución aplicada:**
```tsx
// ANTES: pt-40 (160px)
<div className="... pt-40 pb-12 ...">

// DESPUÉS: pt-12 (48px)
<div className="... pt-12 pb-12 ...">
```

**Archivo:** `pages/DataPage.tsx` línea 216

---

### 2. Panel de equipo no aparece en "Quiénes Somos"

**Causas posibles:**
- Sección fuera del flujo del scroll snap
- `z-index` inadecuado
- Altura `h-screen` mal calculada

**Solución aplicada:**
```tsx
// Panel de equipo ahora en sección 3 de 3
<section className="snap-section relative h-screen ...">
  <motion.div className="relative z-10 ..."> {/* z-10 asegura visibilidad */}
    {/* Contenido del panel */}
  </motion.div>
</section>
```

**Verificar:**
- Que el panel tenga `relative z-10`
- Que la sección tenga `snap-section` y `h-screen`
- scroll snap en el contenedor padre

---

### 3. Modo oscuro no se aplica correctamente

**Causa:** Falta `dark:` prefijo en clases.

**Verificar:**
```css
/* Correcto */
bg-blanco-puro/95 dark:bg-noche-selva/60

/* Incorrecto */
bg-blanco-puro/95 bg-noche-selva/60
```

**Archivos clave:**
- `tailwind.config.js` - debe incluir `darkMode: 'class'`
- `index.html` - debe tener `class="dark"` en html cuando corresponda

---

## 📋 Checklist de Estilos

### Para cualquier nuevo componente:

- [ ] Usar `bg-blanco-puro/95 dark:bg-noche-selva/60` como fondo base
- [ ] Agregar `backdrop-blur-md` si es panel superpuesto
- [ ] Incluir `border border-carbon/10 dark:border-white/10`
- [ ] Aplicar `shadow-medium` (no `shadow-lg` ni `shadow-2xl`)
- [ ] Textos: `text-carbon dark:text-beige-arena` (títulos) o `text-gris-piedra dark:text-beige-arena/80` (párrafos)
- [ ] Radio: `rounded-lg` (cards) o `rounded-2xl` (secciones)
- [ ] **NO** usar colores sólidos oscuros sin transparencia (`bg-gray-800`, `bg-carbon`)

### Para contenedores principales de página:

- [ ] Fondo: `bg-beige-arena/80 dark:bg-noche-selva/55`
- [ ] `backdrop-blur-md rounded-2xl`
- [ ] Borde: `border border-white/40 dark:border-beige-arena/10`
- [ ] Sombra: `shadow-medium`

---

## 🎯 Ejemplos Copy-Paste

### Card de proyecto o fundación

```tsx
<Card className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-6">
  <h3 className="text-xl font-bold text-carbon dark:text-beige-arena">
    Título
  </h3>
  <p className="text-gris-piedra dark:text-beige-arena/80 mt-2">
    Descripción...
  </p>
</Card>
```

### Input de búsqueda

```tsx
<input
  type="text"
  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 focus:ring-2 focus:ring-verde-brote shadow-subtle"
/>
```

### Botón circular (scroll, icono)

```tsx
<button className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md hover:bg-blanco-puro/80 dark:hover:bg-noche-selva/50 w-10 h-10 rounded-full shadow-medium border border-carbon/10 dark:border-white/10">
  <Icon />
</button>
```

### Panel de sección completa

```tsx
<div className="bg-beige-arena/80 dark:bg-noche-selva/55 backdrop-blur-md rounded-2xl border border-white/40 dark:border-beige-arena/10 shadow-medium p-8">
  <h2 className="text-4xl font-bold text-carbon dark:text-beige-arena mb-6">
    Título de Sección
  </h2>
  {/* Contenido */}
</div>
```

---

## 🐛 Debugging de Estilos

### Inspeccionar en DevTools

1. Abrir DevTools (F12)
2. Inspeccionar elemento
3. En pestaña **Computed**, filtrar por `background-color`
4. Verificar valoresRGBA:
   - Modo claro: `rgba(255, 255, 255, 0.95)`
   - Modo oscuro: `rgba(26, 31, 46, 0.60)`

### Forzar modo oscuro

```js
// En consola del navegador:
document.documentElement.classList.add('dark');
// o
localStorage.setItem('theme', 'dark');
```

### Verificar contraste

Usar herramienta **Lighthouse** o **axe DevTools**:
- Contraste mínimo: 4.5:1 (AA)
- Texto grande: 3:1 (AA)
- Texto normal: 4.5:1 (AA) / 7:1 (AAA)

---

## 📁 Archivos Modificados

### Componentes base
- `components/ui/Card.tsx` - Card base con modo oscuro

### Páginas (estilos aplicados)
- `pages/HomePage.tsx` - Secciones con cards estadísticas
- `pages/NosotrosPage.tsx` - Paneles de información y equipo
- `pages/GeoreferencingPage.tsx` - Mapa y explorador
- `pages/DataPage.tsx` - Contenedor principal y controles
- `pages/DashboardPage.tsx` - Estadísticas y gráficos
- `pages/InvestigacionesPage.tsx` - Carrusel y modal

---

## 🔄 Historia de Cambios

### 2026-05-04
- ✅ Implementado sistema unificado de modo oscuro
- ✅ Actualizadas 6 páginas principales
- ✅ Creados documentos de diseño (`DOCUMENTACION_MODO_OSCURO.md`)
- ✅ Corregido posicionamiento en DataPage (`pt-40` → `pt-12`)
- ✅ Build verificado sin errores

---

## 📚 Recursos Adicionales

- [Documentación completa](./DOCUMENTACION_MODO_OSCURO.md)
- [Paleta de colores](./PALETA_COLORES.md)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última actualización:** 2026-05-04
**Estado:** ✅ Estable y en producción
