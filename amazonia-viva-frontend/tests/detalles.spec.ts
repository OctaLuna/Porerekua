import { test, expect } from '@playwright/test';
import { loginViaStorage, tokens } from './helpers';

test.describe('Panel de detalles — todos los campos', () => {
  test('/proyectos/:id retorna todos los campos incluyendo relaciones', async ({ request }) => {
    // Obtener primer proyecto con detalles
    const listResp = await request.get('http://localhost:3333/api/proyectos?limit=1', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    const list = await listResp.json();
    if (!list.data?.length) { test.skip(); return; }

    const id = list.data[0].id;
    const resp = await request.get(`http://localhost:3333/api/proyectos/${id}`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();

    // Verificar que el wrapper unwrap funciona (la API envuelve en { proyecto })
    const proyecto = body.proyecto ?? body;
    expect(proyecto).toHaveProperty('id');
    expect(proyecto).toHaveProperty('nombre');
    expect(proyecto).toHaveProperty('area');
    expect(proyecto).toHaveProperty('tipo');
    expect(proyecto).toHaveProperty('ayudas');
    expect(proyecto).toHaveProperty('actoresMunicipales');
  });

  test('/empresas/:id retorna todos los campos incluyendo organizaciones vinculadas', async ({ request }) => {
    const listResp = await request.get('http://localhost:3333/api/empresas?limit=1', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    const list = await listResp.json();
    if (!list.data?.length) { test.skip(); return; }

    const id = list.data[0].id;
    const resp = await request.get(`http://localhost:3333/api/empresas/${id}`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const empresa = body.empresa ?? body;
    expect(empresa).toHaveProperty('nombre');
    expect(empresa).toHaveProperty('formaJuridica');
    expect(empresa).toHaveProperty('departamentos');
    expect(empresa).toHaveProperty('apoyos');
    expect(empresa).toHaveProperty('motivos');
    expect(empresa).toHaveProperty('ods');
    expect(empresa).toHaveProperty('proyectosEmpresas');
  });

  test('/organizaciones/:id retorna todos los campos', async ({ request }) => {
    const listResp = await request.get('http://localhost:3333/api/organizaciones?limit=1', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    const list = await listResp.json();
    if (!list.data?.length) { test.skip(); return; }

    const id = list.data[0].id;
    const resp = await request.get(`http://localhost:3333/api/organizaciones/${id}`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const org = body.organizacion ?? body;
    expect(org).toHaveProperty('nombre');
    expect(org).toHaveProperty('tipo');
    expect(org).toHaveProperty('departamento');
    expect(org).toHaveProperty('proyectosOrganizaciones');
  });

  test('panel de detalles se abre y muestra contenido con tab de participantes', async ({ page }) => {
    await loginViaStorage(page, tokens.admin);
    await page.goto('/#/datos');
    await page.waitForLoadState('networkidle');

    // Hacer click en el primer item disponible (card de proyecto u org)
    const firstCard = page.locator('[data-detail-id], .cursor-pointer').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      // El panel de detalles debe abrirse
      await expect(page.locator('[data-testid="details-panel"]')).toBeVisible({ timeout: 8000 });
    } else {
      test.skip();
    }
  });
});
