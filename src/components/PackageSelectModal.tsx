import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";

interface PackageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageTitle: string;
  packageCode: string | null;
  batterySize: string | null;
}

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

const PackageSelectModal = ({
  isOpen,
  onClose,
  packageTitle,
  packageCode,
  batterySize,
}: PackageSelectModalProps) => {
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

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      hasSolar: false,
      inverterBrand: "",
      notes: "",
      privacyAccepted: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build notes with customer notes first, then package info
      const packageInfo = `Kiválasztott csomag: ${packageTitle}${packageCode ? ` (${packageCode})` : ""}${batterySize ? ` - Akkumulátor: ${batterySize}` : ""}`;
      const notesWithPackage = formData.notes.trim() 
        ? `${formData.notes.trim()}\n\n${packageInfo}` 
        : packageInfo;

      // Insert into external database
      const externalInsertData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        has_existing_solar: formData.hasSolar,
        inverter_brand: formData.inverterBrand || null,
        message: notesWithPackage,
        customer_type: "maganszemely",
      };

      console.log(
        "PackageSelectModal: External DB INSERT DATA:",
        JSON.stringify(externalInsertData, null, 2)
      );

      const { error: saveError } = await externalSupabase
        .from("quote_requests")
        .insert(externalInsertData);

      if (saveError) {
        console.error("PackageSelectModal: External DB error:", saveError);
        throw saveError;
      }

      // Send notification email
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "package_select",
          data: {
            ...formData,
            packageTitle,
            packageCode,
            batterySize,
          },
        },
      });

      toast.success(
        "Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot a kiválasztott csomaggal kapcsolatban."
      );
      handleClose();
    } catch (err) {
      console.error("Error submitting package selection:", err);
      toast.error("Hiba történt az ajánlatkérés küldése során.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            {packageTitle}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Töltse ki az alábbi adatokat és hamarosan jelentkezünk!
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">Teljes név *</Label>
            <Input
              id="pkg-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Kovács János"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-email">Email cím *</Label>
            <Input
              id="pkg-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="pelda@email.hu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-phone">Telefonszám *</Label>
            <Input
              id="pkg-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+36 30 123 4567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-address">Telepítési cím *</Label>
            <Input
              id="pkg-address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="1234 Budapest, Példa utca 12."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-notes">Megjegyzés (opcionális)</Label>
            <textarea
              id="pkg-notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Egyéb kérdések, megjegyzések..."
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pkg-has-solar"
              checked={formData.hasSolar}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hasSolar: e.target.checked,
                  inverterBrand: e.target.checked ? formData.inverterBrand : "",
                })
              }
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="pkg-has-solar" className="cursor-pointer">
              Már van meglévő napelem rendszerem
            </Label>
          </div>

          {formData.hasSolar && (
            <div className="space-y-2">
              <Label htmlFor="pkg-inverter">Inverter márkája *</Label>
              <Select
                value={formData.inverterBrand}
                onValueChange={(value) =>
                  setFormData({ ...formData, inverterBrand: value })
                }
              >
                <SelectTrigger id="pkg-inverter">
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pkg-privacy"
              checked={formData.privacyAccepted}
              onChange={(e) =>
                setFormData({ ...formData, privacyAccepted: e.target.checked })
              }
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              required
            />
            <Label htmlFor="pkg-privacy" className="cursor-pointer text-sm">
              Elolvastam és elfogadom az{" "}
              <a
                href="/adatkezelesi-tajekoztato"
                target="_blank"
                className="text-primary underline hover:no-underline"
              >
                Adatkezelési Tájékoztatót
              </a>{" "}
              *
            </Label>
          </div>

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            disabled={
              isSubmitting ||
              !formData.privacyAccepted ||
              (formData.hasSolar && !formData.inverterBrand)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Küldés...
              </>
            ) : (
              <>
                Ajánlatkérés Küldése
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PackageSelectModal;
