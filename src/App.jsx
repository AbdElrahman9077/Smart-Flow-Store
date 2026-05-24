import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import CustomerRoute from "./components/CustomerRoute";
import PageLoadingSpinner from "./components/PageLoadingSpinner";

// ── Home components (eagerly loaded)
import Hero from "./components/Hero";
import About from "./components/About";
import Products from "./components/Products";

// ── Lazy-load pages for better performance
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
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
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

// ── Customer Portal
const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const AccountOrders = lazy(() => import("./pages/account/AccountOrders"));
const AccountDownloads = lazy(() => import("./pages/account/AccountDownloads"));
const AccountLicenses = lazy(() => import("./pages/account/AccountLicenses"));
const AccountCustomRequests = lazy(() => import("./pages/account/AccountCustomRequests"));
const AccountSupport = lazy(() => import("./pages/account/AccountSupport"));

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

function HomePage() {
  return (
    <>
      <Hero />
      <main>
        <About />
        <Products featuredOnly limit={6} />
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
          <Route path="/checkout" element={<CustomerRoute><ProductsPage /></CustomerRoute>} />
          <Route path="/checkout/:id" element={<CustomerRoute><Checkout /></CustomerRoute>} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/my-orders" element={<CustomerRoute><MyOrders /></CustomerRoute>} />

          {/* ─── Customer Portal (Account) ─── */}
          <Route path="/account" element={<CustomerRoute><AccountPage /></CustomerRoute>} />
          <Route path="/account/orders" element={<CustomerRoute><AccountOrders /></CustomerRoute>} />
          <Route path="/account/downloads" element={<CustomerRoute><AccountDownloads /></CustomerRoute>} />
          <Route path="/account/licenses" element={<CustomerRoute><AccountLicenses /></CustomerRoute>} />
          <Route path="/account/custom-requests" element={<CustomerRoute><AccountCustomRequests /></CustomerRoute>} />
          <Route path="/account/support" element={<CustomerRoute><AccountSupport /></CustomerRoute>} />

          {/* ─── Admin Routes ─── */}
          <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/licenses" element={<AdminRoute><AdminLicenses /></AdminRoute>} />
          <Route path="/admin/downloads" element={<AdminRoute><AdminDownloads /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
          <Route path="/admin/custom-requests" element={<AdminRoute><AdminCustomRequests /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin-products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin-orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin-users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin-licenses" element={<AdminRoute><AdminLicenses /></AdminRoute>} />
          <Route path="/admin-downloads" element={<AdminRoute><AdminDownloads /></AdminRoute>} />
          <Route path="/admin-coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
          <Route path="/admin-custom-requests" element={<AdminRoute><AdminCustomRequests /></AdminRoute>} />
          <Route path="/admin-support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
          <Route path="/admin-reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          <Route path="/admin-logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
          <Route path="/admin-settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

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
