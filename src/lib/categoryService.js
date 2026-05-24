import { supabase } from "./supabase";

const fallbackCategories = ["Dashboards", "Inventory", "Sales & CRM", "HR & Payroll", "Finance", "Free Templates"];

export async function getCategories() {
  try {
    const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
    if (error) throw error;
    return { data: data || [], error: null };
  } catch {
    return { data: fallbackCategories.map((name, index) => ({ id: index + 1, name, slug: name.toLowerCase().replace(/\s+|&/g, "-") })), error: null };
  }
}
