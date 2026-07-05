import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_FILE = path.join(__dirname, '.tokens.json');

type Tokens = { superadminToken: string; adminToken: string; investigadorToken: string };

function loadTokens(): Tokens {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as Tokens;
  } catch {
    throw new Error('tokens.json no encontrado. Ejecuta: npx playwright test (globalSetup lo genera automáticamente)');
  }
}

/** Tokens pre-obtenidos por globalSetup — no hacen llamadas al API. */
export const tokens = {
  get superadmin() { return loadTokens().superadminToken; },
  get admin() { return loadTokens().adminToken; },
  get investigador() { return loadTokens().investigadorToken; },
};

/** Credenciales de los usuarios de prueba (leídas de process.env o fallback). */
export const creds = {
  superadmin: {
    email: process.env.TEST_SUPERADMIN_EMAIL ?? 'superadmin@kaaiya.test',
    password: process.env.TEST_SUPERADMIN_PASSWORD ?? 'SuperPass1!',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL ?? 'admin.test@kaaiya.test',
    password: process.env.TEST_ADMIN_PASSWORD ?? 'AdminTest1!',
  },
  investigador: {
    email: process.env.TEST_INVESTIGADOR_EMAIL ?? 'investigador.test@kaaiya.test',
    password: process.env.TEST_INVESTIGADOR_PASSWORD ?? 'InvTest1!',
  },
};

/**
 * Login rápido vía localStorage — no llama a la API de login (evita rate limit).
 * Requiere que el token ya esté pre-obtenido por globalSetup.
 */
export async function loginViaStorage(page: Page, token: string) {
  await page.goto('/');
  await page.evaluate((t) => localStorage.setItem('porerekua_token', t), token);
  await page.reload();
  await page.waitForLoadState('networkidle');
  // Esperar que el botón de login desaparezca (indica que AuthContext restauró la sesión)
  await expect(page.getByRole('button', { name: /^login$/i })).not.toBeVisible({ timeout: 10000 });
}

/**
 * Login por UI usando el panel del Header — verifica el flujo visual de login.
 * Botón con aria-label="Login"; formulario con id="email-login" e id="password".
 * Usar solo en tests de regresión/auth — puede verse afectado por rate limit.
 */
export async function loginUI(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /^login$/i }).click();
  await page.locator('#email-login').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /^ingresar/i }).click();

  // Esperar que el panel de login se cierre (confirma login exitoso)
  await expect(page.locator('#email-login')).not.toBeVisible({ timeout: 10000 });
}
