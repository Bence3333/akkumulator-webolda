import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const INVERTER_BRANDS = [
  { id: "deye", name: "Deye" },
  { id: "huawei", name: "Huawei" },
  { id: "growatt", name: "Growatt" },
  { id: "solaredge", name: "SolarEdge" },
  { id: "fronius", name: "Fronius" },
  { id: "sofar", name: "Sofar" },
  { id: "solax", name: "Solax" },
  { id: "sungrow", name: "Sungrow" },
  { id: "sma", name: "SMA" },
  { id: "goodwe", name: "Goodwe" },
  { id: "egyeb", name: "Egyéb" },
];

const QuickQuoteForm = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    hasSolar: false,
    inverterBrand: "",
    notes: "",
    privacyAccepted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Insert into external database (main business database)
      // Note: External DB uses different column names!
      const externalInsertData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        has_existing_solar: formData.hasSolar,
        inverter_brand: formData.inverterBrand || null,
        message: formData.notes.trim() || null,
        customer_type: "maganszemely",
      };
      console.log("QuickQuoteForm: External DB INSERT DATA:", JSON.stringify(externalInsertData, null, 2));
      
      const { error: saveError } = await externalSupabase.from("quote_requests").insert(externalInsertData);
      
      if (saveError) {
        console.error("QuickQuoteForm: External DB error:", saveError);
        throw saveError;
      }
      console.log("QuickQuoteForm: External DB save successful");

      // Send notification email and wait for it
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "quick_quote",
          data: formData,
        },
      });

      toast.success("Ajánlatkérés elküldve! Hamarosan felvesszük Önnel a kapcsolatot.");
      setFormData({ name: "", email: "", phone: "", address: "", hasSolar: false, inverterBrand: "", notes: "", privacyAccepted: false });
    } catch (err) {
      console.error("Error submitting quick quote:", err);
      toast.error("Hiba történt az ajánlatkérés küldése során.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div ref={ref} className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold">Gyors Ajánlatkérés</h3>
                <p className="text-muted-foreground">Töltse ki az alábbi űrlapot és hamarosan jelentkezünk!</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quick-name">Teljes név *</Label>
                <Input
                  id="quick-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kovács János"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-email">Email cím *</Label>
                <Input
                  id="quick-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="pelda@email.hu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-phone">Telefonszám *</Label>
                <Input
                  id="quick-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+36 30 123 4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-address">Telepítési cím *</Label>
                <Input
                  id="quick-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="1234 Budapest, Példa utca 12."
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="quick-notes">Megjegyzés (opcionális)</Label>
                <textarea
                  id="quick-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Egyéb kérdések, megjegyzések..."
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="quick-has-solar"
                  checked={formData.hasSolar}
                  onChange={(e) => setFormData({ ...formData, hasSolar: e.target.checked, inverterBrand: e.target.checked ? formData.inverterBrand : "" })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="quick-has-solar" className="cursor-pointer">
                  Már van meglévő napelem rendszerem
                </Label>
              </div>

              {formData.hasSolar && (
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="quick-inverter">Inverter márkája *</Label>
                  <Select
                    value={formData.inverterBrand}
                    onValueChange={(value) => setFormData({ ...formData, inverterBrand: value })}
                  >
                    <SelectTrigger id="quick-inverter">
                      <SelectValue placeholder="Válasszon inverter márkát..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INVERTER_BRANDS.map((brand) => (
                        <SelectItem key={brand.id} value={brand.name}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="quick-privacy"
                  checked={formData.privacyAccepted}
                  onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  required
                />
                <Label htmlFor="quick-privacy" className="cursor-pointer text-sm">
                  Elolvastam és elfogadom az{" "}
                  <a href="/adatkezelesi-tajekoztato" target="_blank" className="text-primary underline hover:no-underline">
                    Adatkezelési Tájékoztatót
                  </a>{" "}
                  *
                </Label>
              </div>

              <div className="md:col-span-2">
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="xl" 
                  className="w-full"
                  disabled={isSubmitting || !formData.privacyAccepted || (formData.hasSolar && !formData.inverterBrand)}
                >
                  {isSubmitting ? "Küldés..." : "Ajánlatkérés Küldése"}
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickQuoteForm;
