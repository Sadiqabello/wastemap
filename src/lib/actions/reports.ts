"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validators/report";
import { awardPoints } from "@/lib/actions/points";
import { updateChallengeProgress } from "@/lib/actions/challenges";
import { trackReferralMilestone } from "@/lib/actions/referrals";
import { checkAndAwardAchievements } from "@/lib/actions/achievements";
import type { ReportStatus } from "@/types";

export async function createReport(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in to create a report." };
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    severity: formData.get("severity"),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    address: (formData.get("address") as string) || undefined,
  };

  const parsed = reportSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const photoUrls = formData.getAll("photoUrls") as string[];

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      ...parsed.data,
      user_id: user.id,
      photo_urls: photoUrls,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating report:", error);
    return { error: "Failed to create report. Please try again." };
  }

  // Award points for submitting a report
  await awardPoints(user.id, "report_created", report.id);

  // Award bonus points for including photos
  if (photoUrls.length > 0) {
    await awardPoints(user.id, "photos_uploaded", report.id);
    updateChallengeProgress(user.id, "photos_uploaded").catch(() => {});
  }

  // Track challenge progress, referral milestones, and achievements
  updateChallengeProgress(user.id, "report_created").catch(() => {});
  trackReferralMilestone(user.id, "first_report").catch(() => {});
  checkAndAwardAchievements(user.id).catch(() => {});

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  comment?: string,
  photoUrls?: string[]
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  // Get current report status and owner
  const { data: report } = await supabase
    .from("reports")
    .select("status, user_id")
    .eq("id", reportId)
    .single();

  if (!report) {
    return { error: "Report not found." };
  }

  // Update report status (and cleanup photos if resolving)
  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === "resolved" && photoUrls && photoUrls.length > 0) {
    updateData.cleanup_photo_urls = photoUrls;
  }

  const { error: updateError } = await supabase
    .from("reports")
    .update(updateData)
    .eq("id", reportId);

  if (updateError) {
    console.error("Error updating report status:", updateError);
    return { error: "Failed to update status." };
  }

  // Create status update audit trail with photos
  await supabase.from("status_updates").insert({
    report_id: reportId,
    changed_by: user.id,
    old_status: report.status,
    new_status: newStatus,
    comment: comment || null,
    photo_urls: photoUrls || [],
  });

  // Award points based on status change
  if (newStatus === "acknowledged") {
    await awardPoints(report.user_id, "report_acknowledged", reportId);
  } else if (newStatus === "resolved") {
    await awardPoints(report.user_id, "report_resolved", reportId);
    // Award points to the person who resolved it too
    if (user.id !== report.user_id) {
      await awardPoints(user.id, "resolved_report", reportId);
    }
  }

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function deleteReport(reportId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting report:", error);
    return { error: "Failed to delete report." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleUpvote(reportId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in to upvote." };
  }

  // Check if user already upvoted
  const { data: existing } = await supabase
    .from("upvotes")
    .select("user_id")
    .eq("report_id", reportId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Remove upvote
    await supabase
      .from("upvotes")
      .delete()
      .eq("report_id", reportId)
      .eq("user_id", user.id);

    // Decrement count
    await supabase
      .from("reports")
      .update({
        upvote_count: (
          await supabase
            .from("reports")
            .select("upvote_count")
            .eq("id", reportId)
            .single()
        ).data!.upvote_count - 1,
      })
      .eq("id", reportId);
  } else {
    // Add upvote
    await supabase.from("upvotes").insert({
      report_id: reportId,
      user_id: user.id,
    });

    // Increment count
    await supabase
      .from("reports")
      .update({
        upvote_count: (
          await supabase
            .from("reports")
            .select("upvote_count")
            .eq("id", reportId)
            .single()
        ).data!.upvote_count + 1,
      })
      .eq("id", reportId);

    // Award point for upvoting
    await awardPoints(user.id, "upvoted_report", reportId);
    updateChallengeProgress(user.id, "upvoted_report").catch(() => {});
  }

  revalidatePath(`/reports/${reportId}`);
  return { success: true, upvoted: !existing };
}
