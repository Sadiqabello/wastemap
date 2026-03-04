"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDisplayName(fullName: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  const trimmed = fullName.trim();
  if (!trimmed || trimmed.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }
  if (trimmed.length > 100) {
    return { error: "Name must be under 100 characters." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmed })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating display name:", error);
    return { error: "Failed to update name." };
  }

  // Also update auth user metadata so it stays in sync
  await supabase.auth.updateUser({
    data: { full_name: trimmed },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating avatar:", error);
    return { error: "Failed to update profile picture." };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect." };
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("Error changing password:", updateError);
    return { error: "Failed to change password. Please try again." };
  }

  return { success: true };
}
