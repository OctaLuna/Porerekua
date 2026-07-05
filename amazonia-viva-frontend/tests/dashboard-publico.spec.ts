import { test, expect } from '@playwright/test';

test.describe('Dashboard público — HomePage', () => {
  test('muestra stats reales del backend sin sesión', async ({ page, request }) => {
    // Obtener los valores esperados directamente de la API
    const resp = await request.get('http://localhost:3333/api/dashboard/publico/resumen');
    expect(resp.ok()).toBeTruthy();
    const stats = await resp.json();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // El contenedor de stats tiene data-testid="stats-publicas"
    const statsSection = page.locator('[data-testid="stats-publicas"]');
    await expect(statsSection).toBeVisible({ timeout: 10000 });

    // Verificar que los números del backend aparecen en pantalla
    await expect(page.locator('[data-testid="stat-proyectos-activos"]'))
      .toHaveText(String(stats.proyectos_activos), { timeout: 10000 });
    await expect(page.locator('[data-testid="stat-empresas"]'))
      .toHaveText(String(stats.total_empresas));
    await expect(page.locator('[data-testid="stat-organizaciones"]'))
      .toHaveText(String(stats.total_organizaciones));
  });

  test('/dashboard/publico/resumen es accesible sin token', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/dashboard/publico/resumen');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('total_proyectos');
    expect(body).toHaveProperty('proyectos_activos');
    expect(body).toHaveProperty('departamentos_con_actividad');
  });
});
