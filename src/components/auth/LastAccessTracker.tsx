import { useUpdateLastAccess } from '@/hooks/useUpdateLastAccess';

/**
 * Componente invisível que rastreia o último acesso do usuário
 * Deve ser usado dentro do TenantProvider
 */
export function LastAccessTracker() {
  useUpdateLastAccess();
  return null;
}
