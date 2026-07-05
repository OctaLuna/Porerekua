import { test, expect } from '@playwright/test';
import { tokens } from './helpers';

test.describe('Publicaciones — Admin puede editar y eliminar de otros', () => {
  test('admin puede editar publicación de un investigador', async ({ request }) => {
    const createResp = await request.post('http://localhost:3333/api/publicaciones', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
      data: {
        titulo: `Pub para admin editar ${Date.now()}`,
        estado: 'publicado',
        contenido: [{ tipo: 'parrafo', texto: 'Contenido original del investigador.' }],
      },
    });
    expect(createResp.status()).toBe(201);
    const pub = await createResp.json();

    const editResp = await request.patch(`http://localhost:3333/api/publicaciones/${pub.id}`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
      data: { titulo: 'Editado por Admin' },
    });
    expect(editResp.status()).toBe(200);
    const edited = await editResp.json();
    expect(edited.titulo).toBe('Editado por Admin');
    expect(edited.editadoPorId).not.toBeNull();

    // Limpiar
    await request.delete(`http://localhost:3333/api/publicaciones/${pub.id}`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
  });

  test('admin puede eliminar publicación de un investigador', async ({ request }) => {
    const createResp = await request.post('http://localhost:3333/api/publicaciones', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
      data: {
        titulo: `Para eliminar ${Date.now()}`,
        estado: 'borrador',
        contenido: [{ tipo: 'parrafo', texto: 'Se va a eliminar.' }],
      },
    });
    const pub = await createResp.json();

    const delResp = await request.delete(`http://localhost:3333/api/publicaciones/${pub.id}`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(delResp.status()).toBe(204);
  });
});
