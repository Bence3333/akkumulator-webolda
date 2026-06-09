import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Plus, Minus, Package, Zap, Battery, Sun, Wrench, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Product {
  name: string;
  quantity: number;
  category: string;
  imageUrl?: string;
}

interface Extra {
  name: string;
  price: string;
  imageUrl: string;
}

interface QuoteData {
  customerName: string;
  email: string;
  products: Product[];
  selfContribution: string;
  extras: Extra[];
}

interface SelectedExtra {
  name: string;
  quantity: number;
  price: string;
}

const categoryIcon = (category: string) => {
  switch (category) {
    case "Inverter": return <Zap className="w-5 h-5 text-primary" />;
    case "Akkumulátor": return <Battery className="w-5 h-5 text-primary" />;
    case "Napelem": return <Sun className="w-5 h-5 text-secondary" />;
    case "Szolgáltatás": return <Wrench className="w-5 h-5 text-muted-foreground" />;
    default: return <Package className="w-5 h-5 text-primary" />;
  }
};

const Arajanlat = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  

  useEffect(() => {
    if (!token) {
      setError("Érvénytelen link. Kérjük, használja a kapott egyedi linket.");
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/get-quote-data?token=${encodeURIComponent(token)}`,
          {
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Hiba történt");
        setQuoteData(result);
      } catch (err: any) {
        console.error("Error fetching quote:", err);
        setError(err.message || "Nem sikerült betölteni az árajánlatot.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [token]);

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.name === extra.name);
      if (exists) return prev.filter((e) => e.name !== extra.name);
      return [...prev, { name: extra.name, quantity: 1, price: extra.price }];
    });
  };

  const updateExtraQuantity = (name: string, delta: number) => {
    setSelectedExtras((prev) =>
      prev.map((e) =>
        e.name === name ? { ...e, quantity: Math.max(1, e.quantity + delta) } : e
      )
    );
  };

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/accept-quote`,
        {
          method: "POST",
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, selectedExtras }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setAccepted(true);
      toast.success("Árajánlat sikeresen elfogadva!");
    } catch (err: any) {
      console.error("Error accepting quote:", err);
      toast.error("Hiba történt az elfogadás során.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-body">Árajánlat betöltése...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-10"
          >
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-bold mb-3">Árajánlat nem található</h1>
            <p className="text-muted-foreground">{error}</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-card rounded-2xl border border-border p-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="font-heading text-3xl font-bold mb-3">Köszönjük!</h1>
            <p className="text-muted-foreground text-lg mb-2">
              Az árajánlatot sikeresen elfogadta.
            </p>
            <p className="text-muted-foreground">
              Munkatársunk hamarosan felveszi Önnel a kapcsolatot a továbbiakkal kapcsolatban.
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            Személyre szabott árajánlat
          </h1>
          <p className="text-muted-foreground text-lg">
            Kedves <span className="font-semibold text-foreground">{quoteData.customerName}</span>, 
            az alábbi ajánlatot készítettük Önnek
          </p>
        </motion.div>

        {/* Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-6"
        >
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Termékek és szolgáltatások
            </h2>
          </div>
          
          <div className="divide-y divide-border">
            {quoteData.products.map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl bg-muted/50 p-2 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {categoryIcon(product.category)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <span className="text-muted-foreground font-medium whitespace-nowrap">
                  {product.quantity} db
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Self contribution */}
        {quoteData.selfContribution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border-2 border-primary/30 p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="font-heading font-semibold text-lg">Önrész</span>
              </div>
              <span className="font-heading text-2xl font-bold text-primary">
                {quoteData.selfContribution}
              </span>
            </div>
          </motion.div>
        )}

        {/* Extras */}
        {quoteData.extras.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-secondary" />
              Elérhető extra szolgáltatások
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Az alábbi opciók közül választhat extra termékeket, szolgáltatásokat
            </p>

            <div className="space-y-3">
              {quoteData.extras.map((extra, idx) => {
                const isSelected = selectedExtras.some((e) => e.name === extra.name);
                const selected = selectedExtras.find((e) => e.name === extra.name);

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className={`bg-card rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-4 flex-1">
                        {extra.imageUrl && (
                          <img
                            src={extra.imageUrl}
                            alt={extra.name}
                            className="w-14 h-14 object-contain rounded-lg bg-muted/50 p-1 flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{extra.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {extra.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
                            <button
                              onClick={() => updateExtraQuantity(extra.name, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold min-w-[1.5rem] text-center">
                              {selected?.quantity}
                            </span>
                            <button
                              onClick={() => updateExtraQuantity(extra.name, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant={isSelected ? "destructive" : "default"}
                          onClick={() => toggleExtra(extra)}
                          className="min-w-[90px]"
                        >
                          {isSelected ? "Eltávolítás" : "Hozzáadás"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Accept button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            variant="hero"
            size="lg"
            onClick={handleAccept}
            disabled={accepting}
            className="text-lg px-10 py-6 gap-3"
          >
            {accepting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Feldolgozás...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Elfogadom az ajánlatot
              </>
            )}
          </Button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Arajanlat;
