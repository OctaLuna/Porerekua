/**
 * Repara el mojibake (U+FFFD "�") en el dump local database/snapshots/supabase-full.sql
 * para que futuros `docker compose up` nazcan con datos UTF-8 correctos.
 *
 * Cada carácter no-ASCII original fue reemplazado por un único U+FFFD, así que la
 * cadena corrupta se deriva de la corregida: corrupted = corrected.replace(/[^\x00-\x7F]/g, "�").
 * Se aplica de la más larga a la más corta para evitar colisiones de subcadenas.
 *
 * Uso: node scripts/fix-dump.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const DUMP = path.join(__dirname, '..', 'database', 'snapshots', 'supabase-full.sql');
const DRY = process.argv.includes('--dry');
const FFFD = '�';

// Valores corregidos (mismos que se aplicaron a Supabase).
const CORRECTED = [
  // proyectos (nombre + descripcion)
  'Certificación de sostenibilidad en producción de soya RTRS',
  'Programa de certificación Round Table on Responsible Soy (RTRS) para 15,000 ha en el oriente boliviano, con trazabilidad completa de la cadena productiva.',
  'Ganadería silvopastoril en el Beni con conservación forestal',
  'Implementación de sistemas silvopastoriles que combinan ganadería sostenible y conservación forestal en 8,000 ha del departamento del Beni.',
  'Conservación de 1.2 millones de hectáreas del bosque seco más grande del mundo, conectando el Bosque Chiquitano con el Pantanal. Incluye monitoreo de fauna silvestre y trabajo con comunidades.',
  'Operación de turismo sostenible con guías locales indígenas, conservación del hábitat y distribución equitativa de beneficios con comunidades del área del Parque Nacional Madidi.',
  'Monitoreo de fauna silvestre en la Amazonía boliviana',
  'Red de cámaras trampa y monitoreo satelital de jaguares, tapires y caimanes en la Amazonía boliviana. Análisis de corredores de biodiversidad y publicación de datos abiertos.',
  'Certificación orgánica para 500 familias productoras amazónicas',
  'Proceso de certificación orgánica de café, cacao y frutas tropicales para 500 familias de productores en el trópico boliviano, con acceso a mercados internacionales justos.',
  'Programa de conservación de tortugas acuáticas en el Chiquitano',
  'Monitoreo y conservación de poblaciones de tortugas acuáticas y otros reptiles en los ríos y lagunas del bosque chiquitano y Pantanal boliviano, con participación comunitaria.',
  'Plataforma de datos Kaa Iya para la sostenibilidad amazónica',
  'Sistema de información geoespacial para visibilizar y sistematizar iniciativas sostenibles vinculadas a la Amazonía boliviana, desarrollado por la Universidad Católica Boliviana San Pablo.',
  'Proyecto de prueba para verificar degradación elegante cuando GeoRef está caído.',
  // empresas
  'Fundación para la Conservación del Bosque Chiquitano',
  'Test Degradación Elegante Corp S.A.',
  // organizaciones
  'AOPEB - Asociación de Organizaciones de Productores Ecológicos de Bolivia',
  'FAN - Fundación Amigos de la Naturaleza',
  'Cátedra Amazónica UCB – Querida Amazonía',
  // catálogos
  'Fundación',
  'Institución académica',
];

const toCorrupted = (s) => s.replace(/[^\x00-\x7F]/g, FFFD);

let content = fs.readFileSync(DUMP, 'utf8');
const before = (content.match(/�/g) || []).length;
console.log(`Ocurrencias de U+FFFD en el dump ANTES: ${before}`);

// Ordenar por longitud de la versión corrupta, descendente.
const pairs = CORRECTED.map((corrected) => ({ corrected, corrupted: toCorrupted(corrected) }))
  .filter((p) => p.corrupted.includes(FFFD))
  .sort((a, b) => b.corrupted.length - a.corrupted.length);

let totalReplacements = 0;
for (const { corrupted, corrected } of pairs) {
  const count = content.split(corrupted).length - 1;
  if (count > 0) {
    content = content.split(corrupted).join(corrected);
    totalReplacements += count;
    console.log(`  ${count}x  «${corrected.slice(0, 48)}${corrected.length > 48 ? '…' : ''}»`);
  }
}

const after = (content.match(/�/g) || []).length;
console.log(`\nReemplazos: ${totalReplacements}`);
console.log(`Ocurrencias de U+FFFD DESPUÉS: ${after}`);

if (after > 0) {
  // Reportar contexto de lo que queda sin mapear.
  const lines = content.split('\n');
  lines.forEach((ln, i) => {
    if (ln.includes(FFFD)) console.log(`  ⚠️ línea ${i + 1}: ${ln.slice(0, 120)}`);
  });
}

if (DRY) {
  console.log('\n(DRY: no se escribió el archivo)');
} else {
  fs.writeFileSync(DUMP, content, 'utf8');
  console.log('\n✅ Dump actualizado.');
}
