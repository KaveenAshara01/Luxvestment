import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Sourcing from './pages/Sourcing';
import Authenticity from './pages/Authenticity';
import Policies from './pages/Policies';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Inventory from './pages/admin/Inventory';
import Collections from './pages/admin/Collections';
import Orders from './pages/admin/Orders';
import Dashboard from './pages/admin/Dashboard';
import AnalyticsTracker from './components/AnalyticsTracker';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AnalyticsTracker />
            <div className="App">
              <Header />
              <CartDrawer />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/sourcing" element={<Sourcing />} />
                <Route path="/authenticity" element={<Authenticity />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute isAdmin={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  } 
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="collections" element={<Collections />} />
                  <Route path="orders" element={<Orders />} />
                </Route>
                
              </Routes>
            </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
