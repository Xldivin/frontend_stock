import { useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/Auth";
import DropPage from "./pages/Drop";
import HomePage from "./pages/Index";
import NotFoundPage from "./pages/NotFound";
import OrdersReservationsPage from "./pages/OrdersReservations";
import { authStorage } from "./lib/api";

export default function App() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const forceLogout = () => {
      authStorage.clearToken();
      if (window.location.pathname !== "/auth") {
        window.location.assign("/auth");
      }
    };

    const scheduleLogout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      const token = authStorage.getToken();
      if (!token) {
        return;
      }

      if (authStorage.isTokenExpired()) {
        forceLogout();
        return;
      }

      const expiryMs = authStorage.getTokenExpiryMs();
      if (!expiryMs) {
        return;
      }

      const timeUntilExpiry = Math.max(0, expiryMs - Date.now());
      timeoutId = setTimeout(() => {
        forceLogout();
      }, timeUntilExpiry);
    };

    scheduleLogout();
    window.addEventListener("auth-token-changed", scheduleLogout);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("auth-token-changed", scheduleLogout);
    };
  }, []);

  return (
    <main className="page">
      <section className="card">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/drop" element={<DropPage />} />
          <Route path="/activity" element={<OrdersReservationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </section>
    </main>
  );
}
