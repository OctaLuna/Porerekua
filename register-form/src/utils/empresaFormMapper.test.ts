import { describe, expect, it } from 'vitest';
import { mapEmpresaFormToDto, mapOrganizationFormToDto } from './empresaFormMapper';
import type { OrganizationFormData, ProjectFormData, RegistrationFormData } from '../types';

const buildProject = (overrides: Partial<ProjectFormData> = {}): ProjectFormData => ({
  nombre: 'Proyecto de conservación',
  descripcion: '',
  fechaInicio: '2024-03-15',
  fechaFin: '',
  anioInicio: 2024,
  anioFin: undefined,
  tipo: {},
  ubicaciones: [{ departamento: '1', municipiosTrabajo: [{ idMunicipio: '10', idComunidadIndigena: '' }] }],
  ayudas: { seleccionados: [], otros: [] },
  actores: { seleccionados: [], otros: [] },
  area: '2',
  conservacion: {
    especies: { seleccionados: [], otros: [] },
    practicasAgricolas: { seleccionados: [], otros: [] },
  },
  desarrollo: { seleccionados: [], otros: [] },
  organizacionesRelacionadas: [],
  ...overrides,
});

const buildRegistrationForm = (overrides: Partial<RegistrationFormData> = {}): RegistrationFormData => ({
  nombre: '  Empresa Amazónica  ',
  cargo: 'Gerente',
  formaJuridica: { id: '3', otro: '' },
  departamentos: ['1', '2'],
  haApoyado: 'Si',
  anioInicioApoyo: 2023,
  apoyos: { seleccionados: ['1', '2'], otros: ['  Mentoría  ', ''] },
  motivosApoyo: { seleccionados: [], otros: [] },
  ods: ['1', '13'],
  proyectos: [],
  ...overrides,
});

describe('mapEmpresaFormToDto', () => {
  it('trims the company name and converts catalog ids to numbers', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm());

    expect(dto.nombre).toBe('Empresa Amazónica');
    expect(dto.formaJuridica).toEqual({ id: 3, otro: null });
    expect(dto.departamentos).toEqual([1, 2]);
    expect(dto.ods).toEqual([1, 13]);
  });

  it('maps "otro" legal form selection to a null id with the free-text value', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      formaJuridica: { id: '__other__', otro: 'Cooperativa' },
    }));

    expect(dto.formaJuridica).toEqual({ id: null, otro: 'Cooperativa' });
  });

  it('sanitizes "otros" free-text entries, dropping blanks and trimming whitespace', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm());

    expect(dto.apoyos).toEqual({ seleccionados: [1, 2], otros: ['Mentoría'] });
  });

  it('nulls out motivosApoyo when nothing was selected', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm());

    expect(dto.motivosApoyo).toBeNull();
  });

  it('nulls out proyectos when the list is empty', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({ proyectos: [] }));

    expect(dto.proyectos).toBeNull();
  });

  it('drops a project with no name', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      proyectos: [buildProject({ nombre: '   ' })],
    }));

    expect(dto.proyectos).toBeNull();
  });

  it('drops a project whose area is not a valid catalog id', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      proyectos: [buildProject({ area: '' })],
    }));

    expect(dto.proyectos).toBeNull();
  });

  it('reformats project dates from yyyy-mm-dd to dd-mm-yyyy', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      proyectos: [buildProject({ fechaInicio: '2024-03-15', fechaFin: '2024-06-01' })],
    }));

    expect(dto.proyectos?.[0].fechaInicio).toBe('15-03-2024');
    expect(dto.proyectos?.[0].fechaFin).toBe('01-06-2024');
  });

  it('emits one DTO entry per ubicación, all sharing the project base fields', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      proyectos: [buildProject({
        ubicaciones: [
          { departamento: '1', municipiosTrabajo: [{ idMunicipio: '10' }] },
          { departamento: '2', municipiosTrabajo: [{ idMunicipio: '20', idComunidadIndigena: '200' }] },
        ],
      })],
    }));

    expect(dto.proyectos).toHaveLength(2);
    expect(dto.proyectos?.[0]).toMatchObject({ departamento: 1, municipiosTrabajo: [{ idMunicipio: 10, idComunidadIndigena: null }] });
    expect(dto.proyectos?.[1]).toMatchObject({ departamento: 2, municipiosTrabajo: [{ idMunicipio: 20, idComunidadIndigena: 200 }] });
  });

  it('skips a ubicación with an invalid departamento id', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      proyectos: [buildProject({
        ubicaciones: [{ departamento: 'not-a-number', municipiosTrabajo: [{ idMunicipio: '10' }] }],
      })],
    }));

    expect(dto.proyectos).toBeNull();
  });

  it('skips a ubicación with no valid municipios', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      proyectos: [buildProject({
        ubicaciones: [{ departamento: '1', municipiosTrabajo: [{ idMunicipio: 'not-a-number' }] }],
      })],
    }));

    expect(dto.proyectos).toBeNull();
  });

  it('nulls conservacion/ayudas/actores/desarrollo when nothing was selected', () => {
    const dto = mapEmpresaFormToDto(buildRegistrationForm({
      proyectos: [buildProject()],
    }));

    const [proyecto] = dto.proyectos ?? [];
    expect(proyecto.ayudas).toBeNull();
    expect(proyecto.actores).toBeNull();
    expect(proyecto.conservacion).toBeNull();
    expect(proyecto.desarrollo).toBeNull();
  });
});

describe('mapOrganizationFormToDto', () => {
  const buildOrganizationForm = (overrides: Partial<OrganizationFormData> = {}): OrganizationFormData => ({
    nombre: '  Fundación Bosque Vivo  ',
    tipo: { id: '2', otros: '' },
    formaJuridica: { id: '1', otro: '' },
    idDepartamento: '4',
    esNacional: 'Si',
    anioInicioTrabajo: 2019,
    proyectos: [],
    ...overrides,
  });

  it('trims the name and converts esNacional to a boolean', () => {
    const dto = mapOrganizationFormToDto(buildOrganizationForm());

    expect(dto.nombre).toBe('Fundación Bosque Vivo');
    expect(dto.esNacional).toBe(true);
    expect(dto.idDepartamento).toBe(4);
  });

  it('maps esNacional "No" to false', () => {
    const dto = mapOrganizationFormToDto(buildOrganizationForm({ esNacional: 'No' }));

    expect(dto.esNacional).toBe(false);
  });

  it('falls back idDepartamento to 0 when not a valid number', () => {
    const dto = mapOrganizationFormToDto(buildOrganizationForm({ idDepartamento: '' }));

    expect(dto.idDepartamento).toBe(0);
  });
});
