import { createContext, useContext, useEffect, useState } from "react";

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
    admin: "Admin",
    browseProducts: "Browse Products",
    requestCustomWork: "Request Custom Work",
    heroTitle: "Smart Excel Solutions for Business",
    heroSubtitle: "Sell Excel systems, sheets, dashboards, and custom business tools.",
    heroDescription:
      "A professional platform for selling ready-made Excel systems and requesting custom work.",
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
    admin: "الإدارة",
    browseProducts: "تصفح المنتجات",
    requestCustomWork: "اطلب شغل مخصص",
    heroTitle: "حلول Excel احترافية للأعمال",
    heroSubtitle: "بيع أنظمة Excel وشيتات وDashboards وأدوات أعمال مخصصة.",
    heroDescription:
      "منصة احترافية لبيع أنظمة Excel الجاهزة واستقبال طلبات التخصيص.",
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

  const value = {
    language,
    theme,
    toggleLanguage,
    toggleTheme,
    t: translations[language],
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}