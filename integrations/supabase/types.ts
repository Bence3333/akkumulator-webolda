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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      callback_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          preferred_day: string | null
          preferred_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          preferred_day?: string | null
          preferred_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          preferred_day?: string | null
          preferred_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_items: {
        Row: {
          created_at: string
          icon_name: string
          id: string
          label: string
          link_url: string | null
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          icon_name?: string
          id?: string
          label: string
          link_url?: string | null
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          icon_name?: string
          id?: string
          label?: string
          link_url?: string | null
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      editable_content: {
        Row: {
          content: string
          created_at: string
          id: string
          storage_key: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          storage_key: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          storage_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      package_battery_options: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          original_price_modifier: string | null
          package_id: string
          price_modifier: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          original_price_modifier?: string | null
          package_id: string
          price_modifier?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          original_price_modifier?: string | null
          package_id?: string
          price_modifier?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_battery_options_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_brands: {
        Row: {
          created_at: string
          display_name: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      package_subcategories: {
        Row: {
          created_at: string
          display_name: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          brand: string
          created_at: string
          description: string | null
          features: string[]
          highlighted: boolean
          id: string
          image_url: string | null
          original_price: string
          package_code: string | null
          price: string
          sort_order: number
          subcategory: string | null
          title: string
          updated_at: string
        }
        Insert: {
          brand?: string
          created_at?: string
          description?: string | null
          features?: string[]
          highlighted?: boolean
          id?: string
          image_url?: string | null
          original_price?: string
          package_code?: string | null
          price: string
          sort_order?: number
          subcategory?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          description?: string | null
          features?: string[]
          highlighted?: boolean
          id?: string
          image_url?: string | null
          original_price?: string
          package_code?: string | null
          price?: string
          sort_order?: number
          subcategory?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          address: string
          annual_consumption: number | null
          created_at: string
          email: string
          has_solar: boolean
          id: string
          images: string[] | null
          inverter_brand: string | null
          lat: number | null
          lng: number | null
          name: string
          notes: string | null
          phone: string
          roof_angle: number | null
          roof_orientation: string | null
          roof_type: Database["public"]["Enums"]["roof_type"] | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
        }
        Insert: {
          address: string
          annual_consumption?: number | null
          created_at?: string
          email: string
          has_solar: boolean
          id?: string
          images?: string[] | null
          inverter_brand?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          notes?: string | null
          phone: string
          roof_angle?: number | null
          roof_orientation?: string | null
          roof_type?: Database["public"]["Enums"]["roof_type"] | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          annual_consumption?: number | null
          created_at?: string
          email?: string
          has_solar?: boolean
          id?: string
          images?: string[] | null
          inverter_brand?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          notes?: string | null
          phone?: string
          roof_angle?: number | null
          roof_orientation?: string | null
          roof_type?: Database["public"]["Enums"]["roof_type"] | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Relationships: []
      }
      survey_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          survey_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          survey_id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          survey_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      survey_questions: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          options: string[] | null
          question_text: string
          question_type: string
          required: boolean
          sort_order: number
          survey_id: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          options?: string[] | null
          question_text: string
          question_type?: string
          required?: boolean
          sort_order?: number
          survey_id?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          options?: string[] | null
          question_text?: string
          question_type?: string
          required?: boolean
          sort_order?: number
          survey_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "survey_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_section_config: {
        Row: {
          count_label: string | null
          created_at: string
          description: string | null
          highlighted_description: string | null
          id: string
          question_label: string | null
          section_key: string
          survey_id: number
          title: string
          updated_at: string
        }
        Insert: {
          count_label?: string | null
          created_at?: string
          description?: string | null
          highlighted_description?: string | null
          id?: string
          question_label?: string | null
          section_key: string
          survey_id?: number
          title: string
          updated_at?: string
        }
        Update: {
          count_label?: string | null
          created_at?: string
          description?: string | null
          highlighted_description?: string | null
          id?: string
          question_label?: string | null
          section_key?: string
          survey_id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      quote_status: "pending" | "in_progress" | "closed"
      roof_type: "flat" | "sheet" | "standing_seam" | "shingle" | "tile"
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
      app_role: ["admin", "moderator", "user"],
      quote_status: ["pending", "in_progress", "closed"],
      roof_type: ["flat", "sheet", "standing_seam", "shingle", "tile"],
    },
  },
} as const
