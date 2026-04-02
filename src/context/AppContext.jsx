import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext();

const translations = {
  en: {
    home: "Home",
    products: "Products",
    about: "About",
    contact: "Contact",
    login: "Login",
    register: "Register",
    logout: "Logout",
    myOrders: "My Orders",
    customRequest: "Custom Request",
    admin: "Admin",
    adminDashboard: "Admin Dashboard",
    adminProducts: "Admin Products",
    adminOrders: "Admin Orders",
    adminUsers: "Admin Users",
    adminCustomRequests: "Custom Requests",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    verifyOtp: "Verify OTP",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    enterOtp: "Enter OTP",
    resendOtp: "Resend OTP",
    download: "Download",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    send: "Send",
    update: "Update",
    browseProducts: "Browse Products",
    requestCustomWork: "Request Custom Work",
    heroTitle: "Smart Excel Solutions for Business",
    heroSubtitle: "Sell Excel systems, sheets, dashboards, and custom business tools.",
    heroDescription:
      "A professional platform for selling ready-made Excel systems and requesting custom work.",
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    rejected: "Rejected",
    completed: "Completed",
    noOrders: "No orders found.",
    orderStatus: "Order Status",
    orderDate: "Order Date",
    price: "Price",
    product: "Product",
    actions: "Actions",
    sendResetLink: "Send Reset Link",
    updatePassword: "Update Password",
    verify: "Verify",
    backHome: "Back Home",
    checkEmail: "Check your email",
    otpSent: "OTP sent successfully.",
    otpVerified: "OTP verified successfully.",
    resetEmailSent: "Reset link sent successfully.",
    passwordUpdated: "Password updated successfully.",
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    about: "من نحن",
    contact: "تواصل معنا",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    logout: "تسجيل الخروج",
    myOrders: "طلباتي",
    customRequest: "طلب مخصص",
    admin: "الإدارة",
    adminDashboard: "لوحة الأدمن",
    adminProducts: "إدارة المنتجات",
    adminOrders: "إدارة الطلبات",
    adminUsers: "إدارة المستخدمين",
    adminCustomRequests: "الطلبات المخصصة",
    forgotPassword: "نسيت كلمة المرور؟",
    resetPassword: "إعادة تعيين كلمة المرور",
    verifyOtp: "تأكيد الكود",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    fullName: "الاسم الكامل",
    enterOtp: "ادخل كود التحقق",
    resendOtp: "إعادة إرسال الكود",
    download: "تحميل",
    loading: "جاري التحميل...",
    save: "حفظ",
    cancel: "إلغاء",
    send: "إرسال",
    update: "تحديث",
    browseProducts: "تصفح المنتجات",
    requestCustomWork: "اطلب شغل مخصص",
    heroTitle: "حلول Excel احترافية للأعمال",
    heroSubtitle: "بيع أنظمة Excel وشيتات وDashboards وأدوات أعمال مخصصة.",
    heroDescription: "منصة احترافية لبيع أنظمة Excel الجاهزة واستقبال طلبات التخصيص.",
    pending: "قيد المراجعة",
    confirmed: "تم التأكيد",
    cancelled: "تم الإلغاء",
    rejected: "مرفوض",
    completed: "مكتمل",
    noOrders: "لا توجد طلبات.",
    orderStatus: "حالة الطلب",
    orderDate: "تاريخ الطلب",
    price: "السعر",
    product: "المنتج",
    actions: "الإجراءات",
    sendResetLink: "إرسال رابط الاسترجاع",
    updatePassword: "تحديث كلمة المرور",
    verify: "تأكيد",
    backHome: "العودة للرئيسية",
    checkEmail: "راجع بريدك الإلكتروني",
    otpSent: "تم إرسال الكود بنجاح.",
    otpVerified: "تم تأكيد الكود بنجاح.",
    resetEmailSent: "تم إرسال رابط الاسترجاع بنجاح.",
    passwordUpdated: "تم تحديث كلمة المرور بنجاح.",
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