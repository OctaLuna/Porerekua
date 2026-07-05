import { test, expect } from '@playwright/test';
import { loginUI, creds } from './helpers';

test.describe('Regresión — funcionalidad existente', () => {
  test('Home Page carga correctamente', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // El h1 tiene el texto "Porerekua" (también aparece en el logo del header)
    await expect(page.getByRole('heading', { name: /porerekua/i })).toBeVisible({ timeout: 8000 });
  });

  test('navegación a /georeferencia funciona', async ({ page }) => {
    await page.goto('/#/georeferencia');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 12000 });
  });

  test('navegación a /datos funciona', async ({ page }) => {
    await page.goto('/#/datos');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/datos/);
  });

  test('navegación a /investigaciones funciona', async ({ page }) => {
    await page.goto('/#/investigaciones');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/investigaciones y publicaciones/i)).toBeVisible({ timeout: 8000 });
  });

  test('login por UI funciona correctamente', async ({ page }) => {
    await loginUI(page, creds.admin.email, creds.admin.password);
    // El header muestra el nombre del usuario (puede haber 2 spans: desktop + mobile)
    await expect(page.getByText(/admin test/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('logout por UI funciona', async ({ page }) => {
    await loginUI(page, creds.admin.email, creds.admin.password);
    await page.getByRole('button', { name: /cerrar sesión/i }).click();
    // El nombre debe desaparecer — usar first() para evitar strict mode violation
    await expect(page.getByText(/admin test/i).first()).not.toBeVisible({ timeout: 6000 });
  });

  test('/api/health del backend responde', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/health');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe('ok');
  });

  test('/geo/health del georef-service responde', async ({ request }) => {
    const resp = await request.get('http://127.0.0.1:8001/geo/health');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe('ok');
  });
});
