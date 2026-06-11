import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./components/AuthProvider.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedDashboard from "./pages/ProtectedDashboard.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
