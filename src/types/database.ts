export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: "reporter" | "authority" | "admin";
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          role?: "reporter" | "authority" | "admin";
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: "reporter" | "authority" | "admin";
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: Database["public"]["Enums"]["waste_category"];
          severity: Database["public"]["Enums"]["severity_level"];
          status: Database["public"]["Enums"]["report_status"];
          latitude: number;
          longitude: number;
          address: string | null;
          photo_urls: string[];
          cleanup_photo_urls: string[];
          upvote_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: Database["public"]["Enums"]["waste_category"];
          severity?: Database["public"]["Enums"]["severity_level"];
          status?: Database["public"]["Enums"]["report_status"];
          latitude: number;
          longitude: number;
          address?: string | null;
          photo_urls?: string[];
          cleanup_photo_urls?: string[];
          upvote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: Database["public"]["Enums"]["waste_category"];
          severity?: Database["public"]["Enums"]["severity_level"];
          status?: Database["public"]["Enums"]["report_status"];
          latitude?: number;
          longitude?: number;
          address?: string | null;
          photo_urls?: string[];
          cleanup_photo_urls?: string[];
          upvote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      status_updates: {
        Row: {
          id: string;
          report_id: string;
          changed_by: string;
          old_status: Database["public"]["Enums"]["report_status"] | null;
          new_status: Database["public"]["Enums"]["report_status"];
          comment: string | null;
          photo_urls: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          changed_by: string;
          old_status?: Database["public"]["Enums"]["report_status"] | null;
          new_status: Database["public"]["Enums"]["report_status"];
          comment?: string | null;
          photo_urls?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          changed_by?: string;
          old_status?: Database["public"]["Enums"]["report_status"] | null;
          new_status?: Database["public"]["Enums"]["report_status"];
          comment?: string | null;
          photo_urls?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "status_updates_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "status_updates_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      upvotes: {
        Row: {
          user_id: string;
          report_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          report_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          report_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "upvotes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "upvotes_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      point_transactions: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          points: number;
          report_id: string | null;
          event_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          points: number;
          report_id?: string | null;
          event_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          points?: number;
          report_id?: string | null;
          event_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "point_transactions_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "point_transactions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          description: string;
          event_date: string;
          start_time: string;
          end_time: string | null;
          latitude: number;
          longitude: number;
          address: string | null;
          report_ids: string[];
          max_attendees: number | null;
          tools_provided: string | null;
          tools_needed: string | null;
          status: Database["public"]["Enums"]["event_status"];
          photo_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          description: string;
          event_date: string;
          start_time: string;
          end_time?: string | null;
          latitude: number;
          longitude: number;
          address?: string | null;
          report_ids?: string[];
          max_attendees?: number | null;
          tools_provided?: string | null;
          tools_needed?: string | null;
          status?: Database["public"]["Enums"]["event_status"];
          photo_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          description?: string;
          event_date?: string;
          start_time?: string;
          end_time?: string | null;
          latitude?: number;
          longitude?: number;
          address?: string | null;
          report_ids?: string[];
          max_attendees?: number | null;
          tools_provided?: string | null;
          tools_needed?: string | null;
          status?: Database["public"]["Enums"]["event_status"];
          photo_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_attendees: {
        Row: {
          event_id: string;
          user_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          total_reports: number;
          pending_reports: number;
          resolved_reports: number;
          in_progress_reports: number;
          reports_this_week: number;
          reports_this_month: number;
        };
        Relationships: [];
      };
      admin_stats: {
        Row: {
          total_users: number;
          total_reports: number;
          total_events: number;
          pending_reports: number;
          resolved_reports: number;
          new_users_this_week: number;
          new_users_this_month: number;
          reports_this_week: number;
          reports_this_month: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      award_points: {
        Args: {
          p_user_id: string;
          p_action: string;
          p_points: number;
          p_report_id: string | null;
          p_event_id: string | null;
        };
        Returns: boolean;
      };
      admin_adjust_points: {
        Args: {
          p_user_id: string;
          p_points: number;
          p_reason: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      waste_category:
        | "household"
        | "industrial"
        | "hazardous"
        | "electronic"
        | "construction"
        | "medical"
        | "organic"
        | "other";
      severity_level: "low" | "medium" | "high" | "critical";
      report_status:
        | "reported"
        | "acknowledged"
        | "cleanup_scheduled"
        | "in_progress"
        | "resolved";
      event_status: "upcoming" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};
