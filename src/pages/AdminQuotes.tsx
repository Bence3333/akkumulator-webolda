import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Search, Clock, CheckCircle2, XCircle, 
  User, Phone, Mail, MapPin, Calendar, Sun, Home,
  ChevronDown, ChevronUp, Image, PhoneCall, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

interface QuoteRequest {
  id: string;
  has_solar: boolean;
  name: string;
  phone: string;
  email: string;
  address: string;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  roof_angle: number | null;
  roof_orientation: string | null;
  roof_type: string | null;
  annual_consumption: number | null;
  images: string[];
  status: "pending" | "in_progress" | "closed";
  created_at: string;
  updated_at: string;
}

interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
  preferred_day: string | null;
  preferred_time: string | null;
}

const statusLabels = {
  pending: { label: "Új", icon: Clock, color: "bg-yellow-500" },
  in_progress: { label: "Folyamatban", icon: CheckCircle2, color: "bg-blue-500" },
  closed: { label: "Lezárt", icon: XCircle, color: "bg-muted-foreground" },
};

const roofTypeLabels: Record<string, string> = {
  flat: "Lapos",
  sheet: "Lemez",
  standing_seam: "Korcolt lemez",
  shingle: "Zsindely",
  tile: "Cserép",
};

const orientationLabels: Record<string, string> = {
  north: "Észak",
  northeast: "Északkelet",
  east: "Kelet",
  southeast: "Délkelet",
  south: "Dél",
  southwest: "Délnyugat",
  west: "Nyugat",
  northwest: "Északnyugat",
};

const AdminQuotes = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [viewMode, setViewMode] = useState<"quotes" | "callbacks">("quotes");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [quotesRes, callbacksRes] = await Promise.all([
        supabase
          .from("quote_requests")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("callback_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (quotesRes.error) throw quotesRes.error;
      if (callbacksRes.error) throw callbacksRes.error;
      
      setQuotes(quotesRes.data || []);
      setCallbacks(callbacksRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (id: string, status: "pending" | "in_progress" | "closed") => {
    try {
      const { error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      setQuotes(quotes.map(q => q.id === id ? { ...q, status } : q));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateCallbackStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("callback_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      setCallbacks(callbacks.map(c => c.id === id ? { ...c, status } : c));
    } catch (error) {
      console.error("Error updating callback status:", error);
    }
  };

  const deleteCallback = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a visszahívás kérést?")) return;
    try {
      const { error } = await supabase
        .from("callback_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setCallbacks(callbacks.filter(c => c.id !== id));
      toast.success("Visszahívás törölve");
    } catch (error) {
      console.error("Error deleting callback:", error);
      toast.error("Hiba történt a törlés során");
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt az ajánlatkérést?")) return;
    try {
      const { error } = await supabase
        .from("quote_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setQuotes(quotes.filter(q => q.id !== id));
      toast.success("Ajánlatkérés törölve");
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Hiba történt a törlés során");
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.phone.includes(searchQuery) ||
      quote.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = quote.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const filteredCallbacks = callbacks.filter(cb => {
    const matchesSearch = 
      cb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cb.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cb.phone.includes(searchQuery);
    
    const matchesTab = cb.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const quoteCounts = {
    pending: quotes.filter(q => q.status === "pending").length,
    in_progress: quotes.filter(q => q.status === "in_progress").length,
    closed: quotes.filter(q => q.status === "closed").length,
  };

  const callbackCounts = {
    pending: callbacks.filter(c => c.status === "pending").length,
    in_progress: callbacks.filter(c => c.status === "in_progress").length,
    closed: callbacks.filter(c => c.status === "closed").length,
  };

  const counts = viewMode === "quotes" ? quoteCounts : callbackCounts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Vissza
          </Button>
          
          <h1 className="font-heading text-xl font-bold">
            {viewMode === "quotes" ? "Ajánlatkérések" : "Visszahívások"}
          </h1>
          
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* View Mode Switch */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-card rounded-xl p-1 border border-border shadow-sm">
            <button
              onClick={() => setViewMode("quotes")}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                viewMode === "quotes"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="w-4 h-4" />
              Ajánlatkérések ({quotes.length})
            </button>
            <button
              onClick={() => setViewMode("callbacks")}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                viewMode === "callbacks"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              Visszahívások ({callbacks.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Keresés név, email vagy telefon alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Új ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Folyamatban ({counts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="closed" className="gap-2">
              <XCircle className="w-4 h-4" />
              Lezárt ({counts.closed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Quote List */}
        {viewMode === "quotes" && (
          <div className="space-y-4">
            {filteredQuotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nincs találat a keresési feltételeknek megfelelően.
                </CardContent>
              </Card>
            ) : (
              filteredQuotes.map((quote) => {
                const StatusIcon = statusLabels[quote.status].icon;
                const isExpanded = expandedId === quote.id;

                return (
                  <motion.div
                    key={quote.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : quote.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${statusLabels[quote.status].color} flex items-center justify-center`}>
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {quote.name}
                                <Badge variant={quote.has_solar ? "secondary" : "default"}>
                                  {quote.has_solar ? "Van napelem" : "Új telepítés"}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(quote.created_at), "yyyy. MMMM d. HH:mm", { locale: hu })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="border-t border-border pt-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Contact Info */}
                            <div className="space-y-4">
                              <h4 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Kapcsolattartó
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <a href={`tel:${quote.phone}`} className="text-primary hover:underline">
                                    {quote.phone}
                                  </a>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <a href={`mailto:${quote.email}`} className="text-primary hover:underline">
                                    {quote.email}
                                  </a>
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  {quote.address}
                                </p>
                              </div>
                            </div>

                            {/* Roof Details (if new installation) */}
                            {!quote.has_solar && (
                              <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Home className="w-4 h-4" />
                                  Tető adatok
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="bg-muted/50 p-3 rounded-lg">
                                    <p className="text-muted-foreground text-xs">Dőlésszög</p>
                                    <p className="font-medium">{quote.roof_angle}°</p>
                                  </div>
                                  <div className="bg-muted/50 p-3 rounded-lg">
                                    <p className="text-muted-foreground text-xs">Tájolás</p>
                                    <p className="font-medium">{orientationLabels[quote.roof_orientation || ""] || "-"}</p>
                                  </div>
                                  <div className="bg-muted/50 p-3 rounded-lg">
                                    <p className="text-muted-foreground text-xs">Tető típus</p>
                                    <p className="font-medium">{roofTypeLabels[quote.roof_type || ""] || "-"}</p>
                                  </div>
                                  <div className="bg-muted/50 p-3 rounded-lg">
                                    <p className="text-muted-foreground text-xs">Éves fogyasztás</p>
                                    <p className="font-medium">{quote.annual_consumption?.toLocaleString()} kWh</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {quote.notes && (
                              <div className="md:col-span-2 space-y-2">
                                <h4 className="font-semibold">Megjegyzés</h4>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                                  {quote.notes}
                                </p>
                              </div>
                            )}

                            {/* Images */}
                            {quote.images && quote.images.length > 0 && (
                              <div className="md:col-span-2 space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Image className="w-4 h-4" />
                                  Feltöltött képek
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {quote.images.map((url, index) => (
                                    <a
                                      key={index}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                                    >
                                      <img src={url} alt={`Kép ${index + 1}`} className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Status Actions */}
                            <div className="md:col-span-2 flex flex-wrap gap-2 pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground mr-4">Státusz módosítása:</p>
                              {quote.status !== "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuoteStatus(quote.id, "pending")}
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  Új
                                </Button>
                              )}
                              {quote.status !== "in_progress" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuoteStatus(quote.id, "in_progress")}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Folyamatban
                                </Button>
                              )}
                              {quote.status !== "closed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuoteStatus(quote.id, "closed")}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Lezárt
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteQuote(quote.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Törlés
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Callback List */}
        {viewMode === "callbacks" && (
          <div className="space-y-4">
            {filteredCallbacks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nincs találat a keresési feltételeknek megfelelően.
                </CardContent>
              </Card>
            ) : (
              filteredCallbacks.map((cb) => {
                const status = cb.status as "pending" | "in_progress" | "closed";
                const StatusIcon = statusLabels[status]?.icon || Clock;
                const statusColor = statusLabels[status]?.color || "bg-gray-500";

                return (
                  <motion.div
                    key={cb.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${statusColor} flex items-center justify-center`}>
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {cb.name}
                                <Badge variant="outline">
                                  <PhoneCall className="w-3 h-3 mr-1" />
                                  Visszahívás
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(cb.created_at), "yyyy. MMMM d. HH:mm", { locale: hu })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="border-t border-border pt-4">
                        <div className="flex flex-wrap items-center gap-6 mb-4">
                          <p className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${cb.phone}`} className="text-primary hover:underline">
                              {cb.phone}
                            </a>
                          </p>
                          <p className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${cb.email}`} className="text-primary hover:underline">
                              {cb.email}
                            </a>
                          </p>
                        </div>

                        {/* Preferred time info */}
                        {(cb.preferred_day || cb.preferred_time) && (
                          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Mikor hívjuk:</span>
                            <Badge variant="secondary">
                              {cb.preferred_day === "weekend" ? "Hétvégén" : "Hétköznap"}
                            </Badge>
                            <Badge variant="secondary">
                              {cb.preferred_time === "afternoon" ? "Délután" : "Délelőtt"}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground mr-4">Státusz módosítása:</p>
                          {cb.status !== "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCallbackStatus(cb.id, "pending")}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Új
                            </Button>
                          )}
                          {cb.status !== "in_progress" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCallbackStatus(cb.id, "in_progress")}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Folyamatban
                            </Button>
                          )}
                          {cb.status !== "closed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCallbackStatus(cb.id, "closed")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Lezárt
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCallback(cb.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Törlés
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminQuotes;
