import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, RefreshCw, Zap } from "lucide-react";
import { api, authStorage, Order, Reservation } from "../lib/api";
import { Button } from "../components/ui/button";

const ORDERS_QUERY = new URLSearchParams({
  page: "1",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "desc",
  status: "CONFIRMED",
});

const RESERVATIONS_QUERY = new URLSearchParams({
  page: "1",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "desc",
});

const OrdersReservations = () => {
  const navigate = useNavigate();
  const token = useMemo(() => authStorage.getToken(), []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (showLoader: boolean) => {
      if (!token) {
        navigate("/auth");
        return;
      }

      setPageError(null);
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [ordersResponse, reservationsResponse] = await Promise.all([
          api.listOrders(token, ORDERS_QUERY),
          api.listReservations(token, RESERVATIONS_QUERY),
        ]);

        setOrders(ordersResponse.items);
        setReservations(reservationsResponse.items);
      } catch (error) {
        setPageError((error as Error).message);
      } finally {
        if (showLoader) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [navigate, token],
  );

  useEffect(() => {
    void fetchData(true);
  }, [fetchData]);

  const handleLogout = () => {
    authStorage.clearToken();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/30 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">STOCK</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void fetchData(false)} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-8">
        {pageError && (
          <p className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {pageError}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="rounded-lg border bg-card p-5">
              <h2 className="mb-4 text-xl font-semibold">My Active + Historical Reservations</h2>
              {reservations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reservations found.</p>
              ) : (
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex flex-col gap-1 rounded border border-border/60 p-3 text-sm md:flex-row md:items-center md:justify-between"
                    >
                      <span className="font-mono">{reservation.id}</span>
                      <span>Product: {reservation.productId}</span>
                      <span>Qty: {reservation.quantity}</span>
                      <span>Status: {reservation.status}</span>
                      <span>Expires: {new Date(reservation.expiresAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border bg-card p-5">
              <h2 className="mb-4 text-xl font-semibold">My Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders found.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded border border-border/60 p-3 text-sm"
                    >
                      <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <span className="font-mono">{order.id}</span>
                        <span>Status: {order.status}</span>
                        <span>Created: {new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        {order.items.map((item) => (
                          <p key={item.id}>
                            Item: {item.productId} | Qty: {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default OrdersReservations;
