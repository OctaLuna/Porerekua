import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { RegistrationFormData } from '../../../types';
import type { NamedResource } from '../../../types/api';
import Input from '../../ui/Input';
import Checkbox from '../../ui/Checkbox';
import Button from '../../ui/Button';

type Step3MotivationProps = {
    motives: NamedResource[];
    ods: NamedResource[];
};

const Step3Motivation: React.FC<Step3MotivationProps> = ({ motives, ods }) => {
        const { register, formState: { errors }, watch, setValue } = useFormContext<RegistrationFormData>();
        const motiveOthers = (watch('motivosApoyo.otros') as string[] | undefined) ?? [];

        const addOtherMotive = () => {
            setValue('motivosApoyo.otros', [...motiveOthers, '']);
        };

        const removeOtherMotive = (index: number) => {
            setValue('motivosApoyo.otros', motiveOthers.filter((_, idx) => idx !== index));
        };

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-6 text-earth-brown-adaptive">Motivación y Alianzas</h3>

            <div className="mb-6">
                <p className="form-label question-accent">¿Qué motiva a su empresa a trabajar en la Amazonia? (puede seleccionar varios)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {motives.map(({ id, nombre }) => (
                        <Checkbox key={id} label={nombre} value={String(id)} {...register('motivosApoyo.seleccionados')} />
                    ))}
                </div>
                {errors.motivosApoyo?.seleccionados && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{(errors.motivosApoyo?.seleccionados as any)?.message}</p>
                )}
                <div className="mt-6">
                    <p className="form-sublabel">Otros motivos (opcional)</p>
                    {motiveOthers?.map((_: unknown, index: number) => (
                        <div key={`motivo-otro-${index}`} className="flex items-center gap-3 mb-2">
                            <Input
                                label={index === 0 ? 'Motivo adicional' : ''}
                                placeholder="Describa el motivo"
                                {...register(`motivosApoyo.otros.${index}` as const)}
                            />
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeOtherMotive(index)}>
                                Quitar
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={addOtherMotive}>
                        + Añadir otro motivo
                    </Button>
                </div>
            </div>

            <div>
                <p className="form-label question-accent">Seleccione los Objetivos de Desarrollo Sostenible (ODS) con los que se alinea su empresa:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {ods.map(({ id, nombre }) => (
                        <Checkbox key={id} label={nombre} value={String(id)} {...register('ods')} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Step3Motivation;