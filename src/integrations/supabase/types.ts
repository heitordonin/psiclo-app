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
      budget_categories: {
        Row: {
          budgeted_amount: number | null
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          parent_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          budgeted_amount?: number | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          parent_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          budgeted_amount?: number | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          parent_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          actual_amount: number | null
          category_id: string
          created_at: string | null
          id: string
          month: string
          planned_amount: number
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          category_id: string
          created_at?: string | null
          id?: string
          month: string
          planned_amount: number
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          category_id?: string
          created_at?: string | null
          id?: string
          month?: string
          planned_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_diagnoses: {
        Row: {
          condominium: number | null
          created_at: string | null
          credit_card_balance: number | null
          credit_card_payment: number | null
          delivery: number | null
          education: number | null
          electricity: number | null
          gifts: number | null
          groceries: number | null
          gym: number | null
          health_insurance: number | null
          home_financing_balance: number | null
          home_financing_payment: number | null
          id: string
          insurance: number | null
          internet_tv: number | null
          leisure: number | null
          mobile_phone: number | null
          other_debts_balance: number | null
          other_debts_payment: number | null
          other_fixed_expenses: number | null
          other_income: number | null
          other_variable_expenses: number | null
          overdraft_balance: number | null
          overdraft_payment: number | null
          personal_care: number | null
          personal_loan_balance: number | null
          personal_loan_payment: number | null
          personal_shopping: number | null
          pharmacy: number | null
          rent: number | null
          salary: number | null
          subscriptions: number | null
          transportation: number | null
          travel: number | null
          updated_at: string | null
          user_id: string
          vehicle_financing_balance: number | null
          vehicle_financing_payment: number | null
          water: number | null
        }
        Insert: {
          condominium?: number | null
          created_at?: string | null
          credit_card_balance?: number | null
          credit_card_payment?: number | null
          delivery?: number | null
          education?: number | null
          electricity?: number | null
          gifts?: number | null
          groceries?: number | null
          gym?: number | null
          health_insurance?: number | null
          home_financing_balance?: number | null
          home_financing_payment?: number | null
          id?: string
          insurance?: number | null
          internet_tv?: number | null
          leisure?: number | null
          mobile_phone?: number | null
          other_debts_balance?: number | null
          other_debts_payment?: number | null
          other_fixed_expenses?: number | null
          other_income?: number | null
          other_variable_expenses?: number | null
          overdraft_balance?: number | null
          overdraft_payment?: number | null
          personal_care?: number | null
          personal_loan_balance?: number | null
          personal_loan_payment?: number | null
          personal_shopping?: number | null
          pharmacy?: number | null
          rent?: number | null
          salary?: number | null
          subscriptions?: number | null
          transportation?: number | null
          travel?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_financing_balance?: number | null
          vehicle_financing_payment?: number | null
          water?: number | null
        }
        Update: {
          condominium?: number | null
          created_at?: string | null
          credit_card_balance?: number | null
          credit_card_payment?: number | null
          delivery?: number | null
          education?: number | null
          electricity?: number | null
          gifts?: number | null
          groceries?: number | null
          gym?: number | null
          health_insurance?: number | null
          home_financing_balance?: number | null
          home_financing_payment?: number | null
          id?: string
          insurance?: number | null
          internet_tv?: number | null
          leisure?: number | null
          mobile_phone?: number | null
          other_debts_balance?: number | null
          other_debts_payment?: number | null
          other_fixed_expenses?: number | null
          other_income?: number | null
          other_variable_expenses?: number | null
          overdraft_balance?: number | null
          overdraft_payment?: number | null
          personal_care?: number | null
          personal_loan_balance?: number | null
          personal_loan_payment?: number | null
          personal_shopping?: number | null
          pharmacy?: number | null
          rent?: number | null
          salary?: number | null
          subscriptions?: number | null
          transportation?: number | null
          travel?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_financing_balance?: number | null
          vehicle_financing_payment?: number | null
          water?: number | null
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          created_at: string | null
          currency: string
          current_amount: number | null
          goal_type: string | null
          id: string
          name: string
          target_amount: number
          target_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          current_amount?: number | null
          goal_type?: string | null
          id?: string
          name: string
          target_amount: number
          target_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          current_amount?: number | null
          goal_type?: string | null
          id?: string
          name?: string
          target_amount?: number
          target_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string | null
          goal_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          contribution_date: string
          created_at?: string | null
          goal_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string | null
          goal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_transactions_control: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_generated_date: string
          next_generation_date: string
          parent_transaction_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_date: string
          next_generation_date: string
          parent_transaction_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_date?: string
          next_generation_date?: string
          parent_transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_control_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string
          id: string
          is_auto_generated: boolean | null
          is_recurring: boolean | null
          parent_transaction_id: string | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_auto_generated?: boolean | null
          is_recurring?: boolean | null
          parent_transaction_id?: string | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_auto_generated?: boolean | null
          is_recurring?: boolean | null
          parent_transaction_id?: string | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_default_categories: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      seed_default_categories_for_me: { Args: never; Returns: undefined }
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
