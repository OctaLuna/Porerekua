import type { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const API_URL = 'http://localhost:3333/api';
const TOKEN_FILE = 'tests/.tokens.json';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchTokenWithRetry(email: string, password: string, retries = 5): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const resp = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (resp.ok) {
      const body = await resp.json() as { accessToken: string };
      return body.accessToken;
    }

    if (resp.status === 429) {
      const waitSecs = attempt * 20;
      console.log(`  ⏳ Rate limit (429) para ${email}. Esperando ${waitSecs}s (intento ${attempt}/${retries})...`);
      await wait(waitSecs * 1000);
      continue;
    }

    throw new Error(`Login falló (${resp.status}) para ${email}`);
  }
  throw new Error(`No se pudo obtener token para ${email} después de ${retries} intentos`);
}

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    // Válido si expira en más de 1 hora
    return payload.exp * 1000 > Date.now() + 3600_000;
  } catch {
    return false;
  }
}

export default async function globalSetup(_config: FullConfig) {
  console.log('\n🔑 [global-setup] Verificando tokens de prueba...');

  // Reutilizar tokens existentes si siguen vigentes
  if (fs.existsSync(TOKEN_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) as {
        superadminToken: string; adminToken: string; investigadorToken: string;
      };
      if (
        isTokenValid(existing.superadminToken) &&
        isTokenValid(existing.adminToken) &&
        isTokenValid(existing.investigadorToken)
      ) {
        console.log('✅ [global-setup] Tokens existentes válidos — reutilizando.');
        return;
      }
    } catch {
      // tokens corruptos, refetch
    }
  }

  console.log('   Obteniendo nuevos tokens (puede tomar ~60s por rate limit)...');

  const superadminToken = await fetchTokenWithRetry(
    process.env.TEST_SUPERADMIN_EMAIL ?? 'superadmin@kaaiya.test',
    process.env.TEST_SUPERADMIN_PASSWORD ?? 'SuperPass1!',
  );
  await wait(22000);

  const adminToken = await fetchTokenWithRetry(
    process.env.TEST_ADMIN_EMAIL ?? 'admin.test@kaaiya.test',
    process.env.TEST_ADMIN_PASSWORD ?? 'AdminTest1!',
  );
  await wait(22000);

  const investigadorToken = await fetchTokenWithRetry(
    process.env.TEST_INVESTIGADOR_EMAIL ?? 'investigador.test@kaaiya.test',
    process.env.TEST_INVESTIGADOR_PASSWORD ?? 'InvTest1!',
  );

  fs.writeFileSync(TOKEN_FILE, JSON.stringify(
    { superadminToken, adminToken, investigadorToken },
    null, 2,
  ));
  console.log('✅ [global-setup] Tokens guardados en', TOKEN_FILE);
}
