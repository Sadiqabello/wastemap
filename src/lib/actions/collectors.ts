"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COLLECTOR_COMMISSION_PERCENT, RECYCLING_VALUES } from "@/lib/constants";
import { createNotification } from "@/lib/actions/notifications";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Register as a waste collector.
 */
export async function registerCollector(formData: FormData) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  // Check if already registered
  const { data: existing } = await adminClient
    .from("collector_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) return { error: "You are already registered as a collector." };

  const businessName = formData.get("business_name") as string;
  const businessRegistration = formData.get("business_registration") as string;
  const description = formData.get("description") as string;
  const wasteCategories = (formData.get("waste_categories") as string || "").split(",").filter(Boolean);
  const serviceAreaRadius = Number(formData.get("service_area_radius") || 10);
  const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : null;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;

  if (!businessName) return { error: "Business name is required." };
  if (wasteCategories.length === 0) return { error: "Select at least one waste category." };

  const { error } = await adminClient.from("collector_profiles").insert({
    user_id: user.id,
    business_name: businessName,
    business_registration: businessRegistration || null,
    description: description || null,
    waste_categories: wasteCategories,
    service_area_radius: serviceAreaRadius,
    latitude,
    longitude,
    address: address || null,
    phone: phone || null,
  });

  if (error) {
    console.error("Error registering collector:", error);
    return { error: "Failed to register as collector." };
  }

  revalidatePath("/collectors");
  return { success: true };
}

/**
 * Resubmit a rejected/suspended collector application with updated details.
 */
export async function resubmitCollector(formData: FormData) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("collector_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!existing) return { error: "No collector profile found." };
  if (existing.status === "verified") return { error: "Your profile is already verified." };
  if (existing.status === "pending") return { error: "Your application is already pending review." };

  const businessName = formData.get("business_name") as string;
  const businessRegistration = formData.get("business_registration") as string;
  const description = formData.get("description") as string;
  const wasteCategories = (formData.get("waste_categories") as string || "").split(",").filter(Boolean);
  const serviceAreaRadius = Number(formData.get("service_area_radius") || 10);
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;

  if (!businessName) return { error: "Business name is required." };
  if (wasteCategories.length === 0) return { error: "Select at least one waste category." };

  const { error } = await adminClient
    .from("collector_profiles")
    .update({
      business_name: businessName,
      business_registration: businessRegistration || null,
      description: description || null,
      waste_categories: wasteCategories,
      service_area_radius: serviceAreaRadius,
      address: address || null,
      phone: phone || null,
      status: "pending",
      review_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (error) {
    console.error("Error resubmitting collector:", error);
    return { error: "Failed to resubmit application." };
  }

  revalidatePath("/collectors/dashboard");
  return { success: true };
}

/**
 * Request pickup on a report (cleanup or sell for recycling).
 */
export async function requestPickup(
  reportId: string,
  pickupType: "cleanup" | "recycling",
  estimatedWeightKg?: number
) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  // Verify user owns this report
  const { data: report } = await adminClient
    .from("reports")
    .select("user_id, pickup_type")
    .eq("id", reportId)
    .single();

  if (!report) return { error: "Report not found." };
  if (report.user_id !== user.id) return { error: "Only the report owner can request pickup." };
  if (report.pickup_type) return { error: "Pickup already requested for this report." };

  const { error } = await adminClient
    .from("reports")
    .update({
      pickup_type: pickupType,
      estimated_weight_kg: estimatedWeightKg || null,
    })
    .eq("id", reportId);

  if (error) {
    console.error("Error requesting pickup:", error);
    return { error: "Failed to request pickup." };
  }

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/collectors/browse");
  return { success: true };
}

/**
 * Cancel a pickup request (report owner, only if no accepted bids).
 */
export async function cancelPickupRequest(reportId: string) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  const { data: report } = await adminClient
    .from("reports")
    .select("user_id")
    .eq("id", reportId)
    .single();

  if (!report) return { error: "Report not found." };
  if (report.user_id !== user.id) return { error: "Only the report owner can cancel." };

  // Check no accepted bids
  const { data: acceptedBids } = await adminClient
    .from("pickup_bids")
    .select("id")
    .eq("report_id", reportId)
    .eq("status", "accepted")
    .limit(1);

  if (acceptedBids && acceptedBids.length > 0) {
    return { error: "Cannot cancel — a bid has already been accepted." };
  }

  // Cancel all pending bids
  await adminClient
    .from("pickup_bids")
    .update({ status: "cancelled" })
    .eq("report_id", reportId)
    .eq("status", "pending");

  await adminClient
    .from("reports")
    .update({ pickup_type: null, estimated_weight_kg: null })
    .eq("id", reportId);

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/collectors/browse");
  return { success: true };
}

/**
 * Place a bid on a waste report for pickup.
 *
 * Cleanup bids: bid_amount = what reporter will pay the collector.
 * Recycling bids: bid_amount = what collector will pay the reporter for materials.
 */
export async function placeBid(
  reportId: string,
  bidAmount: number,
  estimatedTime: string,
  notes?: string
) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  // Verify user is a verified collector
  const { data: collector } = await adminClient
    .from("collector_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!collector || collector.status !== "verified") {
    return { error: "Only verified collectors can place bids." };
  }

  // Get report to determine bid type
  const { data: report } = await adminClient
    .from("reports")
    .select("pickup_type, user_id")
    .eq("id", reportId)
    .single();

  if (!report || !report.pickup_type) {
    return { error: "This report is not open for pickup." };
  }

  if (report.user_id === user.id) {
    return { error: "You cannot bid on your own report." };
  }

  if (bidAmount < 200) return { error: "Minimum bid is ₦200." };
  if (!estimatedTime) return { error: "Provide an estimated pickup time." };

  const platformFee = Math.round((bidAmount * COLLECTOR_COMMISSION_PERCENT) / 100);

  const { error } = await adminClient.from("pickup_bids").insert({
    report_id: reportId,
    collector_id: user.id,
    bid_amount: bidAmount,
    estimated_time: estimatedTime,
    notes: notes || null,
    platform_fee: platformFee,
    bid_type: report.pickup_type,
  });

  if (error) {
    if (error.code === "23505") return { error: "You already have a bid on this report." };
    console.error("Error placing bid:", error);
    return { error: "Failed to place bid." };
  }

  // Notify the report owner about the new bid
  createNotification(
    report.user_id,
    "bid_received",
    "New Bid Received",
    `A collector placed a bid of ₦${bidAmount} on your report`,
    { reportId, bidAmount }
  ).catch(() => {});

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/collectors/dashboard");
  revalidatePath("/collectors/browse");
  return { success: true };
}

/**
 * Accept a bid (report owner action).
 */
export async function acceptBid(bidId: string) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  // Get bid and verify report ownership
  const { data: bid } = await adminClient
    .from("pickup_bids")
    .select("*")
    .eq("id", bidId)
    .single();

  if (!bid) return { error: "Bid not found." };

  // Verify report ownership
  const { data: report } = await adminClient
    .from("reports")
    .select("user_id")
    .eq("id", bid.report_id)
    .single();

  if (report?.user_id !== user.id) return { error: "Only the report owner can accept bids." };
  if (bid.status !== "pending") return { error: "This bid is no longer pending." };

  // Accept this bid
  await adminClient
    .from("pickup_bids")
    .update({ status: "accepted" })
    .eq("id", bidId);

  // Reject other bids on the same report
  await adminClient
    .from("pickup_bids")
    .update({ status: "rejected" })
    .eq("report_id", bid.report_id)
    .neq("id", bidId)
    .eq("status", "pending");

  // Notify the collector whose bid was accepted
  createNotification(
    bid.collector_id,
    "bid_accepted",
    "Bid Accepted!",
    "Your bid was accepted",
    { bidId, reportId: bid.report_id }
  ).catch(() => {});

  revalidatePath(`/reports/${bid.report_id}`);
  return { success: true };
}

/**
 * Complete a pickup (collector marks as done).
 *
 * Payment direction:
 * - Cleanup: reporter pays bid_amount → collector gets bid_amount - platform_fee
 * - Recycling: collector pays bid_amount to reporter → collector also pays platform_fee
 */
export async function completeBid(bidId: string) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  const { data: bid } = await adminClient
    .from("pickup_bids")
    .select("*")
    .eq("id", bidId)
    .single();

  if (!bid) return { error: "Bid not found." };
  if (bid.collector_id !== user.id) return { error: "Only the collector can complete this bid." };
  if (bid.status !== "accepted") return { error: "Bid must be accepted first." };

  // Get report to find the owner
  const { data: report } = await adminClient
    .from("reports")
    .select("user_id, pickup_type")
    .eq("id", bid.report_id)
    .single();

  if (!report) return { error: "Report not found." };

  const isRecycling = bid.bid_type === "recycling";
  const collectorEarnings = isRecycling ? 0 : bid.bid_amount - bid.platform_fee;

  // Mark bid as completed
  await adminClient
    .from("pickup_bids")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", bidId);

  // Update collector stats
  const { data: collectorProfile } = await adminClient
    .from("collector_profiles")
    .select("total_pickups, total_earnings")
    .eq("user_id", user.id)
    .single();

  if (collectorProfile) {
    await adminClient
      .from("collector_profiles")
      .update({
        total_pickups: collectorProfile.total_pickups + 1,
        total_earnings: collectorProfile.total_earnings + collectorEarnings,
      })
      .eq("user_id", user.id);
  }

  if (isRecycling) {
    // Recycling: Collector pays reporter for the materials
    // Award points to reporter (bid_amount as points = naira equivalent)
    const { data: reporterProfile } = await adminClient
      .from("profiles")
      .select("points")
      .eq("id", report.user_id)
      .single();

    if (reporterProfile) {
      await adminClient
        .from("profiles")
        .update({ points: reporterProfile.points + bid.bid_amount })
        .eq("id", report.user_id);

      await adminClient.from("point_transactions").insert({
        user_id: report.user_id,
        action: `Recycling sale: ₦${bid.bid_amount} for collected materials`,
        points: bid.bid_amount,
      });
    }

    // Record platform commission from the collector side
    await adminClient.from("platform_revenue").insert({
      source: "recycling_commission",
      amount_naira: bid.platform_fee,
      reference_id: bidId,
      reference_type: "pickup_bid",
      description: `${COLLECTOR_COMMISSION_PERCENT}% commission on ₦${bid.bid_amount} recycling purchase`,
    });
  } else {
    // Cleanup: Reporter pays collector. Platform takes commission from collector's share.
    // Award points to collector (earnings = bid_amount - platform_fee)
    const { data: collectorUserProfile } = await adminClient
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    if (collectorUserProfile) {
      await adminClient
        .from("profiles")
        .update({ points: collectorUserProfile.points + collectorEarnings })
        .eq("id", user.id);

      await adminClient.from("point_transactions").insert({
        user_id: user.id,
        action: `Cleanup payment: ₦${collectorEarnings} (after ${COLLECTOR_COMMISSION_PERCENT}% fee)`,
        points: collectorEarnings,
      });
    }

    // Deduct points from reporter
    const { data: reporterProfile } = await adminClient
      .from("profiles")
      .select("points")
      .eq("id", report.user_id)
      .single();

    if (reporterProfile) {
      await adminClient
        .from("profiles")
        .update({ points: Math.max(0, reporterProfile.points - bid.bid_amount) })
        .eq("id", report.user_id);

      await adminClient.from("point_transactions").insert({
        user_id: report.user_id,
        action: `Cleanup fee: ₦${bid.bid_amount} paid to collector`,
        points: -bid.bid_amount,
      });
    }

    // Record platform commission
    await adminClient.from("platform_revenue").insert({
      source: "collector_commission",
      amount_naira: bid.platform_fee,
      reference_id: bidId,
      reference_type: "pickup_bid",
      description: `${COLLECTOR_COMMISSION_PERCENT}% commission on ₦${bid.bid_amount} cleanup`,
    });
  }

  // Clear the pickup_type on the report now that it's completed
  await adminClient
    .from("reports")
    .update({ pickup_type: null })
    .eq("id", bid.report_id);

  // Notify the report owner that the pickup is completed
  createNotification(
    report.user_id,
    "bid_completed",
    "Pickup Completed",
    "The collector has completed the pickup",
    { bidId, reportId: bid.report_id }
  ).catch(() => {});

  revalidatePath(`/reports/${bid.report_id}`);
  revalidatePath("/collectors/dashboard");
  revalidatePath("/collectors/browse");
  return { success: true };
}

/**
 * Review a collector after completed pickup.
 */
export async function reviewCollector(
  bidId: string,
  rating: number,
  comment?: string
) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  if (rating < 1 || rating > 5) return { error: "Rating must be 1-5." };

  const adminClient = createAdminClient();

  const { data: bid } = await adminClient
    .from("pickup_bids")
    .select("*")
    .eq("id", bidId)
    .single();

  if (!bid) return { error: "Bid not found." };
  if (bid.status !== "completed") return { error: "Can only review completed pickups." };

  // Verify report ownership
  const { data: report } = await adminClient
    .from("reports")
    .select("user_id")
    .eq("id", bid.report_id)
    .single();

  if (report?.user_id !== user.id) return { error: "Only the report owner can review." };

  const { error } = await adminClient.from("collector_reviews").insert({
    bid_id: bidId,
    reviewer_id: user.id,
    collector_id: bid.collector_id,
    rating,
    comment: comment || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "You already reviewed this pickup." };
    console.error("Error creating review:", error);
    return { error: "Failed to submit review." };
  }

  // Update collector's average rating
  const { data: reviews } = await adminClient
    .from("collector_reviews")
    .select("rating")
    .eq("collector_id", bid.collector_id);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await adminClient
      .from("collector_profiles")
      .update({ rating: Math.round(avgRating * 100) / 100 })
      .eq("user_id", bid.collector_id);
  }

  revalidatePath("/collectors");
  return { success: true };
}
