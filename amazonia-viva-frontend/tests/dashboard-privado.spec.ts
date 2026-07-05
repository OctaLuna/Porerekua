import { test, expect } from '@playwright/test';
import { loginViaStorage, tokens, creds } from './helpers';

test.describe('Dashboard privado', () => {
  test('carga las gráficas para un admin autenticado', async ({ page }) => {
    await loginViaStorage(page, tokens.admin);
    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3, [data-kpi]').first()).toBeVisible({ timeout: 10000 });
  });

  test('/dashboard/resumen requiere token', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/dashboard/resumen');
    expect(resp.status()).toBe(401);
  });

  test('/dashboard/resumen responde con datos para admin', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/dashboard/resumen', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('total_proyectos');
    expect(body).toHaveProperty('total_empresas');
  });
});
