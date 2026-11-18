import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UIProvider } from '../contexts/UIContext';
import { AuthProvider } from '../contexts/AuthContext';
import FaviconSync from '../components/layout/FaviconSync';

const queryClient = new QueryClient();

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <FaviconSync />
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <UIProvider>
              {children}
            </UIProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
};
