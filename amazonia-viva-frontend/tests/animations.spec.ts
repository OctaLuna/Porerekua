import { test, expect } from '@playwright/test';

// Estos tests solo tocan páginas públicas (no requieren login).
// Nota: tests/global-setup.ts corre igualmente y necesita el backend en :3333
// (o un tests/.tokens.json con tokens vigentes) para arrancar la suite.

test.describe('Animaciones — Home (capítulos estilo Floema)', () => {
  test('la secuencia de capítulos existe con 5 capítulos', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.home-chapters')).toBeVisible();
    const slides = page.locator('.chapter-slide');
    expect(await slides.count()).toBe(5);
  });

  test('Lenis aplica la clase "lenis" al <html>', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/lenis/);
  });
});

test.describe('Animaciones — Nosotros (team grid + modal)', () => {
  test('las fotos inician en grayscale y cambian de filtro al hover', async ({ page }) => {
    await page.goto('/#/nosotros');
    await page.waitForLoadState('networkidle');

    const firstImg = page.locator('.team-card .team-img').first();
    await expect(firstImg).toBeVisible();

    const before = await firstImg.evaluate((el) => getComputedStyle(el).filter);
    expect(before).toContain('grayscale');

    await firstImg.hover();
    await page.waitForTimeout(700); // esperar la animación GSAP
    const after = await firstImg.evaluate((el) => getComputedStyle(el).filter);
    expect(after).not.toBe(before);
  });

  test('clic abre el panel modal con el nombre; Escape lo cierra', async ({ page }) => {
    await page.goto('/#/nosotros');
    await page.waitForLoadState('networkidle');

    await page.locator('.team-card').first().click();
    await page.waitForTimeout(700);

    const modal = page.locator('.team-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#modal-name')).not.toBeEmpty();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(modal).toHaveCount(0);
  });
});
