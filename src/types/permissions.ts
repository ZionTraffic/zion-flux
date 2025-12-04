// Definição das permissões disponíveis no sistema
export const PERMISSIONS = {
  // Dashboard e visão geral
  DASHBOARD_VIEW: 'dashboard_view',
  
  // Tráfego e Meta Ads
  TRAFFIC_VIEW: 'traffic_view',
  TRAFFIC_EXPORT: 'traffic_export',
  
  // Leads
  LEADS_VIEW: 'leads_view',
  
  // Atendimento (CSAT, conversas, histórico)
  ATENDIMENTO_VIEW: 'atendimento_view',
  ATENDIMENTO_MANAGE: 'atendimento_manage',
  
  // Qualificação de leads
  QUALIFICATION_VIEW: 'qualification_view',
  QUALIFICATION_MANAGE: 'qualification_manage',
  
  // Análise de conversas
  ANALYSIS_VIEW: 'analysis_view',
  ANALYSIS_EXPORT: 'analysis_export',
  
  // Configurações
  SETTINGS_VIEW: 'settings_view',
  SETTINGS_USERS: 'settings_users',
  SETTINGS_WORKSPACES: 'settings_workspaces',
  SETTINGS_INTEGRATIONS: 'settings_integrations',
  
  // Relatórios
  REPORTS_VIEW: 'reports_view',
  REPORTS_EXPORT: 'reports_export',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Grupos de permissões por role padrão
export const DEFAULT_PERMISSIONS_BY_ROLE = {
  owner: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TRAFFIC_VIEW,
    PERMISSIONS.TRAFFIC_EXPORT,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.ATENDIMENTO_VIEW,
    PERMISSIONS.ATENDIMENTO_MANAGE,
    PERMISSIONS.QUALIFICATION_VIEW,
    PERMISSIONS.QUALIFICATION_MANAGE,
    PERMISSIONS.ANALYSIS_VIEW,
    PERMISSIONS.ANALYSIS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_USERS,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],
  member: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TRAFFIC_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.ATENDIMENTO_VIEW,
    PERMISSIONS.QUALIFICATION_VIEW,
    PERMISSIONS.QUALIFICATION_MANAGE,
    PERMISSIONS.ANALYSIS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  viewer: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TRAFFIC_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.ATENDIMENTO_VIEW,
    PERMISSIONS.QUALIFICATION_VIEW,
    PERMISSIONS.ANALYSIS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
} as const;

// Labels amigáveis para as permissões
export const PERMISSION_LABELS = {
  [PERMISSIONS.DASHBOARD_VIEW]: 'Ver Dashboard',
  [PERMISSIONS.TRAFFIC_VIEW]: 'Ver Tráfego',
  [PERMISSIONS.TRAFFIC_EXPORT]: 'Exportar Relatórios de Tráfego',
  [PERMISSIONS.LEADS_VIEW]: 'Ver Leads',
  [PERMISSIONS.ATENDIMENTO_VIEW]: 'Ver Atendimento',
  [PERMISSIONS.ATENDIMENTO_MANAGE]: 'Gerenciar Atendimento',
  [PERMISSIONS.QUALIFICATION_VIEW]: 'Ver Qualificação',
  [PERMISSIONS.QUALIFICATION_MANAGE]: 'Gerenciar Qualificação',
  [PERMISSIONS.ANALYSIS_VIEW]: 'Ver Análises',
  [PERMISSIONS.ANALYSIS_EXPORT]: 'Exportar Análises',
  [PERMISSIONS.SETTINGS_VIEW]: 'Ver Configurações',
  [PERMISSIONS.SETTINGS_USERS]: 'Gerenciar Usuários',
  [PERMISSIONS.SETTINGS_WORKSPACES]: 'Gerenciar Workspaces',
  [PERMISSIONS.SETTINGS_INTEGRATIONS]: 'Gerenciar Integrações',
  [PERMISSIONS.REPORTS_VIEW]: 'Ver Relatórios',
  [PERMISSIONS.REPORTS_EXPORT]: 'Exportar Relatórios',
} as const;

// Categorias para organizar as permissões na UI
export const PERMISSION_CATEGORIES = {
  'Páginas': [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TRAFFIC_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.ATENDIMENTO_VIEW,
    PERMISSIONS.QUALIFICATION_VIEW,
    PERMISSIONS.ANALYSIS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  'Gerenciamento': [
    PERMISSIONS.ATENDIMENTO_MANAGE,
    PERMISSIONS.QUALIFICATION_MANAGE,
    PERMISSIONS.SETTINGS_USERS,
    PERMISSIONS.SETTINGS_WORKSPACES,
    PERMISSIONS.SETTINGS_INTEGRATIONS,
  ],
  'Exportação': [
    PERMISSIONS.TRAFFIC_EXPORT,
    PERMISSIONS.ANALYSIS_EXPORT,
    PERMISSIONS.REPORTS_EXPORT,
  ],
  'Configurações': [
    PERMISSIONS.SETTINGS_VIEW,
  ],
} as const;
