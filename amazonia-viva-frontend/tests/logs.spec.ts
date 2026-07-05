import { test, expect } from '@playwright/test';
import { loginViaStorage, tokens, creds } from './helpers';

test.describe('Panel de logs — Admin', () => {
  test('/admin/logs devuelve 401 sin token', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/admin/logs');
    expect(resp.status()).toBe(401);
  });

  test('/admin/logs devuelve 403 para investigador', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/admin/logs', {
      headers: { Authorization: `Bearer ${tokens.investigador}` },
    });
    expect(resp.status()).toBe(403);
  });

  test('/admin/logs responde con datos para admin', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/admin/logs', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body).toHaveProperty('total');
  });

  test('/admin/logs soporta filtros de tipo y severidad', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/admin/logs?tipo=seguridad&severidad=warn', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    body.data.forEach((log: { tipo: string; severidad: string }) => {
      expect(log.tipo).toBe('seguridad');
      expect(log.severidad).toBe('warn');
    });
  });

  test('panel de logs es visible en UI para admin', async ({ page }) => {
    await loginViaStorage(page, tokens.admin);
    await page.goto('/#/admin/logs');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="logs-panel"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="nav-logs"]')).toBeVisible();
  });

  test('investigador no ve el panel de logs en UI', async ({ page }) => {
    await loginViaStorage(page, tokens.investigador);
    await page.goto('/#/admin/logs');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="logs-panel"]')).not.toBeVisible({ timeout: 6000 });
  });
});
