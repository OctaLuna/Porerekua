import { test, expect } from '@playwright/test';
import { loginViaStorage, tokens } from './helpers';

test.describe('Dashboard completo — público y privado', () => {
  test('Dashboard público muestra stats reales sin login', async ({ page }) => {
    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');

    // Debe haber al menos 1 stat visible (total_proyectos, etc.)
    await expect(page.getByText(/dashboard de impacto/i)).toBeVisible({ timeout: 8000 });
    // Las stats públicas deben mostrar números
    await expect(page.getByText(/proyectos activos/i)).toBeVisible({ timeout: 8000 });
  });

  test('Dashboard privado muestra KPIs adicionales para admin', async ({ page, request }) => {
    await loginViaStorage(page, tokens.admin);
    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');

    // KPIs adicionales del dashboard privado
    await expect(page.getByText(/proyectos finalizados/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/evolución histórica/i)).toBeVisible({ timeout: 10000 });
  });

  test('/dashboard/timeline responde con datos para admin', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/dashboard/timeline', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('anio');
      expect(body[0]).toHaveProperty('nuevos_proyectos');
    }
  });

  test('/dashboard/por-tipo incluye métricas de empresas y departamentos', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/dashboard/por-tipo', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('tipo_proyecto');
      expect(body[0]).toHaveProperty('empresas_participantes');
      expect(body[0]).toHaveProperty('departamentos_cubiertos');
    }
  });

  test('/dashboard/resumen incluye todos los KPIs del plan', async ({ request }) => {
    const resp = await request.get('http://localhost:3333/api/dashboard/resumen', {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    const body = await resp.json();
    // Verificar todos los campos del resumen
    const expectedFields = [
      'total_proyectos', 'total_empresas', 'total_organizaciones',
      'proyectos_conservacion', 'proyectos_desarrollo',
      'proyectos_activos', 'proyectos_finalizados',
      'empresas_con_proyectos', 'organizaciones_con_proyectos',
      'departamentos_amazonicos', 'municipios_cubiertos',
      'comunidades_indigenas_beneficiadas',
      'organizaciones_nacionales', 'organizaciones_internacionales',
      'total_ods_cubiertos',
      'anio_inicio_mas_antiguo', 'anio_inicio_mas_reciente',
    ];
    for (const field of expectedFields) {
      expect(body).toHaveProperty(field);
    }
  });
});
