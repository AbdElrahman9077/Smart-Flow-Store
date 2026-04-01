import { supabase } from "./supabase";

export async function signUpUser(email, password) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function signInUser(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOutUser() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}