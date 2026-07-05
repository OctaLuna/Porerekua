import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MyNotFoundException } from 'src/shared/exceptions';
import { FilterProyectosDashboardDto } from '../dto/filter-proyectos-dashboard.dto';
import { FilterEmpresasDashboardDto } from '../dto/filter-empresas-dashboard.dto';

interface CacheEntry {
    data: unknown;
    expiresAt: number;
}

const SORT_FIELDS_PROYECTOS: Record<string, string> = {
    nombre:      'mv.nombre',
    anio_inicio: 'mv.anio_inicio',
    id_proyecto: 'mv.id_proyecto',
};

const SORT_FIELDS_EMPRESAS: Record<string, string> = {
    nombre:            'mv.nombre',
    anio_inicio_apoyo: 'mv.anio_inicio_apoyo',
    id_empresa:        'mv.id_empresa',
};

@Injectable()
export class DashboardService {
    private readonly cache = new Map<string, CacheEntry>();

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    private getCached<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry || Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data as T;
    }

    private setCached(key: string, data: unknown, ttlSeconds: number): void {
        this.cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
    }

    private buildSort(sortParam: string | undefined, allowedFields: Record<string, string>, defaultField: string): string {
        if (!sortParam) return `${defaultField} ASC`;
        const [field, dir] = sortParam.split(':');
        const col = allowedFields[field] ?? defaultField;
        const direction = dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        return `${col} ${direction}`;
    }

    // ----------------------------------------------------------
    // KPIs globales
    // ----------------------------------------------------------

    async getResumenGlobal() {
        const cached = this.getCached('resumen_global');
        if (cached) return cached;

        const [row] = await this.dataSource.query(
            'SELECT * FROM mv_dashboard_resumen_global LIMIT 1',
        );
        this.setCached('resumen_global', row, 60);
        return row;
    }

    async getPorRegion() {
        const cached = this.getCached('por_region');
        if (cached) return cached;

        const rows = await this.dataSource.query(
            'SELECT * FROM mv_dashboard_por_region ORDER BY departamento',
        );
        this.setCached('por_region', rows, 60);
        return rows;
    }

    async getTimeline() {
        const cached = this.getCached('timeline');
        if (cached) return cached;

        const rows = await this.dataSource.query(
            'SELECT * FROM mv_dashboard_timeline ORDER BY anio',
        );
        this.setCached('timeline', rows, 300);
        return rows;
    }

    async getSalud() {
        const cached = this.getCached('salud');
        if (cached) return cached;

        const [resumen] = await this.dataSource.query(
            'SELECT total_empresas, total_organizaciones, total_proyectos, ultima_actualizacion FROM mv_dashboard_resumen_global LIMIT 1',
        );

        const result = {
            status: 'ok',
            ultima_actualizacion: resumen?.ultima_actualizacion ?? null,
            totales: {
                empresas:       resumen?.total_empresas       ?? 0,
                organizaciones: resumen?.total_organizaciones ?? 0,
                proyectos:      resumen?.total_proyectos      ?? 0,
            },
        };

        this.setCached('salud', result, 30);
        return result;
    }

    // ----------------------------------------------------------
    // Proyectos — listado con filtros completos
    // ----------------------------------------------------------

    async getProyectos(params: FilterProyectosDashboardDto) {
        const { page = 1, limit = 10, area, departamento, municipio, comunidad,
                tipo, ayuda, actor, activo, anio_desde, anio_hasta, search, sort } = params;

        const cacheKey = `proyectos_p${page}_l${limit}_a${area ?? ''}_d${departamento ?? ''}_`
            + `mu${municipio ?? ''}_ci${comunidad ?? ''}_t${tipo ?? ''}_ay${ayuda ?? ''}_`
            + `ac${actor ?? ''}_act${activo ?? ''}_ad${anio_desde ?? ''}_ah${anio_hasta ?? ''}_`
            + `s${search ?? ''}_so${sort ?? ''}`;

        const cached = this.getCached<unknown>(cacheKey);
        if (cached) return cached;

        const filters: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (area !== undefined) {
            filters.push(`mv.id_area = $${idx++}`);
            values.push(area);
        }
        if (activo !== undefined) {
            filters.push(`mv.activo = $${idx++}`);
            values.push(activo);
        }
        if (tipo !== undefined) {
            filters.push(`mv.id_tipo = $${idx++}`);
            values.push(tipo);
        }
        if (anio_desde !== undefined) {
            filters.push(`mv.anio_inicio >= $${idx++}`);
            values.push(anio_desde);
        }
        if (anio_hasta !== undefined) {
            filters.push(`mv.anio_inicio <= $${idx++}`);
            values.push(anio_hasta);
        }
        if (search !== undefined) {
            filters.push(`mv.nombre ILIKE $${idx++}`);
            values.push(`%${search}%`);
        }
        if (departamento !== undefined) {
            filters.push(`mv.id_proyecto IN (
                SELECT lp.id_proyecto FROM localidades_proyectos lp
                JOIN   municipios mu ON lp.id_municipio = mu.id_municipio
                WHERE  mu.id_departamento = $${idx++}
            )`);
            values.push(departamento);
        }
        if (municipio !== undefined) {
            filters.push(`mv.id_proyecto IN (
                SELECT lp.id_proyecto FROM localidades_proyectos lp
                WHERE  lp.id_municipio = $${idx++}
            )`);
            values.push(municipio);
        }
        if (comunidad !== undefined) {
            filters.push(`mv.id_proyecto IN (
                SELECT lp.id_proyecto FROM localidades_proyectos lp
                WHERE  lp.id_comunidad = $${idx++}
            )`);
            values.push(comunidad);
        }
        if (ayuda !== undefined) {
            filters.push(`mv.id_proyecto IN (
                SELECT ayp.id_proyecto FROM ayudas_proyectos ayp
                WHERE  ayp.id_ayuda = $${idx++}
            )`);
            values.push(ayuda);
        }
        if (actor !== undefined) {
            filters.push(`mv.id_proyecto IN (
                SELECT actp.id_proyecto FROM actores_proyectos actp
                WHERE  actp.id_actor = $${idx++}
            )`);
            values.push(actor);
        }

        const where   = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const orderBy = this.buildSort(sort, SORT_FIELDS_PROYECTOS, 'mv.id_proyecto');
        const offset  = (page - 1) * limit;

        const [rows, countResult] = await Promise.all([
            this.dataSource.query(
                `SELECT * FROM mv_proyectos_detalle mv ${where} ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`,
                [...values, limit, offset],
            ),
            this.dataSource.query(
                `SELECT COUNT(*)::int AS total FROM mv_proyectos_detalle mv ${where}`,
                values,
            ),
        ]);

        const total: number = countResult[0]?.total ?? 0;
        const result = {
            data:             rows,
            page,
            limit,
            total,
            pages:            Math.ceil(total / limit),
            filtros_aplicados: params,
        };

        this.setCached(cacheKey, result, 60);
        return result;
    }

    async getProyectoById(id: number) {
        const cacheKey = `proyecto_${id}`;
        const cached = this.getCached<unknown>(cacheKey);
        if (cached) return cached;

        const [row] = await this.dataSource.query(
            'SELECT * FROM mv_proyectos_detalle WHERE id_proyecto = $1 LIMIT 1',
            [id],
        );

        if (!row) throw new MyNotFoundException(`Proyecto con id ${id} no encontrado`);

        this.setCached(cacheKey, row, 120);
        return row;
    }

    // ----------------------------------------------------------
    // Empresas — listado con filtros completos
    // ----------------------------------------------------------

    async getEmpresas(params: FilterEmpresasDashboardDto) {
        const { page = 1, limit = 10, departamento, forma_juridica, motivo, apoyo, ods, search, sort } = params;

        const cacheKey = `empresas_p${page}_l${limit}_d${departamento ?? ''}_fj${forma_juridica ?? ''}_`
            + `m${motivo ?? ''}_a${apoyo ?? ''}_o${ods ?? ''}_s${search ?? ''}_so${sort ?? ''}`;

        const cached = this.getCached<unknown>(cacheKey);
        if (cached) return cached;

        const filters: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (search !== undefined) {
            filters.push(`mv.nombre ILIKE $${idx++}`);
            values.push(`%${search}%`);
        }
        if (forma_juridica !== undefined) {
            filters.push(`(mv.forma_juridica->>'id')::int = $${idx++}`);
            values.push(forma_juridica);
        }
        if (departamento !== undefined) {
            filters.push(`mv.id_empresa IN (
                SELECT de.id_empresa FROM departamentos_empresas de
                WHERE  de.id_departamento = $${idx++}
            )`);
            values.push(departamento);
        }
        if (motivo !== undefined) {
            filters.push(`mv.id_empresa IN (
                SELECT me.id_empresa FROM motivos_empresas me
                WHERE  me.id_motivo = $${idx++}
            )`);
            values.push(motivo);
        }
        if (apoyo !== undefined) {
            filters.push(`mv.id_empresa IN (
                SELECT ae.id_empresa FROM apoyos_empresas ae
                WHERE  ae.id_apoyo = $${idx++}
            )`);
            values.push(apoyo);
        }
        if (ods !== undefined) {
            filters.push(`mv.id_empresa IN (
                SELECT oe.id_empresa FROM ods_empresas oe
                WHERE  oe.id_ods = $${idx++}
            )`);
            values.push(ods);
        }

        const where   = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const orderBy = this.buildSort(sort, SORT_FIELDS_EMPRESAS, 'mv.id_empresa');
        const offset  = (page - 1) * limit;

        const [rows, countResult] = await Promise.all([
            this.dataSource.query(
                `SELECT * FROM mv_empresas_detalle mv ${where} ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`,
                [...values, limit, offset],
            ),
            this.dataSource.query(
                `SELECT COUNT(*)::int AS total FROM mv_empresas_detalle mv ${where}`,
                values,
            ),
        ]);

        const total: number = countResult[0]?.total ?? 0;
        const result = {
            data:             rows,
            page,
            limit,
            total,
            pages:            Math.ceil(total / limit),
            filtros_aplicados: params,
        };

        this.setCached(cacheKey, result, 60);
        return result;
    }

    async getEmpresaById(id: number) {
        const cacheKey = `empresa_${id}`;
        const cached = this.getCached<unknown>(cacheKey);
        if (cached) return cached;

        const [row] = await this.dataSource.query(
            'SELECT * FROM mv_empresas_detalle WHERE id_empresa = $1 LIMIT 1',
            [id],
        );

        if (!row) throw new MyNotFoundException(`Empresa con id ${id} no encontrada`);

        this.setCached(cacheKey, row, 120);
        return row;
    }

    // ----------------------------------------------------------
    // Desglose por tipo de proyecto
    // ----------------------------------------------------------

    async getPorTipo(area?: number, departamento?: number) {
        const cacheKey = `por_tipo_a${area ?? 'all'}_d${departamento ?? 'all'}`;
        const cached = this.getCached<unknown>(cacheKey);
        if (cached) return cached;

        const filters: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (area !== undefined) {
            filters.push(`mv.id_area = $${idx++}`);
            values.push(area);
        }
        if (departamento !== undefined) {
            filters.push(`(mv.id_area, mv.id_tipo) IN (
                SELECT DISTINCT p.id_area, p.id_tipo
                FROM   proyectos p
                JOIN   localidades_proyectos lp ON p.id_proyecto = lp.id_proyecto
                JOIN   municipios mu ON lp.id_municipio = mu.id_municipio
                WHERE  mu.id_departamento = $${idx++}
            )`);
            values.push(departamento);
        }

        const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const rows  = await this.dataSource.query(
            `SELECT * FROM mv_dashboard_por_tipo mv ${where} ORDER BY mv.id_area, mv.tipo_proyecto`,
            values,
        );

        this.setCached(cacheKey, rows, 60);
        return rows;
    }

    // ----------------------------------------------------------
    // Filtros disponibles para el frontend
    // ----------------------------------------------------------

    async getFiltrosDisponibles() {
        const cached = this.getCached<unknown>('filtros_disponibles');
        if (cached) return cached;

        const [
            departamentos,
            tipos_proyecto,
            areas_proyecto,
            tipos_ayuda,
            actores_municipales,
            comunidades_indigenas,
            formas_juridicas,
            motivos_apoyo,
            tipos_apoyo,
            ods,
            tipos_organizacion,
            rangoAnios,
        ] = await Promise.all([
            this.dataSource.query(
                'SELECT id_departamento AS id, nombre, amazonico FROM departamentos ORDER BY nombre',
            ),
            this.dataSource.query(
                "SELECT id_tipo AS id, nombre FROM tipos_proyectos WHERE es_propio = false ORDER BY nombre",
            ),
            this.dataSource.query(
                'SELECT id_area AS id, nombre FROM areas ORDER BY id_area',
            ),
            this.dataSource.query(
                "SELECT id_ayuda AS id, nombre FROM ayudas WHERE es_propio = false ORDER BY nombre",
            ),
            this.dataSource.query(
                "SELECT id_actor AS id, nombre FROM actores_municipales WHERE es_propio = false ORDER BY nombre",
            ),
            this.dataSource.query(
                'SELECT id_comunidad AS id, nombre FROM comunidades_indigenas ORDER BY nombre',
            ),
            this.dataSource.query(
                "SELECT id_forma AS id, nombre FROM formas_juridicas WHERE es_propio = false ORDER BY nombre",
            ),
            this.dataSource.query(
                "SELECT id_motivo AS id, nombre FROM motivos WHERE es_propio = false ORDER BY nombre",
            ),
            this.dataSource.query(
                "SELECT id_apoyo AS id, nombre FROM apoyos WHERE es_propio = false ORDER BY nombre",
            ),
            this.dataSource.query(
                'SELECT id_ods AS id, nombre FROM ods ORDER BY id_ods',
            ),
            this.dataSource.query(
                "SELECT id_tipo AS id, nombre FROM tipos_organizaciones WHERE es_propio = false ORDER BY nombre",
            ),
            this.dataSource.query(`
                SELECT
                  COALESCE(LEAST(
                    (SELECT MIN(anio_inicio_apoyo)   FROM empresas),
                    (SELECT MIN(anio_inicio_trabajo) FROM organizaciones),
                    (SELECT MIN(anio_inicio)         FROM proyectos)
                  ), EXTRACT(YEAR FROM CURRENT_DATE)::int)::int AS desde,
                  EXTRACT(YEAR FROM CURRENT_DATE)::int          AS hasta
            `),
        ]);

        const result = {
            departamentos,
            tipos_proyecto,
            areas_proyecto,
            tipos_ayuda,
            actores_municipales,
            comunidades_indigenas,
            formas_juridicas,
            motivos_apoyo,
            tipos_apoyo,
            ods,
            tipos_organizacion,
            rango_anios: rangoAnios[0] ?? { desde: null, hasta: null },
        };

        this.setCached('filtros_disponibles', result, 300);
        return result;
    }
}
