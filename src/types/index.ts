import type {
  Database,
  CollectorProfileRow,
  PickupBidRow,
  CollectorReviewRow,
  SponsorshipRow,
  SponsoredRewardRow,
  CarbonTrackingRow,
  AchievementRow,
  UserAchievementRow,
  PremiumSubscriptionRow,
  PlatformRevenueRow,
  DumpSiteRow,
} from "./database";

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

// ── Revenue Feature Types ────────────────────────────────────

export type CollectorProfile = CollectorProfileRow;
export type PickupBid = PickupBidRow;
export type CollectorReview = CollectorReviewRow;
export type Sponsorship = SponsorshipRow;
export type SponsoredReward = SponsoredRewardRow;
export type CarbonTracking = CarbonTrackingRow;
export type Achievement = AchievementRow;
export type UserAchievement = UserAchievementRow;
export type PremiumSubscription = PremiumSubscriptionRow;
export type PlatformRevenue = PlatformRevenueRow;

// Joined types for revenue features
export type CollectorWithProfile = CollectorProfile & {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
};

export type BidWithCollector = PickupBid & {
  collector_profiles: Pick<CollectorProfile, "business_name" | "rating" | "total_pickups">;
  profiles: Pick<Profile, "full_name" | "avatar_url">;
};

export type BidWithReport = PickupBid & {
  reports: Pick<Report, "title" | "category" | "severity" | "address">;
};

export type AchievementWithEarned = Achievement & {
  earned: boolean;
  earned_at: string | null;
};

export type SponsorshipWithSpend = Sponsorship & {
  sponsored_rewards: SponsoredReward[];
};

export interface CarbonStats {
  tracked_reports: number;
  total_weight_kg: number;
  total_co2_avoided_kg: number;
  verified_co2_kg: number;
  certified_co2_kg: number;
}

export interface RevenueStats {
  total_revenue: number;
  fee_revenue: number;
  commission_revenue: number;
  subscription_revenue: number;
  sponsorship_revenue: number;
  revenue_this_week: number;
  revenue_this_month: number;
}

// Dump Sites
export type DumpSite = DumpSiteRow;
export type DumpSiteType = Database["public"]["Enums"]["dump_site_type"];
export type DumpSiteStatus = Database["public"]["Enums"]["dump_site_status"];

export type DumpSiteWithProfile = DumpSite & {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
};

export type DumpSiteMapMarker = Pick<
  DumpSite,
  "id" | "name" | "latitude" | "longitude" | "site_type" | "status" | "is_free"
>;

export interface CollectorStats {
  active_collectors: number;
  pending_collectors: number;
  total_pickups: number;
  total_collector_earnings: number;
}
