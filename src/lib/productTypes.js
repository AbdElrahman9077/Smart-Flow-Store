export const PRODUCT_TYPES = [
  "digital_download",
  "saas_product",
  "desktop_app",
  "custom_service",
  "bundle",
  "free_product",
];

export const LEGACY_PRODUCT_TYPE_MAP = {
  template: "digital_download",
  system: "digital_download",
  free: "free_product",
  service: "custom_service",
};

export const PRODUCT_TYPE_OPTIONS = [
  { value: "digital_download", label: "Digital Download Product" },
  { value: "saas_product", label: "SaaS Product" },
  { value: "desktop_app", label: "Desktop Software Product" },
  { value: "custom_service", label: "Custom Service Product" },
  { value: "bundle", label: "Bundle Product" },
  { value: "free_product", label: "Free Product" },
];

export function normalizeProductType(type) {
  return LEGACY_PRODUCT_TYPE_MAP[type] || type || "digital_download";
}

export function productTypeLabel(type) {
  const normalized = normalizeProductType(type);
  return PRODUCT_TYPE_OPTIONS.find((item) => item.value === normalized)?.label || normalized;
}

export function productTypeAliases(type) {
  const normalized = normalizeProductType(type);
  return [
    normalized,
    ...Object.entries(LEGACY_PRODUCT_TYPE_MAP)
      .filter(([, mapped]) => mapped === normalized)
      .map(([legacy]) => legacy),
  ];
}

export function isFreeProduct(product) {
  return normalizeProductType(product?.product_type) === "free_product" || Number(product?.price || 0) === 0;
}

export function isCheckoutProduct(product) {
  const type = normalizeProductType(product?.product_type);
  return type === "digital_download" || type === "bundle";
}

export function isRoadmapProduct(product) {
  const type = normalizeProductType(product?.product_type);
  return type === "saas_product" || type === "desktop_app";
}

export function productPrimaryAction(product) {
  const type = normalizeProductType(product?.product_type);
  if (type === "digital_download" || type === "bundle") {
    return { label: "Buy now", to: `/checkout/${product.slug || product.id}`, kind: "checkout" };
  }
  if (type === "free_product") {
    return { label: "Request free access", to: "/contact", kind: "contact" };
  }
  if (type === "custom_service") {
    return { label: "Request a quote", to: "/custom-request", kind: "request" };
  }
  if (type === "saas_product" || type === "desktop_app") {
    return { label: "Request demo", to: "/custom-request", kind: "demo" };
  }
  return { label: "View details", to: `/products/${product.slug || product.id}`, kind: "details" };
}
