import { test, expect } from '@playwright/test';

test.describe('Publicaciones — acceso público', () => {
  test('listado es visible sin login', async ({ page }) => {
    await page.goto('/#/investigaciones');
    await page.waitForLoadState('networkidle');

    // Título de la sección
    await expect(page.getByText(/investigaciones y publicaciones/i)).toBeVisible({ timeout: 8000 });

    // No se muestra el botón de "Nueva publicación" para visitantes
    await expect(page.locator('[data-testid="btn-nueva-publicacion"]')).not.toBeVisible();
  });

  test('/publicaciones responde sin token y solo retorna publicados', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/publicaciones');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    // Todos los resultados deben estar publicados
    body.data.forEach((pub: { estado: string }) => {
      expect(pub.estado).toBe('publicado');
    });
  });

  test('detalle de publicación es accesible sin login', async ({ request }) => {
    // Obtener el listado y navegar al primero
    const listResp = await request.get('http://localhost:3333/api/publicaciones?limit=1');
    const list = await listResp.json();
    if (list.data.length === 0) {
      test.skip();
      return;
    }
    const slug = list.data[0].slug;
    const resp = await request.get(`http://localhost:3333/api/publicaciones/${slug}`);
    expect(resp.status()).toBe(200);
    const pub = await resp.json();
    expect(pub).toHaveProperty('titulo');
    expect(pub).toHaveProperty('contenido');
    expect(pub.estado).toBe('publicado');
  });
});
