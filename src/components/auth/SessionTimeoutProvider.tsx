import { ReactNode } from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

interface SessionTimeoutProviderProps {
  children: ReactNode;
}

/**
 * Provider que monitora inatividade e desloga após 30 minutos
 * Deve envolver as rotas protegidas
 */
export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  // Hook que gerencia o timeout
  useSessionTimeout();

  return <>{children}</>;
}
