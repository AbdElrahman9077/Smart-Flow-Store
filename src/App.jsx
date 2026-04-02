import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PageWrapper from "./components/PageWrapper";
import MyOrders from "./pages/MyOrders";
import CustomRequest from "./pages/CustomRequest";
import AdminOrders from "./pages/AdminOrders";
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

function App() {
  return (
    <PageWrapper>
    <BrowserRouter>
      <div className="app">
        <Navbar />

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/products" element={<ProductsPage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/my-orders" element={<MyOrders />} />
  <Route path="/custom-request" element={<CustomRequest />} />
  <Route path="/admin-orders" element={<AdminOrders />} />
  <Route path="/product/:id" element={<ProductDetails />} />
  <Route path="/checkout/:id" element={<Checkout />} />
  <Route path="/order-success" element={<OrderSuccess />} />
  <Route path="/orders" element={<OrdersPage />} />
</Routes>

        <Footer />
      </div>
    </BrowserRouter>
  </PageWrapper>
  );
}

export default App;