import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Grant, GrantInput } from "@/hooks/useGrants";

interface GrantEditorProps {
  grant: Grant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: GrantInput) => Promise<void>;
  mode: "create" | "edit";
}

const GrantEditor = ({
  grant,
  open,
  onOpenChange,
  onSave,
  mode,
}: GrantEditorProps) => {
  const [formData, setFormData] = useState<GrantInput>({
    customer_type: "maganszemely",
    title: "",
    deadline: "",
    max_amount: "",
    intensity: "",
    description: "",
    detailed_description: null,
    requirements: [],
    image_url: null,
  });
  const [newRequirement, setNewRequirement] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (grant && mode === "edit") {
      setFormData({
        customer_type: grant.customer_type,
        title: grant.title,
        deadline: grant.deadline,
        max_amount: grant.max_amount,
        intensity: grant.intensity,
        description: grant.description,
        detailed_description: grant.detailed_description,
        requirements: grant.requirements || [],
        image_url: grant.image_url,
      });
    } else if (mode === "create") {
      setFormData({
        customer_type: "maganszemely",
        title: "",
        deadline: "",
        max_amount: "",
        intensity: "",
        description: "",
        detailed_description: null,
        requirements: [],
        image_url: null,
      });
    }
  }, [grant, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    onOpenChange(false);
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Új pályázat" : "Pályázat szerkesztése"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ügyfél típusa</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: "maganszemely" })}
                className={`px-4 py-2 border transition-all ${
                  formData.customer_type === "maganszemely"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                Magánszemély
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: "ceg" })}
                className={`px-4 py-2 border transition-all ${
                  formData.customer_type === "ceg"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                Vállalkozás
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cím *</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Pályázat neve"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Leírás *</label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Pályázat rövid leírása"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">További részletek</label>
            <Textarea
              value={formData.detailed_description || ""}
              onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value || null })}
              placeholder="Részletes leírás, feltételek, tudnivalók... (opcionális)"
              rows={8}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Itt részletesen kifejthet minden fontos információt a pályázatról.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Maximum összeg *</label>
              <Input
                required
                value={formData.max_amount}
                onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                placeholder="pl. 4.000.000 Ft"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Támogatási intenzitás *</label>
              <Input
                required
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                placeholder="pl. 50%"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Határidő *</label>
            <Input
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              placeholder="pl. 2024. december 31."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Feltételek</label>
            <div className="space-y-2 mb-2">
              {formData.requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="flex-1 text-sm">{req}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Új feltétel"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" variant="outline" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kép</label>
            {formData.image_url && (
              <div className="relative mb-2 inline-block">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: null })}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Mégse
            </Button>
            <Button type="submit" variant="glow" className="flex-1" disabled={saving}>
              {saving ? "Mentés..." : mode === "create" ? "Létrehozás" : "Mentés"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GrantEditor;
