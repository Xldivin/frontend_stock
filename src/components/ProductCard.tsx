import { useEffect, useState } from "react";
import { Clock, Loader2, Package, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Product } from "../lib/api";

interface ProductCardProps {
  product: Product;
  reserving: boolean;
  checkingOut: boolean;
  reservationExpiry?: string;
  hasActiveReservation: boolean;
  onReserve: (productId: string) => Promise<void>;
  onCheckout: (productId: string) => Promise<void>;
}

const ProductCard = ({
  product,
  reserving,
  checkingOut,
  reservationExpiry,
  hasActiveReservation,
  onReserve,
  onCheckout,
}: ProductCardProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const isSoldOut = product.availableStock <= 0;
  const isReserved = hasActiveReservation && secondsLeft !== null;

  useEffect(() => {
    if (!reservationExpiry) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const diffMs = new Date(reservationExpiry).getTime() - Date.now();
      if (diffMs <= 0) {
        setSecondsLeft(null);
        return;
      }
      setSecondsLeft(Math.ceil(diffMs / 1000));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [reservationExpiry]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex h-48 items-center justify-center bg-muted">
        <Package className="h-16 w-16 text-muted-foreground/30" />
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-bold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            {product.description || "Limited drop product"}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">SKU: {product.sku}</span>
          <span className="text-sm text-muted-foreground">
            {isSoldOut ? "Sold Out" : `${product.availableStock} left`}
          </span>
        </div>

        {secondsLeft !== null && (
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">{formatTime(secondsLeft)}</span>
            </div>
            <span className="text-xs text-muted-foreground">Reserved</span>
          </div>
        )}

        {isReserved ? (
          <Button onClick={() => onCheckout(product.id)} disabled={checkingOut} className="h-12 w-full">
            {checkingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Checkout
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => onReserve(product.id)}
            disabled={isSoldOut || reserving}
            className="h-12 w-full"
          >
            {reserving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSoldOut ? (
              "Sold Out"
            ) : (
              "Reserve Now"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
