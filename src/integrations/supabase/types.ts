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
      ad_accounts: {
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
      conversation_summaries: {
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
      lead_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          from_stage: string | null
          id: number
          lead_id: number
          note: string | null
          to_stage: string
          workspace_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          from_stage?: string | null
          id?: number
          lead_id: number
          note?: string | null
          to_stage: string
          workspace_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          from_stage?: string | null
          id?: number
          lead_id?: number
          note?: string | null
          to_stage?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
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
      spend_by_day: {
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
      workspace_members: {
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
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
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
        Relationships: []
      }
    }
    Functions: {
      get_user_workspaces: {
        Args: { _user_id: string }
        Returns: {
          workspace_id: string
        }[]
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
