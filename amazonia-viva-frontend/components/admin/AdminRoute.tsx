import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoleEnum } from '../../types/api';

/** Permite el acceso solo a usuarios autenticados con rol Admin o Superadmin. */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <div className="text-center py-20 text-gris-piedra dark:text-beige-arena/70">Cargando…</div>;
  }

  const isAdmin = !!user && (user.rol === RoleEnum.Superadmin || user.rol === RoleEnum.Admin);
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
