import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";

// Admin Panel Imports
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AddProduct from "./admin/AddProduct";
import ListProducts from "./admin/ListProducts";
import AdminOrders from "./admin/AdminOrders";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import AdminLogout from "./admin/AdminLogout";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop /> {/* Ensures smooth scrolling on route changes */}
          <Navbar />
          
          <main className="min-h-screen container mx-auto px-4 py-6">
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/placeOrder" element={<PlaceOrder />} />
              <Route path="/orders" element={<Orders />} />

              {/* Admin Panel Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/add" element={<ProtectedAdminRoute><AddProduct /></ProtectedAdminRoute>} />
              <Route path="/admin/list" element={<ProtectedAdminRoute><ListProducts /></ProtectedAdminRoute>} />
              <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
              <Route path="/admin/logout" element={<AdminLogout />} />
            </Routes>
          </main>

          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
