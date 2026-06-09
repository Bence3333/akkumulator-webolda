import { motion } from "framer-motion";
import { QuoteFormData } from "@/pages/QuoteRequest";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
}

const roofTypes = [
  { id: "flat", label: "Lapos", icon: "━" },
  { id: "sheet", label: "Lemez", icon: "◢◣" },
  { id: "standing_seam", label: "Korcolt lemez", icon: "╱╲" },
  { id: "shingle", label: "Zsindely", icon: "▰▰" },
  { id: "tile", label: "Cserép", icon: "⌒⌒" },
];

const orientations = [
  { id: "north", label: "É", fullLabel: "Észak", angle: 0 },
  { id: "northeast", label: "ÉK", fullLabel: "Északkelet", angle: 45 },
  { id: "east", label: "K", fullLabel: "Kelet", angle: 90 },
  { id: "southeast", label: "DK", fullLabel: "Délkelet", angle: 135 },
  { id: "south", label: "D", fullLabel: "Dél", angle: 180 },
  { id: "southwest", label: "DNY", fullLabel: "Délnyugat", angle: 225 },
  { id: "west", label: "NY", fullLabel: "Nyugat", angle: 270 },
  { id: "northwest", label: "ÉNY", fullLabel: "Északnyugat", angle: 315 },
];

const roofAngles = [
  { id: "0", label: "Lapos (0°)", description: "Vízszintes tető" },
  { id: "15", label: "Enyhe (15°)", description: "Alig látható lejtés" },
  { id: "25", label: "Közepes (25°)", description: "Tipikus családi ház" },
  { id: "35", label: "Meredek (35°)", description: "Hagyományos tető" },
  { id: "45", label: "Nagyon meredek (45°)", description: "Alpesi stílus" },
];

const StepRoofDetails = ({ formData, updateFormData }: Props) => {
  const selectedOrientation = orientations.find(o => o.id === formData.roofOrientation);
  const selectedAngle = roofAngles.find(a => a.id === String(formData.roofAngle));

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Tető adatok
        </h1>
        <p className="text-muted-foreground text-lg">
          Segítsen nekünk megismerni tetőjét a pontos ajánlatért.
        </p>
      </motion.div>

      <div className="space-y-12">
        {/* Roof Angle - Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <Label className="text-lg font-semibold mb-2 block">
            Tető dőlésszöge
          </Label>
          <p className="text-sm text-muted-foreground mb-6">
            Válassza ki a tetőhöz legközelebb álló dőlésszöget.
          </p>

          <Select
            value={String(formData.roofAngle)}
            onValueChange={(value) => updateFormData({ roofAngle: parseInt(value) })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Válasszon dőlésszöget" />
            </SelectTrigger>
            <SelectContent>
              {roofAngles.map((angle) => (
                <SelectItem key={angle.id} value={angle.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{angle.label}</span>
                    <span className="text-xs text-muted-foreground">{angle.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4 text-sm text-muted-foreground">
            Kiválasztva: <span className="text-foreground font-medium">{selectedAngle?.label || "Nincs kiválasztva"}</span>
          </div>
        </motion.div>

        {/* Roof Orientation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <Label className="text-lg font-semibold mb-2 block">
            Tető tájolása
          </Label>
          <p className="text-sm text-muted-foreground mb-6">
            Válassza ki a tető fő tájolását.
          </p>

          <Select
            value={formData.roofOrientation}
            onValueChange={(value) => updateFormData({ roofOrientation: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Válasszon tájolást" />
            </SelectTrigger>
            <SelectContent>
              {orientations.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.fullLabel} ({o.label})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4 text-sm text-muted-foreground">
            Kiválasztva: <span className="text-foreground font-medium">{selectedOrientation?.fullLabel || "Nincs kiválasztva"}</span>
          </div>
        </motion.div>

        {/* Roof Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <Label className="text-lg font-semibold mb-6 block">Tető típusa</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roofTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => updateFormData({ roofType: type.id })}
                className={`p-4 rounded-xl border-2 transition-all duration-100 hover:scale-105 hover:-translate-y-1 ${
                  formData.roofType === type.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div className="text-2xl mb-2 font-mono">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Annual Consumption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <Label className="text-lg font-semibold mb-4 block">Éves energiafogyasztás (kWh)</Label>
          
          <Input
            type="number"
            value={formData.annualConsumption}
            onChange={(e) => updateFormData({ annualConsumption: parseInt(e.target.value) || 0 })}
            placeholder="pl. 5000"
            className="text-lg"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Ezt a számot megtalálja az áramszámláján. Az átlagos háztartás ~4000-6000 kWh-t fogyaszt évente.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default StepRoofDetails;
