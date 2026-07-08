import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { RegistrationFormData } from '../../../types';
import type { NamedResource } from '../../../types/api';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import Checkbox from '../../ui/Checkbox';
import Button from '../../ui/Button';

type Step2AmazoniaRelationProps = {
  supports: NamedResource[];
};

const Step2AmazoniaRelation: React.FC<Step2AmazoniaRelationProps> = ({ supports }) => {
  const { register, formState: { errors }, watch, setValue } = useFormContext<RegistrationFormData>();
  const currentYear = new Date().getFullYear();
  const hasSupported = watch('haApoyado');
  const supportOthers = (watch('apoyos.otros') as string[] | undefined) ?? [];

  const addOtherSupport = () => {
    setValue('apoyos.otros', [...supportOthers, '']);
  };

  const removeOtherSupport = (index: number) => {
    setValue('apoyos.otros', supportOthers.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    if (hasSupported !== 'Si') {
      setValue('anioInicioApoyo', undefined);
      setValue('apoyos.seleccionados', []);
      setValue('apoyos.otros', []);
    }
  }, [hasSupported, setValue]);

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold mb-6 text-earth-brown-adaptive">Relación con la Amazonia</h3>
      <Select
        label="¿Su empresa ha apoyado proyectos de conservación o desarrollo en la Amazonia?"
        {...register('haApoyado', { required: 'Este campo es requerido' })}
        error={errors.haApoyado?.message}
      >
        <option value="">Seleccione...</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        <option value="No, pero tiene intención">No, pero tiene intención de hacerlo</option>
      </Select>

      {hasSupported === 'Si' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 animate-fade-in">
          <Input
            label="Año de inicio del apoyo"
            type="number"
            {...register('anioInicioApoyo', {
              valueAsNumber: true,
              required: 'Campo requerido',
              min: { value: 1900, message: 'Año inválido' },
              max: { value: currentYear, message: 'El año no puede ser mayor al año actual' },
            })}
            error={errors.anioInicioApoyo?.message}
          />

          <div className="md:col-span-2">
            <p className="form-label question-accent">¿Qué tipo de apoyo ha brindado?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {supports.map(({ id, nombre }) => (
                <Checkbox
                  key={id}
                  label={nombre}
                  value={String(id)}
                  {...register('apoyos.seleccionados', { required: 'Seleccione al menos un tipo de apoyo' })}
                />
              ))}
            </div>
            {errors.apoyos?.seleccionados && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apoyos?.seleccionados?.message}</p>
            )}

            <div className="mt-6">
              <p className="form-sublabel">Otros apoyos (opcional)</p>
              {supportOthers?.map((_: unknown, index: number) => (
                <div key={`apoyo-otro-${index}`} className="flex items-center gap-3 mb-2">
                  <Input
                    label={index === 0 ? 'Descripción' : ''}
                    placeholder="Describa el apoyo"
                    {...register(`apoyos.otros.${index}` as const)}
                  />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeOtherSupport(index)}>
                    Quitar
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addOtherSupport}>
                + Añadir otro apoyo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2AmazoniaRelation;