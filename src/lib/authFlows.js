import { supabase } from "./supabase";

export async function registerWithEmail({ fullName, email, password, language }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
        language: language || "en",
      },
      emailRedirectTo: `${window.location.origin}/verify-otp`,
    },
  });

  if (!error) {
    sessionStorage.setItem("pending_signup_email", email);
  }

  return { data, error };
}

export async function verifySignupOtp({ email, token }) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });
}

export async function resendSignupOtp(email) {
  return supabase.auth.resend({
    type: "signup",
    email,
  });
}

export async function sendResetPasswordEmail(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function updateCurrentUserPassword(password) {
  return supabase.auth.updateUser({
    password,
  });
}