import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GripVertical, Edit2, Check, X, Trash2, Plus, Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import HelpPopover from "./HelpPopover";

export type QuestionType = "text" | "multiple_choice" | "phone" | "date" | "number" | "email" | "ownership_share" | "file_upload";

export interface SurveyQuestion {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: string[];
  sort_order: number;
  required: boolean;
  category_id: string | null;
  description: string | null;
}

interface SurveyCategory {
  id: string;
  name: string;
}

interface SurveyQuestionCardProps {
  question: SurveyQuestion;
  index: number;
  isAdmin: boolean;
  categories: SurveyCategory[];
  answer: string;
  onAnswerChange: (value: string) => void;
  onRefresh: () => void;
  isEmailLocked?: boolean;
  allAnswers?: Record<string, string>;
  allQuestions?: SurveyQuestion[];
  showError?: boolean;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Szöveges válasz",
  multiple_choice: "Felelet választós",
  phone: "Telefonszám",
  date: "Dátum",
  number: "Szám/Darabszám",
  email: "E-mail cím",
  ownership_share: "Tulajdoni hányad",
  file_upload: "Fájl feltöltés",
};

export default function SurveyQuestionCard({
  question,
  index,
  isAdmin,
  categories,
  answer,
  onAnswerChange,
  onRefresh,
  isEmailLocked = false,
  allAnswers = {},
  allQuestions = [],
  showError = false,
}: SurveyQuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestionText, setEditQuestionText] = useState(question.question_text);
  const [editQuestionType, setEditQuestionType] = useState<QuestionType>(question.question_type);
  const [editQuestionOptions, setEditQuestionOptions] = useState<string[]>(
    question.options.length > 0 ? question.options : [""]
  );
  const [editCategoryId, setEditCategoryId] = useState<string | null>(question.category_id);
  const [editRequired, setEditRequired] = useState(question.required);
  const [editDescription, setEditDescription] = useState(question.description || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id, disabled: !isAdmin || isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    if (!editQuestionText.trim()) {
      toast.error("Kérjük, adja meg a kérdést");
      return;
    }

    if (editQuestionType === "multiple_choice" && editQuestionOptions.filter(o => o.trim()).length < 2) {
      toast.error("Legalább 2 válaszlehetőség szükséges");
      return;
    }

    try {
      const { error } = await supabase
        .from("survey_questions")
        .update({
          question_text: editQuestionText.trim(),
          question_type: editQuestionType,
          options: editQuestionType === "multiple_choice" 
            ? editQuestionOptions.filter(o => o.trim()) 
            : [],
          category_id: editCategoryId,
          required: editRequired,
          description: editDescription.trim() || null,
        })
        .eq("id", question.id);

      if (error) throw error;

      toast.success("Kérdés módosítva");
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Hiba történt a kérdés módosításakor");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Biztosan törölni szeretné ezt a kérdést?")) return;

    try {
      const { error } = await supabase
        .from("survey_questions")
        .delete()
        .eq("id", question.id);

      if (error) throw error;

      toast.success("Kérdés törölve");
      onRefresh();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Hiba történt a kérdés törlésekor");
    }
  };

  // Check if this is an email confirmation field and if it matches the original email
  const checkEmailMatch = () => {
    if (!question.question_text.toLowerCase().includes("megerősít") && 
        !question.question_text.toLowerCase().includes("megeros")) {
      return { isConfirmation: false, matches: true };
    }
    
    // Find the original email question (one without "megerősít")
    const originalEmailQuestion = allQuestions.find(q => 
      (q.question_type === "email" || 
       q.question_text.toLowerCase().includes("email") || 
       q.question_text.toLowerCase().includes("e-mail")) &&
      !q.question_text.toLowerCase().includes("megerősít") &&
      !q.question_text.toLowerCase().includes("megeros") &&
      q.id !== question.id
    );
    
    if (!originalEmailQuestion) {
      return { isConfirmation: false, matches: true };
    }
    
    const originalEmail = allAnswers[originalEmailQuestion.id] || "";
    return { 
      isConfirmation: true, 
      matches: !answer || !originalEmail || answer === originalEmail,
      originalEmail 
    };
  };

  const renderInput = () => {
    const errorClass = showError ? "border-destructive ring-1 ring-destructive" : "";
    const baseClass = `w-full ${isEmailLocked ? "bg-muted cursor-not-allowed" : ""} ${errorClass}`;
    
    switch (question.question_type) {
      case "phone":
        return (
          <Input
            type="tel"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="+36 30 123 4567"
            className={baseClass}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            className={baseClass}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="0"
            className={baseClass}
          />
        );
      case "email":
        const isValidEmail = !answer || answer.includes("@");
        const emailMatch = checkEmailMatch();
        const hasError = !isValidEmail || (emailMatch.isConfirmation && !emailMatch.matches);
        return (
          <div className="space-y-1">
            <Input
              type="email"
              value={answer}
              onChange={(e) => !isEmailLocked && onAnswerChange(e.target.value)}
              placeholder="pelda@email.hu"
              className={`${baseClass} ${hasError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              readOnly={isEmailLocked}
            />
            {!isValidEmail && (
              <p className="text-xs text-destructive">Érvényes email címet adjon meg (tartalmaznia kell @-ot)</p>
            )}
            {isValidEmail && emailMatch.isConfirmation && !emailMatch.matches && (
              <p className="text-xs text-destructive">A két e-mail cím nem egyezik</p>
            )}
          </div>
        );
      case "ownership_share":
        const [numerator = "", denominator = ""] = answer.split("/");
        const ownershipErrorClass = showError ? "border-destructive ring-1 ring-destructive" : "";
        return (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="1"
              placeholder="pl. 1"
              value={numerator}
              onChange={(e) => onAnswerChange(`${e.target.value}/${denominator}`)}
              className={`w-20 text-center ${ownershipErrorClass}`}
            />
            <span className="text-lg font-medium text-muted-foreground">/</span>
            <Input
              type="number"
              min="1"
              placeholder="pl. 2"
              value={denominator}
              onChange={(e) => onAnswerChange(`${numerator}/${e.target.value}`)}
              className={`w-20 text-center ${ownershipErrorClass}`}
            />
            <span className="text-xs text-muted-foreground ml-1">hányad</span>
          </div>
        );
      case "multiple_choice":
        return (
          <div className={`space-y-2 ${showError ? "p-2 rounded-md border border-destructive" : ""}`}>
            <RadioGroup
              value={answer}
              onValueChange={onAnswerChange}
              className="space-y-2"
            >
              {question.options.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${i}`} />
                  <Label htmlFor={`${question.id}-${i}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case "file_upload":
        const uploadedUrls = answer ? answer.split(",").filter(Boolean) : [];
        
        const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;
          
          const newUrls: string[] = [...uploadedUrls];
          
          for (const file of Array.from(files)) {
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 8);
            const fileName = `survey-files/${timestamp}-${randomId}-${file.name}`;
            
            try {
              const { error: uploadError } = await supabase.storage
                .from("survey-attachments")
                .upload(fileName, file);
              
              if (uploadError) throw uploadError;
              
              const { data: urlData } = supabase.storage
                .from("survey-attachments")
                .getPublicUrl(fileName);
              
              newUrls.push(urlData.publicUrl);
              toast.success(`${file.name} feltöltve`);
            } catch (err) {
              console.error("Upload error:", err);
              toast.error(`Hiba: ${file.name} feltöltése sikertelen`);
            }
          }
          
          onAnswerChange(newUrls.join(","));
          if (fileInputRef.current) fileInputRef.current.value = "";
        };
        
        return (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors ${errorClass ? "border-destructive" : "border-border"}`}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Kattintson a fájlok feltöltéséhez</p>
              <p className="text-xs text-muted-foreground mt-1">Támogatott: képek, PDF, Word, Excel</p>
            </div>
            {uploadedUrls.length > 0 && (
              <div className="space-y-2">
                {uploadedUrls.map((url, i) => {
                  const fileName = decodeURIComponent(url.split("/").pop() || "").replace(/^\d+-\w+-/, "");
                  return (
                    <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex-1">
                        {fileName}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => {
                          const newUrls = uploadedUrls.filter((_, idx) => idx !== i);
                          onAnswerChange(newUrls.join(","));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      default:
        return (
          <Input
            value={answer}
            onChange={(e) => !isEmailLocked && onAnswerChange(e.target.value)}
            placeholder="Írja be válaszát..."
            className={baseClass}
            readOnly={isEmailLocked}
          />
        );
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border space-y-4">
        <Input
          value={editQuestionText}
          onChange={(e) => setEditQuestionText(e.target.value)}
          placeholder="Kérdés szövege"
          className="font-medium"
        />
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Leírás/súgó szöveg (opcionális - ez jelenik meg a kérdőjel ikonra)"
          rows={2}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={editQuestionType}
            onValueChange={(v) => setEditQuestionType(v as QuestionType)}
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
            value={editCategoryId || "none"}
            onValueChange={(v) => setEditCategoryId(v === "none" ? null : v)}
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
            id="required"
            checked={editRequired}
            onCheckedChange={(checked) => setEditRequired(checked === true)}
          />
          <Label htmlFor="required" className="cursor-pointer">
            Kötelező kitölteni
          </Label>
        </div>
        {editQuestionType === "multiple_choice" && (
          <div className="space-y-2">
            <Label>Válaszlehetőségek:</Label>
            {editQuestionOptions.map((option, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...editQuestionOptions];
                    newOptions[i] = e.target.value;
                    setEditQuestionOptions(newOptions);
                  }}
                  placeholder={`${i + 1}. lehetőség`}
                />
                {editQuestionOptions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditQuestionOptions(editQuestionOptions.filter((_, idx) => idx !== i));
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
              onClick={() => setEditQuestionOptions([...editQuestionOptions, ""])}
            >
              <Plus className="h-4 w-4 mr-1" /> Új lehetőség
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            <Check className="h-4 w-4 mr-1" /> Mentés
          </Button>
          <Button variant="ghost" onClick={() => setIsEditing(false)} size="sm">
            <X className="h-4 w-4 mr-1" /> Mégse
          </Button>
        </div>
      </div>
    );
  }

  const categoryName = categories.find(c => c.id === question.category_id)?.name;

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`question-${question.id}`}
      className={`bg-card rounded-lg p-3 shadow-sm border ${showError ? "border-destructive" : "border-border"}`}
    >
      {/* Admin controls row */}
      {isAdmin && (
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1">
            {categoryName && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2">
                {categoryName}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Question and answer side by side */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Question label */}
        <div className="sm:w-1/2 flex items-start gap-1.5">
          <span className="text-sm text-foreground">
            {question.question_text}
            {question.required && <span className="text-destructive ml-0.5">*</span>}
          </span>
          {question.description && (
            <HelpPopover description={question.description} />
          )}
        </div>
        
        {/* Input field */}
        <div className="sm:w-1/2">
          {renderInput()}
        </div>
      </div>
    </div>
  );
}
