import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { Package, PackageInput } from "@/hooks/usePackages";

// Native select styling class
const nativeSelectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface PackageEditorProps {
  pkg?: Package;
  onSave: (data: PackageInput) => Promise<void>;
  trigger?: React.ReactNode;
}

const BRAND_OPTIONS = [
  { value: "deye", label: "Deye" },
  { value: "huawei", label: "Huawei" },
  { value: "solax", label: "SolaX" },
  { value: "solaredge", label: "SolarEdge" },
  { value: "other", label: "Egyéb" },
];

const PackageEditor = ({ pkg, onSave, trigger }: PackageEditorProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PackageInput>({
    title: pkg?.title || "",
    power_kwp: pkg?.power_kwp || "",
    inverter_power: pkg?.inverter_power || "",
    battery_kwh: pkg?.battery_kwh || "",
    price: pkg?.price || "",
    description: pkg?.description || "",
    detailed_description: pkg?.detailed_description || "",
    features: pkg?.features || [],
    image_url: pkg?.image_url || "",
    images: pkg?.images || [],
    brand_description: pkg?.brand_description || "",
    brand: pkg?.brand || "deye",
    display_order: pkg?.display_order || 0,
  });
  const [newFeature, setNewFeature] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setOpen(false);
      if (!pkg) {
        setFormData({
          title: "",
          power_kwp: "",
          inverter_power: "",
          battery_kwh: "",
          price: "",
          description: "",
          detailed_description: "",
          features: [],
          image_url: "",
          images: [],
          brand_description: "",
          brand: "deye",
          display_order: 0,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const selectedBrandLabel = BRAND_OPTIONS.find(b => b.value === formData.brand)?.label || "a márka";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Új csomag
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pkg ? "Csomag szerkesztése" : "Új csomag hozzáadása"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Csomag neve</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Márka kategória</Label>
              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
                className={nativeSelectClass}
              >
                {BRAND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="display_order">Sorrend</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label htmlFor="power_kwp">Napelem teljesítmény (kWp)</Label>
              <Input
                id="power_kwp"
                value={formData.power_kwp}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, power_kwp: e.target.value }))
                }
                placeholder="pl. 5 kWp"
                required
              />
            </div>
            <div>
              <Label htmlFor="inverter_power">Inverter teljesítmény</Label>
              <Input
                id="inverter_power"
                value={formData.inverter_power}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, inverter_power: e.target.value }))
                }
                placeholder="pl. 5 kW"
                required
              />
            </div>
            <div>
              <Label htmlFor="battery_kwh">Akkumulátor kapacitás (kWh)</Label>
              <Input
                id="battery_kwh"
                value={formData.battery_kwh}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, battery_kwh: e.target.value }))
                }
                placeholder="pl. 5 kWh"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Ár (Bruttó)</Label>
              <Input
                id="price"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="pl. 2 990 000 Ft-tól"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="image_url">Fő kép URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Multiple Images */}
          <div>
            <Label>Galéria képek</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Kép URL hozzáadása"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <Button type="button" onClick={addImage} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Kép ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Rövid leírás</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="detailed_description">Részletes leírás</Label>
            <Textarea
              id="detailed_description"
              value={formData.detailed_description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, detailed_description: e.target.value }))
              }
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="brand_description">Miért pont {selectedBrandLabel}? (leírás)</Label>
            <Textarea
              id="brand_description"
              value={formData.brand_description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand_description: e.target.value }))
              }
              rows={4}
              placeholder={`A ${selectedBrandLabel} márka előnyei, minőségi jellemzők...`}
            />
          </div>
          <div>
            <Label>Jellemzők</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Új jellemző hozzáadása"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" onClick={addFeature} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Mégse
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Mentés..." : "Mentés"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PackageEditor;