import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Products from "./components/Products";
import Footer from "./components/Footer";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import ProductsPage from "./pages/ProductsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import OrderSuccess from "./pages/OrderSuccess";
import OrdersPage from "./pages/OrdersPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import CustomRequest from "./pages/CustomRequest";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminCustomRequests from "./pages/AdminCustomRequests";
function HomePage() {
  return (
    <>
      <Hero />
      <main>
        <About />
        <Products />
      </main>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/custom-request" element={<CustomRequest />} />
        <Route
          path="/admin-orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route
          path="/orders"
          element={
            <AdminRoute>
              <OrdersPage />
            </AdminRoute>
          }
        />
        <Route
  path="/admin-dashboard"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>

<Route
  path="/admin-users"
  element={
    <AdminRoute>
      <AdminUsers />
    </AdminRoute>
  }
/>

<Route
  path="/admin-custom-requests"
  element={
    <AdminRoute>
      <AdminCustomRequests />
    </AdminRoute>
  }
/>
      </Routes>
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