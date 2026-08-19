import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

// Bootstrap is imported by package name rather than through a relative
// `../node_modules/...` path (which breaks under any non-flat install), and
// the bundle is imported once instead of three times.
import 'bootstrap-dark-5/dist/css/bootstrap-dark.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './styles/tokens.css';
import './App.css';

import { CartProvider } from './components/ContextReducer';
import { DeliveryProvider } from './components/delivery/DeliveryContext';
import StorefrontDelivery from './components/delivery/StorefrontDelivery';
import RequireAuth from './components/RequireAuth';

import Home from './screens/Home';
import Login from './screens/Login';
import Signup from './screens/Signup';
import MyOrder from './screens/MyOrder';
import FoodDetail from './screens/FoodDetail';
import KitchenView from './screens/KitchenView';
import Policies from './screens/Policies';
import NotFound from './screens/NotFound';

import AdminLogin from './screens/admin/AdminLogin';
import AdminLayout from './screens/admin/AdminLayout';
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminResource from './screens/admin/AdminResource';
import AdminOrders from './screens/admin/AdminOrders';
import AdminReceipts from './screens/admin/AdminReceipts';

function App() {
  return (
    <CartProvider>
      <DeliveryProvider>
        <Router>
          {/* Renders the confirmation popup and the live tracker on storefront
              routes; it stays mounted across navigation so the countdown does
              not restart when the customer moves between pages. */}
          <StorefrontDelivery />

          <Routes>
            {/* Storefront */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/createuser" element={<Signup />} />
            {/* The original navbar linked to /Createuser with a capital C. */}
            <Route path="/Createuser" element={<Navigate to="/createuser" replace />} />

            <Route path="/food/:id" element={<FoodDetail />} />
            <Route path="/kitchen/:id" element={<KitchenView />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/policies/:slug" element={<Policies />} />

            <Route
              path="/myOrder"
              element={
                <RequireAuth>
                  <MyOrder />
                </RequireAuth>
              }
            />

            {/* Admin console */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="partners" element={<AdminResource resourceKey="partners" />} />
              <Route path="riders" element={<AdminResource resourceKey="riders" />} />
              <Route path="categories" element={<AdminResource resourceKey="categories" />} />
              <Route path="items" element={<AdminResource resourceKey="items" />} />
              <Route path="policies" element={<AdminResource resourceKey="policies" />} />
              <Route path="faqs" element={<AdminResource resourceKey="faqs" />} />
              <Route path="receipts" element={<AdminReceipts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </DeliveryProvider>
    </CartProvider>
  );
}

export default App;
