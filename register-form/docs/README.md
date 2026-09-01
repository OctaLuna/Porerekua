# Assets de Audio para Porerekua

Esta carpeta debe contener los siguientes archivos de audio para la experiencia inmersiva completa:

## Sonidos Ambientales

### Ambiente Diurno
- `amazon_day_ambient.mp3` - Sonido base de la selva durante el día (loop)
- `amazon_day_ambient.ogg` - Versión alternativa en formato OGG

### Ambiente Nocturno  
- `amazon_night_ambient.mp3` - Sonido base de la selva durante la noche (loop)
- `amazon_night_ambient.ogg` - Versión alternativa en formato OGG

## Sonidos Esporádicos Diurnos
- `macaw_call.mp3` - Llamada de guacamayo
- `monkey_chatter.mp3` - Charla de monos
- `jungle_drip.mp3` - Goteo de agua en la selva
- `leaf_rustle.mp3` - Susurro de hojas

## Sonidos Esporádicos Nocturnos
- `owl_call.mp3` - Llamada de búho
- `crickets.mp3` - Grillos (loop suave)
- `night_insects.mp3` - Insectos nocturnos

## Sonidos Interactivos
- `bird_flutter.mp3` - Aleteo de pájaros (al hacer hover)
- `water_drop.mp3` - Gota de agua

## Especificaciones Técnicas

### Formato Recomendado
- **Formato principal**: MP3 (320kbps para ambiente, 192kbps para efectos)
- **Formato alternativo**: OGG Vorbis (para mejor compresión)

### Duración
- **Ambientes**: 2-5 minutos (loops perfectos)
- **Esporádicos**: 1-3 segundos
- **Interactivos**: 0.5-1 segundo

### Características de Audio
- **Frecuencia de muestreo**: 44.1kHz
- **Profundidad de bits**: 16-bit mínimo
- **Canales**: Estéreo
- **Volumen**: Normalizado, sin picos

### Loops Perfectos
Los archivos de ambiente deben tener loops perfectos (sin clics o saltos audibles al reiniciar).

## Fuentes Recomendadas

### Gratuitas
- **Freesound.org** - Sonidos con licencia Creative Commons
- **Zapsplat** - Biblioteca extensa (requiere registro gratuito)
- **BBC Sound Effects** - Archivo de sonidos naturales

### Comerciales
- **AudioJungle** - Sonidos profesionales de alta calidad
- **Pond5** - Biblioteca de audio específica para naturaleza
- **Artlist** - Suscripción con sonidos premium

## Notas de Implementación

1. **Políticas de Autoplay**: Los sonidos se inicializan solo después de la primera interacción del usuario
2. **Gestión de Memoria**: Los sonidos se precargan pero se descargan cuando no se usan
3. **Fallbacks**: Si falta un archivo, el sistema continúa funcionando sin errores
4. **Accesibilidad**: Los usuarios pueden desactivar todos los sonidos desde los controles de accesibilidad

## Testing Sin Archivos

Para probar la funcionalidad sin archivos de audio reales:
1. Los archivos que falten se manejan silenciosamente
2. Los indicadores visuales muestran cuando el audio está activo
3. El SoundManager registra los intentos de reproducción en la consola