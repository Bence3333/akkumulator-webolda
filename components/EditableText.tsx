import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useEditableContent } from "@/contexts/EditableContentContext";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EditableTextProps {
  initialText: string;
  storageKey: string;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
  multiline?: boolean;
}

const EditableText = ({ 
  initialText, 
  storageKey, 
  className = "", 
  as: Component = "span",
  multiline = false 
}: EditableTextProps) => {
  const { isAdmin } = useAdmin();
  const { content, isLoading, updateContent } = useEditableContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");

  // Get text from context, fallback to initialText if not found
  const text = content[storageKey] ?? (isLoading ? "" : initialText);

  const handleStartEdit = () => {
    setEditingText(text || initialText);
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateContent(storageKey, editingText);
  };

  if (isLoading) {
    return <Skeleton className={`${className} inline-block min-w-[100px] min-h-[1em]`} />;
  }

  if (!isAdmin) {
    // If text is empty, show nothing for non-admin users
    if (!text.trim()) {
      return null;
    }
    return <Component className={className}>{text}</Component>;
  }

  // Admin mode: if text is empty, show a clickable span to add text
  if (!text.trim() && !isEditing) {
    return (
      <span
        onClick={handleStartEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleStartEdit()}
        className={`${className} inline-flex items-center gap-1 text-primary hover:text-primary/80 cursor-pointer bg-primary/10 rounded px-2 py-1`}
        title="Kattints szöveg hozzáadásához"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Szöveg hozzáadása</span>
      </span>
    );
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className={`${className} bg-primary/10 border border-primary rounded p-2 min-h-[100px] w-full resize-y`}
        />
      );
    }
    return (
      <input
        type="text"
        value={editingText}
        onChange={(e) => setEditingText(e.target.value)}
        onBlur={handleBlur}
        autoFocus
        className={`${className} bg-primary/10 border border-primary rounded px-2 py-1`}
      />
    );
  }

  return (
    <Component 
      className={`${className} cursor-pointer hover:bg-primary/20 rounded transition-colors ring-2 ring-primary/30`}
      onClick={handleStartEdit}
      title="Kattints a szerkesztéshez"
    >
      {text}
    </Component>
  );
};

export default EditableText;
