import { Route, Routes } from "react-router-dom";
import DropPage from "./pages/Drop";
import HomePage from "./pages/Index";
import NotFoundPage from "./pages/NotFound";
import OrdersReservationsPage from "./pages/OrdersReservations";

export default function App() {
  return (
    <main className="page">
      <section className="card">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/drop" element={<DropPage />} />
          <Route path="/activity" element={<OrdersReservationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </section>
    </main>
  );
}
