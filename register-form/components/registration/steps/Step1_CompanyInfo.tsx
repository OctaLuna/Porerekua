import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { RegistrationFormData } from '../../../types';
import type { DepartamentoDto, NamedResource } from '../../../types/api';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';

type Step1CompanyInfoProps = {
  legalForms: NamedResource[];
  departments: DepartamentoDto[];
};

const OTHER_OPTION = '__other__';

const Step1CompanyInfo: React.FC<Step1CompanyInfoProps> = ({ legalForms, departments }) => {
  const { register, formState: { errors }, watch, setValue } = useFormContext<RegistrationFormData>();

  const selectedLegalFormId = watch('formaJuridica.id');
  const departmentsValue = watch('departamentos') ?? [];

  useEffect(() => {
    // ensure at least one department input exists
    if (!departmentsValue || departmentsValue.length === 0) {
      setValue('departamentos', ['']);
    }
  }, [departmentsValue, setValue]);

  useEffect(() => {
    if (selectedLegalFormId !== OTHER_OPTION) {
      setValue('formaJuridica.otro', '');
    }
  }, [selectedLegalFormId, setValue]);

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold mb-6 text-earth-brown-adaptive dark:text-gray-600">Información de la Empresa</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Nombre de la empresa"
          {...register('nombre', {
            required: 'El nombre es requerido',
            minLength: {
              value: 2,
              message: 'El nombre debe tener al menos 2 caracteres',
            },
          })}
          error={errors.nombre?.message}
        />

        <Input
          label="Cargo que ocupa (opcional)"
          {...register('cargo')}
          error={errors.cargo?.message}
        />

        <Select
          label="Forma jurídica"
          {...register('formaJuridica.id', { required: 'Seleccione una forma jurídica' })}
          error={errors.formaJuridica?.id?.message}
        >
          <option value="">Seleccione...</option>
          {legalForms.map(({ id, nombre }) => (
            <option key={id} value={String(id)}>{nombre}</option>
          ))}
          <option value={OTHER_OPTION}>Otro (especificar)</option>
        </Select>

        {selectedLegalFormId === OTHER_OPTION && (
          <Input
            label="Especifique la forma jurídica"
            {...register('formaJuridica.otro', { required: 'Indique la forma jurídica' })}
            error={errors.formaJuridica?.otro?.message}
          />
        )}

        <div className="md:col-span-2">
          <p className="form-label question-accent">Departamentos donde opera (añada tantos como necesite)</p>
          <div className="space-y-2">
            {departmentsValue.map((_, index) => (
              <div key={`departamento-${index}`} className="flex gap-3 items-center">
                <Select
                  label={index === 0 ? 'Departamento' : ''}
                  {...register(`departamentos.${index}` as const, {
                    required: 'Seleccione un departamento',
                    validate: (value) => {
                      if (!value) return true; // Let 'required' handle empty values
                      const count = departmentsValue.filter(dep => dep === value).length;
                      return count <= 1 || 'El departamento ya ha sido seleccionado';
                    }
                  })}
                  error={(errors.departamentos as any)?.[index]?.message}
                >
                  <option value="">Seleccione...</option>
                  {departments.map(({ id, nombre }) => (
            <option
              key={id}
              value={String(id)}
              disabled={departmentsValue.some((d: any, i: number) => i !== index && String(d) === String(id))}
            >
              {nombre}
            </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setValue('departamentos', departmentsValue.filter((_, idx) => idx !== index))}
                  disabled={departmentsValue.length === 1}
                >
                  Eliminar
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setValue('departamentos', [...departmentsValue, ''])}
            >
              + Añadir departamento
            </Button>
          </div>
        </div>

        {/* Se removió la entrada libre de organizaciones en Información de la Empresa.
            Las organizaciones relacionadas ahora se registran por proyecto en el paso de Proyectos. */}
      </div>
    </div>
  );
};

export default Step1CompanyInfo;