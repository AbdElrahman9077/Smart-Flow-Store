export const ADMIN_ROLES = ["super_admin", "admin", "sales", "support_agent", "content_manager"];

export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "products.view",
  "products.manage",
  "categories.manage",
  "files.manage",
  "customers.view",
  "customers.manage",
  "orders.view",
  "orders.manage",
  "payments.view",
  "payments.manage",
  "downloads.view",
  "licenses.view",
  "licenses.manage",
  "support.view",
  "support.reply",
  "custom_requests.view",
  "custom_requests.manage",
  "coupons.view",
  "coupons.manage",
  "reviews.view",
  "reviews.manage",
  "settings.view",
  "settings.manage",
  "audit_logs.view",
  "admin_users.view",
  "admin_users.manage",
];

export const ROLE_PERMISSIONS = {
  super_admin: ADMIN_PERMISSIONS,
  admin: [
    "dashboard.view",
    "products.view",
    "products.manage",
    "categories.manage",
    "files.manage",
    "customers.view",
    "customers.manage",
    "orders.view",
    "orders.manage",
    "payments.view",
    "downloads.view",
    "licenses.view",
    "licenses.manage",
    "support.view",
    "support.reply",
    "custom_requests.view",
    "custom_requests.manage",
    "coupons.view",
    "coupons.manage",
    "reviews.view",
    "reviews.manage",
    "settings.view",
    "audit_logs.view",
    "admin_users.view",
  ],
  sales: [
    "dashboard.view",
    "customers.view",
    "orders.view",
    "custom_requests.view",
    "custom_requests.manage",
    "payments.view",
  ],
  support_agent: [
    "dashboard.view",
    "customers.view",
    "orders.view",
    "support.view",
    "support.reply",
    "custom_requests.view",
  ],
  content_manager: [
    "dashboard.view",
    "products.view",
    "products.manage",
    "categories.manage",
    "files.manage",
    "reviews.view",
    "reviews.manage",
  ],
};

export const ADMIN_ROUTE_PERMISSIONS = {
  "/admin/dashboard": "dashboard.view",
  "/admin/products": "products.view",
  "/admin/orders": "orders.view",
  "/admin/customers": "customers.view",
  "/admin/users": "customers.view",
  "/admin/licenses": "licenses.view",
  "/admin/downloads": "downloads.view",
  "/admin/coupons": "coupons.view",
  "/admin/custom-requests": "custom_requests.view",
  "/admin/support": "support.view",
  "/admin/reviews": "reviews.view",
  "/admin/logs": "audit_logs.view",
  "/admin/settings": "settings.view",
};

export function normalizeAdminRole(role, legacyProfile = null) {
  if (ADMIN_ROLES.includes(role)) return role;
  if (legacyProfile?.is_admin === true || legacyProfile?.role === "admin") return "super_admin";
  return "customer";
}

export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export function mergePermissions(role, explicitPermissions) {
  const base = permissionsForRole(role);
  const explicit = Array.isArray(explicitPermissions) ? explicitPermissions : [];
  return Array.from(new Set([...base, ...explicit]));
}

export function can(permissionSet, permission) {
  if (!permission) return true;
  return permissionSet.includes(permission);
}

export function canAny(permissionSet, permissions = []) {
  return permissions.some((permission) => can(permissionSet, permission));
}

export function canAll(permissionSet, permissions = []) {
  return permissions.every((permission) => can(permissionSet, permission));
}
