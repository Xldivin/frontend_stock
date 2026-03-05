import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Zap } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { api, Product, Reservation } from "../lib/api";
import { Button } from "../components/ui/button";

type ReservationState = {
  reservationId: string;
  expiresAt: string;
};

const PRODUCTS_QUERY = new URLSearchParams({
  page: "1",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "desc",
});

const RESERVATIONS_QUERY = new URLSearchParams({
  page: "1",
  limit: "50",
  sortBy: "expiresAt",
  sortOrder: "asc",
  status: "ACTIVE",
});

const Drop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [reservingProductId, setReservingProductId] = useState<string | null>(null);
  const [checkingOutProductId, setCheckingOutProductId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Record<string, ReservationState>>({});

  const fetchProducts = useCallback(
    async (showLoader = false) => {
      if (showLoader) {
        setIsLoading(true);
      }
      const response = await api.listProducts(PRODUCTS_QUERY);
      setProducts(response.items);
      if (showLoader) {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchReservations = useCallback(async () => {
    const response = await api.listReservations(RESERVATIONS_QUERY);
    const nextReservations: Record<string, ReservationState> = {};

    response.items
      .filter((item: Reservation) => item.status === "ACTIVE")
      .forEach((item) => {
        if (!nextReservations[item.productId]) {
          nextReservations[item.productId] = {
            reservationId: item.id,
            expiresAt: item.expiresAt,
          };
        }
      });

    setReservations(nextReservations);
  }, []);

  const refreshAll = useCallback(
    async (showLoader = false) => {
      setPageError(null);
      try {
        await Promise.all([fetchProducts(showLoader), fetchReservations()]);
      } catch (error) {
        setPageError((error as Error).message);
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [fetchProducts, fetchReservations],
  );

  useEffect(() => {
    void refreshAll(true);
  }, [refreshAll]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshAll();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const handleReserve = async (productId: string) => {
    setPageError(null);
    setReservingProductId(productId);

    try {
      const response = await api.reserve({ productId, quantity: 1 });
      setReservations((prev) => ({
        ...prev,
        [productId]: {
          reservationId: response.reservationId,
          expiresAt: response.expiresAt,
        },
      }));

      await fetchProducts();
    } catch (error) {
      setPageError((error as Error).message);
    } finally {
      setReservingProductId(null);
    }
  };

  const handleCheckout = async (productId: string) => {
    const reservation = reservations[productId];
    if (!reservation) {
      setPageError("No active reservation found for this product");
      return;
    }

    setPageError(null);
    setCheckingOutProductId(productId);
    try {
      await api.checkout({ reservationId: reservation.reservationId });
      await refreshAll();
    } catch (error) {
      setPageError((error as Error).message);
    } finally {
      setCheckingOutProductId(null);
    }
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
            <Button variant="outline" onClick={() => navigate("/activity")}>
              Activity
            </Button>
          </div>
        </div>
      </header>

      <section className="py-12 text-center">
        <h2 className="mb-3 text-4xl font-bold">
           <span className="text-primary">STOCK</span>
        </h2>
        <p className="text-muted-foreground">Live inventory from backend API</p>
      </section>

      <main className="container mx-auto px-4 pb-16">
        {pageError && (
          <p className="mx-auto mb-6 max-w-5xl rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {pageError}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                reserving={reservingProductId === product.id}
                checkingOut={checkingOutProductId === product.id}
                reservationExpiry={reservations[product.id]?.expiresAt}
                hasActiveReservation={Boolean(reservations[product.id])}
                onReserve={handleReserve}
                onCheckout={handleCheckout}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Drop;
