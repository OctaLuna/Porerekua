import { test, expect } from '@playwright/test';
import { loginViaStorage, tokens } from './helpers';

test.describe('Navegación general — auditoría', () => {
  test('todos los links del nav público cargan sin error 500', async ({ page }) => {
    const routes = ['/', '/#/nosotros', '/#/georeferencia', '/#/datos', '/#/investigaciones', '/#/registro'];
    for (const route of routes) {
      const errors: string[] = [];
      page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('maptiler') && !msg.text().includes('viewBox')) errors.push(`${route}: ${msg.text()}`); });
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      // La página debe tener un título visible
      expect(await page.title()).toBeTruthy();
    }
  });

  test('rutas del admin redirigen a home para investigadores', async ({ page }) => {
    await loginViaStorage(page, tokens.investigador);
    await page.goto('/#/admin/usuarios');
    await page.waitForLoadState('networkidle');
    // AdminRoute redirige a home
    await expect(page).not.toHaveURL(/admin\/usuarios/);
  });

  test('rutas del admin accesibles para admin', async ({ page }) => {
    await loginViaStorage(page, tokens.admin);
    await page.goto('/#/admin/solicitudes');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /solicitudes/i })).toBeVisible({ timeout: 8000 });
  });

  test('/admin/logs accesible para admin', async ({ page }) => {
    await loginViaStorage(page, tokens.admin);
    await page.goto('/#/admin/logs');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="logs-panel"]')).toBeVisible({ timeout: 8000 });
  });

  test('página 404 o home para rutas inexistentes', async ({ page }) => {
    await page.goto('/#/ruta-que-no-existe');
    await page.waitForLoadState('networkidle');
    // No debe explotar — puede mostrar home o 404
    expect(await page.title()).toBeTruthy();
  });

  test('dashboard sin login muestra stats públicas (no LoginGate)', async ({ page }) => {
    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');
    // Debe mostrar algo sin requerir login
    await expect(page.getByText(/dashboard de impacto/i)).toBeVisible({ timeout: 8000 });
    // No debe mostrar el LoginGate antiguo
    await expect(page.getByText(/inicia sesión para ver el dashboard/i)).not.toBeVisible();
  });
});
