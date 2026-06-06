import { isSupabaseConfigured, supabase } from "./supabase";
import { normalizeProductType, productTypeAliases } from "./productTypes";

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
    product_type: "digital_download",
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
    product_type: "digital_download",
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
    product_type: "digital_download",
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
    product_type: "digital_download",
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
    product_type: "free_product",
    status: "published",
  },
  {
    id: 6,
    title: "Smart Operations Web App",
    slug: "smart-operations-web-app",
    description: "Custom web app service for dashboards, workflows, and admin portals.",
    short_description: "Request a scoped custom web app project.",
    price: 0,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900",
    category: "Web Apps",
    tags: ["Web App", "Custom", "Portal"],
    featured: false,
    is_active: true,
    product_type: "custom_service",
    status: "published",
    roadmap_status: "Available by request",
    features: ["Discovery scope", "Admin dashboard", "Customer portal", "Workflow automation"],
  },
  {
    id: 7,
    title: "Smart Flow SaaS CRM",
    slug: "smart-flow-saas-crm",
    description: "Roadmap SaaS product placeholder for subscription-based CRM workflows.",
    short_description: "SaaS product roadmap entry. Request a demo or discovery call.",
    price: 0,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=900",
    category: "SaaS Products",
    tags: ["SaaS", "CRM", "Roadmap"],
    featured: false,
    is_active: true,
    product_type: "saas_product",
    status: "published",
    roadmap_status: "Coming soon",
    features: ["Subscription plans planned", "Workspace provisioning planned", "Request demo only"],
  },
  {
    id: 8,
    title: "Desktop POS Foundation",
    slug: "desktop-pos-foundation",
    description: "Roadmap desktop software product placeholder for offline-first POS workflows.",
    short_description: "Desktop product roadmap entry. License activation is not live yet.",
    price: 0,
    currency: "EGP",
    cover_image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900",
    category: "Desktop Software",
    tags: ["Desktop", "POS", "Roadmap"],
    featured: false,
    is_active: true,
    product_type: "desktop_app",
    status: "published",
    roadmap_status: "Coming soon",
    system_requirements: "Requirements will be published with the production release.",
    features: ["Offline-first roadmap", "Installer releases planned", "Device activation not implemented"],
  },
];

function normalizeProduct(product) {
  if (!product) return product;
  return {
    ...product,
    product_type: normalizeProductType(product.product_type),
  };
}

function normalizeProducts(products) {
  return (products || []).map(normalizeProduct);
}

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
  if (!isSupabaseConfigured) {
    let products = FALLBACK_PRODUCTS.filter((p) => p.is_active);
    if (category) products = products.filter((p) => p.category === category);
    if (productType) products = products.filter((p) => productTypeAliases(productType).includes(p.product_type));
    if (featured !== null) products = products.filter((p) => p.featured === featured);
    if (search) products = products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (limit) products = products.slice(0, limit);
    return { data: normalizeProducts(products), error: null };
  }

  try {
    let query = supabase
      .from("products")
      .select(
        "id, title, slug, description, short_description, price, old_price, sale_price, currency, cover_image_url, image_url, image_urls, featured, category, category_id, tags, is_active, product_type, status, visibility, sort_order, version, compatibility, license_type, download_limit, features, roadmap_status, cta_label, cta_url, system_requirements, updated_at"
      )
      .eq("is_active", true)
      .eq("status", "published");

    if (category) query = query.eq("category", category);
    if (productType) query = query.in("product_type", productTypeAliases(productType));
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

    return { data: normalizeProducts(data), error: null };
  } catch (err) {
    console.warn("[productService] Falling back to static data:", err?.message);
    let products = FALLBACK_PRODUCTS.filter((p) => p.is_active);
    if (category) products = products.filter((p) => p.category === category);
    if (productType) products = products.filter((p) => productTypeAliases(productType).includes(p.product_type));
    if (featured !== null) products = products.filter((p) => p.featured === featured);
    if (search) products = products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (limit) products = products.slice(0, limit);
    return { data: normalizeProducts(products), error: null };
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id) {
  const numId = Number(id);
  if (isNaN(numId)) return { data: null, error: "Invalid product ID" };

  if (!isSupabaseConfigured) {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === numId);
    return { data: normalizeProduct(fallback) || null, error: fallback ? null : "Product not found" };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", numId)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return { data: normalizeProduct(data), error: null };
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === numId);
    return { data: normalizeProduct(fallback) || null, error: fallback ? null : "Product not found" };
  }
}

/**
 * Get a product by slug
 */
export async function getProductBySlug(slug) {
  if (!isSupabaseConfigured) {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    return { data: normalizeProduct(fallback) || null, error: fallback ? null : "Product not found" };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return { data: normalizeProduct(data), error: null };
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    return { data: normalizeProduct(fallback) || null, error: null };
  }
}

/**
 * Get related products (same category, different ID)
 */
export async function getRelatedProducts(productId, category, limit = 4) {
  if (!isSupabaseConfigured) {
    return { data: normalizeProducts(FALLBACK_PRODUCTS.filter((p) => p.id !== productId && (!category || p.category === category)).slice(0, limit)), error: null };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, price, old_price, currency, cover_image_url, category, featured, product_type")
      .eq("is_active", true)
      .eq("status", "published")
      .eq("category", category)
      .neq("id", productId)
      .limit(limit);

    if (error) throw error;
    return { data: normalizeProducts(data), error: null };
  } catch {
    return { data: normalizeProducts(FALLBACK_PRODUCTS.filter((p) => p.id !== productId).slice(0, limit)), error: null };
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
    return { data: normalizeProducts(data), error: null };
  } catch (err) {
    return { data: [], error: err?.message || "Failed to load products" };
  }
}
