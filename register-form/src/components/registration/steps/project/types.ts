import type { DepartamentoDto, NamedResource } from '../../../../types/api';

export type Step5Props = {
  departments: DepartamentoDto[];
  projectTypes: NamedResource[];
  projectAreas: NamedResource[];
  helpTypes: NamedResource[];
  localActors: NamedResource[];
  species: NamedResource[];
  agriculturalPractices: NamedResource[];
  developmentAreas: NamedResource[];
};
