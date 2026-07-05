import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-verde-brote text-blanco-puro shadow-sm'
      : 'text-carbon dark:text-beige-arena/90 hover:bg-verde-brote/15'
  }`;

const AdminLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="md:w-56 shrink-0">
        <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-xl p-3">
          <h2 className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gris-piedra dark:text-beige-arena/60">Administración</h2>
          <nav className="flex md:flex-col gap-1">
            <NavLink to="/admin/solicitudes" className={linkClass}>Solicitudes</NavLink>
            <NavLink to="/admin/usuarios" className={linkClass}>Usuarios</NavLink>
            <NavLink to="/admin/logs" className={linkClass} data-testid="nav-logs">Logs</NavLink>
          </nav>
        </div>
      </aside>
      <div className="flex-grow min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
