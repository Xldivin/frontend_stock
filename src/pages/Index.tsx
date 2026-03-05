import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Zap, ArrowRight, Shield, Clock, Package } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative text-center space-y-8 max-w-2xl">
        
        {/* Static Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">
            Live API Mode
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
          <span className="text-primary">DROP</span>{" "}
          <span className="text-foreground">ZONE</span>
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Limited edition products. First come, first served.
          View live stock, reserve items, and checkout in real time.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate("/drop")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base h-12 px-8"
          >
            View Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-border">
          
          <div className="text-center space-y-2">
            <Shield className="w-6 h-6 text-primary mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">
              Secure Reserve
            </h3>
            <p className="text-xs text-muted-foreground">
              Public reservation flow
            </p>
          </div>

          <div className="text-center space-y-2">
            <Clock className="w-6 h-6 text-primary mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">
              5-Min Window
            </h3>
            <p className="text-xs text-muted-foreground">
              Reservation expiry support
            </p>
          </div>

          <div className="text-center space-y-2">
            <Package className="w-6 h-6 text-primary mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">
              Limited Stock
            </h3>
            <p className="text-xs text-muted-foreground">
              Backend inventory checks
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;
