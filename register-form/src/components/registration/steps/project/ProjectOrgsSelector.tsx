import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ProjectFormContext } from '../../../../types';
import Button from '../../../ui/Button';
import useRegisteredOrganizations from '../../../../hooks/useRegisteredOrganizations';
import OrganizationModal from '../../OrganizationModal';

type ProjectOrgsSelectorProps = {
  index: number;
};

// pequeño subcomponente para mantener el ProjectCard más limpio
const ProjectOrgsSelector: React.FC<ProjectOrgsSelectorProps> = ({ index }) => {
  const { data: registeredOrgs, loading: loadingOrgs, error: orgsError, reload } = useRegisteredOrganizations();
  const { watch, setValue } = useFormContext<ProjectFormContext>();
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [query, setQuery] = useState('');

  const fieldName = `proyectos.${index}.organizacionesRelacionadas` as const;
  const current = watch(fieldName) ?? [];

  const openModal = () => setShowOrgModal(true);
  const closeModal = () => {
    setShowOrgModal(false);
    // intentar recargar el catálogo cuando se cierra el modal
    reload();
  };

  const toggle = (id: number) => {
    const sid = String(id);
    const next = current.includes(sid) ? current.filter((v) => v !== sid) : [...current, sid];
    setValue(fieldName, next, { shouldValidate: true, shouldDirty: true });
  };

  const filtered = (registeredOrgs ?? []).filter((o) => o.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  const selectAllVisible = () => {
    const ids = filtered.map((o) => String(o.id));
    const merged = Array.from(new Set([...current, ...ids]));
    setValue(fieldName, merged, { shouldValidate: true, shouldDirty: true });
  };

  const clearAll = () => setValue(fieldName, [], { shouldValidate: true, shouldDirty: true });

  return (
  <div>
  <p className="form-label question-accent">Organizaciones relacionadas al proyecto (seleccione una o varias)</p>

      {loadingOrgs && <p className="text-sm text-carbon-muted">Cargando organizaciones...</p>}

      {orgsError && (
        <div className="space-y-2">
          <div className="p-3 border rounded bg-amber-50 text-amber-800 text-sm">
            <p>{orgsError}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={reload}>Reintentar</Button>
            <Button type="button" variant="primary" onClick={openModal}>Registrar nueva organización</Button>
          </div>
        </div>
      )}

      {!loadingOrgs && registeredOrgs && registeredOrgs.length === 0 && !orgsError && (
        <div className="space-y-2">
          <p className="text-sm text-carbon-muted">Aún no hay organizaciones registradas.</p>
          <div className="flex gap-2">
            <Button type="button" variant="primary" onClick={openModal}>Registrar organización</Button>
          </div>
        </div>
      )}

      {!loadingOrgs && registeredOrgs && registeredOrgs.length > 0 && (
          <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <input
              type="search"
              placeholder="Buscar organización..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none"
            />
            <Button type="button" variant="secondary" onClick={selectAllVisible}>Seleccionar visibles</Button>
            <Button type="button" variant="destructive" onClick={clearAll}>Limpiar</Button>
          </div>

          <div className="max-h-40 overflow-auto border rounded p-2 bg-white dark:bg-gray-800 dark:border-gray-700">
            {filtered.length === 0 ? (
              <p className="text-sm text-carbon-muted">No se encontraron organizaciones que coincidan.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map(({ id, nombre }) => (
                  <label key={id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={current.includes(String(id))}
                      onChange={() => toggle(id)}
                    />
                    <span className="text-sm text-heading-primary dark:text-gray-600">{nombre}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showOrgModal && <OrganizationModal onClose={closeModal} isNested={true} />}
    </div>
  );
};

export default ProjectOrgsSelector;
