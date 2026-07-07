/**
 * Simulación de registro de empresa al máximo capacity
 * Este script emula el llenado completo del formulario de empresas
 * respetando los límites de la UI
 */

import type { RegistrationFormData, ProjectFormData } from '../types';
import type { DepartamentoDto, NamedResource } from '../types/api';
import { mapEmpresaFormToDto } from '../utils/empresaFormMapper.js';

// ============================================================================
// DATOS MOCK - Catálogos completos (simulando respuesta de API)
// ============================================================================

const mockDepartamentos: DepartamentoDto[] = [
  { id: 1, nombre: 'Beni', municipios: [
    { id: 101, nombre: 'Trinidad', comunidadesIndigenas: [
      { id: 1001, nombre: 'Comunidad Yucaré' },
      { id: 1002, nombre: 'Comunidad San José' },
      { id: 1003, nombre: 'Comunidad El Cerro' },
    ]},
    { id: 102, nombre: 'San Ignacio de Moxos', comunidadesIndigenas: [
      { id: 1004, nombre: 'Comunidad Santa Ana' },
      { id: 1005, nombre: 'Comunidad San Luis' },
    ]},
    { id: 103, nombre: 'Reyes', comunidadesIndigenas: [
      { id: 1006, nombre: 'Comunidad Santiago' },
    ]},
    { id: 104, nombre: 'Riberalta', comunidadesIndigenas: [
      { id: 1007, nombre: 'Comunidad El Sena' },
      { id: 1008, nombre: 'Comunidad Puerto Gonzalo' },
    ]},
  ]},
  { id: 2, nombre: 'Pando', municipios: [
    { id: 201, nombre: 'Cobija', comunidadesIndigenas: [
      { id: 2001, nombre: 'Comunidad Filadelfia' },
      { id: 2002, nombre: 'Comunidad Bella Flor' },
    ]},
    { id: 202, nombre: 'Puerto Gonzalo Moreno', comunidadesIndigenas: [
      { id: 2003, nombre: 'Comunidad Porvenir' },
    ]},
    { id: 203, nombre: 'Filadelfia', comunidadesIndigenas: [
      { id: 2004, nombre: 'Comunidad El Sena' },
    ]},
  ]},
  { id: 3, nombre: 'La Paz', municipios: [
    { id: 301, nombre: 'La Paz', comunidadesIndigenas: [
      { id: 3001, nombre: 'Comunidad Achacachi' },
      { id: 3002, nombre: 'Comunidad Warisata' },
    ]},
    { id: 302, nombre: 'Apolo', comunidadesIndigenas: [
      { id: 3003, nombre: 'Comunidad Tacana' },
      { id: 3004, nombre: 'Comunidad Araona' },
    ]},
    { id: 303, nombre: 'Guanay', comunidadesIndigenas: [
      { id: 3005, nombre: 'Comunidad Kallawaya' },
    ]},
  ]},
  { id: 4, nombre: 'Cochabamba', municipios: [
    { id: 401, nombre: 'Cochabamba', comunidadesIndigenas: [
      { id: 4001, nombre: 'Comunidad Tiraque' },
    ]},
    { id: 402, nombre: 'Villa Tunari', comunidadesIndigenas: [
      { id: 4002, nombre: 'Comunidad Chimán' },
      { id: 4003, nombre: 'Comunidad Isiboro' },
    ]},
  ]},
  { id: 5, nombre: 'Santa Cruz', municipios: [
    { id: 501, nombre: 'Santa Cruz de la Sierra', comunidadesIndigenas: [
      { id: 5001, nombre: 'Comunidad Guabirá' },
    ]},
    { id: 502, nombre: 'Buena Vista', comunidadesIndigenas: [
      { id: 5002, nombre: 'Comunidad Yapacaní' },
      { id: 5003, nombre: 'Comunidad San Carlos' },
    ]},
    { id: 503, nombre: 'San Ignacio de Velasco', comunidadesIndigenas: [
      { id: 5004, nombre: 'Comunidad Chiquitana' },
      { id: 5005, nombre: 'Comunidad Concepción' },
    ]},
  ]},
  { id: 6, nombre: 'Tarija', municipios: [
    { id: 601, nombre: 'Tarija', comunidadesIndigenas: [
      { id: 6001, nombre: 'Comunidad El Chaco' },
    ]},
    { id: 602, nombre: 'Yacuiba', comunidadesIndigenas: [
      { id: 6002, nombre: 'Comunidad Guarani' },
      { id: 6003, nombre: 'Comunidad Weenhayek' },
    ]},
  ]},
  { id: 7, nombre: 'Chuquisaca', municipios: [
    { id: 701, nombre: 'Sucre', comunidadesIndigenas: [
      { id: 7001, nombre: 'Comunidad Yampara' },
    ]},
    { id: 702, nombre: 'Presto', comunidadesIndigenas: [
      { id: 7002, nombre: 'Comunidad Mojocoya' },
    ]},
  ]},
  { id: 8, nombre: 'Potosí', municipios: [
    { id: 801, nombre: 'Potosí', comunidadesIndigenas: [
      { id: 8001, nombre: 'Comunidad Quechua' },
    ]},
    { id: 802, nombre: 'Uyuni', comunidadesIndigenas: [
      { id: 8002, nombre: 'Comunidad Lipez' },
    ]},
  ]},
  { id: 9, nombre: 'Oruro', municipios: [
    { id: 901, nombre: 'Oruro', comunidadesIndigenas: [
      { id: 9001, nombre: 'Comunidad Uru Uru' },
    ]},
    { id: 902, nombre: 'Carangas', comunidadesIndigenas: [
      { id: 9002, nombre: 'Comunidad Chipaya' },
    ]},
  ]},
];

const mockLegalForms: NamedResource[] = [
  { id: 1, nombre: 'Sociedad Anónima (S.A.)' },
  { id: 2, nombre: 'Sociedad de Responsabilidad Limitada (S.R.L.)' },
  { id: 3, nombre: 'Empresa Unipersonal' },
  { id: 4, nombre: 'Sociedad Colectiva' },
  { id: 5, nombre: 'Sociedad en Comandita' },
];

const mockSupports: NamedResource[] = [
  { id: 1, nombre: 'Financiero' },
  { id: 2, nombre: 'Técnico' },
  { id: 3, nombre: 'Tecnológico' },
  { id: 4, nombre: 'Capacitación' },
  { id: 5, nombre: 'Equipamiento' },
  { id: 6, nombre: 'Infraestructura' },
];

const mockMotives: NamedResource[] = [
  { id: 1, nombre: 'Responsabilidad Social Empresarial' },
  { id: 2, nombre: 'Sostenibilidad ambiental' },
  { id: 3, nombre: 'Compromiso con comunidades locales' },
  { id: 4, nombre: 'Preservación cultural' },
  { id: 5, nombre: 'Desarrollo económico local' },
  { id: 6, nombre: 'Conservación de biodiversidad' },
];

const mockOds: NamedResource[] = [
  { id: 1, nombre: 'ODS 1: Fin de la pobreza' },
  { id: 2, nombre: 'ODS 2: Hambre cero' },
  { id: 3, nombre: 'ODS 3: Salud y bienestar' },
  { id: 4, nombre: 'ODS 4: Educación de calidad' },
  { id: 5, nombre: 'ODS 5: Igualdad de género' },
  { id: 6, nombre: 'ODS 6: Agua limpia y saneamiento' },
  { id: 7, nombre: 'ODS 7: Energía asequible y no contaminante' },
  { id: 8, nombre: 'ODS 8: Trabajo decente y crecimiento económico' },
  { id: 9, nombre: 'ODS 9: Industria, innovación e infraestructura' },
  { id: 10, nombre: 'ODS 10: Reducción de las desigualdades' },
  { id: 11, nombre: 'ODS 11: Ciudades y comunidades sostenibles' },
  { id: 12, nombre: 'ODS 12: Producción y consumo responsables' },
  { id: 13, nombre: 'ODS 13: Acción por el clima' },
  { id: 14, nombre: 'ODS 14: Vida submarina' },
  { id: 15, nombre: 'ODS 15: Vida de ecosistemas terrestres' },
  { id: 16, nombre: 'ODS 16: Paz, justicia e instituciones sólidas' },
  { id: 17, nombre: 'ODS 17: Alianzas para lograr los objetivos' },
];

const mockProjectTypes: NamedResource[] = [
  { id: 1, nombre: 'Conservación' },
  { id: 2, nombre: 'Desarrollo sostenible' },
  { id: 3, nombre: 'Investigación' },
  { id: 4, nombre: 'Ecoturismo' },
  { id: 5, nombre: 'Agroforestería' },
];

const mockProjectAreas: NamedResource[] = [
  { id: 1, nombre: 'Conservación de Ecosistemas' },
  { id: 2, nombre: 'Desarrollo de Comunidades Indígenas' },
  { id: 3, nombre: 'Investigación y Monitoreo' },
];

const mockHelpTypes: NamedResource[] = [
  { id: 1, nombre: 'Apoyo financiero directo' },
  { id: 2, nombre: 'Donación de equipos' },
  { id: 3, nombre: 'Capacitación técnica' },
  { id: 4, nombre: 'Asesoría legal' },
  { id: 5, nombre: 'Voluntariado corporativo' },
  { id: 6, nombre: 'Alianzas estratégicas' },
];

const mockLocalActors: NamedResource[] = [
  { id: 1, nombre: 'Comunidades indígenas' },
  { id: 2, nombre: 'Gobiernos locales' },
  { id: 3, nombre: 'ONGs ambientales' },
  { id: 4, nombre: 'Universidades' },
  { id: 5, nombre: 'Cooperativas' },
  { id: 6, nombre: 'Asociaciones de productores' },
];

const mockSpecies: NamedResource[] = [
  { id: 1, nombre: 'Jaguar' },
  { id: 2, nombre: 'Delfín rosado' },
  { id: 3, nombre: 'Guacamayo rojo' },
  { id: 4, nombre: 'Tapir amazónico' },
  { id: 5, nombre: 'Mono araña' },
  { id: 6, nombre: 'Caimán negro' },
  { id: 7, nombre: 'Anaconda' },
  { id: 8, nombre: 'Águila arpía' },
];

const mockAgriculturalPractices: NamedResource[] = [
  { id: 1, nombre: 'Agroforestería tradicional' },
  { id: 2, nombre: 'Agricultura de rotación' },
  { id: 3, nombre: 'Sistemas silvopastoriles' },
  { id: 4, nombre: 'Cosecha sostenible' },
  { id: 5, nombre: 'Manejo integrado de plagas' },
  { id: 6, nombre: 'Conservación de suelos' },
];

const mockDevelopmentAreas: NamedResource[] = [
  { id: 1, nombre: 'Salud comunitaria' },
  { id: 2, nombre: 'Educación intercultural' },
  { id: 3, nombre: 'Infraestructura comunitaria' },
  { id: 4, nombre: 'Economía local sostenible' },
  { id: 5, nombre: 'Fortalecimiento organizativo' },
  { id: 6, nombre: 'Gestión territorial' },
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function generateLongText(maxLength: number): string {
  const words = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');
  let result = '';
  while (result.length < maxLength) {
    const word = words[Math.floor(Math.random() * words.length)];
    result += (result.length > 0 ? ' ' : '') + word;
  }
  return result.substring(0, maxLength);
}

function getAllMunicipiosFromDepartamento(depId: number): { id: number; nombre: string; comunidadesIndigenas: { id: number; nombre: string }[] }[] {
  const dep = mockDepartamentos.find(d => d.id === depId);
  return dep?.municipios || [];
}

// ============================================================================
// CONSTRUCCIÓN DEL FORMULARIO MÁXIMO
// ============================================================================

function buildMaxEmpresaForm(): RegistrationFormData {
  const currentYear = new Date().getFullYear();
  
  // IDs de organizaciones relacionadas (simulamos que ya hay 5 organizaciones registradas)
  const mockOrgIds = ['1', '2', '3', '4', '5'];
  
  // Construir 10 proyectos al máximo
  const proyectos: ProjectFormData[] = [];
  
  for (let i = 0; i < 10; i++) {
    const proyecto = buildMaxProject(i, currentYear, mockOrgIds);
    proyectos.push(proyecto);
  }
  
  const form: RegistrationFormData = {
    nombre: 'Empresa Amazónica de Conservación y Desarrollo Sostenible S.A.',
    cargo: 'Director Ejecutivo de Sostenibilidad y Relaciones Comunitarias',
    formaJuridica: {
      id: '1', // Sociedad Anónima
      otro: 'Sociedad Anónima Mixta con participación estatal y privada',
    },
    departamentos: mockDepartamentos.map(d => String(d.id)), // Todos los 9 departamentos
    haApoyado: 'Si',
    anioInicioApoyo: 1990,
    apoyos: {
      seleccionados: mockSupports.map(s => String(s.id)), // Todos los apoyos
      otros: [
        'Transferencia de tecnología verde',
        'Investigación aplicada',
        'Desarrollo de patentes ecológicas',
        'Consultoría especializada',
      ],
    },
    motivosApoyo: {
      seleccionados: mockMotives.map(m => String(m.id)), // Todos los motivos
      otros: [
        'Compromiso con futuras generaciones',
        'Liderazgo en sostenibilidad',
        'Innovación ambiental',
      ],
    },
    ods: mockOds.map(o => String(o.id)), // Todos los 17 ODS
    workArea: 'Desarrollo de Comunidades Indígenas',
    communityDevTypes: [
      'Salud comunitaria',
      'Educación',
      'Infraestructura',
      'Economía local',
      'Cultura y tradición',
    ],
    proyectos,
  };
  
  return form;
}

function buildMaxProject(index: number, currentYear: number, orgIds: string[]): ProjectFormData {
  // Cada proyecto usa diferentes combinaciones de ubicaciones
  // Para maximizar, usaremos todos los departamentos en el primer proyecto
  // y combinaciones en los siguientes
  
  const ubicaciones = [];
  
  if (index === 0) {
    // Primer proyecto: TODOS los departamentos con múltiples municipios
    mockDepartamentos.forEach(dep => {
      const municipiosTrabajo = dep.municipios.map(mun => ({
        idMunicipio: String(mun.id),
        idComunidadIndigena: mun.comunidadesIndigenas.length > 0 
          ? String(mun.comunidadesIndigenas[0].id) 
          : '',
      }));
      ubicaciones.push({
        departamento: String(dep.id),
        municipiosTrabajo,
      });
    });
  } else {
    // Proyectos siguientes: algunos departamentos con algunos municipios
    const numDeps = Math.min(3, mockDepartamentos.length);
    const startDepIndex = (index * 2) % mockDepartamentos.length;
    
    for (let d = 0; d < numDeps; d++) {
      const depIndex = (startDepIndex + d) % mockDepartamentos.length;
      const dep = mockDepartamentos[depIndex];
      const numMun = Math.min(2, dep.municipios.length);
      
      const municipiosTrabajo = [];
      for (let m = 0; m < numMun; m++) {
        const mun = dep.municipios[m];
        municipiosTrabajo.push({
          idMunicipio: String(mun.id),
          idComunidadIndigena: mun.comunidadesIndigenas.length > 0
            ? String(mun.comunidadesIndigenas[m % mun.comunidadesIndigenas.length].id)
            : '',
        });
      }
      
      ubicaciones.push({
        departamento: String(dep.id),
        municipiosTrabajo,
      });
    }
  }
  
  // Alternar entre áreas para activar conservación y desarrollo
  const areaId = index % 2 === 0 ? '1' : '2'; // 1=Conservación, 2=Desarrollo
  
  const proyecto: ProjectFormData = {
    nombre: `Proyecto Amazónico Integral ${index + 1}: ${generateLongText(50)}`,
    descripcion: generateLongText(500),
    fechaInicio: '1995-03-15',
    fechaFin: index % 3 === 0 ? '2025-12-31' : undefined, // Algunos proyectos tienen fecha fin
    anioInicio: 1995 + index,
    anioFin: index % 3 === 0 ? currentYear : undefined,
    tipo: {
      id: String((index % 5) + 1), // Rotar entre tipos
      otros: index % 5 === 4 ? 'Proyecto innovador de biotecnología amazónica' : undefined,
    },
    ubicaciones,
    ayudas: {
      seleccionados: mockHelpTypes.map(h => String(h.id)), // Todas las ayudas
      otros: [
        'Mentoría empresarial',
        'Acceso a mercados',
        'Certificación sostenible',
      ],
    },
    actores: {
      seleccionados: mockLocalActors.map(a => String(a.id)), // Todos los actores
      otros: [
        'Redes de comercio justo',
        'Organizaciones de mujeres',
        'Colectivos juveniles',
      ],
    },
    area: areaId,
    conservacion: {
      especies: {
        seleccionados: mockSpecies.map(s => String(s.id)), // Todas las especies
        otros: [
          'Oso andino',
          'Loro militar',
          'Nutria gigante',
        ],
      },
      practicasAgricolas: {
        seleccionados: mockAgriculturalPractices.map(p => String(p.id)), // Todas las prácticas
        otros: [
          'Manejo de semillas nativas',
          'Técnicas ancestrales',
          'Biofertilizantes',
        ],
      },
    },
    desarrollo: {
      seleccionados: mockDevelopmentAreas.map(da => String(da.id)), // Todas las áreas
      otros: [
        'Soberanía alimentaria',
        'Turismo comunitario',
        'Artesanías tradicionales',
      ],
    },
    organizacionesRelacionadas: orgIds, // Todas las organizaciones
  };
  
  return proyecto;
}

// ============================================================================
// CÁLCULO DE TAMAÑO
// ============================================================================

function calculateSize(obj: any): { jsonSize: number; jsonSizeMB: number; estimatedDBSize: number; estimatedDBSizeMB: number } {
  const json = JSON.stringify(obj, null, 2);
  const jsonBytes = new TextEncoder().encode(json).length;
  const jsonSizeMB = jsonBytes / (1024 * 1024);
  
  // Estimado de base de datos:
  // - PostgreSQL/MySQL tienen overhead de ~20-40% por fila
  // - Índices añaden ~10-20%
  // - Metadatos y estructura ~5-10%
  // Total estimado: ~1.5x a 2x el tamaño JSON
  const dbMultiplier = 1.7; // Promedio conservador
  const estimatedDBBytes = jsonBytes * dbMultiplier;
  const estimatedDBSizeMB = estimatedDBBytes / (1024 * 1024);
  
  return {
    jsonSize: jsonBytes,
    jsonSizeMB,
    estimatedDBSize: estimatedDBBytes,
    estimatedDBSizeMB,
  };
}

// ============================================================================
// EJECUCIÓN DE LA SIMULACIÓN
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('  SIMULACIÓN: Registro de Empresa al Máximo Capacity');
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Construir formulario máximo
console.log('📝 Construyendo formulario de empresa con datos máximos...\n');
const maxForm = buildMaxEmpresaForm();

// 2. Mostrar resumen de la empresa
console.log('🏢 DATOS DE LA EMPRESA:');
console.log(`   Nombre: ${maxForm.nombre}`);
console.log(`   Cargo: ${maxForm.cargo}`);
console.log(`   Forma Jurídica: ${maxForm.formaJuridica.id} - ${maxForm.formaJuridica.otro}`);
console.log(`   Departamentos: ${maxForm.departamentos.length} (todos)`);
console.log(`   Ha apoyado: ${maxForm.haApoyado}`);
console.log(`   Año inicio apoyo: ${maxForm.anioInicioApoyo}`);
console.log(`   Tipos de apoyo: ${maxForm.apoyos.seleccionados.length} seleccionados + ${maxForm.apoyos.otros.length} otros`);
console.log(`   Motivos: ${maxForm.motivosApoyo.seleccionados.length} seleccionados + ${maxForm.motivosApoyo.otros.length} otros`);
console.log(`   ODS: ${maxForm.ods.length} seleccionados`);
console.log(`   Área de trabajo: ${maxForm.workArea}`);
console.log(`   Sub-áreas: ${maxForm.communityDevTypes?.length || 0} seleccionadas\n`);

// 3. Mostrar resumen de proyectos
console.log(`📊 PROYECTOS: ${maxForm.proyectos.length} proyectos (máximo permitido)\n`);

maxForm.proyectos.forEach((proyecto, index) => {
  console.log(`   Proyecto #${index + 1}:`);
  console.log(`      Nombre: ${proyecto.nombre.substring(0, 60)}...`);
  console.log(`      Ubicaciones: ${proyecto.ubicaciones.length} departamentos`);
  
  let totalMunicipios = 0;
  proyecto.ubicaciones.forEach(ubic => {
    totalMunicipios += ubic.municipiosTrabajo.length;
  });
  console.log(`      Municipios totales: ${totalMunicipios}`);
  console.log(`      Ayudas: ${proyecto.ayudas.seleccionados.length} + ${proyecto.ayudas.otros.length} otros`);
  console.log(`      Actores: ${proyecto.actores.seleccionados.length} + ${proyecto.actores.otros.length} otros`);
  console.log(`      Área: ${proyecto.area}`);
  
  if (proyecto.conservacion) {
    console.log(`      Especies: ${proyecto.conservacion.especies.seleccionados.length} + ${proyecto.conservacion.especies.otros.length} otros`);
    console.log(`      Prácticas: ${proyecto.conservacion.practicasAgricolas.seleccionados.length} + ${proyecto.conservacion.practicasAgricolas.otros.length} otros`);
  }
  
  if (proyecto.desarrollo) {
    console.log(`      Áreas desarrollo: ${proyecto.desarrollo.seleccionados.length} + ${proyecto.desarrollo.otros.length} otros`);
  }
  
  console.log(`      Organizaciones relacionadas: ${proyecto.organizacionesRelacionadas?.length || 0}\n`);
});

// 4. Mapear a DTO (como se enviaría a la API)
console.log('🔄 Mapeando a DTO para envío a API...\n');
const dto = mapEmpresaFormToDto(maxForm);

// 5. Calcular tamaños
console.log('💾 CÁLCULO DE TAMAÑO EN BASE DE DATOS:\n');
const sizeInfo = calculateSize(dto);

console.log(`   Tamaño JSON (crudo):`);
console.log(`      Bytes: ${sizeInfo.jsonSize.toLocaleString()}`);
console.log(`      KB: ${(sizeInfo.jsonSize / 1024).toFixed(2)} KB`);
console.log(`      MB: ${sizeInfo.jsonSizeMB.toFixed(4)} MB`);
console.log('');
console.log(`   Tamaño estimado en Base de Datos (PostgreSQL/MySQL):`);
console.log(`      Factor de overhead: 1.7x`);
console.log(`      Bytes: ${sizeInfo.estimatedDBSize.toLocaleString()}`);
console.log(`      KB: ${(sizeInfo.estimatedDBSize / 1024).toFixed(2)} KB`);
console.log(`      MB: ${sizeInfo.estimatedDBSizeMB.toFixed(4)} MB`);
console.log('');

// 6. Desglose por componentes
console.log('📈 DESGLOSE DETALLADO:\n');

const numProyectos = maxForm.proyectos.length;
const avgProjectSize = sizeInfo.jsonSize / (1 + numProyectos); // 1 para empresa + N proyectos
const empresaSize = avgProjectSize * 0.3; // La empresa es ~30% del total
const proyectosSize = sizeInfo.jsonSize - empresaSize;

console.log(`   Datos de empresa: ~${(empresaSize / 1024).toFixed(2)} KB`);
console.log(`   Datos de proyectos: ~${(proyectosSize / 1024).toFixed(2)} KB (${numProyectos} proyectos)`);
console.log(`   Promedio por proyecto: ~${(avgProjectSize / 1024).toFixed(2)} KB`);
console.log('');

// 7. Mostrar JSON completo (primera parte)
console.log('📋 MUESTRA DEL JSON GENERADO (primeros 2000 caracteres):\n');
const fullJson = JSON.stringify(dto, null, 2);
console.log(fullJson.substring(0, 2000) + '...\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  RESULTADOS FINALES');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  ✅ Empresa registrada con ${numProyectos} proyectos al máximo`);
console.log(`  ✅ Todos los campos llenos al máximo capacity de la UI`);
console.log(`  ✅ Tamaño en BD estimado: ${sizeInfo.estimatedDBSizeMB.toFixed(4)} MB`);
console.log(`  ✅ Tamaño JSON: ${sizeInfo.jsonSizeMB.toFixed(4)} MB`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Exportar para posible uso posterior
export { maxForm, dto, sizeInfo };