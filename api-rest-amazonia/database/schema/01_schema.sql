-- ==========================================================
-- Generated: 2026-06-11 20:30:00
-- DO NOT EDIT — run: npm run build
-- ==========================================================

-- ==========================================================
-- RESET COMPLETO — elimina todo y recarga desde schema/
-- Usar solo en entornos vacíos o de desarrollo.
-- ==========================================================

DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;


-- [schema] ------------------------------------------------
-- ==========================================================
-- SCHEMA LOAD ORDER
-- Rutas siempre desde la raíz del proyecto. Dependencias primero.
-- ==========================================================


-- [schema > catalogos] ------------------------------------

-- [schema > catalogos > tipos-organizaciones] -------------
CREATE TABLE tipos_organizaciones (
    id_tipo    SERIAL,
    nombre     VARCHAR(100)    NOT NULL UNIQUE,
    es_propio  BOOLEAN         DEFAULT TRUE,           -- TRUE si el tipo fue agregado por el sistema, no del catálogo original
    PRIMARY KEY (id_tipo)
);

INSERT INTO tipos_organizaciones (nombre, es_propio) VALUES
('Cooperación internacional Bilateral', false),
('Cooperación internacional Multilateral', false),
('ONG/Fundación nacional', false),
('ONG/Fundación internacional', false),
('Empresa privada', false);


-- [/schema > catalogos > tipos-organizaciones]


-- [schema > catalogos > areas-desarrollo] -----------------
CREATE TABLE areas_desarrollo (
    id_area  SERIAL,
    nombre   VARCHAR(100)    NOT NULL UNIQUE,
    PRIMARY KEY (id_area)
);

INSERT INTO areas_desarrollo (nombre) VALUES
('Ecoturismo'),
('Restauración ecológica'),
('Apoyo legal y administrativo para la protección de territorios'),
('Educación');


-- [/schema > catalogos > areas-desarrollo]


-- [schema > catalogos > practicas-agricolas] --------------
CREATE TABLE practicas_agricolas (
    id_practica  SERIAL,
    nombre       VARCHAR(100)    NOT NULL,
    es_propio    BOOLEAN         DEFAULT TRUE,         -- TRUE si la práctica fue agregada por el sistema, no del catálogo original
    PRIMARY KEY (id_practica)
);

INSERT INTO practicas_agricolas (nombre, es_propio) VALUES
('Acai', false),
('Castaña', false),
('Cacao silvestre', false),
('Plantas medicinales', false),
('Paraba frente roja', false),
('Camu Camu', false),
('Miel', false);


-- [/schema > catalogos > practicas-agricolas]


-- [schema > catalogos > especies-animales] ----------------
CREATE TABLE especies_animales (
    id_especie  SERIAL,
    nombre      VARCHAR(100)    NOT NULL,
    es_propio   BOOLEAN         DEFAULT TRUE,          -- TRUE si la especie fue agregada por el sistema, no del catálogo original
    PRIMARY KEY (id_especie)
);

INSERT INTO especies_animales (nombre, es_propio) VALUES
('Jaguar', false),
('Bufeo', false),
('Oso andino', false),
('Paraba barba azul', false),
('Paraba frente roja', false),
('Ninguno', false),
('Águila harpía', false);


-- [/schema > catalogos > especies-animales]


-- [schema > catalogos > ayudas] ---------------------------
CREATE TABLE ayudas (
    id_ayuda   SERIAL,
    nombre     VARCHAR(150)    NOT NULL,
    es_propio  BOOLEAN         DEFAULT TRUE,           -- TRUE si la ayuda fue agregada por el sistema, no del catálogo original
    PRIMARY KEY (id_ayuda)
);

INSERT INTO ayudas (nombre, es_propio) VALUES
('Donaciones', false),
('Financiero', false),
('Capacitaciones', false),
('Fortalecimiento de organizaciones sociales', false),
('Investigaciones', false),
('Construcción/refacción de infraestructura', false);


-- [/schema > catalogos > ayudas]


-- [schema > catalogos > actores-municipales] --------------
CREATE TABLE actores_municipales (
    id_actor   SERIAL,
    nombre     VARCHAR(150)    NOT NULL,
    es_propio  BOOLEAN         DEFAULT TRUE,           -- TRUE si el actor fue agregado por el sistema, no del catálogo original
    PRIMARY KEY (id_actor)
);

INSERT INTO actores_municipales (nombre, es_propio) VALUES
('Gobiernos municipales', false),
('Financiero', false),
('Capacitaciones', false),
('Fortalecimiento de organizaciones sociales', false),
('Actores privados', false);


-- [/schema > catalogos > actores-municipales]


-- [schema > catalogos > tipos-proyectos] ------------------
CREATE TABLE tipos_proyectos (
    id_tipo    SERIAL,
    nombre     VARCHAR(200)    NOT NULL UNIQUE,
    es_propio  BOOLEAN         NOT NULL DEFAULT TRUE,  -- TRUE si el tipo fue agregado por el sistema, no del catálogo original
    PRIMARY KEY (id_tipo)
);

INSERT INTO tipos_proyectos (nombre, es_propio) VALUES
('Áreas protegidas', false),
('Conservación de bosques', false),
('Restauración ecológica', false),
('Conservación y aprovechamiento de bosques', false),
('Desarrollo productivo sostenible', false),
('Conservación de especies', false),
('Manejo sostenible', false),
('Ecoturismo', false),
('Apoyo legal y administrativo para la protección de territorios', false),
('Educación', false);


-- [/schema > catalogos > tipos-proyectos]


-- [schema > catalogos > areas] ----------------------------
CREATE TABLE areas (
    id_area  SERIAL,
    nombre   VARCHAR(100)    NOT NULL,
    PRIMARY KEY (id_area)
);

INSERT INTO areas (nombre) VALUES
('Conservacion'),
('Desarrollo de comunidades indigenas');


-- [/schema > catalogos > areas]


-- [schema > catalogos > motivos] --------------------------
CREATE TABLE motivos (
    id_motivo  SERIAL,
    nombre     VARCHAR(100)    NOT NULL,
    es_propio  BOOLEAN         NOT NULL DEFAULT TRUE,  -- TRUE si el motivo fue agregado por el sistema, no del catálogo original
    PRIMARY KEY (id_motivo)
);

INSERT INTO motivos (nombre, es_propio) VALUES
('Responsabilidad Social', false),
('Interés económico-productivo', false),
('Imagen institucional', false);


-- [/schema > catalogos > motivos]


-- [schema > catalogos > apoyos] ---------------------------
CREATE TABLE apoyos (
    id_apoyo   SERIAL,
    nombre     VARCHAR(100)    NOT NULL,
    es_propio  BOOLEAN         NOT NULL DEFAULT TRUE,  -- TRUE si el apoyo fue agregado por el sistema, no del catálogo original
    PRIMARY KEY (id_apoyo)
);

INSERT INTO apoyos (nombre, es_propio) VALUES
('Donaciones', false),
('Financiero', false),
('Logistico', false),
('Talento Humano', false),
('Investigaciones', false);


-- [/schema > catalogos > apoyos]


-- [schema > catalogos > ods] ------------------------------
CREATE TABLE ods (
    id_ods  SERIAL,
    nombre  VARCHAR(100)    NOT NULL,
    PRIMARY KEY (id_ods)
);

INSERT INTO ods (nombre) VALUES
('Fin de la pobreza'),
('Hambre cero'),
('Salud y bienestar'),
('Educacion de calidad'),
('Igualdad de genero'),
('Agua limpia y saneamiento'),
('Energia asequible y no contaminante'),
('Trabajo decente y crecimiento economico'),
('Industria, innovacion e infraestructura'),
('Reduccion de las desigualdades'),
('Ciudades y comunidades sostenibles'),
('Produccion y consumo responsables'),
('Accion por el clima'),
('Vida submarina'),
('Vida de ecosistemas terrestres'),
('Paz, justicia e instituciones solidas'),
('Alianzas para lograr los objetivos');


-- [/schema > catalogos > ods]


-- [schema > catalogos > formas-juridicas] -----------------
CREATE TABLE formas_juridicas (
    id_forma   SERIAL,
    nombre     VARCHAR(100)    NOT NULL,
    es_propio  BOOLEAN         NOT NULL DEFAULT TRUE,  -- TRUE si la forma jurídica fue agregada por el sistema, no del catálogo original
    PRIMARY KEY (id_forma)
);

INSERT INTO formas_juridicas (nombre, es_propio) VALUES
('S.R.L', false),
('S.A', false),
('Empresa individual', false);


-- [/schema > catalogos > formas-juridicas]


-- [/schema > catalogos]


-- [schema > ubicaciones-geograficas] ----------------------

-- [schema > ubicaciones-geograficas > departamentos] ------
CREATE TABLE departamentos (
    id_departamento  SERIAL,
    nombre           VARCHAR(100)    NOT NULL,
    amazonico        BOOLEAN         NOT NULL,         -- TRUE si el departamento forma parte de la Amazonía boliviana
    PRIMARY KEY (id_departamento)
);

-- 2. Los 9 departamentos de Bolivia
--    TRUE  = presencia amazónica (fuente: Excel)
--    FALSE = sin presencia amazónica (sedes empresas/orgs)
INSERT INTO departamentos (id_departamento, nombre, amazonico) VALUES
(1, 'Pando', TRUE),
(2, 'Beni', TRUE),
(3, 'La Paz', TRUE),
(4, 'Cochabamba', TRUE),
(5, 'Santa Cruz', TRUE),
(6, 'Oruro', FALSE),
(7, 'Potosí', FALSE),
(8, 'Chuquisaca', FALSE),
(9, 'Tarija', FALSE);

SELECT setval('departamentos_id_departamento_seq',
       (SELECT MAX(id_departamento) FROM departamentos));


-- [/schema > ubicaciones-geograficas > departamentos]


-- [schema > ubicaciones-geograficas > municipios] ---------
CREATE TABLE municipios (
    id_municipio     SERIAL,
    id_departamento  INT             NOT NULL,         -- departamento al que pertenece el municipio
    nombre           VARCHAR(100)    NOT NULL,
    PRIMARY KEY (id_municipio),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento)
);

-- 3. Municipios (105 municipios amazónicos según Excel)
INSERT INTO municipios (id_municipio, nombre, id_departamento) VALUES
(1, 'Bella Flor', 1),
(2, 'Bolpebra', 1),
(3, 'Cobija', 1),
(4, 'Filadelfia', 1),
(5, 'Ingavi', 1),
(6, 'Nueva Esperanza', 1),
(7, 'Porvenir', 1),
(8, 'Puerto Gonzalo Moreno', 1),
(9, 'Puerto Rico', 1),
(10, 'San Lorenzo', 1),
(11, 'San Pedro', 1),
(12, 'Santa Rosa', 1),
(13, 'Santos Mercado', 1),
(14, 'Sena', 1),
(15, 'Villa Nueva (Loma Alta)', 1),
(16, 'Baures', 2),
(17, 'Exaltación', 2),
(18, 'Guayaramerín', 2),
(19, 'Huacaraje', 2),
(20, 'Loreto', 2),
(21, 'Magdalena', 2),
(22, 'Puerto Siles', 2),
(23, 'Reyes', 2),
(24, 'Riberalta', 2),
(25, 'Rurrenabaque', 2),
(26, 'San Andrés', 2),
(27, 'San Borja', 2),
(28, 'San Ignacio', 2),
(29, 'San Javier', 2),
(30, 'San Joaquín', 2),
(31, 'San Ramón', 2),
(32, 'Santa Ana de Yacuma', 2),
(33, 'Santa Rosa', 2),
(34, 'Trinidad', 2),
(35, 'Alto Beni', 3),
(36, 'Apolo', 3),
(37, 'Aucapata', 3),
(38, 'Ayata', 3),
(39, 'Cairoma', 3),
(40, 'Cajuata', 3),
(41, 'Caranavi', 3),
(42, 'Charazani (Gral. Pérez)', 3),
(43, 'Chulumani', 3),
(44, 'Chuma', 3),
(45, 'Colquiri', 3),
(46, 'Combaya', 3),
(47, 'Coripata', 3),
(48, 'Coroico', 3),
(49, 'Curva', 3),
(50, 'Guanay', 3),
(51, 'Ichoca', 3),
(52, 'Inquisivi', 3),
(53, 'Irupana', 3),
(54, 'Ixiamas', 3),
(55, 'La Asunta', 3),
(56, 'Licoma (Villa libertad)', 3),
(57, 'Mapiri', 3),
(58, 'Mocomoco', 3),
(59, 'Nuestra Señora de La Paz', 3),
(60, 'Palos Blancos', 3),
(61, 'Pelechuco', 3),
(62, 'Puerto Carabuco', 3),
(63, 'Quiabaya', 3),
(64, 'Quime', 3),
(65, 'San Buenaventura', 3),
(66, 'Sorata', 3),
(67, 'Tacacoma', 3),
(68, 'Teoponte', 3),
(69, 'Tipuani', 3),
(70, 'Yanacachi', 3),
(71, 'Chimoré', 4),
(72, 'Cocapata', 4),
(73, 'Entre Ríos (Bulo Bulo)', 4),
(74, 'Independencia', 4),
(75, 'Morochata', 4),
(76, 'Pojo', 4),
(77, 'Puerto Villarroel', 4),
(78, 'Shinaota', 4),
(79, 'Tapacarí', 4),
(80, 'Tiraque', 4),
(81, 'Totora', 4),
(82, 'Villa Tunari', 4),
(83, 'Ascensión de Guarayos', 5),
(84, 'Buena Vista', 5),
(85, 'Comarapa', 5),
(86, 'Concepción', 5),
(87, 'El Puente', 5),
(88, 'El Torno', 5),
(89, 'Fernández Alonso', 5),
(90, 'General Saavedra', 5),
(91, 'Mairana', 5),
(92, 'Mineros', 5),
(93, 'Pampa Grande', 5),
(94, 'Porongo (Ayacucho)', 5),
(95, 'Portachuelo', 5),
(96, 'Samaipata', 5),
(97, 'San Carlos', 5),
(98, 'San Ignacio de Velasco', 5),
(99, 'San Juan de Yapacaní', 5),
(100, 'San Julián', 5),
(101, 'San Pedro', 5),
(102, 'Santa Rosa del Sara', 5),
(103, 'Urubichá', 5),
(104, 'Warnes', 5),
(105, 'Yapacaní', 5);

SELECT setval('municipios_id_municipio_seq',
       (SELECT MAX(id_municipio) FROM municipios));


-- [/schema > ubicaciones-geograficas > municipios]


-- [schema > ubicaciones-geograficas > comunidades-indigenas] --
CREATE TABLE comunidades_indigenas (
    id_comunidad  SERIAL,
    nombre        VARCHAR(100)    NOT NULL,
    PRIMARY KEY (id_comunidad)
);

-- 4. Comunidades indígenas (51 comunidades únicas)
INSERT INTO comunidades_indigenas (id_comunidad, nombre) VALUES
(1, 'Afrobolivianos'),
(2, 'Baure'),
(3, 'Canichana'),
(4, 'Cavineño'),
(5, 'Cayubaba'),
(6, 'Central de Comunidades Indígenas Tacana II Río Madre de Dios (CITRMD)'),
(7, 'Chacobo'),
(8, 'Chiquitano'),
(9, 'Comunidad Agroecológica Originaria de Palos Blancos (CAOPB)'),
(10, 'Comunidad Ese Ejja de Eyiyoquibo (CEEE)'),
(11, 'Comunidad Indígena Apichana'),
(12, 'Comunidad Indígena Puesto Araona (CAPIA)'),
(13, 'Consejo Indígena Yuqui Consejo Indígena del Río Ichilo (YUQUI CIRI)'),
(14, 'Consejo Indígena del Pueblo Tacana (CIPTA)'),
(15, 'Consejo Regional T''simane Mosetenes Pilón Lajas (CRTM-PL)'),
(16, 'Esse Ejja'),
(17, 'Guaragsug we'),
(18, 'Guarayo'),
(19, 'Ignaciano'),
(20, 'Itonama'),
(21, 'Itonamas'),
(22, 'Javeriano'),
(23, 'Joaquiniano'),
(24, 'La Central Indígena del Pueblo Leco de Apolo (CIPLA)'),
(25, 'La Organización del Pueblo Indígena Leco y Comunidades Originarias de Larecaja (PILCOL)'),
(26, 'Lecos'),
(27, 'Loretano'),
(28, 'Machineri'),
(29, 'Mojeño'),
(30, 'Mojeño Trinitario (TIM)'),
(31, 'Moré'),
(32, 'Mosetene'),
(33, 'Mosetén'),
(34, 'Movima'),
(35, 'Movima (TIM)'),
(36, 'Moxeño'),
(37, 'OPIM (Organización del Pueblo Indígena Mosetén) y OMIM (Organización de la Mujer Indígena Mosetén)'),
(38, 'Pacahuara'),
(39, 'Pueblo Indígena de San José de Uchupiamonas (PI-SJU)'),
(40, 'Reyesano / Moropa'),
(41, 'Sirionó'),
(42, 'Tacanas'),
(43, 'Trinitario Moxeño'),
(44, 'Trinitario Moxeño - Territorio Indígena del Parque Isiboro Sécure Consejo Indígena del Sur (TIPNIS)'),
(45, 'Tsimane'),
(46, 'Tsimane (TIM)'),
(47, 'Yaminahua'),
(48, 'Yuracare'),
(49, 'Yuracare (TIM)'),
(50, 'Yuracaré'),
(51, 'Yuracaré-Mojeño');

SELECT setval('comunidades_indigenas_id_comunidad_seq',
       (SELECT MAX(id_comunidad) FROM comunidades_indigenas));


-- [/schema > ubicaciones-geograficas > comunidades-indigenas]


-- [schema > ubicaciones-geograficas > comunidades-municipios] --
CREATE TABLE comunidades_municipios (
    id_comunidad  INT     NOT NULL,
    id_municipio  INT     NOT NULL,
    PRIMARY KEY (id_comunidad, id_municipio),
    FOREIGN KEY (id_comunidad) REFERENCES comunidades_indigenas(id_comunidad),
    FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio)
);

-- 5. Relaciones municipio ↔ comunidad (131 relaciones)
INSERT INTO comunidades_municipios (id_municipio, id_comunidad) VALUES
(1, 42),
(2, 28),
(2, 47),
(3, 38),
(4, 4),
(5, 4),
(5, 16),
(5, 42),
(6, 42),
(8, 4),
(8, 16),
(8, 42),
(9, 4),
(9, 42),
(10, 4),
(10, 16),
(10, 42),
(11, 4),
(11, 42),
(12, 4),
(13, 42),
(14, 4),
(14, 42),
(16, 2),
(16, 21),
(17, 4),
(17, 5),
(17, 7),
(17, 34),
(18, 7),
(19, 2),
(19, 20),
(20, 27),
(20, 29),
(20, 50),
(21, 2),
(21, 21),
(21, 29),
(22, 23),
(22, 31),
(23, 4),
(23, 7),
(23, 40),
(23, 42),
(23, 45),
(24, 4),
(24, 7),
(24, 38),
(24, 42),
(25, 15),
(25, 16),
(25, 40),
(25, 42),
(26, 29),
(27, 15),
(27, 34),
(27, 37),
(27, 42),
(27, 48),
(28, 19),
(28, 30),
(28, 33),
(28, 35),
(28, 46),
(28, 50),
(29, 3),
(29, 22),
(29, 36),
(29, 41),
(30, 2),
(30, 20),
(30, 23),
(30, 29),
(30, 31),
(30, 34),
(31, 20),
(31, 23),
(31, 29),
(32, 4),
(32, 30),
(32, 33),
(32, 35),
(32, 46),
(32, 49),
(33, 42),
(33, 45),
(33, 48),
(34, 3),
(34, 36),
(34, 41),
(36, 15),
(36, 24),
(36, 25),
(36, 39),
(41, 26),
(43, 1),
(47, 1),
(48, 1),
(50, 25),
(50, 32),
(52, 1),
(53, 1),
(54, 6),
(54, 12),
(54, 14),
(54, 16),
(54, 39),
(57, 25),
(60, 9),
(60, 11),
(60, 15),
(60, 37),
(64, 1),
(65, 10),
(65, 14),
(65, 39),
(68, 25),
(69, 25),
(71, 43),
(71, 50),
(75, 32),
(77, 13),
(82, 44),
(82, 50),
(83, 2),
(83, 18),
(87, 18),
(98, 8),
(98, 17),
(103, 18),
(105, 51);


-- [/schema > ubicaciones-geograficas > comunidades-municipios]


-- [/schema > ubicaciones-geograficas]


-- [schema > gestion-empresarial] --------------------------

-- [schema > gestion-empresarial > empresas] ---------------
CREATE TABLE empresas (
    id_empresa         SERIAL,
    id_forma_juridica  INT             NOT NULL,       -- forma jurídica de la empresa
    nombre             VARCHAR(100)    NOT NULL,
    anio_inicio_apoyo  INT             NOT NULL,        -- año en que la empresa comenzó a apoyar proyectos
    logo_url           TEXT,                            -- URL pública del logo
    logo_path          TEXT,                            -- ruta relativa en filesystem /uploads/
    PRIMARY KEY (id_empresa),
    FOREIGN KEY (id_forma_juridica) REFERENCES formas_juridicas(id_forma)
);

-- Sin datos iniciales


-- [/schema > gestion-empresarial > empresas]


-- [schema > gestion-empresarial > departamentos-empresas] --
CREATE TABLE departamentos_empresas (
    id_departamento  INT     NOT NULL,
    id_empresa       INT     NOT NULL,
    PRIMARY KEY (id_departamento, id_empresa),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    FOREIGN KEY (id_empresa)      REFERENCES empresas(id_empresa)
);

-- Sin datos iniciales


-- [/schema > gestion-empresarial > departamentos-empresas]


-- [schema > gestion-empresarial > motivos-empresas] -------
CREATE TABLE motivos_empresas (
    id_empresa  INT     NOT NULL,
    id_motivo   INT     NOT NULL,
    PRIMARY KEY (id_empresa, id_motivo),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
    FOREIGN KEY (id_motivo)  REFERENCES motivos(id_motivo)
);

-- Sin datos iniciales


-- [/schema > gestion-empresarial > motivos-empresas]


-- [schema > gestion-empresarial > apoyos-empresas] --------
CREATE TABLE apoyos_empresas (
    id_apoyo    INT     NOT NULL,
    id_empresa  INT     NOT NULL,
    PRIMARY KEY (id_apoyo, id_empresa),
    FOREIGN KEY (id_apoyo)   REFERENCES apoyos(id_apoyo),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
);

-- Sin datos iniciales


-- [/schema > gestion-empresarial > apoyos-empresas]


-- [schema > gestion-empresarial > ods-empresas] -----------
CREATE TABLE ods_empresas (
    id_ods      INT     NOT NULL,
    id_empresa  INT     NOT NULL,
    PRIMARY KEY (id_ods, id_empresa),
    FOREIGN KEY (id_ods)     REFERENCES ods(id_ods),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
);

-- Sin datos iniciales


-- [/schema > gestion-empresarial > ods-empresas]


-- [/schema > gestion-empresarial]


-- [schema > gestion-organizacional] -----------------------

-- [schema > gestion-organizacional > organizaciones] ------
CREATE TABLE organizaciones (
    id_organizacion      SERIAL,
    id_tipo              INT             NOT NULL,     -- tipo de organización
    id_departamento      INT             NOT NULL,     -- departamento donde opera la organización
    nombre               VARCHAR(100)    NOT NULL,
    es_nacional          BOOLEAN         NOT NULL,      -- TRUE si la organización es de origen nacional, FALSE si es internacional
    anio_inicio_trabajo  INT             NOT NULL,      -- año en que la organización comenzó a trabajar en la zona
    logo_url             TEXT,                          -- URL pública del logo
    logo_path            TEXT,                          -- ruta relativa en filesystem /uploads/
    PRIMARY KEY (id_organizacion),
    FOREIGN KEY (id_tipo)         REFERENCES tipos_organizaciones(id_tipo),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento)
);

-- Sin datos iniciales


-- [/schema > gestion-organizacional > organizaciones]


-- [schema > gestion-organizacional > organizaciones-empresas] --
CREATE TABLE organizaciones_empresas (
    id_orga_empresa  SERIAL,
    id_organizacion  INT,                                   -- organización a la que pertenece la empresa, si aplica
    id_empresa       INT             NOT NULL,              -- empresa asociada a la organización
    nombre           VARCHAR(300),                          -- nombre comercial alternativo de la empresa dentro de la organización
    PRIMARY KEY (id_orga_empresa),
    FOREIGN KEY (id_organizacion) REFERENCES organizaciones(id_organizacion),
    FOREIGN KEY (id_empresa)      REFERENCES empresas(id_empresa)
);

-- Sin datos iniciales


-- [/schema > gestion-organizacional > organizaciones-empresas]


-- [/schema > gestion-organizacional]


-- [schema > gestion-proyectos] ----------------------------

-- [schema > gestion-proyectos > proyectos] ----------------
CREATE TABLE proyectos (
    id_proyecto            SERIAL          NOT NULL,
    id_area                INT             NOT NULL,   -- área temática del proyecto (conservación, desarrollo de comunidades, etc.)
    id_tipo                INT             NOT NULL,   -- tipo de proyecto
    nombre                 VARCHAR(300)    NOT NULL,
    descripcion            TEXT,                       -- descripción detallada del proyecto
    anio_inicio            INT             NOT NULL,   -- año en que inició el proyecto
    anio_fin               INT,                        -- año en que finalizó el proyecto, si ya concluyó
    imagen_principal_url   TEXT,                       -- URL pública de la imagen principal
    imagen_principal_path  TEXT,                       -- ruta relativa en filesystem /uploads/
    PRIMARY KEY (id_proyecto),
    FOREIGN KEY (id_area) REFERENCES areas(id_area),
    FOREIGN KEY (id_tipo) REFERENCES tipos_proyectos(id_tipo)
);

-- Sin datos iniciales


-- [/schema > gestion-proyectos > proyectos]


-- [schema > gestion-proyectos > proyecto-imagenes] -------
CREATE TABLE proyecto_imagenes (
    id           UUID        DEFAULT gen_random_uuid(),
    id_proyecto  INT         NOT NULL,                 -- proyecto al que pertenece la imagen
    url          TEXT        NOT NULL,                 -- URL pública de la imagen
    path         TEXT        NOT NULL,                 -- ruta relativa en filesystem /uploads/
    descripcion  TEXT,                                 -- descripción opcional de la imagen
    orden        INT         DEFAULT 0,                -- orden para mostrar en la galería
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto) ON DELETE CASCADE
);
CREATE INDEX idx_proyecto_imagenes_proyecto ON proyecto_imagenes(id_proyecto);

-- Sin datos iniciales


-- [/schema > gestion-proyectos > proyecto-imagenes]


-- [schema > gestion-proyectos > proyectos-empresas] -------
-- NOTA: id_participacion permite registrar múltiples periodos de participación
--       (una empresa puede salir y volver a un mismo proyecto).
CREATE TABLE proyectos_empresas (
    id_participacion  SERIAL  NOT NULL,
    id_proyecto       INT     NOT NULL,
    id_empresa        INT     NOT NULL,
    fecha_inicio      DATE    NOT NULL,                -- fecha en que la empresa comenzó a apoyar el proyecto
    fecha_fin         DATE,                             -- fecha en que la empresa dejó de apoyar el proyecto, si aplica
    PRIMARY KEY (id_participacion),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto),
    FOREIGN KEY (id_empresa)  REFERENCES empresas(id_empresa)
);

CREATE INDEX idx_proyectos_empresas_actor ON proyectos_empresas(id_empresa, id_proyecto);

-- Sin datos iniciales


-- [/schema > gestion-proyectos > proyectos-empresas]


-- [schema > gestion-proyectos > proyectos-organizaciones] --
-- NOTA: id_participacion permite registrar múltiples periodos de participación
--       (una organización puede salir y volver a un mismo proyecto).
CREATE TABLE proyectos_organizaciones (
    id_participacion  SERIAL  NOT NULL,
    id_proyecto       INT     NOT NULL,
    id_organizacion   INT     NOT NULL,
    fecha_inicio      DATE    NOT NULL,                -- fecha en que la organización comenzó a participar en el proyecto
    fecha_fin         DATE,                             -- fecha en que la organización dejó de participar en el proyecto, si aplica
    PRIMARY KEY (id_participacion),
    FOREIGN KEY (id_proyecto)     REFERENCES proyectos(id_proyecto)          ON DELETE CASCADE,
    FOREIGN KEY (id_organizacion) REFERENCES organizaciones(id_organizacion) ON DELETE CASCADE
);

CREATE INDEX idx_proyectos_organizaciones_actor ON proyectos_organizaciones(id_proyecto, id_organizacion);

-- Sin datos iniciales


-- [/schema > gestion-proyectos > proyectos-organizaciones]


-- [schema > gestion-proyectos > localidades-proyectos] ----
CREATE TABLE localidades_proyectos (
    id_localidad  SERIAL,
    id_proyecto   INT     NOT NULL,                    -- proyecto que se ejecuta en la localidad
    id_municipio  INT     NOT NULL,                    -- municipio donde se ubica la localidad
    id_comunidad  INT,                                  -- comunidad indígena de la localidad, si aplica
    PRIMARY KEY (id_localidad),
    FOREIGN KEY (id_proyecto)  REFERENCES proyectos(id_proyecto),
    FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio),
    FOREIGN KEY (id_comunidad) REFERENCES comunidades_indigenas(id_comunidad)
);

-- Sin datos iniciales


-- [/schema > gestion-proyectos > localidades-proyectos]


-- [schema > gestion-proyectos > actores-proyectos] --------
CREATE TABLE actores_proyectos (
    id_proyecto  INT     NOT NULL,
    id_actor     INT     NOT NULL,
    PRIMARY KEY (id_proyecto, id_actor),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto),
    FOREIGN KEY (id_actor)    REFERENCES actores_municipales(id_actor)
);

-- Sin datos iniciales


-- [/schema > gestion-proyectos > actores-proyectos]


-- [schema > gestion-proyectos > ayudas-proyectos] ---------
CREATE TABLE ayudas_proyectos (
    id_proyecto  INT     NOT NULL,
    id_ayuda     INT     NOT NULL,
    PRIMARY KEY (id_proyecto, id_ayuda),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto),
    FOREIGN KEY (id_ayuda)    REFERENCES ayudas(id_ayuda)
);

-- Sin datos iniciales


-- [/schema > gestion-proyectos > ayudas-proyectos]


-- [/schema > gestion-proyectos]


-- [schema > gestion-conservacion] -------------------------

-- [schema > gestion-conservacion > conservacion-animales] --
CREATE TABLE conservacion_animales (
    id_especie   INT     NOT NULL,
    id_proyecto  INT     NOT NULL,
    PRIMARY KEY (id_especie, id_proyecto),
    FOREIGN KEY (id_especie)  REFERENCES especies_animales(id_especie),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto)
);

-- Sin datos iniciales


-- [/schema > gestion-conservacion > conservacion-animales]


-- [schema > gestion-conservacion > conservacion-agricolas] --
CREATE TABLE conservacion_agricolas (
    id_practica  INT     NOT NULL,
    id_proyecto  INT     NOT NULL,
    PRIMARY KEY (id_practica, id_proyecto),
    FOREIGN KEY (id_practica) REFERENCES practicas_agricolas(id_practica),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto)
);

-- Sin datos iniciales


-- [/schema > gestion-conservacion > conservacion-agricolas]


-- [/schema > gestion-conservacion]


-- [schema > gestion-comunidades] --------------------------

-- [schema > gestion-comunidades > comunidades-indigenas-areas] --
CREATE TABLE comunidades_indigenas_areas (
    id_proyecto  INT     NOT NULL,
    id_area      INT     NOT NULL,
    PRIMARY KEY (id_proyecto, id_area),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto)         ON DELETE CASCADE,
    FOREIGN KEY (id_area)     REFERENCES areas_desarrollo(id_area)      ON DELETE CASCADE
);

-- Sin datos iniciales


-- [/schema > gestion-comunidades > comunidades-indigenas-areas]


-- [/schema > gestion-comunidades]


-- [schema > auth] -----------------------------------------
-- Tablas agregadas en: 2026-06-11 — Módulo de autenticación
-- ==========================================================

-- [schema > auth > usuarios] ------------------------------
CREATE TABLE usuarios (
    id_usuario        SERIAL,
    email             VARCHAR(255)    NOT NULL UNIQUE,
    password_hash     VARCHAR(255)    NOT NULL,            -- hash bcrypt (cost 12), nunca retornar en respuestas
    nombre            VARCHAR(150)    NOT NULL,
    rol               INT             NOT NULL,            -- 1=Superadmin, 2=Admin, 3=Investigador
    activo            BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_expiracion  TIMESTAMP,                           -- solo para Investigadores; NULL = sin expiración
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_usuario)
);

CREATE UNIQUE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Sin datos iniciales — usar: npm run seed:superadmin


-- [/schema > auth > usuarios]


-- [schema > auth > solicitudes-acceso] --------------------
CREATE TABLE solicitudes_acceso (
    id_solicitud             SERIAL,
    nombre_solicitante       VARCHAR(150)     NOT NULL,
    email_solicitante        VARCHAR(255)     NOT NULL,    -- email del solicitante (no tiene que ser único)
    institucion              VARCHAR(255)     NOT NULL,
    proposito                TEXT             NOT NULL,
    estado                   VARCHAR(20)      NOT NULL DEFAULT 'pendiente',  -- pendiente | aprobada | rechazada
    fecha_expiracion_acceso  TIMESTAMP,                   -- definida por el admin al aprobar
    id_revisor               INT,                         -- FK al admin que revisó la solicitud
    id_usuario_creado        INT,                         -- FK al usuario creado al aprobar (Investigador)
    nota_rechazo             TEXT,
    fecha_revision           TIMESTAMP,
    created_at               TIMESTAMP        NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_solicitud),
    FOREIGN KEY (id_revisor) REFERENCES usuarios(id_usuario)
);

CREATE INDEX idx_solicitudes_estado ON solicitudes_acceso(estado);
CREATE INDEX idx_solicitudes_email ON solicitudes_acceso(email_solicitante);

-- Sin datos iniciales


-- [/schema > auth > solicitudes-acceso]


-- [/schema > auth]


-- [/schema]
