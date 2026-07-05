/**
 * Genera `openapi.json` en la raíz del backend a partir de la app NestJS.
 * El equipo de frontend puede generar tipos con, p.ej.:
 *   npx openapi-typescript openapi.json -o src/api/types.ts
 *
 * Uso: npm run openapi:export
 */
import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { buildSwaggerConfig } from '../src/shared/swagger/swagger.config';

async function main() {
    const app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api');
    const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
    const out = join(process.cwd(), 'openapi.json');
    writeFileSync(out, JSON.stringify(document, null, 2), 'utf8');
    await app.close();
    const paths = Object.keys(document.paths ?? {}).length;
    console.log(`OpenAPI exportado a ${out} (${paths} rutas).`);
    process.exit(0);
}

main().catch((err) => {
    console.error('ERROR exportando OpenAPI:', err.message);
    process.exit(1);
});
