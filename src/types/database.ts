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
          tier: Database["public"]["Enums"]["user_tier"];
          referral_code: string | null;
          referred_by: string | null;
          phone_number: string | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          role?: "reporter" | "authority" | "admin";
          points?: number;
          tier?: Database["public"]["Enums"]["user_tier"];
          referral_code?: string | null;
          referred_by?: string | null;
          phone_number?: string | null;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: "reporter" | "authority" | "admin";
          points?: number;
          tier?: Database["public"]["Enums"]["user_tier"];
          referral_code?: string | null;
          referred_by?: string | null;
          phone_number?: string | null;
          is_premium?: boolean;
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
          pickup_type: "cleanup" | "recycling" | null;
          estimated_weight_kg: number | null;
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
          pickup_type?: "cleanup" | "recycling" | null;
          estimated_weight_kg?: number | null;
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
          pickup_type?: "cleanup" | "recycling" | null;
          estimated_weight_kg?: number | null;
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
          is_live: boolean;
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
          is_live?: boolean;
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
          is_live?: boolean;
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
      rewards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: Database["public"]["Enums"]["reward_category"];
          point_cost: number;
          provider: string;
          provider_config: Record<string, unknown>;
          is_active: boolean;
          stock: number | null;
          tier_required: Database["public"]["Enums"]["user_tier"] | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: Database["public"]["Enums"]["reward_category"];
          point_cost: number;
          provider?: string;
          provider_config?: Record<string, unknown>;
          is_active?: boolean;
          stock?: number | null;
          tier_required?: Database["public"]["Enums"]["user_tier"] | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: Database["public"]["Enums"]["reward_category"];
          point_cost?: number;
          provider?: string;
          provider_config?: Record<string, unknown>;
          is_active?: boolean;
          stock?: number | null;
          tier_required?: Database["public"]["Enums"]["user_tier"] | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      redemptions: {
        Row: {
          id: string;
          user_id: string;
          reward_id: string | null;
          points_spent: number;
          status: Database["public"]["Enums"]["redemption_status"];
          provider_reference: string | null;
          delivery_details: Record<string, unknown>;
          failure_reason: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          reward_id?: string | null;
          points_spent: number;
          status?: Database["public"]["Enums"]["redemption_status"];
          provider_reference?: string | null;
          delivery_details?: Record<string, unknown>;
          failure_reason?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          reward_id?: string;
          points_spent?: number;
          status?: Database["public"]["Enums"]["redemption_status"];
          provider_reference?: string | null;
          delivery_details?: Record<string, unknown>;
          failure_reason?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "redemptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "redemptions_reward_id_fkey";
            columns: ["reward_id"];
            isOneToOne: false;
            referencedRelation: "rewards";
            referencedColumns: ["id"];
          },
        ];
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          status: Database["public"]["Enums"]["referral_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          status?: Database["public"]["Enums"]["referral_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          status?: Database["public"]["Enums"]["referral_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey";
            columns: ["referrer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referred_id_fkey";
            columns: ["referred_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          action_type: string;
          target_count: number;
          bonus_points: number;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          action_type: string;
          target_count: number;
          bonus_points: number;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          action_type?: string;
          target_count?: number;
          bonus_points?: number;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      user_challenges: {
        Row: {
          user_id: string;
          challenge_id: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          user_id: string;
          challenge_id: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          challenge_id?: string;
          progress?: number;
          completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_challenges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_challenges_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      collector_profiles: {
        Row: CollectorProfileRow;
        Insert: Partial<CollectorProfileRow> & { user_id: string; business_name: string };
        Update: Partial<CollectorProfileRow>;
        Relationships: [];
      };
      pickup_bids: {
        Row: PickupBidRow;
        Insert: Partial<PickupBidRow> & { report_id: string; collector_id: string; bid_amount: number };
        Update: Partial<PickupBidRow>;
        Relationships: [];
      };
      collector_reviews: {
        Row: CollectorReviewRow;
        Insert: Partial<CollectorReviewRow> & { bid_id: string; reviewer_id: string; collector_id: string; rating: number };
        Update: Partial<CollectorReviewRow>;
        Relationships: [];
      };
      sponsorships: {
        Row: SponsorshipRow;
        Insert: Partial<SponsorshipRow> & { company_name: string; start_date: string; end_date: string };
        Update: Partial<SponsorshipRow>;
        Relationships: [];
      };
      sponsored_rewards: {
        Row: SponsoredRewardRow;
        Insert: Partial<SponsoredRewardRow> & { sponsorship_id: string };
        Update: Partial<SponsoredRewardRow>;
        Relationships: [];
      };
      carbon_tracking: {
        Row: CarbonTrackingRow;
        Insert: Partial<CarbonTrackingRow> & { report_id: string; waste_type: string };
        Update: Partial<CarbonTrackingRow>;
        Relationships: [];
      };
      achievements: {
        Row: AchievementRow;
        Insert: Partial<AchievementRow> & { slug: string; name: string; criteria_type: string; criteria_value: number };
        Update: Partial<AchievementRow>;
        Relationships: [];
      };
      user_achievements: {
        Row: UserAchievementRow;
        Insert: { user_id: string; achievement_id: string; earned_at?: string };
        Update: Partial<UserAchievementRow>;
        Relationships: [];
      };
      premium_subscriptions: {
        Row: PremiumSubscriptionRow;
        Insert: Partial<PremiumSubscriptionRow> & { user_id: string; amount_naira: number; expires_at: string };
        Update: Partial<PremiumSubscriptionRow>;
        Relationships: [];
      };
      platform_revenue: {
        Row: PlatformRevenueRow;
        Insert: Partial<PlatformRevenueRow> & { source: string; amount_naira: number };
        Update: Partial<PlatformRevenueRow>;
        Relationships: [];
      };
      platform_settings: {
        Row: PlatformSettingRow;
        Insert: Partial<PlatformSettingRow> & { key: string; value: Json; category: string };
        Update: Partial<PlatformSettingRow>;
        Relationships: [];
      };
      dump_sites: {
        Row: DumpSiteRow;
        Insert: Omit<DumpSiteRow, "id" | "upvote_count" | "created_at" | "updated_at"> & {
          id?: string;
          upvote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<DumpSiteRow>;
        Relationships: [
          {
            foreignKeyName: "dump_sites_added_by_fkey";
            columns: ["added_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
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
      revenue_stats: {
        Row: {
          total_revenue: number;
          fee_revenue: number;
          commission_revenue: number;
          subscription_revenue: number;
          sponsorship_revenue: number;
          revenue_this_week: number;
          revenue_this_month: number;
        };
        Relationships: [];
      };
      carbon_stats: {
        Row: {
          tracked_reports: number;
          total_weight_kg: number;
          total_co2_avoided_kg: number;
          verified_co2_kg: number;
          certified_co2_kg: number;
        };
        Relationships: [];
      };
      collector_stats: {
        Row: {
          active_collectors: number;
          pending_collectors: number;
          total_pickups: number;
          total_collector_earnings: number;
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
      redeem_reward: {
        Args: {
          p_user_id: string;
          p_reward_id: string;
          p_delivery_details: Record<string, unknown>;
        };
        Returns: string;
      };
      update_user_tier: {
        Args: {
          p_user_id: string;
        };
        Returns: Database["public"]["Enums"]["user_tier"];
      };
      generate_referral_code: {
        Args: {
          p_user_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      dump_site_type:
        | "trash_can"
        | "recycling_bin"
        | "dumpster"
        | "transfer_station"
        | "landfill"
        | "compost_site"
        | "drop_off_center"
        | "street_bin";
      dump_site_status: "pending" | "verified" | "rejected" | "closed";
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
      reward_category:
        | "airtime"
        | "data"
        | "bank_transfer"
        | "gift_card"
        | "utility"
        | "merchandise";
      redemption_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded";
      referral_status: "signed_up" | "first_report" | "first_event";
      user_tier:
        | "green_starter"
        | "eco_warrior"
        | "clean_champion"
        | "waste_hero";
    };
    CompositeTypes: Record<string, never>;
  };
};

// ── Revenue Feature Tables (Migration 009) ─────────────────

export type CollectorProfileRow = {
  id: string;
  user_id: string;
  business_name: string;
  business_registration: string | null;
  description: string | null;
  waste_categories: string[];
  service_area_radius: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  phone: string | null;
  rating: number;
  total_pickups: number;
  total_earnings: number;
  status: "pending" | "verified" | "suspended" | "rejected";
  is_available: boolean;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PickupBidRow = {
  id: string;
  report_id: string;
  collector_id: string;
  bid_amount: number;
  estimated_time: string | null;
  notes: string | null;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  platform_fee: number;
  bid_type: "cleanup" | "recycling";
  completed_at: string | null;
  created_at: string;
};

export type CollectorReviewRow = {
  id: string;
  bid_id: string;
  reviewer_id: string;
  collector_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type SponsorshipRow = {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tier: "bronze" | "silver" | "gold" | "platinum";
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  budget_allocated: number;
  budget_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SponsoredRewardRow = {
  id: string;
  sponsorship_id: string;
  reward_id: string | null;
  challenge_id: string | null;
  budget_allocated: number;
  budget_spent: number;
  created_at: string;
};

export type CarbonTrackingRow = {
  id: string;
  report_id: string;
  estimated_weight_kg: number | null;
  waste_type: string;
  co2_avoided_kg: number | null;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
};

export type AchievementRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  category: string;
  criteria_type: string;
  criteria_value: number;
  points_reward: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type UserAchievementRow = {
  user_id: string;
  achievement_id: string;
  earned_at: string;
};

export type PremiumSubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  amount_naira: number;
  status: "active" | "cancelled" | "expired" | "trial";
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
  payment_reference: string | null;
  created_at: string;
};

export type PlatformRevenueRow = {
  id: string;
  source: string;
  amount_naira: number;
  reference_id: string | null;
  reference_type: string | null;
  description: string | null;
  created_at: string;
};

export type PlatformSettingRow = {
  key: string;
  value: Json;
  description: string | null;
  category: string;
  updated_at: string;
};

export type DumpSiteType =
  | "trash_can"
  | "recycling_bin"
  | "dumpster"
  | "transfer_station"
  | "landfill"
  | "compost_site"
  | "drop_off_center"
  | "street_bin";

export type DumpSiteStatus = "pending" | "verified" | "rejected" | "closed";

export type DumpSiteRow = {
  id: string;
  added_by: string;
  name: string;
  description: string | null;
  site_type: DumpSiteType;
  status: DumpSiteStatus;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_urls: string[];
  operating_hours: string | null;
  accepts: string[];
  is_free: boolean;
  upvote_count: number;
  created_at: string;
  updated_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Json;
  read: boolean;
  created_at: string;
};
