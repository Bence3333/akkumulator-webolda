import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { QuoteFormData } from "@/pages/QuoteRequest";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Upload, X, Map } from "lucide-react";
import AddressMap from "./AddressMap";

interface Props {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  showImages?: boolean;
}

const StepContactInfo = ({ formData, updateFormData, showImages = false }: Props) => {
  const [addressMode, setAddressMode] = useState<"manual" | "map">("manual");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateFormData({ images: [...formData.images, ...files] });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Elérhetőségi adatok
        </h1>
        <p className="text-muted-foreground text-lg">
          Adja meg adatait, hogy felvehessük Önnel a kapcsolatot.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor="name" className="text-base font-medium">Név *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Teljes név"
            className="mt-2"
          />
        </motion.div>

        {/* Phone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Label htmlFor="phone" className="text-base font-medium">Telefonszám *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="+36 30 123 4567"
            className="mt-2"
          />
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor="email" className="text-base font-medium">Email cím *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="pelda@email.com"
            className="mt-2"
          />
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="address" className="text-base font-medium">Cím *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={addressMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setAddressMode("manual")}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Manuális
              </Button>
              <Button
                type="button"
                variant={addressMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setAddressMode("map")}
              >
                <Map className="w-4 h-4 mr-1" />
                Térkép
              </Button>
            </div>
          </div>
          
          {addressMode === "manual" ? (
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="1234 Budapest, Példa utca 1."
              className="mt-2"
            />
          ) : (
            <div className="mt-2">
              <AddressMap
                address={formData.address}
                lat={formData.lat}
                lng={formData.lng}
                onAddressChange={(address, lat, lng) => 
                  updateFormData({ address, lat, lng })
                }
              />
            </div>
          )}
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="notes" className="text-base font-medium">Megjegyzés (opcionális)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            placeholder="Bármilyen további információ, amit fontosnak tart..."
            className="mt-2 min-h-24"
          />
        </motion.div>

        {/* Image Upload - Only show for new installations */}
        {showImages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Label className="text-base font-medium mb-2 block">Képek a házról (opcionális)</Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">Feltöltés</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Has Existing Solar Checkbox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3"
        >
          <input
            type="checkbox"
            id="has-existing-solar"
            checked={formData.hasExistingSolar || false}
            onChange={(e) => updateFormData({ hasExistingSolar: e.target.checked })}
            className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary"
          />
          <Label htmlFor="has-existing-solar" className="cursor-pointer text-sm leading-relaxed">
            Már van meglévő napelem rendszerem
          </Label>
        </motion.div>

        {/* Privacy Consent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex items-start gap-3"
        >
          <input
            type="checkbox"
            id="privacy-consent"
            checked={formData.privacyAccepted}
            onChange={(e) => updateFormData({ privacyAccepted: e.target.checked })}
            className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary"
          />
          <Label htmlFor="privacy-consent" className="cursor-pointer text-sm leading-relaxed">
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
        </motion.div>
      </div>
    </div>
  );
};

export default StepContactInfo;
