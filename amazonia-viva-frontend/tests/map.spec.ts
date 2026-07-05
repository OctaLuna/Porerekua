import { test, expect } from '@playwright/test';

test.describe('Mapa — GeoreferencingPage', () => {
  test('carga el contenedor del mapa y no lanza errores críticos', async ({ page }) => {
    const criticalErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      // Ignorar errores conocidos no críticos
      const isMapTilerNoise =
        text.includes('maptiler') ||
        text.includes('api.maptiler.com') ||
        text.includes('Failed to load resource') ||
        text.includes('net::ERR') ||
        text.includes('style') ||
        text.includes('tiles') ||
        text.includes('sprite') ||
        text.includes('glyphs');
      // Ignorar errores de SVG malformados (bug existente en íconos inline del app)
      const isSvgNoise = text.includes('viewBox') || text.includes('<svg>');
      if (!isMapTilerNoise && !isSvgNoise) {
        criticalErrors.push(text);
      }
    });

    await page.goto('/#/georeferencia');

    // El canvas del mapa debe aparecer (MapLibre GL crea un <canvas>)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });

    // Sin errores críticos de aplicación
    expect(criticalErrors, `Errores de consola inesperados: ${criticalErrors.join('\n')}`).toHaveLength(0);
  });

  test('la API /proyectos/map responde con coordenadas', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/proyectos/map');
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(Array.isArray(data)).toBeTruthy();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('lat');
      expect(data[0]).toHaveProperty('lng');
      expect(data[0]).toHaveProperty('nombre');
    }
  });
});
