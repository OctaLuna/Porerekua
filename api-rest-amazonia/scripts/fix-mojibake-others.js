/**
 * Repara mojibake (U+FFFD "�") en tablas de catálogo/actores fuera de `proyectos`:
 * empresas, organizaciones, formas_juridicas, tipos_organizaciones.
 * Se identifica por id cuando existe; si no, por patrón único del nombre corrupto.
 */
require('dotenv').config();
const { Client } = require('pg');
const R = String.fromCharCode(65533); // "�"
const DRY = process.argv.includes('--dry');

// { sql, params } — cada UPDATE apunta a una fila corrupta concreta.
const UPDATES = [
  {
    label: 'empresas#14',
    sql: `UPDATE empresas SET nombre=$1 WHERE id_empresa=14`,
    params: ['Fundación para la Conservación del Bosque Chiquitano'],
  },
  {
    label: 'empresas#16',
    sql: `UPDATE empresas SET nombre=$1 WHERE id_empresa=16`,
    params: ['Test Degradación Elegante Corp S.A.'],
  },
  {
    label: 'organizaciones#13',
    sql: `UPDATE organizaciones SET nombre=$1 WHERE id_organizacion=13`,
    params: ['AOPEB - Asociación de Organizaciones de Productores Ecológicos de Bolivia'],
  },
  {
    label: 'organizaciones#14',
    sql: `UPDATE organizaciones SET nombre=$1 WHERE id_organizacion=14`,
    params: ['FAN - Fundación Amigos de la Naturaleza'],
  },
  {
    label: 'organizaciones#15',
    sql: `UPDATE organizaciones SET nombre=$1 WHERE id_organizacion=15`,
    params: ['Cátedra Amazónica UCB – Querida Amazonía'],
  },
  {
    label: 'formas_juridicas(Fundación)',
    sql: `UPDATE formas_juridicas SET nombre=$1 WHERE nombre LIKE 'Fundaci' || chr(65533) || 'n'`,
    params: ['Fundación'],
  },
  {
    label: 'tipos_organizaciones(Institución académica)',
    sql: `UPDATE tipos_organizaciones SET nombre=$1 WHERE nombre LIKE 'Instituci' || chr(65533) || 'n acad' || chr(65533) || 'mica'`,
    params: ['Institución académica'],
  },
];

const host = process.env.DB_HOST || '';
(async () => {
  const c = new Client({
    host,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: /supabase/i.test(host) ? { rejectUnauthorized: false } : false,
    client_encoding: 'UTF8',
  });
  await c.connect();
  console.log(`Conectado a ${host} — modo ${DRY ? 'DRY' : 'REPARAR'}\n`);
  if (!DRY) {
    for (const u of UPDATES) {
      const res = await c.query(u.sql, u.params);
      console.log(`${u.label} -> ${res.rowCount} fila(s)`);
    }
  }
  // Verificación global.
  const cols = await c.query(
    `select table_name, column_name from information_schema.columns
      where table_schema='public' and data_type in ('text','character varying')`,
  );
  let total = 0;
  const hits = [];
  for (const { table_name, column_name } of cols.rows) {
    try {
      const q = await c.query(
        `select count(*)::int n from "${table_name}" where "${column_name}" like $1`,
        ['%' + R + '%'],
      );
      if (q.rows[0].n > 0) {
        hits.push(`${table_name}.${column_name} = ${q.rows[0].n}`);
        total += q.rows[0].n;
      }
    } catch {}
  }
  console.log('\nMojibake restante en toda la BD:');
  if (hits.length === 0) console.log('  (ninguna) ✅');
  else hits.forEach((h) => console.log('  ' + h));
  console.log('Total:', total);
  await c.end();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
