import { test, expect } from '@playwright/test';
import { loginViaStorage, tokens, creds } from './helpers';

test.describe('Publicaciones — flujo investigador', () => {
  test('investigador ve el botón de nueva publicación', async ({ page }) => {
    await loginViaStorage(page, tokens.investigador);
    await page.goto('/#/investigaciones');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="btn-nueva-publicacion"]')).toBeVisible({ timeout: 8000 });
  });

  test('investigador puede crear publicación con subtítulo y párrafo vía API', async ({ request }) => {
    const titulo = `Test pub ${Date.now()}`;
    const resp = await request.post('http://localhost:3333/api/publicaciones', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
      data: {
        titulo,
        estado: 'publicado',
        contenido: [
          { tipo: 'subtitulo', texto: 'Introducción' },
          { tipo: 'parrafo', texto: 'Párrafo de prueba generado por Playwright.' },
        ],
      },
    });
    expect(resp.status()).toBe(201);
    const pub = await resp.json();
    expect(pub).toHaveProperty('slug');
    expect(pub.titulo).toBe(titulo);
    expect(pub.estado).toBe('publicado');

    // Verificar que el detalle contiene los 2 bloques
    const detalle = await request.get(`http://localhost:3333/api/publicaciones/${pub.slug}`);
    expect(detalle.status()).toBe(200);
    const detalleBody = await detalle.json();
    expect(detalleBody.contenido).toHaveLength(2);
    expect(detalleBody.contenido[0].tipo).toBe('subtitulo');

    // Limpiar
    await request.delete(`http://localhost:3333/api/publicaciones/${pub.id}`, {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
    });
  });

  test('publicaciones aparecen en /investigaciones', async ({ page, request }) => {
    const listResp = await request.get('http://localhost:3333/api/publicaciones?limit=1');
    const list = await listResp.json();
    if (list.data.length === 0) { test.skip(); return; }

    await page.goto('/#/investigaciones');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid^="pub-card-"]').first()).toBeVisible({ timeout: 10000 });
  });
});
