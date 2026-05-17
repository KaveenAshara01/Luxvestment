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
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Inventory from './pages/admin/Inventory';
import Collections from './pages/admin/Collections';
import Orders from './pages/admin/Orders';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <div className="App">
            <Header />
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
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute isAdmin={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  } 
                >
                  <Route index element={<Navigate to="/admin/inventory" replace />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="collections" element={<Collections />} />
                  <Route path="orders" element={<Orders />} />
                </Route>
                
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
