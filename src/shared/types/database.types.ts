export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          check_date: string
          created_at: string
          habit_id: string
          id: string
          status: Database["public"]["Enums"]["checkin_status"]
          user_id: string
        }
        Insert: {
          check_date: string
          created_at?: string
          habit_id: string
          id?: string
          status: Database["public"]["Enums"]["checkin_status"]
          user_id: string
        }
        Update: {
          check_date?: string
          created_at?: string
          habit_id?: string
          id?: string
          status?: Database["public"]["Enums"]["checkin_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["habit_category"]
          created_at: string
          custom_emoji: string | null
          custom_label: string | null
          description: string | null
          frequency_days: number[]
          id: string
          name: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          category: Database["public"]["Enums"]["habit_category"]
          created_at?: string
          custom_emoji?: string | null
          custom_label?: string | null
          description?: string | null
          frequency_days: number[]
          id?: string
          name: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["habit_category"]
          created_at?: string
          custom_emoji?: string | null
          custom_label?: string | null
          description?: string | null
          frequency_days?: number[]
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      mastery_scores: {
        Row: {
          habit_id: string
          last_calculated_date: string | null
          level: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          habit_id: string
          last_calculated_date?: string | null
          level?: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          habit_id?: string
          last_calculated_date?: string | null
          level?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_scores_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: true
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          habit_id: string | null
          task_id: string | null
          phase: Database["public"]["Enums"]["pomodoro_phase"]
          planned_duration_seconds: number
          actual_duration_seconds: number
          outcome: Database["public"]["Enums"]["pomodoro_outcome"]
          cycle_index: number
          started_at: string
          ended_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_id?: string | null
          task_id?: string | null
          phase: Database["public"]["Enums"]["pomodoro_phase"]
          planned_duration_seconds: number
          actual_duration_seconds: number
          outcome: Database["public"]["Enums"]["pomodoro_outcome"]
          cycle_index?: number
          started_at: string
          ended_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string | null
          task_id?: string | null
          phase?: Database["public"]["Enums"]["pomodoro_phase"]
          planned_duration_seconds?: number
          actual_duration_seconds?: number
          outcome?: Database["public"]["Enums"]["pomodoro_outcome"]
          cycle_index?: number
          started_at?: string
          ended_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pomodoro_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          habit_id: string | null
          title: string
          description: string | null
          due_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_mastery_level: { Args: { p_score: number }; Returns: string }
      has_used_weekly_skip: {
        Args: { p_date: string; p_habit_id: string }
        Returns: boolean
      }
      register_check_in: {
        Args: {
          p_check_date: string
          p_habit_id: string
          p_status: Database["public"]["Enums"]["checkin_status"]
        }
        Returns: {
          level: string
          score: number
          used_skip: boolean
        }[]
      }
    }
    Enums: {
      checkin_status: "completed" | "skipped" | "missed"
      habit_category:
        | "health"
        | "mind"
        | "learning"
        | "productivity"
        | "nutrition"
        | "creativity"
        | "social"
        | "finance"
        | "custom"
      task_status: "pending" | "completed"
      pomodoro_phase: "work" | "short_break" | "long_break"
      pomodoro_outcome: "completed" | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      checkin_status: ["completed", "skipped", "missed"],
      habit_category: [
        "health",
        "mind",
        "learning",
        "productivity",
        "nutrition",
        "creativity",
        "social",
        "finance",
        "custom",
      ],
      task_status: ["pending", "completed"],
      pomodoro_phase: ["work", "short_break", "long_break"],
      pomodoro_outcome: ["completed", "cancelled"],
    },
  },
} as const

