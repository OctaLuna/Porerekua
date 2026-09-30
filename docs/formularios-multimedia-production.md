# Operación de multimedia en formularios

Esta guía acompaña la entrega de carga opcional de material multimedia en los
formularios de Empresa y Organización. El backend recibe multipart/form-data,
persiste los bytes en PostgreSQL y no publica ningún archivo automáticamente.

## Alcance y garantías

- Máximo agregado por formulario: **500 MiB** (524288000 bytes).
- Máximo de 20 archivos por envío; no se restringe el tipo de archivo.
- Cada archivo se almacena por fragmentos de 1 MiB en BYTEA, con SHA-256,
  nombre y tipo MIME saneados.
- El material comienza en estado pendiente y se adjunta en la misma transacción
  que el formulario. No se generan rutas, archivos temporales ni URLs públicas.
- La autorización de posible publicación se registra, pero no vuelve público
  el archivo: requiere una futura interfaz de revisión.

## Migración de producción

Migración: api-rest-amazonia/database/migrations/20260929-1200_add_formularios_multimedia.sql.
Es aditiva, idempotente y contiene su propia transacción. Ejecútala únicamente
con un rol de Supabase autorizado y usando una conexión TLS.

1. Establecer DATABASE_URL en una terminal segura; no copiarla a archivos,
   tickets ni registros de CI.
2. Generar un respaldo completo antes de cambiar el esquema:

   ~~~bash
   pg_dump --format=custom --no-owner "$DATABASE_URL" \
     --file "pre-multimedia-$(date +%Y%m%d-%H%M).dump"
   ~~~

3. Confirmar que las tablas de los propietarios existen:

   ~~~bash
   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c \
     "SELECT to_regclass('public.empresas'), to_regclass('public.organizaciones');"
   ~~~

4. Aplicar exactamente la migración versionada:

   ~~~bash
   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 \
     -f api-rest-amazonia/database/migrations/20260929-1200_add_formularios_multimedia.sql
   ~~~

5. Verificar tablas, restricciones y acceso antes de desplegar la aplicación:

   ~~~bash
   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c \
     "SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      AND tablename IN ('formularios_multimedia', 'formularios_multimedia_fragmentos')
      ORDER BY tablename;"
   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c \
     "SELECT conname FROM pg_constraint
      WHERE conrelid = 'public.formularios_multimedia'::regclass
      ORDER BY conname;"
   ~~~

Guarda el respaldo en el mecanismo aprobado por el equipo y conserva la hora,
la persona operadora y la revisión Git desplegada.

## Despliegue y smoke test

1. Publicar la revisión que incluye frontend, backend, Nginx y esta migración
   en la rama conectada al servicio.
2. Esperar una compilación exitosa en Render y comprobar:

   ~~~bash
   curl --fail --silent --show-error https://api-rest-amazonia.onrender.com/api/health
   curl --fail --silent --show-error https://api-rest-amazonia.onrender.com/api/health/ready
   ~~~

3. Desde una cuenta de prueba autorizada, enviar un formulario mínimo con un
   archivo pequeño no sensible y confirmar en PostgreSQL:

   ~~~sql
   SELECT nombre_original, tipo_mime, tamano_bytes, checksum_sha256, estado
   FROM formularios_multimedia
   ORDER BY created_at DESC
   LIMIT 1;
   ~~~

4. Comprobar que una selección de más de 500 MiB se rechaza antes de enviar y
   que los formularios sin multimedia continúan usando JSON.

No usar nombres, documentos ni material real de terceros durante el smoke test.

## Operación y rollback

- Consultar cargas interrumpidas: SELECT count(*) FROM formularios_multimedia
  WHERE estado = 'pendiente';. Investigar antes de eliminar cualquier fila.
- Ante una incidencia de aplicación, volver al despliegue anterior de Render.
  La versión previa ignora estas tablas, por lo que mantenerlas es compatible
  y evita pérdida de datos.
- Ejecutar el bloque DOWN solo tras una aprobación explícita, después de
  respaldar y confirmar que no hay contenido que conservar. Elimina material
  multimedia de forma irreversible.
