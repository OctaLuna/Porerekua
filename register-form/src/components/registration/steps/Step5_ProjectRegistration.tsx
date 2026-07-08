import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { ProjectFormData, ProjectFormContext } from '../../../types';
import Button from '../../ui/Button';
import ProjectCard from './project/ProjectCard';
import type { Step5Props } from './project/types';

const buildEmptyProject = (): ProjectFormData => ({
  nombre: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  anioInicio: new Date().getFullYear(),
  anioFin: undefined,
  tipo: {},
  ubicaciones: [{ departamento: '', municipiosTrabajo: [{ idMunicipio: '', idComunidadIndigena: '' }] }],
  ayudas: { seleccionados: [], otros: [] },
  actores: { seleccionados: [], otros: [] },
  area: '',
  conservacion: {
    especies: { seleccionados: [], otros: [] },
    practicasAgricolas: { seleccionados: [], otros: [] },
  },
  desarrollo: { seleccionados: [], otros: [] },
  organizacionesRelacionadas: [],
});

const Step5_ProjectRegistration: React.FC<Step5Props> = (props) => {
  const { control } = useFormContext<ProjectFormContext>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'proyectos',
  });

  const addNewProject = () => {
    if (fields.length < 10) {
      append(buildEmptyProject());
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold mb-2 text-heading-primary dark:text-gray-950">Registro de Proyectos</h3>
      <p className="text-sm text-carbon-muted mb-6">Añada los principales proyectos que su empresa realiza en la Amazonia (máximo 10).</p>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <ProjectCard
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
            {...props}
          />
        ))}
      </div>

      {fields.length < 10 && (
        <Button
          type="button"
          variant="secondary"
          onClick={addNewProject}
          className="mt-6 bg-green-50 dark:bg-opacity-10 text-earth-brown-adaptive dark:text-gray-600 hover:bg-green-100 dark:hover:bg-opacity-20 focus:ring-green-600"
        >
          + Añadir Nuevo Proyecto
        </Button>
      )}
    </div>
  );
};

export default Step5_ProjectRegistration;
