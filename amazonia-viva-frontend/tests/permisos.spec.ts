import { test, expect } from '@playwright/test';
import { tokens } from './helpers';

test.describe('Permisos y control de acceso', () => {
  test('visitante sin login no ve el botón de nueva publicación', async ({ page }) => {
    await page.goto('/#/investigaciones');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/investigaciones y publicaciones/i)).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="btn-nueva-publicacion"]')).not.toBeVisible();
  });

  test('POST /publicaciones sin token devuelve 401', async ({ request }) => {
    const resp = await request.post('http://localhost:3333/api/publicaciones', {
      data: { titulo: 'Intento sin token', contenido: [{ tipo: 'parrafo', texto: 'No.' }] },
    });
    expect(resp.status()).toBe(401);
  });

  test('investigador no puede acceder a /admin/logs → 403', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/admin/logs', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
    });
    expect(resp.status()).toBe(403);
  });

  test('admin no puede crear publicaciones → 403', async ({ request }) => {
    const resp = await request.post('http://localhost:3333/api/publicaciones', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
      data: {
        titulo: 'Admin intentando crear pub',
        contenido: [{ tipo: 'parrafo', texto: 'No debería.' }],
      },
    });
    expect(resp.status()).toBe(403);
  });

  test('DELETE /publicaciones/:id sin token devuelve 401', async ({ request }) => {
    // Crear pub como investigador para tener un ID válido
    const createResp = await request.post('http://localhost:3333/api/publicaciones', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
      data: {
        titulo: `Permisos test ${Date.now()}`,
        estado: 'borrador',
        contenido: [{ tipo: 'parrafo', texto: 'Solo el autor o admin puede.' }],
      },
    });
    const pub = await createResp.json();
    const delResp = await request.delete(`http://localhost:3333/api/publicaciones/${pub.id}`);
    expect(delResp.status()).toBe(401);

    // Limpiar
    await request.delete(`http://localhost:3333/api/publicaciones/${pub.id}`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
  });
});
