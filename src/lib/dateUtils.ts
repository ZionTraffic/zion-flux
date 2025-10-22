/**
 * Utilitários para manipulação de datas em horário de Brasília
 * Todas as datas no sistema devem usar estas funções para garantir consistência
 */

const BRASILIA_TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte uma data para string no formato YYYY-MM-DD em horário de Brasília
 */
export function toBrasiliaDateString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toLocaleString('pt-BR', {
      timeZone: BRASILIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-'); // YYYY-MM-DD
  } catch {
    return null;
  }
}

/**
 * Converte uma data para string no formato DD/MM/YYYY em horário de Brasília
 */
export function toBrasiliaDateStringBR(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toLocaleString('pt-BR', {
      timeZone: BRASILIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split(',')[0]; // DD/MM/YYYY
  } catch {
    return null;
  }
}

/**
 * Converte uma data para string com data e hora em horário de Brasília
 * Formato: DD/MM/YYYY HH:MM
 */
export function toBrasiliaDateTimeString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toLocaleString('pt-BR', {
      timeZone: BRASILIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return null;
  }
}

/**
 * Converte uma data para string com data e hora completa em horário de Brasília
 * Formato: DD/MM/YYYY HH:MM:SS
 */
export function toBrasiliaDateTimeFullString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toLocaleString('pt-BR', {
      timeZone: BRASILIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return null;
  }
}

/**
 * Retorna apenas a hora em horário de Brasília
 * Formato: HH:MM
 */
export function toBrasiliaTimeString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toLocaleString('pt-BR', {
      timeZone: BRASILIA_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return null;
  }
}

/**
 * Retorna a data atual em horário de Brasília no formato YYYY-MM-DD
 */
export function getCurrentBrasiliaDate(): string {
  return toBrasiliaDateString(new Date()) || new Date().toISOString().split('T')[0];
}

/**
 * Retorna a data e hora atual em horário de Brasília
 */
export function getCurrentBrasiliaDateTime(): string {
  return toBrasiliaDateTimeString(new Date()) || new Date().toLocaleString('pt-BR');
}

/**
 * Verifica se uma data está no dia de hoje (horário de Brasília)
 */
export function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateStr = toBrasiliaDateString(date);
  const todayStr = getCurrentBrasiliaDate();
  
  return dateStr === todayStr;
}

/**
 * Formata uma data de forma relativa (hoje, ontem, etc.) em horário de Brasília
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return 'Data inválida';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Data inválida';
  
  const today = getCurrentBrasiliaDate();
  const dateStr = toBrasiliaDateString(date);
  
  if (dateStr === today) {
    return `Hoje às ${toBrasiliaTimeString(date)}`;
  }
  
  // Calcular ontem
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toBrasiliaDateString(yesterday);
  
  if (dateStr === yesterdayStr) {
    return `Ontem às ${toBrasiliaTimeString(date)}`;
  }
  
  return toBrasiliaDateTimeString(date) || 'Data inválida';
}
