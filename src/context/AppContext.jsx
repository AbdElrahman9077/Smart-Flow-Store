import { createContext, useContext, useEffect, useState } from "react";
import { productTypeLabel as formatProductTypeLabel } from "../lib/productTypes";

const AppContext = createContext();

const translations = {
  en: {
    home: "Home",
    products: "Products",
    excelProducts: "Excel Products",
    webApps: "Web Apps",
    saas: "SaaS",
    desktopSoftware: "Desktop Software",
    docs: "Docs",
    customerPortal: "Customer Portal",
    bundles: "Bundles",
    freeTemplates: "Free Templates",
    faq: "FAQ",
    about: "About",
    contact: "Contact",
    login: "Login",
    register: "Register",
    logout: "Logout",
    account: "Account",
    accountDashboard: "Account Dashboard",
    downloads: "Downloads",
    licenses: "Licenses",
    support: "Support",
    profile: "Profile",
    myOrders: "Orders",
    customRequest: "Custom Request",
    admin: "Admin",
    adminDashboard: "Dashboard",
    adminProducts: "Products",
    adminOrders: "Orders",
    adminUsers: "Customers",
    adminLicenses: "Licenses",
    adminDownloads: "Downloads",
    adminCoupons: "Coupons",
    adminCustomRequests: "Custom Requests",
    adminSupport: "Support",
    adminReviews: "Reviews",
    adminLogs: "Logs",
    adminSettings: "Settings",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    phone: "Phone",
    download: "Download",
    loading: "Loading",
    save: "Save",
    cancel: "Cancel",
    send: "Send",
    update: "Update",
    browseProducts: "Explore Products",
    requestCustomWork: "Request a Custom System",
    heroTitle: "Smart Flow Hub for digital business tools.",
    heroSubtitle: "The official center for Excel systems, digital products, web apps, SaaS plans, desktop software, secure downloads, customer accounts, and support.",
    heroDescription:
      "The current available foundation focuses on Excel products, digital downloads, manual checkout, custom requests, and partial customer/admin portals. Payments, subscriptions, desktop license activation, and production email delivery are still planned modules.",
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    rejected: "Rejected",
    completed: "Completed",
    delivered: "Delivered",
    noOrders: "No orders found.",
    orderStatus: "Order Status",
    orderDate: "Order Date",
    price: "Price",
    product: "Product",
    actions: "Actions",
    verify: "Verify",
    backHome: "Back Home",
    checkEmail: "Check your email",
    otpSent: "OTP sent successfully.",
    otpVerified: "OTP verified successfully.",
    resetPassword: "Reset password",
    resetEmailSent: "If this email exists, reset instructions will be sent shortly.",
    sendResetLink: "Send reset link",
    updatePassword: "Update password",
    passwordUpdated: "Your password has been updated. Redirecting to login.",
    marketplace: "Marketplace",
    featuredCollection: "Featured Collection",
    bestSellingSystems: "Best-selling Excel systems",
    browseCatalogTitle: "Browse Excel products and digital tools",
    catalogSubtitle:
      "Search, compare, and choose the currently available Excel products and digital downloads. Checkout uses manual payment confirmation while production payment automation remains pending.",
    viewDetails: "View details",
    buyNow: "Buy now",
    customize: "Customize",
    requestCustomization: "Request customization",
    downloadFree: "Download free",
    getTemplate: "Get template",
    licenseIncluded: "License included",
    secureDelivery: "Secure delivery",
    supportAvailable: "Support available",
    customizable: "Customizable",
    allTypes: "All types",
    allPrices: "All prices",
    paid: "Paid",
    free: "Free",
    onSale: "On sale",
    featured: "Featured",
    newest: "Newest",
    priceLowHigh: "Price low to high",
    priceHighLow: "Price high to low",
    filters: "Filters",
    hideFilters: "Hide filters",
    searchProducts: "Search Excel tools, dashboards, CRM...",
    noProducts:
      "No products match your filters. Try another search or request a custom Excel system.",
    chooseProductFirst: "Choose a product first",
    signInToContinue: "Sign in to continue",
    createAccount: "Create account",
    checkoutAccessTitle: "Sign in to continue checkout",
    checkoutAccessSubtitle:
      "Your orders, licenses, and downloads are saved in a secure customer portal.",
    manualPaymentNotice:
      "Some orders require manual payment confirmation. Downloads and license keys unlock after confirmation.",
    noCartDescription:
      "Start by choosing an Excel product. You can review delivery and payment details before submitting your order.",
    selectedProduct: "Selected product",
    productTypes: {
      digital_download: "Digital Download",
      saas_product: "SaaS Product",
      desktop_app: "Desktop Software",
      custom_service: "Custom Service",
      free_product: "Free Product",
      system: "System",
      template: "Template",
      bundle: "Bundle",
      service: "Service",
      free: "Free",
    },
    categories: {
      dashboards: "Dashboards",
      inventory: "Inventory",
      "sales-crm": "Sales & CRM",
      "hr-payroll": "HR & Payroll",
      finance: "Finance",
      "free-templates": "Free Templates",
    },
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    bundles: "الحزم",
    freeTemplates: "القوالب المجانية",
    faq: "الأسئلة الشائعة",
    about: "من نحن",
    contact: "تواصل معنا",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    logout: "تسجيل الخروج",
    account: "حسابي",
    accountDashboard: "لوحة الحساب",
    downloads: "التحميلات",
    licenses: "التراخيص",
    support: "الدعم",
    profile: "الملف الشخصي",
    myOrders: "الطلبات",
    customRequest: "طلب مخصص",
    admin: "الإدارة",
    adminDashboard: "لوحة التحكم",
    adminProducts: "المنتجات",
    adminOrders: "الطلبات",
    adminUsers: "العملاء",
    adminLicenses: "التراخيص",
    adminDownloads: "التحميلات",
    adminCoupons: "الكوبونات",
    adminCustomRequests: "الطلبات المخصصة",
    adminSupport: "الدعم",
    adminReviews: "المراجعات",
    adminLogs: "السجلات",
    adminSettings: "الإعدادات",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    fullName: "الاسم الكامل",
    phone: "الهاتف",
    download: "تحميل",
    loading: "جاري التحميل",
    save: "حفظ",
    cancel: "إلغاء",
    send: "إرسال",
    update: "تحديث",
    browseProducts: "استكشاف المنتجات",
    requestCustomWork: "اطلب نظامًا مخصصًا",
    heroTitle: "أنظمة Excel جاهزة لإدارة أعمالك باحتراف.",
    heroSubtitle: "اشترِ، حمّل، وأدر حلول Excel الخاصة بك من بوابة آمنة ومنظمة.",
    heroDescription:
      "يساعدك Excel Store على تحويل ملفات العمل المتفرقة إلى قوالب احترافية ولوحات متابعة وأنظمة Excel مصممة لاحتياجات الأعمال اليومية.",
    pending: "قيد المراجعة",
    confirmed: "تم التأكيد",
    cancelled: "ملغي",
    rejected: "مرفوض",
    completed: "مكتمل",
    delivered: "تم التسليم",
    noOrders: "لا توجد طلبات.",
    orderStatus: "حالة الطلب",
    orderDate: "تاريخ الطلب",
    price: "السعر",
    product: "المنتج",
    actions: "الإجراءات",
    verify: "تأكيد",
    backHome: "العودة للرئيسية",
    checkEmail: "راجع بريدك الإلكتروني",
    otpSent: "تم إرسال رمز التحقق بنجاح.",
    otpVerified: "تم تأكيد الرمز بنجاح.",
    resetPassword: "إعادة تعيين كلمة المرور",
    resetEmailSent: "إذا كان البريد مسجلًا لدينا، ستصلك تعليمات إعادة التعيين قريبًا.",
    sendResetLink: "إرسال رابط التعيين",
    updatePassword: "تحديث كلمة المرور",
    passwordUpdated: "تم تحديث كلمة المرور. سيتم تحويلك إلى تسجيل الدخول.",
    marketplace: "المتجر",
    featuredCollection: "مجموعة مختارة",
    bestSellingSystems: "أنظمة Excel الأكثر طلبًا",
    browseCatalogTitle: "تصفح أنظمة وقوالب وخدمات Excel",
    catalogSubtitle:
      "ابحث وقارن واختر منتجات Excel احترافية مع تسليم منظم وتراخيص ودعم بعد الشراء.",
    viewDetails: "عرض التفاصيل",
    buyNow: "شراء الآن",
    customize: "تخصيص",
    requestCustomization: "طلب تخصيص",
    downloadFree: "تحميل مجاني",
    getTemplate: "احصل على القالب",
    licenseIncluded: "يشمل الترخيص",
    secureDelivery: "تسليم آمن",
    supportAvailable: "دعم متاح",
    customizable: "قابل للتخصيص",
    allTypes: "كل الأنواع",
    allPrices: "كل الأسعار",
    paid: "مدفوع",
    free: "مجاني",
    onSale: "عروض",
    featured: "مميز",
    newest: "الأحدث",
    priceLowHigh: "السعر من الأقل للأعلى",
    priceHighLow: "السعر من الأعلى للأقل",
    filters: "الفلاتر",
    hideFilters: "إخفاء الفلاتر",
    searchProducts: "ابحث عن لوحات متابعة أو CRM أو مخزون...",
    noProducts: "لا توجد منتجات مطابقة للفلاتر. جرّب بحثًا آخر أو اطلب نظام Excel مخصصًا.",
    chooseProductFirst: "اختر منتجًا أولًا",
    signInToContinue: "تسجيل الدخول للمتابعة",
    createAccount: "إنشاء حساب",
    checkoutAccessTitle: "سجل دخولك لمتابعة الشراء",
    checkoutAccessSubtitle: "يتم حفظ طلباتك وتراخيصك وتحميلاتك داخل بوابة عميل آمنة.",
    manualPaymentNotice:
      "قد تحتاج بعض الطلبات إلى تأكيد دفع يدوي. يتم فتح التحميلات ومفاتيح الترخيص بعد التأكيد.",
    noCartDescription:
      "ابدأ باختيار منتج Excel. يمكنك مراجعة تفاصيل التسليم والدفع قبل إرسال الطلب.",
    selectedProduct: "المنتج المختار",
    productTypes: {
      system: "نظام",
      template: "قالب",
      bundle: "حزمة",
      service: "خدمة",
      free: "مجاني",
    },
    categories: {
      dashboards: "لوحات المتابعة",
      inventory: "المخزون",
      "sales-crm": "المبيعات وإدارة العملاء",
      "hr-payroll": "الموارد البشرية والرواتب",
      finance: "المالية",
      "free-templates": "القوالب المجانية",
    },
  },
};

function slugifyLabel(value = "") {
  return String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(theme === "dark" ? "dark-theme" : "light-theme");
  }, [theme]);

  function toggleLanguage() {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function tx(enText, arText) {
    return language === "ar" ? arText : enText;
  }

  function statusLabel(status) {
    const map = {
      pending: translations[language].pending,
      confirmed: translations[language].confirmed,
      cancelled: translations[language].cancelled,
      rejected: translations[language].rejected,
      completed: translations[language].completed,
      delivered: translations[language].delivered,
    };
    return map[status] || status;
  }

  function productTypeLabel(type) {
    return translations[language].productTypes?.[type] || formatProductTypeLabel(type) || translations[language].product;
  }

  function categoryLabel(category) {
    const slug = slugifyLabel(category);
    return translations[language].categories?.[slug] || category;
  }

  const value = {
    language,
    theme,
    isArabic: language === "ar",
    toggleLanguage,
    toggleTheme,
    t: translations[language],
    tx,
    statusLabel,
    productTypeLabel,
    categoryLabel,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
