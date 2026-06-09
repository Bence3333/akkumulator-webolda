import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionType, QUESTION_TYPE_LABELS } from "./SurveyQuestionCard";

interface SurveyCategory {
  id: string;
  name: string;
}

interface AddQuestionFormProps {
  categories: SurveyCategory[];
  maxSortOrder: number;
  onRefresh: () => void;
  defaultCategoryId?: string | null;
  surveyId?: number;
}

export default function AddQuestionForm({
  categories,
  maxSortOrder,
  onRefresh,
  defaultCategoryId = null,
  surveyId = 1,
}: AddQuestionFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("text");
  const [questionOptions, setQuestionOptions] = useState<string[]>([""]);
  const [categoryId, setCategoryId] = useState<string | null>(defaultCategoryId);
  const [required, setRequired] = useState(true);
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    if (!questionText.trim()) {
      toast.error("Kérjük, adja meg a kérdést");
      return;
    }

    if (questionType === "multiple_choice" && questionOptions.filter(o => o.trim()).length < 2) {
      toast.error("Legalább 2 válaszlehetőség szükséges");
      return;
    }

    try {
      const { error } = await supabase
        .from("survey_questions")
        .insert({
          question_text: questionText.trim(),
          question_type: questionType,
          options: questionType === "multiple_choice" 
            ? questionOptions.filter(o => o.trim()) 
            : [],
          sort_order: maxSortOrder + 1,
          category_id: categoryId,
          required,
          description: description.trim() || null,
          survey_id: surveyId,
        } as any);

      if (error) throw error;

      toast.success("Kérdés hozzáadva");
      setIsAdding(false);
      setQuestionText("");
      setQuestionType("text");
      setQuestionOptions([""]);
      setCategoryId(defaultCategoryId);
      setRequired(true);
      setDescription("");
      onRefresh();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Hiba történt a kérdés hozzáadásakor");
    }
  };

  if (!isAdding) {
    return (
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4 mr-2" /> Új kérdés hozzáadása
      </Button>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-dashed border-primary/50 space-y-4">
      <Input
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Kérdés szövege"
        className="font-medium"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Leírás/súgó szöveg (opcionális - ez jelenik meg a kérdőjel ikonra)"
        rows={2}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          value={questionType}
          onValueChange={(v) => setQuestionType(v as QuestionType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={categoryId || "none"}
          onValueChange={(v) => setCategoryId(v === "none" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kategória kiválasztása" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nincs kategória</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="required-new"
          checked={required}
          onCheckedChange={(checked) => setRequired(checked === true)}
        />
        <Label htmlFor="required-new" className="cursor-pointer">
          Kötelező kitölteni
        </Label>
      </div>
      {questionType === "multiple_choice" && (
        <div className="space-y-2">
          <Label>Válaszlehetőségek:</Label>
          {questionOptions.map((option, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...questionOptions];
                  newOptions[i] = e.target.value;
                  setQuestionOptions(newOptions);
                }}
                placeholder={`${i + 1}. lehetőség`}
              />
              {questionOptions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setQuestionOptions(questionOptions.filter((_, idx) => idx !== i));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuestionOptions([...questionOptions, ""])}
          >
            <Plus className="h-4 w-4 mr-1" /> Új lehetőség
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleAdd}>
          <Check className="h-4 w-4 mr-1" /> Hozzáadás
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setIsAdding(false);
            setQuestionText("");
            setQuestionType("text");
            setQuestionOptions([""]);
            setCategoryId(defaultCategoryId);
            setRequired(true);
            setDescription("");
          }}
        >
          <X className="h-4 w-4 mr-1" /> Mégse
        </Button>
      </div>
    </div>
  );
}
