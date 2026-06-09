import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SurveyCategoryProps {
  id: string;
  name: string;
  isAdmin: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  children: React.ReactNode;
}

export default function SurveyCategory({
  id,
  name,
  isAdmin,
  isExpanded,
  onToggle,
  onRefresh,
  children,
}: SurveyCategoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isAdmin || isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Kérjük, adja meg a kategória nevét");
      return;
    }

    try {
      const { error } = await supabase
        .from("survey_categories")
        .update({ name: editName.trim() })
        .eq("id", id);

      if (error) throw error;

      toast.success("Kategória módosítva");
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Hiba történt a kategória módosításakor");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Biztosan törölni szeretné ezt a kategóriát? A benne lévő kérdések kategória nélkül maradnak.")) return;

    try {
      const { error } = await supabase
        .from("survey_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Kategória törölve");
      onRefresh();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Hiba történt a kategória törlésekor");
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      {/* Category Header - styled similar to reference */}
      <div 
        className="bg-primary text-primary-foreground rounded-lg p-3 cursor-pointer flex items-center justify-between shadow-md"
        onClick={() => !isEditing && onToggle()}
      >
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="font-semibold bg-white text-foreground"
              autoFocus
            />
            <Button size="sm" variant="secondary" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary/80" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-5 w-5 text-primary-foreground/70" />
                </div>
              )}
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-primary-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-primary-foreground" />
              )}
              <h2 className="font-semibold text-base">{name}</h2>
            </div>
            {isAdmin && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                  onClick={() => {
                    setEditName(name);
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Questions inside category */}
      {isExpanded && (
        <div className="space-y-2 pl-2 border-l-2 border-primary/30 ml-2">
          {children}
        </div>
      )}
    </div>
  );
}
