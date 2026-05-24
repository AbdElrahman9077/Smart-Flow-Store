import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext();

const translations = {
  en: {
    home: "Home",
    products: "Products",
    bundles: "Bundles",
    freeTemplates: "Free Templates",
    faq: "FAQ",
    about: "About",
    contact: "Contact",
    login: "Login",
    register: "Register",
    logout: "Logout",
    account: "Account",
    myOrders: "Orders",
    customRequest: "Custom Request",
    admin: "Admin",
    adminDashboard: "Dashboard",
    adminProducts: "Products",
    adminOrders: "Orders",
    adminUsers: "Customers",
    adminCustomRequests: "Custom Requests",
    adminLogs: "Logs",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    download: "Download",
    loading: "Loading",
    save: "Save",
    cancel: "Cancel",
    send: "Send",
    update: "Update",
    browseProducts: "Explore Products",
    requestCustomWork: "Request a Custom System",
    heroTitle: "Ready-made Excel systems for smarter business operations.",
    heroSubtitle: "Buy, download, and manage professional Excel solutions in one secure portal.",
    heroDescription:
      "Excel Store helps teams replace fragile spreadsheets with polished templates, operational dashboards, and custom Excel systems built for real business workflows.",
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
    myOrders: "الطلبات",
    customRequest: "طلب مخصص",
    admin: "الإدارة",
    adminDashboard: "لوحة التحكم",
    adminProducts: "المنتجات",
    adminOrders: "الطلبات",
    adminUsers: "العملاء",
    adminCustomRequests: "الطلبات المخصصة",
    adminLogs: "السجلات",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    fullName: "الاسم الكامل",
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
  },
};

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

  const value = useMemo(
    () => ({
      language,
      theme,
      isArabic: language === "ar",
      toggleLanguage,
      toggleTheme,
      t: translations[language],
      tx,
      statusLabel,
    }),
    [language, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
