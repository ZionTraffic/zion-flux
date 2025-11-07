export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analise_fluxos: {
        Row: {
          conversa_id: number
          created_at: string
          id: number
          issues: string[] | null
          score_coerencia: number | null
          score_fluxo: number | null
          score_humanizacao: number | null
          suggestions: string[] | null
          summary: string | null
          workspace_id: string
        }
        Insert: {
          conversa_id: number
          created_at?: string
          id?: number
          issues?: string[] | null
          score_coerencia?: number | null
          score_fluxo?: number | null
          score_humanizacao?: number | null
          suggestions?: string[] | null
          summary?: string | null
          workspace_id: string
        }
        Update: {
          conversa_id?: number
          created_at?: string
          id?: number
          issues?: string[] | null
          score_coerencia?: number | null
          score_fluxo?: number | null
          score_humanizacao?: number | null
          suggestions?: string[] | null
          summary?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      analise_ia: {
        Row: {
          ad_suggestions: string[] | null
          ai_suggestions: string[] | null
          ended_at: string | null
          extra: Json | null
          id: number
          lead_id: number | null
          negatives: string[] | null
          phone: string | null
          positives: string[] | null
          qualified: boolean | null
          stage_after: string | null
          started_at: string | null
          summary: string | null
          workspace_id: string
        }
        Insert: {
          ad_suggestions?: string[] | null
          ai_suggestions?: string[] | null
          ended_at?: string | null
          extra?: Json | null
          id?: number
          lead_id?: number | null
          negatives?: string[] | null
          phone?: string | null
          positives?: string[] | null
          qualified?: boolean | null
          stage_after?: string | null
          started_at?: string | null
          summary?: string | null
          workspace_id: string
        }
        Update: {
          ad_suggestions?: string[] | null
          ai_suggestions?: string[] | null
          ended_at?: string | null
          extra?: Json | null
          id?: number
          lead_id?: number | null
          negatives?: string[] | null
          phone?: string | null
          positives?: string[] | null
          qualified?: boolean | null
          stage_after?: string | null
          started_at?: string | null
          summary?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_summaries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_phone_numbers: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string
          reason?: string | null
        }
        Relationships: []
      }
      contas_anuncios: {
        Row: {
          active: boolean | null
          external_id: string
          id: number
          name: string | null
          platform: string
          workspace_id: string
        }
        Insert: {
          active?: boolean | null
          external_id: string
          id?: number
          name?: string | null
          platform: string
          workspace_id: string
        }
        Update: {
          active?: boolean | null
          external_id?: string
          id?: number
          name?: string | null
          platform?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas_asf: {
        Row: {
          created_at: string | null
          data_entrada: string | null
          id: number
          id_workspace: string | null
          lead_name: string | null
          messages: Json | null
          phone: string | null
          source: string | null
          tag: string | null
        }
        Insert: {
          created_at?: string | null
          data_entrada?: string | null
          id?: number
          id_workspace?: string | null
          lead_name?: string | null
          messages?: Json | null
          phone?: string | null
          source?: string | null
          tag?: string | null
        }
        Update: {
          created_at?: string | null
          data_entrada?: string | null
          id?: number
          id_workspace?: string | null
          lead_name?: string | null
          messages?: Json | null
          phone?: string | null
          source?: string | null
          tag?: string | null
        }
        Relationships: []
      }
      conversas_sieg_financeiro: {
        Row: {
          analista: string | null
          created_at: string
          csat: string | null
          data_conclusao: string | null
          data_resposta_csat: string | null
          data_transferencia: string | null
          id: number
          id_workspace: string
          message_automatic: string | null
          messages: Json | null
          nome: string | null
          phone: string | null
          started: string
          tag: string | null
          tempo_medio_resposta: string | null
          tempo_primeira_resposta: string | null
          updated_at: string
          valor_em_aberto: string | null
        }
        Insert: {
          analista?: string | null
          created_at?: string
          csat?: string | null
          data_conclusao?: string | null
          data_resposta_csat?: string | null
          data_transferencia?: string | null
          id?: number
          id_workspace: string
          message_automatic?: string | null
          messages?: Json | null
          nome?: string | null
          phone?: string | null
          started?: string
          tag?: string | null
          tempo_medio_resposta?: string | null
          tempo_primeira_resposta?: string | null
          updated_at?: string
          valor_em_aberto?: string | null
        }
        Update: {
          analista?: string | null
          created_at?: string
          csat?: string | null
          data_conclusao?: string | null
          data_resposta_csat?: string | null
          data_transferencia?: string | null
          id?: number
          id_workspace?: string
          message_automatic?: string | null
          messages?: Json | null
          nome?: string | null
          phone?: string | null
          started?: string
          tag?: string | null
          tempo_medio_resposta?: string | null
          tempo_primeira_resposta?: string | null
          updated_at?: string
          valor_em_aberto?: string | null
        }
        Relationships: []
      }
      custo_anuncios: {
        Row: {
          ad_account_id: string
          amount: number
          created_at: string | null
          day: string
          source: string | null
          workspace_id: string
        }
        Insert: {
          ad_account_id?: string
          amount?: number
          created_at?: string | null
          day: string
          source?: string | null
          workspace_id: string
        }
        Update: {
          ad_account_id?: string
          amount?: number
          created_at?: string | null
          day?: string
          source?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spend_by_day_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      database_configs: {
        Row: {
          active: boolean | null
          anon_key: string
          created_at: string | null
          created_by: string | null
          database_key: string
          id: string
          name: string
          service_role_secret_name: string | null
          url: string
        }
        Insert: {
          active?: boolean | null
          anon_key: string
          created_at?: string | null
          created_by?: string | null
          database_key: string
          id?: string
          name: string
          service_role_secret_name?: string | null
          url: string
        }
        Update: {
          active?: boolean | null
          anon_key?: string
          created_at?: string | null
          created_by?: string | null
          database_key?: string
          id?: string
          name?: string
          service_role_secret_name?: string | null
          url?: string
        }
        Relationships: []
      }
      historico_leads: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_stage: string | null
          id: number
          lead_id: number
          to_stage: string
          workspace_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_stage?: string | null
          id?: never
          lead_id: number
          to_stage: string
          workspace_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_stage?: string | null
          id?: never
          lead_id?: number
          to_stage?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_secrets: {
        Row: {
          created_at: string | null
          key: string
          value: string
        }
        Insert: {
          created_at?: string | null
          key: string
          value: string
        }
        Update: {
          created_at?: string | null
          key?: string
          value?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          canal_origem: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          entered_at: string | null
          follow_up: string | null
          id: number
          localidade: string | null
          meta: Json | null
          motivo: string | null
          nome: string | null
          produto: string | null
          stage: string
          telefone: string | null
          url_origem: string | null
          workspace_id: string
        }
        Insert: {
          canal_origem?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          entered_at?: string | null
          follow_up?: string | null
          id?: number
          localidade?: string | null
          meta?: Json | null
          motivo?: string | null
          nome?: string | null
          produto?: string | null
          stage: string
          telefone?: string | null
          url_origem?: string | null
          workspace_id: string
        }
        Update: {
          canal_origem?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          entered_at?: string | null
          follow_up?: string | null
          id?: number
          localidade?: string | null
          meta?: Json | null
          motivo?: string | null
          nome?: string | null
          produto?: string | null
          stage?: string
          telefone?: string | null
          url_origem?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_workspace: {
        Row: {
          role: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          role?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          role?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          permissions: string | null
          role: string
          token: string
          used_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          permissions?: string | null
          role: string
          token: string
          used_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          permissions?: string | null
          role?: string
          token?: string
          used_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      test_phone_numbers: {
        Row: {
          created_at: string | null
          description: string | null
          phone: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          phone: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          phone?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_key: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_key: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_key?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          default_workspace_id: string | null
          user_id: string
        }
        Insert: {
          default_workspace_id?: string | null
          user_id: string
        }
        Update: {
          default_workspace_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_default_workspace_id_fkey"
            columns: ["default_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          database: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          database?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          database?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      custo_anuncios_totals: {
        Row: {
          media_diaria: number | null
          primeira_data: string | null
          total_dias: number | null
          total_investido: number | null
          ultima_data: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spend_by_day_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_overview_daily: {
        Row: {
          cpl: number | null
          day: string | null
          investimento: number | null
          leads_descartados: number | null
          leads_followup: number | null
          leads_qualificados: number | null
          leads_recebidos: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_workspace_member: {
        Args: {
          p_role?: Database["public"]["Enums"]["app_role"]
          p_set_default_workspace?: boolean
          p_user_id: string
          p_workspace_id: string
        }
        Returns: Json
      }
      clean_phone_number: { Args: { phone: string }; Returns: string }
      cleanup_orphan_users: {
        Args: never
        Returns: {
          deleted_count: number
          deleted_emails: string[]
        }[]
      }
      get_atendimentos_metrics: {
        Args: {
          p_data_hoje: string
          p_primeiro_dia_mes: string
          p_table_name: string
          p_ultimo_dia_mes: string
          p_workspace_id: string
        }
        Returns: Json
      }
      get_user_permissions: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: Json
      }
      get_user_workspaces: {
        Args: { _user_id: string }
        Returns: {
          workspace_id: string
        }[]
      }
      get_workspace_members_with_details: {
        Args: { p_workspace_id: string }
        Returns: {
          role: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_phone_blocked: { Args: { phone: string }; Returns: boolean }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      kpi_totais_periodo: {
        Args: { p_from: string; p_to: string; p_workspace_id: string }
        Returns: {
          cpl: number
          descartados: number
          followup: number
          investimento: number
          qualificados: number
          recebidos: number
        }[]
      }
      remove_workspace_member: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: Json
      }
      save_user_permissions: {
        Args: {
          p_permissions: string[]
          p_user_id: string
          p_workspace_id: string
        }
        Returns: Json
      }
      update_conversation_tag: {
        Args: {
          p_conversation_id: number
          p_new_tag: string
          p_table_name: string
        }
        Returns: boolean
      }
      update_workspace_member_role: {
        Args: { p_new_role: string; p_user_id: string; p_workspace_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
