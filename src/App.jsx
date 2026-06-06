import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import CustomerRoute from "./components/CustomerRoute";
import AdminLayout from "./components/AdminLayout";
import AccountLayout from "./components/AccountLayout";
import PageLoadingSpinner from "./components/PageLoadingSpinner";

// ── Home components (eagerly loaded)
import Hero from "./components/Hero";
import About from "./components/About";
import Products from "./components/Products";
import { AnimatedSection, StaggerContainer, StaggerItem } from "./components/animations";
import { useAppContext } from "./context/AppContext";

// ── Lazy-load pages for better performance
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutAccess = lazy(() => import("./pages/CheckoutAccess"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const CustomRequest = lazy(() => import("./pages/CustomRequest"));
const FreeTemplates = lazy(() => import("./pages/FreeTemplates"));
const BundlesPage = lazy(() => import("./pages/BundlesPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const PlaceholderSectionPage = lazy(() => import("./pages/PlaceholderSectionPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

// ── Customer Portal
const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const AccountOrders = lazy(() => import("./pages/account/AccountOrders"));
const AccountDownloads = lazy(() => import("./pages/account/AccountDownloads"));
const AccountLicenses = lazy(() => import("./pages/account/AccountLicenses"));
const AccountCustomRequests = lazy(() => import("./pages/account/AccountCustomRequests"));
const AccountSupport = lazy(() => import("./pages/account/AccountSupport"));
const AccountProfile = lazy(() => import("./pages/account/AccountProfile"));

// ── Admin Pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminLicenses = lazy(() => import("./pages/AdminLicenses"));
const AdminDownloads = lazy(() => import("./pages/AdminDownloads"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminCustomRequests = lazy(() => import("./pages/AdminCustomRequests"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
// OrdersPage legacy — redirect to admin-orders
const OrdersPage = lazy(() => import("./pages/OrdersPage"));

function withAccountLayout(page) {
  return <CustomerRoute><AccountLayout>{page}</AccountLayout></CustomerRoute>;
}

function withAdminLayout(page) {
  return <AdminRoute><AdminLayout>{page}</AdminLayout></AdminRoute>;
}

function HomePage() {
  const { tx, t } = useAppContext();
  const productFamilies = [
    {
      title: tx("Excel Products", "منتجات Excel"),
      text: tx("Ready templates, VBA systems, dashboards, accounting, HR, inventory, and reporting tools are available through the current catalog foundation.", "القوالب الجاهزة وأنظمة VBA ولوحات المتابعة وأدوات الحسابات والموارد البشرية والمخزون والتقارير متاحة من خلال أساس الكتالوج الحالي."),
      cta: tx("Browse products", "تصفح المنتجات"),
      to: "/products",
      status: tx("Available now", "متاح الآن"),
    },
    {
      title: tx("Web App Services", "خدمات تطبيقات الويب"),
      text: tx("Custom business systems, admin dashboards, and portals can be requested and scoped manually.", "يمكن طلب أنظمة الأعمال المخصصة ولوحات الإدارة والبوابات وتحديد نطاقها يدويًا."),
      cta: tx("Request a custom project", "اطلب مشروعًا مخصصًا"),
      to: "/custom-request",
      status: tx("Available by request", "متاح حسب الطلب"),
    },
    {
      title: tx("SaaS Products", "منتجات SaaS"),
      text: tx("Subscription-based products are planned, but recurring billing and workspace provisioning are not implemented yet.", "منتجات الاشتراك مخططة، لكن الفوترة المتكررة وتجهيز مساحات العمل غير مطبقة بعد."),
      cta: tx("Request demo", "اطلب عرضًا"),
      to: "/saas",
      status: tx("Coming soon", "قريبًا"),
    },
    {
      title: tx("Desktop Software", "برامج سطح المكتب"),
      text: tx("Offline-first systems and desktop license activation are planned as dedicated production modules.", "الأنظمة التي تعمل دون اتصال وتفعيل تراخيص سطح المكتب مخططة كوحدات إنتاجية مستقلة."),
      cta: tx("Request demo", "اطلب عرضًا"),
      to: "/desktop-software",
      status: tx("Coming soon", "قريبًا"),
    },
  ];

  return (
    <>
      <Hero />
      <main>
        <AnimatedSection className="products-section">
          <div className="container">
            <div className="section-title-row">
              <span className="section-kicker">{tx("Product families", "عائلات المنتجات")}</span>
              <h2>{tx("Smart Flow Hub sections", "أقسام Smart Flow Hub")}</h2>
              <p className="section-subtitle">
                {tx(
                  "Current available products focus on digital downloads and Excel business tools. Future SaaS, desktop licensing, and subscription modules are labeled clearly until implemented.",
                  "تركز المنتجات المتاحة حاليًا على التحميلات الرقمية وأدوات Excel للأعمال. يتم توضيح وحدات SaaS وتراخيص سطح المكتب والاشتراكات المستقبلية حتى يتم تنفيذها."
                )}
              </p>
            </div>
            <div className="feature-card-grid">
              {productFamilies.map((family) => (
                <article className="feature-card" key={family.title}>
                  <span className="status-badge">{family.status}</span>
                  <h3>{family.title}</h3>
                  <p>{family.text}</p>
                  <div className="section-actions">
                    <a className="card-link-btn" href={family.to}>{family.cta}</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </AnimatedSection>
        <About />
        <Products featuredOnly limit={6} />
        <AnimatedSection className="conversion-section">
          <div className="container conversion-grid">
            <StaggerContainer>
              <StaggerItem>
              <span className="section-kicker">{tx("Custom Excel systems", "أنظمة Excel مخصصة")}</span>
              </StaggerItem>
              <StaggerItem>
              <h2>{tx("Need a workflow built around your exact business?", "هل تحتاج إلى سير عمل مبني حول طبيعة عملك بدقة؟")}</h2>
              </StaggerItem>
              <StaggerItem>
              <p>{tx("Send your requirements and receive a structured quote for dashboards, trackers, CRM sheets, inventory systems, or finance models.", "أرسل متطلباتك واحصل على عرض منظم للوحات المتابعة أو أدوات التتبع أو CRM أو المخزون أو النماذج المالية.")}</p>
              </StaggerItem>
            </StaggerContainer>
            <div className="conversion-actions">
              <a className="primary-link-btn" href="/custom-request">{t.requestCustomWork}</a>
              <a className="secondary-link-btn" href="/free-templates">{tx("Explore free templates", "استكشف القوالب المجانية")}</a>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoadingSpinner />}>
        <Routes location={location} key={location.pathname}>
          {/* ─── Public Routes ─── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/categories/:slug" element={<ProductsPage />} />
          <Route path="/free-templates" element={<FreeTemplates />} />
          <Route path="/bundles" element={<BundlesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/custom-request" element={<CustomRequest />} />
          <Route path="/web-apps" element={<PlaceholderSectionPage section="web-apps" />} />
          <Route path="/saas" element={<PlaceholderSectionPage section="saas" />} />
          <Route path="/desktop-software" element={<PlaceholderSectionPage section="desktop-software" />} />
          <Route path="/docs" element={<PlaceholderSectionPage section="docs" />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* ─── Auth Routes ─── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<VerifyOtp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ─── Customer Routes ─── */}
          <Route path="/checkout" element={<CheckoutAccess />} />
          <Route path="/checkout/:id" element={<CustomerRoute fallback={<CheckoutAccess />}><Checkout /></CustomerRoute>} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/my-orders" element={<CustomerRoute><MyOrders /></CustomerRoute>} />

          {/* ─── Customer Portal (Account) ─── */}
          <Route path="/account" element={withAccountLayout(<AccountPage />)} />
          <Route path="/account/orders" element={withAccountLayout(<AccountOrders />)} />
          <Route path="/account/downloads" element={withAccountLayout(<AccountDownloads />)} />
          <Route path="/account/licenses" element={withAccountLayout(<AccountLicenses />)} />
          <Route path="/account/custom-requests" element={withAccountLayout(<AccountCustomRequests />)} />
          <Route path="/account/support" element={withAccountLayout(<AccountSupport />)} />
          <Route path="/account/profile" element={withAccountLayout(<AccountProfile />)} />

          {/* ─── Admin Routes ─── */}
          <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
          <Route path="/admin/dashboard" element={withAdminLayout(<AdminDashboard />)} />
          <Route path="/admin/products" element={withAdminLayout(<AdminProducts />)} />
          <Route path="/admin/orders" element={withAdminLayout(<AdminOrders />)} />
          <Route path="/admin/customers" element={withAdminLayout(<AdminUsers />)} />
          <Route path="/admin/users" element={withAdminLayout(<AdminUsers />)} />
          <Route path="/admin/licenses" element={withAdminLayout(<AdminLicenses />)} />
          <Route path="/admin/downloads" element={withAdminLayout(<AdminDownloads />)} />
          <Route path="/admin/coupons" element={withAdminLayout(<AdminCoupons />)} />
          <Route path="/admin/custom-requests" element={withAdminLayout(<AdminCustomRequests />)} />
          <Route path="/admin/support" element={withAdminLayout(<AdminSupport />)} />
          <Route path="/admin/reviews" element={withAdminLayout(<AdminReviews />)} />
          <Route path="/admin/logs" element={withAdminLayout(<AdminLogs />)} />
          <Route path="/admin/settings" element={withAdminLayout(<AdminSettings />)} />
          <Route path="/admin-dashboard" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
          <Route path="/admin-products" element={<AdminRoute><Navigate to="/admin/products" replace /></AdminRoute>} />
          <Route path="/admin-orders" element={<AdminRoute><Navigate to="/admin/orders" replace /></AdminRoute>} />
          <Route path="/admin-users" element={<AdminRoute><Navigate to="/admin/customers" replace /></AdminRoute>} />
          <Route path="/admin-licenses" element={<AdminRoute><Navigate to="/admin/licenses" replace /></AdminRoute>} />
          <Route path="/admin-downloads" element={<AdminRoute><Navigate to="/admin/downloads" replace /></AdminRoute>} />
          <Route path="/admin-coupons" element={<AdminRoute><Navigate to="/admin/coupons" replace /></AdminRoute>} />
          <Route path="/admin-custom-requests" element={<AdminRoute><Navigate to="/admin/custom-requests" replace /></AdminRoute>} />
          <Route path="/admin-support" element={<AdminRoute><Navigate to="/admin/support" replace /></AdminRoute>} />
          <Route path="/admin-reviews" element={<AdminRoute><Navigate to="/admin/reviews" replace /></AdminRoute>} />
          <Route path="/admin-logs" element={<AdminRoute><Navigate to="/admin/logs" replace /></AdminRoute>} />
          <Route path="/admin-settings" element={<AdminRoute><Navigate to="/admin/settings" replace /></AdminRoute>} />

          {/* ─── Legacy Admin Routes (preserved) ─── */}
          <Route path="/orders" element={<AdminRoute><OrdersPage /></AdminRoute>} />

          {/* ─── Error Routes ─── */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
