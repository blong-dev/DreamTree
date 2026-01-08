'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './feedback';
import { ErrorBoundary } from './feedback';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider position="bottom-right">
        {children}
      </ToastProvider>
    </ErrorBoundary>
  );
}
