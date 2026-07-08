import { z } from 'zod';

// Catálogos (frontera de entrada: respuestas de la API)

export const namedResourceSchema = z.object({
  id: z.number(),
  nombre: z.string(),
});

export const comunidadIndigenaSchema = namedResourceSchema;

export const municipioSchema = namedResourceSchema.extend({
  comunidadesIndigenas: z.array(comunidadIndigenaSchema),
});

export const departamentoSchema = namedResourceSchema.extend({
  municipios: z.array(municipioSchema),
});

export const formasJuridicasResponseSchema = z.object({ formasJuridicas: z.array(namedResourceSchema) });
export const apoyosResponseSchema = z.object({ apoyos: z.array(namedResourceSchema) });
export const motivosResponseSchema = z.object({ motivos: z.array(namedResourceSchema) });
export const odsResponseSchema = z.object({ ods: z.array(namedResourceSchema) });
export const tiposProyectosResponseSchema = z.object({ tiposProyectos: z.array(namedResourceSchema) });
export const areasResponseSchema = z.object({ areas: z.array(namedResourceSchema) });
export const ayudasResponseSchema = z.object({ ayudas: z.array(namedResourceSchema) });
export const actoresMunicipalesResponseSchema = z.object({ actoresMunicipales: z.array(namedResourceSchema) });
export const especiesResponseSchema = z.object({ especiesAnimales: z.array(namedResourceSchema) });
export const practicasAgricolasResponseSchema = z.object({ practicasAgricolas: z.array(namedResourceSchema) });
export const areasDesarrolloResponseSchema = z.object({ areasDesarrollo: z.array(namedResourceSchema) });
export const departamentosResponseSchema = z.object({ departamentos: z.array(departamentoSchema) });
export const tiposOrganizacionesResponseSchema = z.object({ tiposOrganizaciones: z.array(namedResourceSchema) });

export const commonResponseSchema = z.object({ message: z.string() });

// El catálogo de organizaciones registradas responde con { organizaciones: [...] }
// según la especificación, pero se tolera también un array plano.
export const organizacionesCatalogSchema = z.union([
  z.array(namedResourceSchema),
  z.object({ organizaciones: z.array(namedResourceSchema) }),
]);

// Payloads de registro (frontera de salida: lo que se envía a la API)

export const registerFormaJuridicaSchema = z.object({
  id: z.number().nullable(),
  otro: z.string().nullable(),
});

export const registerAyudasSchema = z.object({
  seleccionados: z.array(z.number()).nullable(),
  otros: z.array(z.string()).nullable(),
});

export const registerActoresSchema = registerAyudasSchema;
export const registerDesarrolloSchema = registerAyudasSchema;
export const registerApoyosSchema = registerAyudasSchema;
export const registerMotivosApoyosSchema = registerAyudasSchema;

export const registerConservacionSchema = z.object({
  especies: registerAyudasSchema,
  practicasAgricolas: registerAyudasSchema,
});

export const registerMunicipioTrabajoSchema = z.object({
  idMunicipio: z.number(),
  idComunidadIndigena: z.number().nullable(),
});

export const registerTipoSchema = z.object({
  id: z.number().nullable(),
  otros: z.string().nullable(),
});

export const registerProyectoSchema = z.object({
  fechaInicio: z.string(),
  fechaFin: z.string().nullable(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  anioInicio: z.number(),
  anioFin: z.number().nullable(),
  tipo: registerTipoSchema,
  departamento: z.number(),
  municipiosTrabajo: z.array(registerMunicipioTrabajoSchema),
  ayudas: registerAyudasSchema.nullable(),
  actores: registerActoresSchema.nullable(),
  area: z.number(),
  conservacion: registerConservacionSchema.nullable(),
  desarrollo: registerDesarrolloSchema.nullable(),
  organizaciones: z.array(z.number()).nullable().optional(),
});

export const registerFormularioEmpresaSchema = z.object({
  nombre: z.string(),
  formaJuridica: registerFormaJuridicaSchema,
  departamentos: z.array(z.number()),
  anioInicioApoyo: z.number(),
  apoyos: registerApoyosSchema,
  organizaciones: z.array(z.string()).nullable(),
  motivosApoyo: registerMotivosApoyosSchema.nullable(),
  ods: z.array(z.number()),
  proyectos: z.array(registerProyectoSchema).nullable(),
});

export const registerFormularioOrganizacionSchema = z.object({
  nombre: z.string(),
  idDepartamento: z.number(),
  esNacional: z.boolean(),
  tipo: registerTipoSchema,
  formaJuridica: registerFormaJuridicaSchema,
  anioInicioTrabajo: z.number(),
  proyectos: z.array(registerProyectoSchema).nullable(),
});
