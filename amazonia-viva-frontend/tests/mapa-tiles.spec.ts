import { test, expect } from '@playwright/test';

test.describe('Mapa — tiles visibles sin API key', () => {
  test('mapa carga tiles de OSM cuando VITE_MAPTILER_KEY está vacío', async ({ page }) => {
    const tileRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('tile.openstreetmap.org') || url.includes('maptiler.com')) {
        tileRequests.push(url);
      }
    });

    await page.goto('/#/georeferencia');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
    // Esperar a que el mapa cargue tiles
    await page.waitForTimeout(3000);

    // Debe haber pedido tiles (OSM o MapTiler)
    expect(tileRequests.length, 'El mapa no pidió ningún tile').toBeGreaterThan(0);
  });

  test('mapa muestra los markers de proyectos con coordenadas', async ({ page, request }) => {
    // Verificar que hay proyectos con coordenadas en la API
    const resp = await request.get('http://localhost:3333/api/proyectos/map');
    const projects = await resp.json();
    const withCoords = projects.filter((p: { lat: string; lng: string }) => p.lat && p.lng);

    if (withCoords.length === 0) { test.skip(); return; }

    await page.goto('/#/georeferencia');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Los markers de MapLibre son divs con clase maplibregl-marker
    const markers = page.locator('.maplibregl-marker');
    await expect(markers.first()).toBeVisible({ timeout: 10000 });
  });
});
