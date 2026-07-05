/**
 * Repara los nombres/descripciones de proyectos guardados con mojibake
 * (bytes Latin-1 mal codificados que aparecen como el carácter de reemplazo U+FFFD "�").
 *
 * Uso:
 *   node scripts/fix-mojibake.js          -> escanea y REPARA
 *   node scripts/fix-mojibake.js --dry    -> solo escanea, no modifica
 *
 * Lee la conexión desde el .env del backend (Supabase por defecto).
 * Detecta SSL automáticamente cuando el host contiene "supabase".
 */
require('dotenv').config();
const { Client } = require('pg');

const DRY = process.argv.includes('--dry');
const REPL = '�'; // carácter de reemplazo "�"

// Correcciones (9 filas afectadas: 18–26). Cada "�" (U+FFFD) reemplaza una
// vocal acentuada; el texto correcto se reconstruye a partir del contexto.
const FIXES = [
  {
    id: 18,
    nombre: 'Certificación de sostenibilidad en producción de soya RTRS',
    descripcion:
      'Programa de certificación Round Table on Responsible Soy (RTRS) para 15,000 ha en el oriente boliviano, con trazabilidad completa de la cadena productiva.',
  },
  {
    id: 19,
    nombre: 'Ganadería silvopastoril en el Beni con conservación forestal',
    descripcion:
      'Implementación de sistemas silvopastoriles que combinan ganadería sostenible y conservación forestal en 8,000 ha del departamento del Beni.',
  },
  {
    id: 20,
    nombre: 'Corredor de Biodiversidad Chiquitano-Pantanal',
    descripcion:
      'Conservación de 1.2 millones de hectáreas del bosque seco más grande del mundo, conectando el Bosque Chiquitano con el Pantanal. Incluye monitoreo de fauna silvestre y trabajo con comunidades.',
  },
  {
    id: 21,
    nombre: 'Turismo de naturaleza sostenible en el Parque Madidi',
    descripcion:
      'Operación de turismo sostenible con guías locales indígenas, conservación del hábitat y distribución equitativa de beneficios con comunidades del área del Parque Nacional Madidi.',
  },
  {
    id: 22,
    nombre: 'Monitoreo de fauna silvestre en la Amazonía boliviana',
    descripcion:
      'Red de cámaras trampa y monitoreo satelital de jaguares, tapires y caimanes en la Amazonía boliviana. Análisis de corredores de biodiversidad y publicación de datos abiertos.',
  },
  {
    id: 23,
    nombre: 'Certificación orgánica para 500 familias productoras amazónicas',
    descripcion:
      'Proceso de certificación orgánica de café, cacao y frutas tropicales para 500 familias de productores en el trópico boliviano, con acceso a mercados internacionales justos.',
  },
  {
    id: 24,
    nombre: 'Programa de conservación de tortugas acuáticas en el Chiquitano',
    descripcion:
      'Monitoreo y conservación de poblaciones de tortugas acuáticas y otros reptiles en los ríos y lagunas del bosque chiquitano y Pantanal boliviano, con participación comunitaria.',
  },
  {
    id: 25,
    nombre: 'Plataforma de datos Kaa Iya para la sostenibilidad amazónica',
    descripcion:
      'Sistema de información geoespacial para visibilizar y sistematizar iniciativas sostenibles vinculadas a la Amazonía boliviana, desarrollado por la Universidad Católica Boliviana San Pablo.',
  },
  {
    id: 26,
    nombre: 'Proyecto test sin GeoRef activo',
    descripcion:
      'Proyecto de prueba para verificar degradación elegante cuando GeoRef está caído.',
  },
];

const host = process.env.DB_HOST || '';
const useSsl = /supabase/i.test(host);

async function main() {
  const client = new Client({
    host,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    client_encoding: 'UTF8',
  });

  await client.connect();
  console.log(`Conectado a ${host} (ssl=${useSsl}) — modo ${DRY ? 'DRY-RUN' : 'REPARAR'}\n`);

  // 1) Escaneo: cualquier fila con el carácter de reemplazo en nombre o descripcion.
  const scan = await client.query(
    `SELECT id_proyecto, nombre, descripcion
       FROM proyectos
      WHERE nombre LIKE '%' || $1 || '%'
         OR descripcion LIKE '%' || $1 || '%'
      ORDER BY id_proyecto`,
    [REPL],
  );

  console.log(`Filas con mojibake detectadas: ${scan.rows.length}`);
  for (const r of scan.rows) {
    console.log(`  #${r.id_proyecto}: ${JSON.stringify(r.nombre)}`);
  }
  console.log('');

  const detectedIds = new Set(scan.rows.map((r) => r.id_proyecto));
  const knownIds = new Set(FIXES.map((f) => f.id));
  const unhandled = [...detectedIds].filter((id) => !knownIds.has(id));
  if (unhandled.length) {
    console.warn(`⚠️  Filas con mojibake SIN corrección definida: ${unhandled.join(', ')}`);
  }

  if (DRY) {
    await client.end();
    return;
  }

  // 2) Reparación de las filas conocidas.
  for (const fix of FIXES) {
    const res = await client.query(
      `UPDATE proyectos SET nombre = $1, descripcion = $2 WHERE id_proyecto = $3`,
      [fix.nombre, fix.descripcion, fix.id],
    );
    console.log(`UPDATE #${fix.id} -> ${res.rowCount} fila(s)`);
  }

  // 3) Verificación.
  const verify = await client.query(
    `SELECT id_proyecto, nombre, descripcion FROM proyectos WHERE id_proyecto = ANY($1) ORDER BY id_proyecto`,
    [FIXES.map((f) => f.id)],
  );
  console.log('\nVerificación post-fix:');
  for (const r of verify.rows) {
    const clean = !r.nombre.includes(REPL) && !r.descripcion.includes(REPL);
    console.log(`  #${r.id_proyecto} ${clean ? '✅' : '❌'}: ${JSON.stringify(r.nombre)}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
