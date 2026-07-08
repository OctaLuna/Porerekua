import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { RegistrationFormData } from '../../../types';

// Opciones locales para áreas dentro de 'Desarrollo de Comunidades Indígenas'.
// Se mantienen aquí para evitar dependencia en un export adicional de tipos.
const COMMUNITY_DEV_TYPES = [
  'Salud comunitaria',
  'Educación',
  'Infraestructura',
  'Economía local',
  'Cultura y tradición',
];
import Select from '../../ui/Select';
import Checkbox from '../../ui/Checkbox';

const Step4WorkAreas: React.FC = () => {
  const { register, formState: { errors }, watch } = useFormContext<RegistrationFormData>();
  const workArea = watch('workArea');

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold mb-6 text-earth-brown-adaptive">Áreas de Trabajo</h3>
      <Select
        label="¿En cuál de las siguientes áreas le interesaría trabajar principalmente?"
        {...register('workArea', { required: 'Debe seleccionar un área' })}
        error={errors.workArea?.message}
      >
        <option value="">Seleccione...</option>
        <option value="Conservación de Ecosistemas">Conservación de Ecosistemas</option>
        <option value="Desarrollo de Comunidades Indígenas">Desarrollo de Comunidades Indígenas</option>
        <option value="Investigación y Monitoreo">Investigación y Monitoreo</option>
        <option value="Otro">Otro</option>
      </Select>

      {workArea === 'Desarrollo de Comunidades Indígenas' && (
        <div className="mt-6 animate-fade-in">
          <p className="form-label question-accent">
            Especifique las áreas de interés en Desarrollo de Comunidades Indígenas:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {COMMUNITY_DEV_TYPES.map(type => (
              <Checkbox
                key={type}
                label={type}
                value={type}
                {...register('communityDevTypes')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4WorkAreas;