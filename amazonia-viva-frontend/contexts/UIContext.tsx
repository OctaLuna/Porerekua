import React, { createContext, useState, ReactNode, useCallback } from 'react';

type PanelType = 'none' | 'login' | 'registration';

/** Referencia a la entidad cuyo detalle se muestra (el panel lo carga vía API). */
export type DetailRef =
  | { kind: 'proyecto'; id: number }
  | { kind: 'organizacion'; id: number }
  | { kind: 'empresa'; id: number };

interface UIContextType {
  activePanel: PanelType;
  openLoginPanel: () => void;
  openRegistrationPanel: () => void;
  closePanel: () => void;

  isDetailPanelOpen: boolean;
  detailRef: DetailRef | null;
  openDetailPanel: (ref: DetailRef) => void;
  closeDetailPanel: () => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePanel, setActivePanel] = useState<PanelType>('none');
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [detailRef, setDetailRef] = useState<DetailRef | null>(null);

  const openLoginPanel = useCallback(() => {
    setIsDetailPanelOpen(false);
    setActivePanel('login');
  }, []);

  const openRegistrationPanel = useCallback(() => {
    setIsDetailPanelOpen(false);
    setActivePanel('registration');
  }, []);

  const closePanel = useCallback(() => setActivePanel('none'), []);

  const openDetailPanel = useCallback((ref: DetailRef) => {
    setActivePanel('none');
    setDetailRef(ref);
    setIsDetailPanelOpen(true);
  }, []);

  const closeDetailPanel = useCallback(() => {
    setIsDetailPanelOpen(false);
    // Retrasa limpiar la referencia para permitir la animación de salida.
    setTimeout(() => setDetailRef(null), 300);
  }, []);

  return (
    <UIContext.Provider value={{
      activePanel,
      openLoginPanel,
      openRegistrationPanel,
      closePanel,
      isDetailPanelOpen,
      detailRef,
      openDetailPanel,
      closeDetailPanel
    }}>
      {children}
    </UIContext.Provider>
  );
};
