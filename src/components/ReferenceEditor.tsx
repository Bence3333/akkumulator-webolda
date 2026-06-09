import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Reference } from "@/hooks/useReferences";

interface ReferenceEditorProps {
  reference?: Reference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Reference, "id" | "created_at" | "updated_at">) => Promise<void>;
  mode: "create" | "edit";
}

const ReferenceEditor = ({ reference, open, onOpenChange, onSave, mode }: ReferenceEditorProps) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "lakossagi" as "lakossagi" | "ipari",
    power: "",
    panels: "",
    year: new Date().getFullYear().toString(),
    description: "",
    detailed_description: "",
    images: [] as string[],
  });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reference && mode === "edit") {
      setFormData({
        title: reference.title,
        category: reference.category as "lakossagi" | "ipari",
        power: reference.power,
        panels: reference.panels,
        year: reference.year,
        description: reference.description,
        detailed_description: reference.detailed_description || "",
        images: reference.images || [],
      });
    } else if (mode === "create") {
      setFormData({
        title: "",
        category: "lakossagi",
        power: "",
        panels: "",
        year: new Date().getFullYear().toString(),
        description: "",
        detailed_description: "",
        images: [],
      });
    }
  }, [reference, mode, open]);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            {mode === "create" ? "Új referencia létrehozása" : "Referencia szerkesztése"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cím *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                placeholder="Pl: Családi ház - Budapest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kategória *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "lakossagi" | "ipari" })}
                className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              >
                <option value="lakossagi">Lakossági</option>
                <option value="ipari">Ipari</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Teljesítmény *
              </label>
              <input
                type="text"
                required
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                placeholder="Pl: 8.5 kW"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Panelek száma *
              </label>
              <input
                type="text"
                required
                value={formData.panels}
                onChange={(e) => setFormData({ ...formData, panels: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                placeholder="Pl: 20 db"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Év *
              </label>
              <input
                type="text"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                placeholder="2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rövid leírás *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground resize-none"
              placeholder="Rövid összefoglaló a projektről..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Részletes leírás
            </label>
            <textarea
              rows={4}
              value={formData.detailed_description}
              onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground resize-none"
              placeholder="Részletes információk a projektről..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Képek (URL-ek)
            </label>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative aspect-video bg-background border border-border overflow-hidden group">
                    <img src={img} alt={`Kép ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" variant="outline" onClick={handleAddImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Mégse
            </Button>
            <Button type="submit" variant="glow" disabled={saving}>
              {saving ? "Mentés..." : mode === "create" ? "Létrehozás" : "Mentés"}
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceEditor;
