"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validators/report";
import { awardPoints } from "@/lib/actions/points";
import { updateChallengeProgress } from "@/lib/actions/challenges";
import { trackReferralMilestone } from "@/lib/actions/referrals";
import { checkAndAwardAchievements } from "@/lib/actions/achievements";
import { createNotification } from "@/lib/actions/notifications";
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
    category: formData.getAll("category"),
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
    .maybeSingle();

  if (!report) {
    return { error: "Report not found." };
  }

  // Authorize: only the owner OR an authority/admin can change status.
  // Additionally, an owner cannot mark their own report "resolved" — that
  // step must be confirmed by an authority/admin so users can't farm the
  // report_resolved points by self-resolving.
  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = actorProfile?.role;
  const isPrivileged = role === "authority" || role === "admin";
  const isOwner = report.user_id === user.id;

  if (!isOwner && !isPrivileged) {
    return { error: "You don't have permission to change this report's status." };
  }
  if (newStatus === "resolved" && !isPrivileged) {
    return {
      error: "Only an authority or admin can mark a report resolved.",
    };
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

  // Notify the report owner about the status change
  if (report.user_id !== user.id) {
    const { data: reportData } = await supabase
      .from("reports")
      .select("title")
      .eq("id", reportId)
      .single();
    createNotification(
      report.user_id,
      "report_status_changed",
      "Report Status Updated",
      `Your report '${reportData?.title || "Untitled"}' was updated to ${newStatus}`,
      { reportId, newStatus }
    ).catch(() => {});
  }

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

  // upvote_count on reports is maintained automatically by the
  // trg_sync_upvote_count trigger (migration 017), so the action only needs
  // to insert or delete the upvotes row.
  const { data: existing } = await supabase
    .from("upvotes")
    .select("user_id")
    .eq("report_id", reportId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("upvotes")
      .delete()
      .eq("report_id", reportId)
      .eq("user_id", user.id);
  } else {
    const { error: insertError } = await supabase.from("upvotes").insert({
      report_id: reportId,
      user_id: user.id,
    });
    // If a race causes a duplicate insert, treat as no-op rather than fail.
    if (insertError && insertError.code !== "23505") {
      console.error("toggleUpvote insert failed:", insertError);
      return { error: "Failed to upvote." };
    }

    // Award points + notify only on first upvote
    await awardPoints(user.id, "upvoted_report", reportId);
    updateChallengeProgress(user.id, "upvoted_report").catch((e) =>
      console.warn("updateChallengeProgress failed:", e)
    );

    const { data: reportData } = await supabase
      .from("reports")
      .select("user_id, title")
      .eq("id", reportId)
      .maybeSingle();
    if (reportData && reportData.user_id !== user.id) {
      createNotification(
        reportData.user_id,
        "report_upvoted",
        "Report Upvoted",
        `Someone upvoted your report '${reportData.title || "Untitled"}'`,
        { reportId }
      ).catch((e) => console.warn("createNotification failed:", e));
    }
  }

  revalidatePath(`/reports/${reportId}`);
  return { success: true, upvoted: !existing };
}
