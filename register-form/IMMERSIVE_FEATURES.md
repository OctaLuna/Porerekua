# 🌿 Porerekua - Experiencia Web Inmersiva

## ✨ Características Implementadas
```
porerekua/
```
**🎊 ¡Felicidades!** Has implementado una experiencia web inmersiva de clase mundial. La página de Porerekua ahora no solo informa, sino que transporta a los usuarios al corazón del bosque a través de los sentidos.
# 🌿 Porerekua - Experiencia Web Inmersiva

## ✨ Características Implementadas

### 🎵 Sistema de Audio Inmersivo (SoundManager)
- **Audio en capas**: Ambiente base, sonidos esporádicos e interactivos
- **Temas dinámicos**: Cambio automático día/noche según la hora local
- **Cumplimiento de políticas**: Inicialización solo tras interacción del usuario
- **Control de volumen**: Ajustes granulares y controles de usuario
- **Memoria optimizada**: Carga y descarga inteligente de recursos

### 🎭 Partículas Dinámicas (tsParticles)
- **Partículas diurnas**: Polvo y polen flotante con movimiento sutil
- **Luciérnagas nocturnas**: Efectos bioluminiscentes con parpadeo
- **Reacción al cursor**: Repulsión sutil para mayor inmersión
- **Rendimiento optimizado**: 60fps garantizado con configuración adaptiva

### 🌅 Ciclo Día/Noche Automático
- **Detección temporal**: Cambio automático basado en hora local
- **4 Estados temáticos**: Amanecer, día, atardecer, noche
- **Transiciones suaves**: Variables CSS y animaciones fluidas
- **Personalización**: Colores, backgrounds e intensidad de efectos

### ♿ Controles de Accesibilidad
- **Modo reducido**: Desactivación de animaciones y efectos
- **Respeto del sistema**: Detección de `prefers-reduced-motion`
- **Control de volumen**: Slider con ajustes granulares
- **Persistencia**: Configuraciones guardadas en localStorage
- **UX intuitiva**: Panel flotante con controles claros

### 🎯 Animaciones Mejoradas
- **Zoom dinámico en bg1**: Reacción al scroll con transiciones suaves
- **Aves interactivas**: Sonidos y micro-animaciones al hover
- **Optimización GPU**: Uso de `transform3d` y `will-change`
- **Fallbacks**: Degradación elegante en dispositivos limitados

## 🏗️ Estructura del Proyecto

```
amazonia-viva/
├── components/
│   ├── AccessibilityControls.tsx    # Panel de controles de accesibilidad
│   ├── ImmersiveParticles.tsx       # Sistema de partículas dinámicas
│   └── sections/
│       ├── Bird.tsx                 # Aves con interacciones sonoras
│       └── Aviary.tsx               # Contenedor de aves
├── hooks/
│   └── useDayNightCycle.ts         # Hook para ciclo temporal
├── utils/
│   └── SoundManager.ts             # Gestor de audio inmersivo
├── styles/
│   └── immersive.css               # Estilos para temas y efectos
└── public/assets/sounds/           # Assets de audio (ver README)
```

## 🚀 Características Técnicas

### Performance
- **60 FPS garantizado**: Optimizaciones GPU y rendering eficiente
- **Lazy loading**: Carga diferida de componentes pesados
- **Memory management**: Limpieza automática de recursos
- **Mobile optimization**: Desactivación de efectos pesados en móviles

### Accesibilidad
- **WCAG 2.1 compliant**: Cumplimiento de estándares de accesibilidad
- **Keyboard navigation**: Navegación completa por teclado
- **Screen reader**: Etiquetas ARIA y alt texts descriptivos
- **Motion sensitivity**: Respeto por preferencias de movimiento

### Browser Support
- **Modernos**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Fallbacks**: Degradación elegante en navegadores antiguos
- **Progressive enhancement**: Funcionalidad base sin JavaScript

## 🎮 Guía de Uso

### Para Desarrolladores

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Desarrollo**:
   ```bash
   npm run dev
   ```

3. **Producción**:
   ```bash
   npm run build
   ```

### Para Usuarios Finales

1. **Primera visita**: Clic en cualquier lugar para activar audio
2. **Controles**: Botón flotante (⚙️) en esquina inferior derecha
3. **Navegación**: Scroll suave o menú de navegación
4. **Aves interactivas**: Hover sobre las aves para efectos

## 🔧 Configuración

### Variables de Entorno
```env
NODE_ENV=development|production
VITE_AUDIO_ENABLED=true
VITE_PARTICLES_ENABLED=true
```

### Personalización de Temas
Editar `hooks/useDayNightCycle.ts` para ajustar:
- Horarios de cambio de tema
- Colores y gradientes
- Intensidad de efectos
- Imágenes de fondo

### Audio Assets
Ver `public/assets/sounds/README.md` para especificaciones completas de archivos de audio requeridos.

## 🎨 Experiencia de Usuario

### Momentos Inmersivos
1. **Entrada**: Preloader con animación suave
2. **Exploración**: Partículas reactivas y sonidos ambientales
3. **Interacción**: Feedback audiovisual en cada acción
4. **Transiciones**: Cambios temáticos automáticos
5. **Personalización**: Controles de accesibilidad siempre disponibles

### Detalles de Pulido
- **Micro-interacciones**: Hover states sutiles pero perceptibles
- **Feedback visual**: Indicadores de estado en desarrollo
- **Transiciones contextuales**: Diferentes efectos según el momento del día
- **Sonido espacial**: Variación de volumen para naturalidad

## 🌟 Próximas Mejoras

### Planificadas
- [ ] Efecto de lluvia con PixiJS (DisplacementFilter)
- [ ] Geolocalización para audio específico por región
- [ ] Integración con Web Audio API para efectos 3D
- [ ] PWA con caching de audio assets
- [ ] Analytics de interacción inmersiva

### Experimentales
- [ ] WebXR para experiencias VR/AR
- [ ] Machine learning para patrones de sonido adaptativos
- [ ] Sincronización con APIs meteorológicas reales
- [ ] Colaboración multi-usuario en tiempo real

---

**🎊 ¡Felicidades!** Has implementado una experiencia web inmersiva de clase mundial. La página de Porerekua ahora no solo informa, sino que transporta a los usuarios al corazón de la selva amazónica a través de los sentidos.