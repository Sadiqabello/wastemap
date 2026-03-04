"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "All fields are required." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, user.identities will be empty for
  // already-existing users, and the session won't be set yet for new users
  // who need to confirm their email.
  if (data.user && !data.session) {
    // Email confirmation is enabled — don't redirect, tell the user
    return {
      success: true,
      message:
        "Account created! Please check your email and click the confirmation link, then log in.",
    };
  }

  // Auto-confirmed (email confirmation disabled) — redirect to home
  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Email not confirmed. Please check your inbox and click the confirmation link first.",
      };
    }
    return { error: error.message };
  }

  const redirectTo = formData.get("redirectTo") as string;
  redirect(redirectTo || "/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
