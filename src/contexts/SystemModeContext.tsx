import React, { createContext, useContext, useState, ReactNode } from 'react';

type SystemMode = 'restaurants' | 'vendors';

interface SystemModeContextType {
  mode: SystemMode;
  setMode: (mode: SystemMode) => void;
  isVendorMode: boolean;
  isRestaurantMode: boolean;
}

const SystemModeContext = createContext<SystemModeContextType | undefined>(undefined);

export function SystemModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SystemMode>('restaurants');

  return (
    <SystemModeContext.Provider
      value={{
        mode,
        setMode,
        isVendorMode: mode === 'vendors',
        isRestaurantMode: mode === 'restaurants',
      }}
    >
      {children}
    </SystemModeContext.Provider>
  );
}

export function useSystemMode() {
  const context = useContext(SystemModeContext);
  if (context === undefined) {
    throw new Error('useSystemMode must be used within a SystemModeProvider');
  }
  return context;
}
