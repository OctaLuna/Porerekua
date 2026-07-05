import { test, expect } from '@playwright/test';
import { loginViaStorage, loginUI, tokens, creds } from './helpers';

test.describe('Mis publicaciones — investigador', () => {
  test('/publicaciones/mias requiere token', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/publicaciones/mias');
    expect(resp.status()).toBe(401);
  });

  test('investigador ve su propia lista incl. borradores', async ({ request }) => {
    // Crear un borrador
    await request.post('http://localhost:3333/api/publicaciones', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
      data: {
        titulo: `Borrador test ${Date.now()}`,
        estado: 'borrador',
        contenido: [{ tipo: 'parrafo', texto: 'Contenido del borrador.' }],
      },
    });

    const resp = await request.get('http://localhost:3333/api/publicaciones/mias', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('data');
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('investigador puede editar su propia publicación', async ({ request }) => {
    const createResp = await request.post('http://localhost:3333/api/publicaciones', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
      data: {
        titulo: `Editable ${Date.now()}`,
        estado: 'borrador',
        contenido: [{ tipo: 'parrafo', texto: 'Original.' }],
      },
    });
    const pub = await createResp.json();

    const editResp = await request.patch(`http://localhost:3333/api/publicaciones/${pub.id}`, {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
      data: { titulo: 'Título editado', contenido: [{ tipo: 'parrafo', texto: 'Modificado.' }] },
    });
    expect(editResp.status()).toBe(200);
    const edited = await editResp.json();
    expect(edited.titulo).toBe('Título editado');

    // Limpiar
    await request.delete(`http://localhost:3333/api/publicaciones/${pub.id}`, {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
    });
  });

  test('página Mis Publicaciones carga para investigador', async ({ page }) => {
    await loginViaStorage(page, tokens.investigador);
    await page.goto('/#/mis-publicaciones');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/mis publicaciones/i)).toBeVisible({ timeout: 8000 });
  });
});
