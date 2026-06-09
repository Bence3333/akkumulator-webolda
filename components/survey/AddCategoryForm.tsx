import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddCategoryFormProps {
  maxSortOrder: number;
  onRefresh: () => void;
  surveyId?: number;
}

export default function AddCategoryForm({
  maxSortOrder,
  onRefresh,
  surveyId = 1,
}: AddCategoryFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const handleAdd = async () => {
    if (!categoryName.trim()) {
      toast.error("Kérjük, adja meg a kategória nevét");
      return;
    }

    try {
      const { error } = await supabase
        .from("survey_categories")
        .insert({
          name: categoryName.trim(),
          sort_order: maxSortOrder + 1,
          survey_id: surveyId,
        } as any);

      if (error) throw error;

      toast.success("Kategória hozzáadva");
      setIsAdding(false);
      setCategoryName("");
      onRefresh();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Hiba történt a kategória hozzáadásakor");
    }
  };

  if (!isAdding) {
    return (
      <Button
        variant="outline"
        className="border-dashed"
        onClick={() => setIsAdding(true)}
      >
        <FolderPlus className="h-4 w-4 mr-2" /> Új kategória
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Kategória neve (pl. Ingatlan adatok)"
        className="max-w-xs"
        autoFocus
      />
      <Button size="sm" onClick={handleAdd}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => {
        setIsAdding(false);
        setCategoryName("");
      }}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
