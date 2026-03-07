import type { Database } from "./database";

// Table row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type StatusUpdate =
  Database["public"]["Tables"]["status_updates"]["Row"];
export type Upvote = Database["public"]["Tables"]["upvotes"]["Row"];
export type PointTransaction =
  Database["public"]["Tables"]["point_transactions"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventAttendee =
  Database["public"]["Tables"]["event_attendees"]["Row"];
export type Reward = Database["public"]["Tables"]["rewards"]["Row"];
export type Redemption = Database["public"]["Tables"]["redemptions"]["Row"];
export type Referral = Database["public"]["Tables"]["referrals"]["Row"];
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];
export type UserChallenge =
  Database["public"]["Tables"]["user_challenges"]["Row"];

// Insert types
export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];
export type StatusUpdateInsert =
  Database["public"]["Tables"]["status_updates"]["Insert"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type RewardInsert = Database["public"]["Tables"]["rewards"]["Insert"];

// Enums
export type WasteCategory = Database["public"]["Enums"]["waste_category"];
export type SeverityLevel = Database["public"]["Enums"]["severity_level"];
export type ReportStatus = Database["public"]["Enums"]["report_status"];
export type EventStatus = Database["public"]["Enums"]["event_status"];
export type RewardCategory = Database["public"]["Enums"]["reward_category"];
export type RedemptionStatus = Database["public"]["Enums"]["redemption_status"];
export type ReferralStatus = Database["public"]["Enums"]["referral_status"];
export type UserTier = Database["public"]["Enums"]["user_tier"];

// Joined types
export type ReportWithProfile = Report & {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
};

export type ReportDetail = ReportWithProfile & {
  status_updates: (StatusUpdate & {
    profiles: Pick<Profile, "full_name">;
  })[];
  user_has_upvoted: boolean;
};

// Map marker (lightweight for rendering)
export type MapMarker = Pick<
  Report,
  "id" | "title" | "latitude" | "longitude" | "category" | "severity" | "status"
>;

// Events
export type EventWithOrganizer = Event & {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
};

export type EventDetail = EventWithOrganizer & {
  event_attendees: (EventAttendee & {
    profiles: Pick<Profile, "full_name" | "avatar_url">;
  })[];
  attendee_count: number;
  user_is_attending: boolean;
  user_rsvp_status: string | null;
};

// Dashboard
export interface DashboardStats {
  total_reports: number;
  pending_reports: number;
  resolved_reports: number;
  in_progress_reports: number;
  reports_this_week: number;
  reports_this_month: number;
}

export interface CategoryCount {
  category: WasteCategory;
  count: number;
}

export interface StatusCount {
  status: ReportStatus;
  count: number;
}

// Leaderboard
export interface LeaderboardEntry {
  id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  rank: number;
  tier?: UserTier;
  report_count?: number;
  event_count?: number;
}

// Admin
export interface AdminStats {
  total_users: number;
  total_reports: number;
  total_events: number;
  pending_reports: number;
  resolved_reports: number;
  new_users_this_week: number;
  new_users_this_month: number;
  reports_this_week: number;
  reports_this_month: number;
}

export interface ProfileWithEmail extends Profile {
  email: string;
  report_count: number;
}

export interface AdminReportEntry extends Report {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
}

export interface AdminEventEntry extends Event {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
  attendee_count: number;
}

// Rewards
export type RewardWithRedemptionCount = Reward & {
  redemption_count: number;
};

export type RedemptionWithReward = Redemption & {
  rewards: Pick<Reward, "name" | "category" | "image_url"> | null;
};

// Referrals
export type ReferralWithProfile = Referral & {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
};

// Challenges
export type ChallengeWithProgress = Challenge & {
  user_progress: number;
  user_completed: boolean;
};
