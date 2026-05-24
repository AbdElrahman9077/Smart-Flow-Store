import { supabase } from "./supabase";

/**
 * Product Service
 * Fetches and manages products. Falls back gracefully if Supabase is not configured.
 */

// Static fallback products
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: "Sales Dashboard",
    slug: "sales-dashboard",
    description: "Interactive Excel dashboard for tracking sales performance.",
    short_description: "Track sales with a powerful interactive dashboard.",
    long_description:
      "A fully interactive Excel dashboard for sales teams. Track performance, targets, products, and reps in one clean interface. No VBA required.",
    price: 1200,
    old_price: 1800,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900",
    category: "Dashboards",
    tags: ["Sales", "Dashboard", "KPI"],
    featured: true,
    is_active: true,
    product_type: "system",
    status: "published",
    version: "2.1",
    compatibility: "Excel 2016+",
    license_type: "single",
    download_limit: 3,
    features: ["Sales tracking", "KPI metrics", "Monthly charts", "Team performance"],
    what_you_get: ["Excel file (.xlsx)", "User guide (PDF)", "1 year support"],
  },
  {
    id: 2,
    title: "Inventory Management Sheet",
    slug: "inventory-management-sheet",
    description: "Excel sheet for stock tracking, alerts, and item management.",
    short_description: "Manage inventory with stock alerts and reporting.",
    price: 950,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900",
    category: "Inventory",
    tags: ["Inventory", "Stock", "Warehouse"],
    featured: true,
    is_active: true,
    product_type: "template",
    status: "published",
    version: "1.5",
    compatibility: "Excel 2013+",
    license_type: "single",
    features: ["Low stock alerts", "Barcode ready", "Auto reports", "Supplier tracking"],
  },
  {
    id: 3,
    title: "CRM System",
    slug: "crm-system",
    description: "Simple Excel CRM for managing leads, clients, and follow-ups.",
    price: 1800,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=900",
    category: "Sales & CRM",
    tags: ["CRM", "Leads", "Clients"],
    featured: false,
    is_active: true,
    product_type: "system",
    status: "published",
    version: "3.0",
    compatibility: "Excel 2016+",
  },
  {
    id: 4,
    title: "HR & Attendance Tracker",
    slug: "hr-attendance-tracker",
    description: "Excel sheet for employee data, attendance, and follow-up.",
    price: 1100,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900",
    category: "HR & Payroll",
    tags: ["HR", "Attendance", "Payroll"],
    featured: false,
    is_active: true,
    product_type: "system",
    status: "published",
  },
  {
    id: 5,
    title: "Free Budget Planner",
    slug: "free-budget-planner",
    description: "Free Excel budget planner for personal and small business use.",
    price: 0,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900",
    category: "Finance",
    tags: ["Budget", "Free", "Finance"],
    featured: false,
    is_active: true,
    product_type: "free",
    status: "published",
  },
];

/**
 * Get all active/published products with optional filters
 */
export async function getProducts({
  category = null,
  productType = null,
  featured = null,
  search = null,
  limit = null,
  orderBy = "featured",
} = {}) {
  try {
    let query = supabase
      .from("products")
      .select(
        "id, title, slug, description, short_description, price, old_price, sale_price, currency, cover_image_url, image_url, image_urls, featured, category, category_id, tags, is_active, product_type, status, version, compatibility, license_type, download_limit, features, updated_at"
      )
      .eq("is_active", true)
      .eq("status", "published");

    if (category) query = query.eq("category", category);
    if (productType) query = query.eq("product_type", productType);
    if (featured !== null) query = query.eq("featured", featured);
    if (search) query = query.ilike("title", `%${search}%`);

    if (orderBy === "featured") {
      query = query
        .order("featured", { ascending: false })
        .order("updated_at", { ascending: false });
    } else if (orderBy === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (orderBy === "price_desc") {
      query = query.order("price", { ascending: false });
    } else if (orderBy === "newest") {
      query = query.order("created_at", { ascending: false });
    }

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    return { data: data || [], error: null };
  } catch (err) {
    console.warn("[productService] Falling back to static data:", err?.message);
    let products = FALLBACK_PRODUCTS.filter((p) => p.is_active);
    if (category) products = products.filter((p) => p.category === category);
    if (productType) products = products.filter((p) => p.product_type === productType);
    if (featured !== null) products = products.filter((p) => p.featured === featured);
    if (search) products = products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (limit) products = products.slice(0, limit);
    return { data: products, error: null };
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id) {
  const numId = Number(id);
  if (isNaN(numId)) return { data: null, error: "Invalid product ID" };

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", numId)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === numId);
    return { data: fallback || null, error: fallback ? null : "Product not found" };
  }
}

/**
 * Get a product by slug
 */
export async function getProductBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    return { data: fallback || null, error: null };
  }
}

/**
 * Get related products (same category, different ID)
 */
export async function getRelatedProducts(productId, category, limit = 4) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, price, old_price, currency, cover_image_url, category, featured")
      .eq("is_active", true)
      .eq("status", "published")
      .eq("category", category)
      .neq("id", productId)
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch {
    return { data: FALLBACK_PRODUCTS.filter((p) => p.id !== productId).slice(0, limit), error: null };
  }
}

/**
 * Admin: get all products (including inactive)
 */
export async function adminGetProducts(search = "") {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err?.message || "Failed to load products" };
  }
}
