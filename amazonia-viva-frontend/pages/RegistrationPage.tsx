import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Reveal from '../components/animations/Reveal';
import {
  useApoyos,
  useDepartamentos,
  useFormasJuridicas,
  useMotivos,
  useOds,
  useTiposOrganizaciones,
} from '../hooks/useCatalogos';
import { useRegistrarEmpresa, useRegistrarOrganizacion } from '../hooks/useFormularios';
import { ApiError } from '../services/apiClient';
import type { Ref } from '../types/api';

type TipoEntidad = 'organizacion' | 'empresa';

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-beige-arena dark:bg-noche-selva border border-carbon/20 dark:border-beige-arena/20 text-carbon dark:text-beige-arena placeholder-gris-piedra focus:ring-2 focus:ring-verde-brote focus:border-transparent transition-all duration-300";
const labelClass = "block text-sm font-medium text-carbon dark:text-beige-arena mb-2";

const parseOtros = (s: string): string[] => s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);

const CheckboxGroup: React.FC<{ items: Ref[]; selected: number[]; onToggle: (id: number) => void }> = ({ items, selected, onToggle }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {items.map((it) => (
      <label key={it.id} className="flex items-center gap-2 text-sm text-carbon dark:text-beige-arena cursor-pointer rounded-lg px-3 py-2 border border-carbon/15 dark:border-beige-arena/15 hover:border-verde-brote/60 transition-colors">
        <input type="checkbox" checked={selected.includes(it.id)} onChange={() => onToggle(it.id)} className="rounded accent-verde-brote" />
        <span className="truncate" title={it.nombre}>{it.nombre}</span>
      </label>
    ))}
    {items.length === 0 && <p className="text-sm text-gris-piedra col-span-full">Cargando opciones…</p>}
  </div>
);

/** Select de catálogo con opción "Otro" que revela un input de texto. */
const SelectConOtro: React.FC<{
  items: Ref[];
  value: string;
  otro: string;
  onChange: (value: string) => void;
  onOtroChange: (otro: string) => void;
  placeholder: string;
}> = ({ items, value, otro, onChange, onOtroChange, placeholder }) => (
  <>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} required>
      <option value="" disabled>{placeholder}</option>
      {items.map((it) => <option key={it.id} value={String(it.id)}>{it.nombre}</option>)}
      <option value="otro">Otro…</option>
    </select>
    {value === 'otro' && (
      <input type="text" required minLength={3} maxLength={100} value={otro} onChange={(e) => onOtroChange(e.target.value)} className={`${inputClass} mt-2`} placeholder="Especifica" />
    )}
  </>
);

const RegistrationPage: React.FC = () => {
  const [tipo, setTipo] = useState<TipoEntidad>('organizacion');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Organización
  const [orgTipoId, setOrgTipoId] = useState('');
  const [orgTipoOtro, setOrgTipoOtro] = useState('');
  const [idDepartamento, setIdDepartamento] = useState('');
  const [esNacional, setEsNacional] = useState(true);
  const [anioInicioTrabajo, setAnioInicioTrabajo] = useState('');

  // Empresa
  const [formaJurId, setFormaJurId] = useState('');
  const [formaJurOtro, setFormaJurOtro] = useState('');
  const [departamentosSel, setDepartamentosSel] = useState<number[]>([]);
  const [anioInicioApoyo, setAnioInicioApoyo] = useState('');
  const [apoyosSel, setApoyosSel] = useState<number[]>([]);
  const [apoyosOtros, setApoyosOtros] = useState('');
  const [motivosSel, setMotivosSel] = useState<number[]>([]);
  const [motivosOtros, setMotivosOtros] = useState('');
  const [odsSel, setOdsSel] = useState<number[]>([]);
  const [orgsAliadas, setOrgsAliadas] = useState('');

  // Catálogos
  const { data: tiposOrg = [] } = useTiposOrganizaciones();
  const { data: formasJur = [] } = useFormasJuridicas();
  const { data: departamentos = [] } = useDepartamentos();
  const { data: apoyos = [] } = useApoyos();
  const { data: motivos = [] } = useMotivos();
  const { data: ods = [] } = useOds();

  const regOrg = useRegistrarOrganizacion();
  const regEmp = useRegistrarEmpresa();
  const submitting = regOrg.isPending || regEmp.isPending;

  const toggle = (setter: React.Dispatch<React.SetStateAction<number[]>>) => (id: number) =>
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (tipo === 'organizacion') {
        await regOrg.mutateAsync({
          nombre,
          idDepartamento: Number(idDepartamento),
          esNacional,
          tipo: orgTipoId === 'otro' ? { otro: orgTipoOtro } : { id: Number(orgTipoId) },
          anioInicioTrabajo: Number(anioInicioTrabajo),
        });
      } else {
        if (departamentosSel.length === 0) { setError('Selecciona al menos un departamento.'); return; }
        if (odsSel.length === 0) { setError('Selecciona al menos un ODS.'); return; }
        const otrosApoyos = parseOtros(apoyosOtros);
        const otrosMotivos = parseOtros(motivosOtros);
        const aliadas = parseOtros(orgsAliadas);
        await regEmp.mutateAsync({
          nombre,
          formaJuridica: formaJurId === 'otro' ? { otro: formaJurOtro } : { id: Number(formaJurId) },
          departamentos: departamentosSel,
          anioInicioApoyo: Number(anioInicioApoyo),
          apoyos: { seleccionados: apoyosSel, otros: otrosApoyos.length ? otrosApoyos : undefined },
          motivosApoyo: { seleccionados: motivosSel, otros: otrosMotivos.length ? otrosMotivos : undefined },
          ods: odsSel,
          organizaciones: aliadas.length ? aliadas : undefined,
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar la solicitud. Intenta de nuevo.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-beige-arena dark:bg-noche-selva flex items-center justify-center p-4 pt-32">
        <div className="bg-blanco-puro dark:bg-verde-hoja-seca rounded-xl shadow-medium p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-verde-brote rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blanco-puro" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-carbon dark:text-beige-arena mb-2">¡Solicitud Enviada!</h2>
          <p className="text-gris-piedra dark:text-beige-arena/80 mb-6">
            Gracias por unirte a Porerekua. Revisaremos tu información y la sumaremos a la red.
          </p>
          <Link to="/"><Button className="w-full">Volver al Inicio</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 pt-32 sm:pt-36 bg-blanco-puro dark:bg-noche-selva">
      <Reveal className="w-full max-w-2xl" y={30}>
        <div className="bg-blanco-puro dark:bg-noche-selva/60 rounded-xl shadow-medium overflow-hidden border border-carbon/10 dark:border-white/10">
          <div className="bg-verde-brote p-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-blanco-puro">Únete a Porerekua</h1>
            <p className="text-blanco-puro/80 mt-2 text-sm sm:text-base">Suma tu organización o empresa a nuestra red de conservación</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-4 py-2.5">{error}</div>}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="tipo" className={labelClass}>Tipo de entidad *</label>
                <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoEntidad)} className={inputClass} required>
                  <option value="organizacion">Organización</option>
                  <option value="empresa">Empresa</option>
                </select>
              </div>
              <div>
                <label htmlFor="nombre" className={labelClass}>Nombre de la {tipo === 'organizacion' ? 'organización' : 'empresa'} *</label>
                <input id="nombre" type="text" required minLength={tipo === 'empresa' ? 5 : 3} maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} placeholder={`Nombre de tu ${tipo === 'organizacion' ? 'organización' : 'empresa'}`} />
              </div>
            </div>

            {tipo === 'organizacion' ? (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Tipo de organización *</label>
                    <SelectConOtro items={tiposOrg} value={orgTipoId} otro={orgTipoOtro} onChange={setOrgTipoId} onOtroChange={setOrgTipoOtro} placeholder="Selecciona un tipo" />
                  </div>
                  <div>
                    <label htmlFor="depto" className={labelClass}>Departamento (sede central) *</label>
                    <select id="depto" value={idDepartamento} onChange={(e) => setIdDepartamento(e.target.value)} className={inputClass} required>
                      <option value="" disabled>Selecciona un departamento</option>
                      {departamentos.map((d) => <option key={d.id} value={String(d.id)}>{d.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="anioOrg" className={labelClass}>Año de inicio de trabajo *</label>
                    <input id="anioOrg" type="number" required min={1900} max={new Date().getFullYear()} value={anioInicioTrabajo} onChange={(e) => setAnioInicioTrabajo(e.target.value)} className={inputClass} placeholder="Ej: 2010" />
                  </div>
                  <div>
                    <label className={labelClass}>Alcance *</label>
                    <div className="flex gap-3 pt-1">
                      <label className="flex items-center gap-2 text-sm text-carbon dark:text-beige-arena cursor-pointer"><input type="radio" name="alcance" checked={esNacional} onChange={() => setEsNacional(true)} className="accent-verde-brote" /> Nacional</label>
                      <label className="flex items-center gap-2 text-sm text-carbon dark:text-beige-arena cursor-pointer"><input type="radio" name="alcance" checked={!esNacional} onChange={() => setEsNacional(false)} className="accent-verde-brote" /> Internacional</label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Forma jurídica *</label>
                    <SelectConOtro items={formasJur} value={formaJurId} otro={formaJurOtro} onChange={setFormaJurId} onOtroChange={setFormaJurOtro} placeholder="Selecciona una forma jurídica" />
                  </div>
                  <div>
                    <label htmlFor="anioEmp" className={labelClass}>Año de inicio de apoyo *</label>
                    <input id="anioEmp" type="number" required min={1} max={new Date().getFullYear()} value={anioInicioApoyo} onChange={(e) => setAnioInicioApoyo(e.target.value)} className={inputClass} placeholder="Ej: 2018" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Departamentos donde trabaja * <span className="text-xs text-gris-piedra">(al menos uno)</span></label>
                  <CheckboxGroup items={departamentos} selected={departamentosSel} onToggle={toggle(setDepartamentosSel)} />
                </div>
                <div>
                  <label className={labelClass}>Tipos de apoyo que brinda</label>
                  <CheckboxGroup items={apoyos} selected={apoyosSel} onToggle={toggle(setApoyosSel)} />
                  <input type="text" value={apoyosOtros} onChange={(e) => setApoyosOtros(e.target.value)} className={`${inputClass} mt-2`} placeholder="Otros apoyos (separados por coma)" />
                </div>
                <div>
                  <label className={labelClass}>Motivos para apoyar a la Amazonía</label>
                  <CheckboxGroup items={motivos} selected={motivosSel} onToggle={toggle(setMotivosSel)} />
                  <input type="text" value={motivosOtros} onChange={(e) => setMotivosOtros(e.target.value)} className={`${inputClass} mt-2`} placeholder="Otros motivos (separados por coma)" />
                </div>
                <div>
                  <label className={labelClass}>Objetivos de Desarrollo Sostenible (ODS) * <span className="text-xs text-gris-piedra">(al menos uno)</span></label>
                  <CheckboxGroup items={ods} selected={odsSel} onToggle={toggle(setOdsSel)} />
                </div>
                <div>
                  <label htmlFor="aliadas" className={labelClass}>Organizaciones aliadas</label>
                  <input id="aliadas" type="text" value={orgsAliadas} onChange={(e) => setOrgsAliadas(e.target.value)} className={inputClass} placeholder="Nombres separados por coma (opcional)" />
                </div>
              </>
            )}

            <div className="pt-4">
              <Button type="submit" disabled={submitting} className="w-full py-4 text-lg bg-verde-brote hover:bg-verde-oscuro hover:shadow-verde-glow">
                {submitting ? 'Enviando…' : 'Enviar Solicitud'}
              </Button>
            </div>
          </form>
        </div>
      </Reveal>
    </div>
  );
};

export default RegistrationPage;
