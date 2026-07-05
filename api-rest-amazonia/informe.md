# TÉRMINOS DE REFERENCIA: IMPLEMENTACIÓN Y DESPLIEGUE DE LA PLATAFORMA WEB KAA IYA

## ANTECEDENTES Y JUSTIFICACIÓN

La plataforma digital Kaa Iya (“Espíritu del Bosque”) se desarrolla en el marco de la Cátedra Nazaria Ignacia “Querida Amazonía” de la Universidad Católica Boliviana “San Pablo”, como una iniciativa orientada a visibilizar, articular y fortalecer iniciativas sostenibles vinculadas a la Amazonía boliviana. Este proyecto surge en respuesta a una necesidad estructural: la ausencia de un sistema integrado que permita organizar, analizar y poner en valor la información generada por empresas, fundaciones y otros actores comprometidos con la sostenibilidad.

La plataforma trasciende una función comunicacional y se concibe como una infraestructura de información capaz de contribuir progresivamente a la toma de decisiones empresariales y, en etapas posteriores, al diseño de políticas públicas basadas en evidencia. En una primera fase, el enfoque está centrado en empresas y fundaciones como actores motores del sistema; posteriormente se prevé la incorporación de la sociedad civil y, en una etapa más avanzada, del Estado como actor articulador y usuario estratégico de la información generada.

El proyecto responde a un cambio conceptual importante en el campo de la sostenibilidad: en los últimos años, las empresas se han constituido progresivamente en actores centrales en la promoción e implementación de iniciativas sostenibles, pasando de enfoques tradicionales de carácter filantrópico hacia una participación más estratégica y comprometida. En este marco, se transita también de una lógica asistencialista hacia un enfoque de desarrollo comunitario basado en la autonomía, la capacidad de decisión y el reconocimiento de las comunidades como actores con agencia.

## OBJETIVO DE LOS TÉRMINOS DE REFERENCIA

El presente documento tiene como objetivo definir los requerimientos técnicos, funcionales y de infraestructura necesarios para el despliegue de la plataforma Kaa Iya en los servidores institucionales de la Universidad Católica Boliviana “San Pablo”. Se busca proporcionar al Ing. Orlando Rivera Jurado una comprensión clara del sistema, tanto en su estado actual como en su proyección futura, de modo que se puedan tomar decisiones informadas respecto a la viabilidad técnica, la capacidad del servidor y las condiciones necesarias para su implementación.

## NATURALEZA Y ALCANCE DEL SISTEMA

La plataforma Kaa Iya debe entenderse como un sistema digital de carácter escalable, modular y multiactor. Se configura como una infraestructura tecnológica orientada a la gestión de datos, la interacción entre actores y la generación de conocimiento, superando el alcance de una página web estática o meramente informativa.

En su fase inicial, el sistema permitirá el registro y visualización de iniciativas sostenibles impulsadas principalmente por empresas y fundaciones. Se proyecta la participación de más de 200 actores en esta primera etapa, quienes incorporarán información relacionada con sus proyectos, incluyendo datos descriptivos, contenido multimedia y, progresivamente, documentación técnica.

El alcance funcional del sistema comprende los siguientes componentes:

* **Registro y gestión de actores:** incorporación de empresas y fundaciones mediante perfiles institucionales que incluirán información general, descripción de iniciativas y datos asociados a sus proyectos.
* **Gestión de contenido de proyectos:** carga y administración de información vinculada a iniciativas sostenibles, incluyendo descripción estructurada de proyectos, fotografías, videos (con posibilidad de integración mediante enlaces externos como YouTube). En fases posteriores, documentos de investigación y reportes técnicos.
* **Gestión de datos estructurados:** organización de la información en bases de datos que permitan su sistematización, consulta y análisis, considerando la necesidad de escalabilidad ante el incremento de actores y variables.
* **Georreferenciación de iniciativas:** registro de la ubicación de los proyectos, permitiendo su visualización territorial y facilitando el análisis espacial de las intervenciones.
* **Generación de reportes e información analítica:** desarrollo de herramientas que permitan evaluar avances, identificar tendencias y generar insumos para la toma de decisiones estratégicas.

Adicionalmente, el sistema ha sido concebido desde su diseño inicial para evolucionar progresivamente hacia un ecosistema más complejo, en el cual se integren nuevos actores, se amplíe el volumen y la diversidad de datos disponibles, y se incorporen funcionalidades avanzadas de análisis.

## RESUMEN EJECUTIVO DEL PROYECTO

Kaa Iya es una plataforma web geoespacial creada para registrar, organizar y visualizar iniciativas sostenibles vinculadas a la Amazonía boliviana. Su propósito es centralizar la información de empresas, fundaciones y organizaciones, facilitar el análisis territorial de sus proyectos y ofrecer una base técnica para la toma de decisiones basada en datos.

La solución se divide en tres capas: un backend API REST que administra usuarios, catálogos, proyectos, seguridad y reportes; un microservicio de georreferenciación que transforma coordenadas GPS en ubicación administrativa; y un frontend SPA que consume la API, muestra mapas interactivos y presenta la información de forma clara para el usuario final. El sistema se completa con PostgreSQL como base de datos, Nginx como servidor web y PM2 para la gestión de procesos en producción.

### Herramientas utilizadas por capa

**Backend (API REST / NestJS)**

NestJS 11, TypeScript, Node.js, TypeORM, PostgreSQL, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `helmet`, `@nestjs/throttler`, `class-validator`, `class-transformer`, `joi`, `@nestjs/config`, `@nestjs/swagger`, `rxjs`, `date-fns`, `reflect-metadata`, `Jest`, `supertest`, `SWC`, `ts-node`, `ESLint` y `Prettier`.

**Microservicio de georreferenciación (GeoRef)**

FastAPI, Starlette, Gunicorn, Uvicorn, GeoPandas, Shapely, Pydantic Settings, Python 3.11+, datos geoespaciales GADM 4.1 de Bolivia y archivo GeoJSON cargado en memoria para resolver coordenadas de manera eficiente.

**Frontend (interfaz web)**

React 19, React DOM, TypeScript, Vite, React Router DOM, TanStack Query, Context API, Framer Motion, Axios, Zod, React Hook Form, `@hookform/resolvers`, DOMPurify, js-cookie, jsonwebtoken, jose, bcryptjs, crypto-js, Sentry, Vitest, Testing Library, MSW, ESLint, `eslint-plugin-security`, Husky, lint-staged, Commitlint, Snyk, Rollup Visualizer y MapLibre GL para la visualización geográfica.

## ARQUITECTURA TECNOLÓGICA DEL SISTEMA

La plataforma está construida sobre un stack moderno orientado a la escalabilidad y mantenibilidad, dividido en dos capas principales: backend (API REST) y frontend (interfaz de usuario), con una base de datos relacional PostgreSQL.

### 4.1 Backend — Amazonia API

Construido sobre NestJS v11.0.1, framework progresivo para Node.js con arquitectura modular basada en inyección de dependencias.

#### Framework y lenguaje

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| NestJS Core / Common / Platform-Express | 11.0.1 | Motor principal, decoradores, adaptador HTTP |
| TypeScript | 5.7.3 | Lenguaje principal |
| Node.js | 18.x – 22.x | Runtime requerido en servidor |

#### Autenticación y seguridad

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| @nestjs/jwt | 11.0.1 | Generación y validación de tokens JWT |
| @nestjs/passport + passport | 11.0.5 / 0.7.0 | Estrategias de autenticación |
| passport-jwt | 4.0.1 | Validación de tokens Bearer |
| bcrypt | 6.0.0 | Hash seguro de contraseñas |
| helmet | latest | HTTP security headers (XSS, clickjacking, CSP) |
| @nestjs/throttler | latest | Rate limiting por IP y por ruta |

#### Base de datos y ORM

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| TypeORM | 0.3.27 | ORM: queries, migrations, relaciones |
| @nestjs/typeorm | 11.0.0 | Integración TypeORM con NestJS |
| pg | 8.16.3 | Driver nativo PostgreSQL |

#### Validación y configuración

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| class-validator | 0.14.2 | Validación de clases con decoradores |
| class-transformer | 0.5.1 | Transformación de objetos |
| joi | 18.0.1 | Validación de esquemas y variables de entorno |
| @nestjs/config | 4.0.2 | Gestión de variables de entorno |

#### Documentación y utilidades

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| @nestjs/swagger | 11.2.1 | Documentación automática OpenAPI / Swagger UI |
| date-fns | 4.1.0 | Manipulación de fechas |
| rxjs | 7.8.1 | Programación reactiva, observables |
| reflect-metadata | 0.2.2 | Metadatos en runtime para decoradores |

#### Herramientas de desarrollo

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| @nestjs/cli | 11.0.0 | Generación de módulos, build, desarrollo |
| SWC Core | 1.10.7 | Compilador rápido (Rust), alternativa a Babel |
| TypeScript Compiler | 5.7.3 | Compilación y type checking |
| ts-node | 10.9.2 | Ejecución directa de archivos .ts |
| Jest | 29.7.0 | Framework de testing |
| supertest | 7.0.0 | Testing de endpoints HTTP |
| ESLint | 9.18.0 | Linter estático |
| Prettier | 3.4.2 | Formateador de código |

### 4.2 Frontend — Interfaz de Usuario

Construido sobre React 19.1.1 y TypeScript 5.8.2, con Vite 6.2.0 como herramienta de build.

#### Framework y lenguaje

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| React + React DOM | 19.1.1 | Framework principal de UI |
| TypeScript | 5.8.2 | Tipado estático |
| Vite | 6.2.0 | Build tool y servidor de desarrollo |

#### Routing, estado y animaciones

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| React Router DOM | 7.9.3 | Routing del lado del cliente (SPA) |
| @tanstack/react-query | 5.90.2 | Estado del servidor, caché de datos |
| Context API | (built-in React) | Estado global de la aplicación |
| Framer Motion | 12.23.22 | Animaciones y transiciones |

#### Mapas y georreferenciación

| Herramienta | Función |
| :--- | :--- |
| Microservicio Autoalojado de georeferencia | Mapas vectoriales interactivos, renderizado por GPU |

#### Seguridad y formularios

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| axios | 1.7.7 | Cliente HTTP con interceptors para tokens |
| zod | 3.23.8 | Validación de esquemas tipada |
| react-hook-form | 7.52.1 | Gestión de formularios |
| @hookform/resolvers | 3.4.2 | Integración react-hook-form + zod |
| dompurify | 3.1.5 | Sanitización de HTML dinámico |
| js-cookie | 3.0.5 | Manejo de cookies |
| jsonwebtoken | 9.1.2 | Manejo de tokens JWT en cliente |
| jose | 5.4.1 | Decodificación y verificación de JWT |
| bcryptjs | 2.4.3 | Hash de contraseñas en cliente |
| crypto-js | 4.2.0 | Utilidades de cifrado |

#### Monitoring y logging

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| @sentry/react | 8.18.0 | Error tracking en producción |
| @sentry/tracing | 8.18.0 | Tracing de performance en cliente |

#### Herramientas de desarrollo

| Herramienta | Versión | Función |
| :--- | :--- | :--- |
| vitest + @vitest/coverage-v8 | 2.1.3 | Testing nativo de Vite con cobertura |
| @testing-library/react | 16.0.1 | Testing de componentes |
| msw | 2.4.5 | Mock de API para tests |
| ESLint + eslint-plugin-security | 9.10.0 / 3.0.1 | Linter con detección de patrones inseguros |
| husky + lint-staged | 9.1.6 / 15.2.11 | Git hooks automáticos |
| commitlint | 19.5.0 | Validación de mensajes de commit |
| snyk | 1.1302.3 | Auditoría de vulnerabilidades en dependencias |
| rollup-plugin-visualizer | 4.2.2 | Análisis del bundle size |

### 4.3 Base de Datos

PostgreSQL como sistema gestor de base de datos relacional, accedido desde el backend mediante TypeORM. Centraliza toda la información de actores, proyectos, iniciativas y datos georreferenciados. Se requiere PostgreSQL 14 o superior para plena compatibilidad con TypeORM y las funcionalidades geoespaciales del sistema.

### 4.4 Arquitectura de Despliegue

El sistema se compone de tres procesos que deben ejecutarse de forma persistente:

* **Backend (API REST):** proceso NestJS compilado, gestionado mediante PM2 para reinicio automático.
* **Frontend (SPA):** archivos estáticos compilados (HTML, CSS, JS) servidos por Nginx. No requiere proceso Node.js activo en producción.
* **Base de datos:** instancia PostgreSQL como servicio del sistema operativo.
* **Nginx:** proxy inverso, sirve los archivos estáticos del frontend y redirige el tráfico al backend. Gestiona también la terminación SSL/TLS.

## SEGURIDAD DEL SISTEMA

La plataforma implementa seguridad en múltiples capas, alineada con el OWASP Top 10:2025 e ISO/IEC 27001:2022.

### 5.1 Medidas implementadas

#### Control de acceso y autenticación (OWASP A01, A07)
* Autenticación basada en JWT con tokens Bearer validados en cada endpoint.
* Guards de NestJS para protección de rutas por rol.
* Hash seguro de contraseñas con bcrypt (salting automático).
* Rate limiting por IP mediante @nestjs/throttler para prevenir fuerza bruta.

#### Configuración segura (OWASP A02)
* helmet en el backend para establecer headers HTTP de seguridad: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.
* Variables de entorno gestionadas mediante @nestjs/config y validación Joi. Sin credenciales en código fuente.
* CORS configurado con lista blanca de orígenes permitidos.
* HTTPS obligatorio con terminación SSL/TLS en Nginx.

#### Cadena de suministro de software (OWASP A03)
* Auditoría de dependencias con npm audit en backend y snyk en frontend.
* Integración recomendada en pipeline CI/CD para auditoría automática en cada despliegue.

#### Inyección y validación de datos (OWASP A05)
* class-validator y joi en backend previenen entrada de datos malformados.
* dompurify en frontend sanitiza cualquier HTML renderizado dinámicamente.
* Consultas a base de datos únicamente mediante TypeORM (queries parametrizadas, sin SQL manual).

#### Manejo de errores (OWASP A10)
* Global Exception Filter en NestJS: captura todas las excepciones no controladas y devuelve respuestas normalizadas sin exponer stack traces al cliente.

#### Logging y alertas (OWASP A09)
* @sentry/react en frontend captura errores en producción con stack traces completos.
* Se recomienda incorporar winston o pino en el backend para logging estructurado persistente con niveles (error, warn, info).

### 5.2 Controles ISO/IEC 27001:2022 aplicados

| Control | Descripción | Implementación |
| :--- | :--- | :--- |
| 8.26 | Seguridad de aplicaciones | Validación, sanitización, autenticación JWT, headers de seguridad |
| 8.8 | Gestión de vulnerabilidades | npm audit, snyk, actualizaciones periódicas de dependencias |
| 8.24 | Uso de criptografía | bcrypt para contraseñas, HTTPS para datos en tránsito |
| 8.15 | Logging | Sentry en frontend, logging estructurado en backend |
| 8.28 | Codificación segura | ESLint con eslint-plugin-security, class-validator, dompurify |

### 5.3 Medidas de infraestructura (nivel servidor)

* HTTPS obligatorio con certificado SSL/TLS (Let's Encrypt recomendado).
* Headers de seguridad configurados en Nginx: HSTS, X-Content-Type-Options, X-Frame-Options, Permissions-Policy.
* Respaldos periódicos de la base de datos PostgreSQL (frecuencia diaria o semanal recomendada).
* PM2 para reinicio automático del proceso backend ante fallos inesperados.
* Fail2Ban recomendado para bloqueo automático de IPs con comportamiento abusivo.

## INFRAESTRUCTURA Y CAPACIDAD REQUERIDA

### 6.1 Requisitos de servidor

| Componente | Mínimo requerido | Recomendado |
| :--- | :--- | :--- |
| Sistema Operativo | Linux (Ubuntu 20.04+ / Debian 11+) | Ubuntu 22.04 LTS |
| Procesador | 4 núcleos x86_64 | 8+ núcleos |
| Memoria RAM | 3.0 GB (Suma de componentes) | 8.0 GB (Optimización Page Cache) |
| Almacenamiento | 100 GB SSD | Escalable |
| Node.js | 18.x | 20.x LTS o 22.x |
| PostgreSQL | 14.x | 16.x |
| Nginx | 1.18+ | 1.24+ |

(\*) **Nota sobre consumo de RAM:** el consumo ha sido medido considerando todos los componentes del sistema, incluido el microservicio de georreferenciación. En la fase inicial con ~200 actores, el consumo consolidado es de 2.5–2.7 GB en condiciones de carga leve (6-12 usuarios) y 6.0–8.0 GB recomendado para carga moderada (40-60 usuarios). El microservicio GeoRef consume 1.2 GB en mínimo y 2.0 GB en recomendado, manejando 120 MB de datos GeoJSON compartidos mediante la bandera ––preload en Gunicorn para evitar consumo redundante entre procesos. Estos valores han sido derivados de datos reales de operación del microservicio con FastAPI + Gunicorn y son esenciales para la estabilidad del sistema ante la carga de datos geoespaciales.

#### 6.1.1 Resumen de Consumo de RAM Detallado (Cálculo Global)

La siguiente tabla desglosa el impacto técnico de cada componente en el consumo total de memoria, justificando el dimensionamiento ante la Dirección de Sistemas:

| Componente | RAM Base (Mínimo) | RAM Recomendada | Fuente / Justificación |
| :--- | :--- | :--- | :--- |
| Backend (NestJS/Node.js) | 400 MB | 512 MB | Estimación Nota Técnica |
| Base de Datos (PostgreSQL) | 512 MB | 2.0 GB | Manejo de 200 actores e índices |
| Microservicio GeoRef | 1.2 GB | 2.0 GB | Datos reales (FastAPI + Gunicorn) |
| Nginx (Proxy + Tile Server) | 50 MB | 500 MB | Cache de teselas (PMTiles) |
| SO + PM2 + Overhead | 300 MB | 500 MB | Gestión de procesos y sistema |
| **TOTAL CONSOLIDADO** | **~2.5–2.7 GB** | **~6.0–8.0 GB** | **Cálculo acumulado final** |

#### 6.1.2 Escenarios de Carga y Rendimiento (Cálculos de Georreferenciación)

Los siguientes datos de rendimiento han sido medidos en operación real del microservicio de georreferenciación, determinando la capacidad de respuesta del servidor bajo diferentes escenarios de carga:

| Métrica de Rendimiento | Escenario LEVE (6-12 usuarios) | Escenario MODERADO (40-60 usuarios) |
| :--- | :--- | :--- |
| RPS Totales (API + Tiles) | 28 – 50 req/s | 170 – 230 req/s |
| Ancho de banda saliente | 5 – 9 Mbps | 28 – 48 Mbps |
| Latencia PiP (Geocodificación) | < 10 ms | 10 – 25 ms |
| Carga de capa Bolivia (RAM) | 120 MB (compartida) | 120 MB (compartida) |

Estos datos demuestran que la configuration recomendada (8 núcleos, 8 GB RAM) proporciona suficiente capacidad para mantener tiempos de respuesta aceptables incluso bajo carga moderada, mientras que la configuración mínima puede mantener el sistema operativo en escenarios de baja concurrencia. El almacenamiento del archivo bolivia.pmtiles (237.6 MB) es insignificante dentro de los 100 GB asignados, pero requiere SSD para garantizar latencias menores a 2 ms en la entrega de teselas.

### 6.2 Requisitos de red y acceso

* IP pública fija para acceso externo a la plataforma.
* Posibilidad de múltiples IPs para segmentación de servicios o escalamiento futuro.
* Acceso SSH con permisos para instalar dependencias, configurar servicios y gestionar procesos.
* Puertos abiertos: 80 (HTTP), 443 (HTTPS), y un puerto adicional para la API (ej. 3000).
* Certificado SSL/TLS para comunicaciones cifradas.
* Posibilidad de configurar subdominios (ej. api.kaaiya.ucb.edu.bo para el backend, app.kaaiya.ucb.edu.bo para el frontend).

### 6.3 Herramientas de infraestructura

| Herramienta | Función | Prioridad |
| :--- | :--- | :--- |
| Nginx | Proxy inverso, archivos estáticos, terminación SSL | Indispensable |
| PM2 | Gestor de procesos Node.js: reinicio automático, logs, monitoreo | Recomendado |
| Certbot / Let's Encrypt | Generación y renovación automática de certificado SSL | Recomendado |
| Docker (opcional) | Contenedorización para aislamiento y portabilidad | Opcional |
| Fail2Ban | Bloqueo automático de IPs abusivas | Recomendado |

### 6.4 Gestión de contenido multimedia

* **Videos:** integración mediante enlaces externos (YouTube) para evitar almacenamiento local y consumo de ancho de banda para streaming.
* **Imágenes:** almacenamiento local con compresión optimizada y límites de tamaño por archivo.
* **Datos geoespaciales:** servidos desde PostgreSQL mediante TypeORM. El renderizado del mapa ocurre en el cliente (MapLibre GL), minimizando la carga del servidor.

#### 6.4.1 Consideraciones Técnicas Críticas

##### Optimización de Memoria:
La implementación del microservicio GeoRef requiere especial atención al manejo de memoria compartida. El uso de la bandera `--preload` en Gunicorn es fundamental. Esta bandera permite que los 120 MB de datos GeoJSON (archivo bolivia.geojson) sean cargados una única vez en memoria durante el inicio del proceso y compartidos por todos los workers de Gunicorn, evitando consumo redundante que podría bloquear la máquina virtual en configuraciones con RAM limitada. Sin esta optimización, cada worker cargaría independientemente los datos, multiplicando el consumo de memoria de forma insostenible. Se recomienda validar que esta configuración esté activa en todas las instancias de producción mediante verificación de los flags de inicio del servicio GeoRef.

##### Gestión de Disco y Teselas:
El archivo bolivia.pmtiles (formato PMTiles que contiene las teselas vectoriales de Bolivia) ocupa 237.6 MB, lo que representa solo el 0.24% del almacenamiento asignado de 100 GB. Aunque el tamaño es insignificante, el ACCESO A LAS TESELAS DEBE UTILIZAR ALMACENAMIENTO SSD (NO rotacional) para garantizar que las latencias de lectura se mantengan por debajo de 2 milisegundos. Discos HDD tradicionales causarían latencias de 10-20 ms o superiores, degradando significativamente la experiencia del usuario al interactuar con el mapa. El almacenamiento NVMe es altamente recomendado para este componente crítico.

## BASE DE DATOS: PROYECCIÓN Y CRECIMIENTO

### 7.1 Fase inicial (Año 1)

Almacenamiento previsto para:
* ~200 empresas, fundaciones y organizaciones.
* Información estructurada de iniciativas y proyectos.
* Fotografías y enlaces a videos externos.
* Coordenadas y polígonos georreferenciados.
* Perfiles institucionales con datos de contacto.

### 7.2 Proyección de crecimiento

| Horizonte | Período | Descripción |
| :--- | :--- | :--- |
| Corto plazo | Año 1 | ~200 actores, datos básicos de proyectos, georreferenciación inicial |
| Mediano plazo | Años 2–3 | Expansión de actores, incorporación de sociedad civil, integración regional |
| Largo plazo | Años 4+ | Integración del Estado, análisis avanzado, ciencia de datos |

### 7.3 Criterios de diseño

* **Escalabilidad:** estructura que permita incorporar nuevos campos y tipos de información sin comprometer la integridad.
* **Actualización periódica:** frecuencia semestral para garantizar vigencia de los datos.
* **Integridad referencial:** constraints, índices y relaciones formales mediante TypeORM.
* **Migraciones controladas:** cambios de esquema versionados con TypeORM Migrations, sin pérdida de información.

## FUNCIONALIDADES DEL SISTEMA

* **Gestión de actores:** registro de empresas y fundaciones con perfiles institucionales, descripción de proyectos y contenido multimedia.
* **Gestión de contenidos:** carga de imágenes, documentos y enlace a videos externos.
* **Georreferenciación:** visualización territorial interactiva de iniciativas mediante MapLibre GL, con filtros por zona, tipo de actor y categoría.
* **Autenticación y roles:** sistema JWT con control de acceso por rol (administrador, actor registrado, usuario público).
* **API REST documentada:** documentación automática disponible en `/api/docs` mediante Swagger/OpenAPI.
* **Información analítica:** reportes de avance, datos de impacto agregados y visualizaciones comparativas.

## LÍMITES AND CONSIDERACIONES

No se contempla la inclusión de datos financieros sensibles ni información confidencial de las organizaciones participantes. El enfoque está en datos de impacto, resultados y trazabilidad general de las iniciativas. El sistema no reemplaza sistemas de gestión interna de las organizaciones, sino que actúa como agregador y visualizador de información de impacto.

## SEGURIDAD DEL SISTEMA — MEDIDAS COMPLEMENTARIAS

Las medidas de seguridad descritas en la sección 5 constituyen la base del sistema. A continuación se detallan disposiciones adicionales orientadas a reforzar la autenticación, la gestión de secretos, la auditoría y el endurecimiento de la infraestructura, en línea con estándares internacionales aplicables a proyectos académicos y de sostenibilidad.

### 10.1 Autenticación reforzada y control de acceso

Además de la autenticación basada en JWT descrita en la sección 5.1, se recomienda implementar autenticación de dos factores (2FA) para los perfiles con acceso a funciones administrativas y de gestión de contenido. Los perfiles diferenciados del sistema serían: administrador (acceso total a configuración, usuarios y auditoría), actor registrado (acceso exclusivo a datos propios y carga de contenido) y usuario público (acceso a métricas agregadas sin autenticación). Para administradores se recomienda el uso de llaves de hardware FIDO2/U2F, mientras que para actores registrados es suficiente el uso de aplicaciones TOTP como Google Authenticator o Microsoft Authenticator.

### 10.2 Cifrado en tránsito y en reposo

En tránsito, se establece TLS 1.3 como protocolo mínimo obligatorio, con certificados Let’s Encrypt gestionados mediante Certbot con renovación automática. Se recomienda activar HSTS con un tiempo de vida extendido e implementar Perfect Forward Secrecy en la configuración de Nginx. En reposo, los volúmenes de almacenamiento que contengan documentos y respaldos deben contar con cifrado a nivel de sistema de archivos (LUKS o equivalente). Las contraseñas ya se almacenan con bcrypt; para campos sensibles en base de datos se puede incorporar cifrado AES-256 a nivel de aplicación en etapas posteriores.

### 10.3 Gestión de secretos y credenciales

Las variables de entorno sensibles (credenciales de base de datos, claves JWT, tokens de servicios externos) no deben almacenarse en el código fuente ni en archivos versionados. Se recomienda una solución de gestión centralizada de secretos, como HashiCorp Vault u opciones equivalentes, que permita la rotación periódica de credenciales (cada 90 días para contraseñas y claves JWT, cada 180 días para API keys) y el registro de cada acceso. En etapas iniciales, el uso de variables de entorno gestionadas mediante `@nestjs/config` con validación Joi, combinado con procedimientos documentados de rotación, cumple este requisito de forma adecuada.

### 10.4 Auditoría y registro de eventos

El sistema debe mantener un registro estructurado de los eventos relevantes: accesos exitosos y fallidos, cambios en datos de actores y proyectos, modificaciones administrativas y exportaciones de información. Se recomienda implementar logging estructurado en el backend (winston o pino, ya mencionados en la sección 5.1) y configurar alertas automáticas ante patrones anómalos, como múltiples intentos de acceso fallidos desde una misma IP. Los registros de auditoría deben conservarse por un mínimo de dos años para permitir trazabilidad de las iniciativas documentadas en la plataforma.

### 10.5 Endurecimiento del servidor (hardening)

A nivel del sistema operativo, se recomienda restringir el acceso SSH únicamente mediante claves públicas (sin autenticación por contraseña), mantener activo el sistema de actualizaciones automáticas de seguridad, habilitar AppArmor o SELinux en modo de cumplimiento, y configurar UFW para denegar todo el tráfico entrante excepto los puertos estrictamente necesarios (22, 80 y 443). A nivel de base de datos, se recomienda habilitar Row-Level Security en PostgreSQL para garantizar que cada actor autenticado acceda únicamente a sus propios datos, crear un usuario de solo lectura para operaciones de generación de reportes, y exigir conexiones SSL/TLS para todas las conexiones a la instancia PostgreSQL.

### 10.6 Plan de respuesta ante incidentes

El proyecto debe definir un protocolo mínimo de respuesta ante incidentes que establezca: (1) canales de notificación inmediata para el equipo técnico responsable, (2) criterios de severidad que distingan entre incidentes críticos (sistema caído, pérdida de datos, acceso no autorizado confirmado) e incidentes menores, (3) procedimientos de contención y restauración con tiempos objetivo definidos, y (4) protocolo de comunicación a los actores registrados en caso de que el incidente afecte la disponibilidad del sistema o la integridad de la información. Este plan debe revisarse al menos una vez al año y antes de cada período de incorporación masiva de nuevos actores.

## MONITOREO Y OBSERVABILIDAD DEL SISTEMA

La operación sostenida de la plataforma Kaa Iya requiere un sistema de monitoreo que permita detectar degradaciones de rendimiento, errores y condiciones de fallo antes de que afecten la experiencia de los actores registrados. A continuación se describen los componentes recomendados para una observabilidad efectiva del sistema.

### 11.1 Métricas e indicadores operacionales

Se recomienda implementar recolección de métricas mediante Prometheus con visualización en Grafana, cubriendo los siguientes indicadores clave: uso de CPU y memoria del servidor, latencia de los endpoints de la API (percentiles p50, p95 y p99), tasa de errores por endpoint, uso de conexiones a la base de datos PostgreSQL, y espacio disponible en disco. Los umbrales de alerta sugeridos son: CPU por encima del 80%, memoria por encima del 85%, latencia p95 superior a 500 ms en endpoints de consulta, y espacio en disco por debajo del 10% disponible.

### 11.2 Logging estructurado y centralizado

El backend debe emitir logs estructurados con niveles diferenciados (error, warn, info, debug) que incluyan al menos el timestamp, el identificador del request, el endpoint invocado y el tiempo de respuesta. Para el frontend, Sentry (ya incluido en el stack) cubre el rastreo de errores en producción. Se recomienda centralizar los logs del backend, de Nginx y del sistema operativo en una solución de búsqueda y retención, con un período mínimo de conservación de 90 días en almacenamiento activo.

### 11.3 Disponibilidad y objetivos de servicio

El objetivo de disponibilidad recomendado para la plataforma es de 99,5% de uptime mensual, equivalente a un máximo de 3,6 horas de interrupción por mes. Este objetivo es alcanzable en un entorno de servidor único gestionado con PM2 y Nginx, siempre que se mantengan actualizaciones de seguridad periódicas y se realicen mantenimientos programados en horarios de baja demanda. La disponibilidad debe medirse mediante verificaciones automáticas de estado (health checks) ejecutadas al menos cada minuto.

### 11.4 Monitoreo de la base de datos

Se recomienda habilitar el registro de consultas lentas en PostgreSQL (slow query log para consultas con duración superior a 300 ms) y revisar periódicamente los planes de ejecución de las consultas más frecuentes. Los índices críticos descritos en la sección 6 deben verificarse luego de cada migración de esquema para asegurar que no han sido eliminados o invalidados. El tamaño de la base de datos y el número de conexiones activas deben incluirse en las métricas monitoreadas.

## RESPALDOS Y RECUPERACIÓN DEL SISTEMA

La estrategia de respaldos define los mecanismos para proteger la información de la plataforma Kaa Iya ante fallos de hardware, errores humanos o incidentes imprevistos, asegurando la continuidad operativa del sistema.

### 12.1 Objetivos de recuperación

Se establecen dos parámetros principales: el RPO (Recovery Point Objective) define la máxima pérdida de datos tolerable, establecida en 15 minutos para la base de datos mediante la combinación de snapshots periódicos y archivado de WAL (Write-Ahead Logs). El RTO (Recovery Time Objective) define el tiempo máximo aceptable para restaurar el sistema tras un fallo, establecido en 1 a 2 horas para escenarios de corrupción de base de datos o fallo de componentes individuales.

### 12.2 Nivel 1 — Respaldos locales (on-premises)

La base de datos PostgreSQL debe respaldarse mediante snapshots completos comprimidos cada 6 horas, almacenados en un volumen de disco independiente del servidor principal. Complementariamente, el archivado continuo de WAL cada 15 minutos permite recuperación a un punto exacto en el tiempo (PITR). Los documentos cargados por los actores (imágenes, material multimedia) deben incluirse en respaldos incrementales diarios. El período de retención recomendado para los respaldos locales es de 7 días. Para 200 actores en la fase inicial, el volumen estimado de respaldos locales (snapshots, WAL y documentos) es de aproximadamente 10 a 12 GB.

### 12.3 Nivel 2 — Respaldos externos opcionales

Como medida de protección adicional ante fallos catastróficos del hardware físico (incendio, daño severo del equipo), se recomienda implementar respaldos externos en almacenamiento en frío (por ejemplo, AWS S3 Glacier o equivalente). Los respaldos externos serían incrementales con frecuencia diaria y una retención de 12 meses. El costo estimado para la fase inicial de 200 actores es inferior a 3 USD por año, dado el reducido volumen de datos. Los respaldos deben cifrarse con GPG antes de su transferencia, conservando las claves privadas en la infraestructura de la Universidad.

### 12.4 Verificación de respaldos

Los respaldos solo tienen valor si han sido verificados. Se recomienda ejecutar una prueba de restauración completa al menos una vez por trimestre, preferiblemente en un servidor de prueba separado. Esta prueba debe validar la integridad de los datos restaurados mediante consultas de verificación sobre las tablas críticas del sistema, y su resultado debe documentarse. La verificación automática del checksum de cada snapshot (SHA-256) debe configurarse como parte del proceso de generación del respaldo.

## AMBIENTE DE STAGING Y VALIDACIÓN PREVIA

Antes de cada despliegue de nuevas versiones del sistema en el servidor de producción, se recomienda contar con un ambiente de staging que permita validar los cambios en condiciones equivalentes a las del entorno productivo.

### 13.1 Especificaciones del ambiente de staging

El ambiente de staging debe replicar la arquitectura de producción en sus componentes esenciales: backend NestJS, frontend React compilado, base de datos PostgreSQL con esquema idéntico, y el microservicio de georreferenciación. Puede funcionar en una máquina virtual o servidor físico de menor capacidad que producción, dado que no estará expuesto a carga real. Su acceso debe estar restringido a la red institucional de la Universidad Católica Boliviana.

### 13.2 Proceso de validación pre-despliegue

Cada nueva versión del sistema debe pasar por las siguientes etapas en staging antes de ser desplegada en producción:
1. Despliegue del build candidato con datos de prueba representativos.
2. Ejecución de la suite de tests automatizados (unitarios, de integración y end-to-end).
3. Verificación manual de los flujos principales del sistema por parte del equipo técnico.
4. Aprobación explícita del responsable técnico del proyecto antes del despliegue a producción.

En el caso de cambios de esquema de base de datos, la migración debe ejecutarse primero en staging y validarse antes de aplicarse en producción.

### 13.3 Plan de rollback

Ante la detección de un problema crítico posterior al despliegue en producción, el equipo técnico debe contar con un procedimiento documentado de reversión a la versión anterior. Este procedimiento incluye: revertir al build anterior del backend (mediante PM2 o Docker), restaurar el snapshot de base de datos previo a la migración si corresponde, y notificar a los actores afectados. El tiempo objetivo de ejecución de un rollback es inferior a 10 minutos para los componentes de aplicación.

## COSTOS Y ANÁLISIS ECONÓMICO DE LA INFRAESTRUCTURA

La plataforma Kaa Iya está diseñada para operar sobre la infraestructura institucional de la Universidad Católica Boliviana “San Pablo”, lo que representa una ventaja significativa en términos de costos operativos. A continuación se presenta un análisis del costo de infraestructura recurrente.

### 14.1 Infraestructura on-premises

Al operar en servidores propios de la Universidad, el costo de hardware de infraestructura es nulo como línea presupuestaria directa del proyecto. Los costos marginales de energía, enfriamiento y espacio de rack son absorbidos por la institución como parte de sus costos operativos regulares. Todo el stack tecnológico seleccionado (NestJS, React, PostgreSQL, Nginx, PM2) es software de código abierto sin costo de licencias.

### 14.2 Comparativa con alternativas en la nube

A modo de referencia para la toma de decisiones institucionales, con la inclusión del microservicio de georreferenciación, los requisitos han aumentado a 8 GB de RAM y 8 vCPUs para garantizar un rendimiento estable en escenarios moderados. Para una instancia equivalente de 8 GB RAM y 8 vCPUs en proveedores de nube (AWS EC2, Azure, DigitalOcean, Hetzner), el costo mensual oscila entre 80 y 220 USD mensuales según el proveedor y la región. El ahorro anual estimado al operar en infraestructura on-premises de la Universidad es de aproximadamente 960 a 2.640 USD por año (80 a 220 USD mensuales × 12 meses), dependiendo del proveedor cloud de referencia. Este ahorro es significativo considerando que la infraestructura de la UCB ya existe y los costos de operación (energía, espacio, enfriamiento) son absorbidos por la institución como costos generales.

### 14.3 Costos operativos recurrentes estimados

Los únicos costos recurrentes proyectados son opcionales y de muy bajo monto: respaldos externos en almacenamiento en frío (menos de 3 USD por año para la fase inicial de 200 actores), y potencialmente el ancho de banda institucional si requiere contratación separada. No se proyectan costos de licencias de software para ninguno de los componentes del stack seleccionado.

### 14.4 Proyección de costos a 3 años

Para los tres primeros años de operación, el costo total de infraestructura recurrente asociado directamente al proyecto se estima entre 5 y 15 USD acumulados, correspondientes exclusivamente a los respaldos externos opcionales en almacenamiento en frío. El crecimiento de actores previsto (de 200 en el año 1 a un número mayor en años posteriores) no modifica esta proyección de forma significativa, dado que el volumen de datos se mantiene reducido y la infraestructura on-premises absorbe el crecimiento sin costos adicionales directos.

## 15 - CRONOGRAMA DE IMPLEMENTACIÓN

El despliegue de la plataforma Kaa Iya se realizará mediante un enfoque gradual que minimiza riesgos y permite validación rigurosa en cada etapa. A continuación se detalla el cronograma estimado, considerando la complejidad de la integración del microservicio de georreferenciación y los procesos de validación requeridos.

| Etapa | Duración | Entregables Concretos | Responsable |
| :--- | :--- | :--- | :--- |
| **1. Configuración del Ambiente de Staging** | 1 semana (15-21 junio) | Instalación de dependencias (Node.js, PostgreSQL, Nginx, PM2). Despliegue del backend, frontend y microservicio GeoRef en máquina staging. Configuración de variables de entorno y validación inicial de conectividad. | Equipo Técnico del Proyecto + Dirección de Sistemas |
| **2. Validación en Staging** | 1 semana (22-28 junio) | Ejecución de suite de tests (unitarios, integración, end-to-end). Pruebas manuales de flujos principales. Validación de georreferenciación con datos reales. Verificación de rendimiento bajo carga moderada (40-60 usuarios simulados). Aprobación técnica firmada. Reporte de defectos y correcciones aplicadas. | Equipo QA + Responsable Técnico Proyecto |
| **3. Despliegue en Producción** | 2 semanas (29 junio - 12 julio) | Migración de datos iniciales (~200 actores base). Despliegue de builds finales en servidor de producción. Validación de respaldos pre-despliegue. Ejecutar plan de rollback si es necesario. Certificado de despliegue exitoso. Acceso de usuarios piloto habilitado. | Equipo Técnico + Dirección de Sistemas |
| **4. Operación Supervisada y Ajustes** | 1 semana (13-19 julio) | Monitoreo 24x7 de métricas (CPU, memoria, latencia). Recolección de feedback de usuarios piloto. Aplicación de parches críticos. Ajuste de parámetros de rendimiento (PM2, PostgreSQL, Nginx). Reporte diario de incidencias. Documento de lecciones aprendidas. | Equipo de Operaciones + Soporte Técnico |
| **5. Entrega Formal y Cierre** | 0.5 semana (20-21 julio) | Acta de entrega y aceptación formal. Manual de usuario final. Documentación técnica completa (architectural decision records, runbooks). Capacitación a equipo de soporte. Cierre de incidencias. Entrega de llaves del proyecto al cliente. | Responsable del Proyecto + Dirección Institucional |

El cronograma total comprende 5.5 semanas de actividades, iniciando el lunes 15 de junio de 2026 y culminando la entrega formal el viernes 21 de julio del mismo año. Este plazo contempla márgenes de holgura para resolución de incidencias no previstas en etapas críticas (validación y despliegue). Los ajustes en hitos pueden realizarse previo consenso entre el equipo técnico y la dirección del proyecto, registrando los cambios en el plan de control de cambios formalmente.

## GLOSARIO TÉCNICO

El presente glosario define los principales términos técnicos empleados en este documento, orientado a facilitar su comprensión por parte de tomadores de decisión no especializados en tecnología.

### Términos de arquitectura

* **API (Application Programming Interface):** protocolo que permite la comunicación entre dos sistemas de software. En esta plataforma, el backend NestJS expone una API REST que el frontend React consume para obtener y enviar datos.
* **Backend:** componente del sistema que opera en el servidor, procesa la lógica de negocio, ejecuta consultas a la base de datos y expone la API. En la plataforma Kaa Iya, el backend está construido con NestJS.
* **Frontend:** interfaz de usuario que se ejecuta en el navegador del visitante. Incluye los dashboards, formularios, mapas y visualizaciones interactivas. Construido con React.
* **Contenedor (Docker):** unidad de software que empaqueta una aplicación junto con todas sus dependencias, garantizando que funcione de forma idéntica en cualquier entorno. Facilita el despliegue y el mantenimiento del sistema.
* **Nginx:** servidor web y proxy inverso que recibe las peticiones del navegador, sirve los archivos estáticos del frontend y redirige el tráfico hacia el backend. Gestiona también la terminación SSL/TLS.
* **Microservicio:** componente de software autónomo que cumple una función específica y se comunica con el resto del sistema mediante API. El servicio de georreferenciación de la plataforma opera como microservicio independiente.
* **SPA (Single Page Application):** aplicación web que carga una única vez y actualiza el contenido dinámicamente sin recargar la página completa. El frontend de Kaa Iya es una SPA construida con React.
* **Staging:** ambiente de pruebas que replica la infraestructura de producción y se utiliza para validar cambios antes de hacerlos disponibles a los usuarios finales.

### Términos de base de datos y rendimiento

* **PostgreSQL:** sistema gestor de base de datos relacional de código abierto utilizado por la plataforma para almacenar toda la información estructurada de actores, proyectos e iniciativas.
* **ORM (Object-Relational Mapper):** capa de software que traduce entre los objetos del lenguaje de programación y las tablas de la base de datos. La plataforma utiliza TypeORM como ORM.
* **Migración de base de datos:** proceso controlado y versionado de modificación del esquema de la base de datos (creación o modificación de tablas, columnas o índices) sin pérdida de datos existentes.
* **Índice:** estructura interna de la base de datos que acelera las consultas sobre columnas específicas. Sin índices adecuados, las consultas analíticas sobre grandes volúmenes de datos pueden resultar significativamente más lentas.
* **RPO (Recovery Point Objective):** parámetro que define la cantidad máxima de datos que se acepta perder ante un fallo del sistema, expresada en tiempo. Un RPO de 15 minutos significa que, en el peor caso, se perdería la información generada en los últimos 15 minutos previos al fallo.
* **RTO (Recovery Time Objective):** parámetro que define el tiempo máximo aceptable para restaurar el sistema a su estado operativo tras un fallo. Un RTO de 1 a 2 horas significa que el sistema debe estar plenamente operativo en ese plazo.
* **PITR (Point-in-Time Recovery):** capacidad de restaurar la base de datos al estado exacto que tenía en un momento preciso del pasado, habilitada por el archivado continuo de registros WAL.

### Términos de seguridad

* **JWT (JSON Web Token):** mecanismo de autenticación basado en un token firmado digitalmente que el usuario presenta en cada solicitud al sistema para demostrar su identidad sin necesidad de reautenticarse en cada petición.
* **2FA (Two-Factor Authentication):** mecanismo de autenticación que requiere dos factores independientes para verificar la identidad de un usuario: típicamente una contraseña y un código temporal generado por una aplicación o dispositivo.
* **TLS (Transport Layer Security):** protocolo de cifrado que protege las comunicaciones entre el navegador del usuario y el servidor, impidiendo que terceros intercepten o modifiquen los datos en tránsito. Se identifica en la barra del navegador por el prefijo `https://`.
* **bcrypt:** algoritmo de cifrado unidireccional utilizado para almacenar contraseñas de forma segura. Convierte la contraseña original en un valor irreversible, de modo que incluso si la base de datos fuera comprometida, no sería posible recuperar las contraseñas originales.
* **OWASP Top 10:** listado de las diez vulnerabilidades de seguridad más críticas en aplicaciones web, publicado por la Open Web Application Security Project. La plataforma ha sido desarrollada atendiendo a estas categorías de riesgo.
* **Audit log (registro de auditoría):** registro cronológico de los eventos relevantes del sistema (accesos, modificaciones de datos, cambios de configuración) que permite trazar el historial de actividad y detectar comportamientos anómalos.
* **LUKS (Linux Unified Key Setup):** estándar de cifrado de volúmenes de disco en sistemas Linux, utilizado para proteger los datos almacenados en el servidor ante acceso físico no autorizado.

### Términos de monitoreo y operación

* **Uptime (disponibilidad):** porcentaje del tiempo durante el cual el sistema está operativo y accesible. Un uptime del 99,5% equivale a un máximo de 3,6 horas de interrupción por mes.
* **Latencia:** tiempo que transcurre entre el envío de una solicitud al servidor y la recepción de la respuesta. Se expresa habitualmente en milisegundos (ms) y se mide en percentiles (p50, p95, p99).
* **PM2:** gestor de procesos para aplicaciones Node.js que garantiza el reinicio automático del backend ante fallos inesperados, facilita el monitoreo del proceso y permite actualizaciones sin tiempo de inactividad.
* **SLA (Service Level Agreement):** compromiso documentado sobre el nivel mínimo de calidad del servicio, expresado generalmente en términos de disponibilidad y tiempos de respuesta ante incidentes.
* **Prometheus / Grafana:** herramientas de código abierto para recolección de métricas y visualización de dashboards operacionales, ampliamente utilizadas en entornos de producción para el monitoreo de sistemas.

## CONCLUSIÓN

La implementación de la plataforma Kaa Iya en los servidores de la Universidad Católica Boliviana “San Pablo” requiere una planificación técnica cuidadosa, considerando no solo las necesidades actuales, sino también el crecimiento futuro del sistema. La naturaleza escalable del proyecto, el volumen de datos previsto y su proyección estratégica hacen imprescindible contar con una infraestructura robusta, flexible y preparada para evolucionar.

En este sentido, el despliegue debe realizarse bajo criterios de sostenibilidad tecnológica, garantizando que la plataforma pueda acompañar el desarrollo del proyecto y consolidarse como una herramienta clave para la articulación de actores y la generación de conocimiento en torno a la Amazonía boliviana.