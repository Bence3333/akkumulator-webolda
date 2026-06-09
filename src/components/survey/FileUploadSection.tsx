import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, Image, File, Edit2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface SectionConfig {
  title: string;
  description: string;
  highlighted_description: string;
}

interface FileUploadSectionProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  isAdmin?: boolean;
}

export type { UploadedFile };

export default function FileUploadSection({
  uploadedFiles,
  onFilesChange,
  isAdmin = false,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState<SectionConfig>({
    title: "Fájl feltöltés",
    description: "Kérjük, JPG/JPEG (fénykép) vagy PDF formátumban töltse fel az alábbi dokumentumokat.",
    highlighted_description: "Amennyiben fényképezővel vagy telefonnal készíti el a digitális változatot, kérjük, ellenőrizze, hogy minden oldal jól olvasható legyen.",
  });
  const [editConfig, setEditConfig] = useState<SectionConfig>(config);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_section_config")
        .select("*")
        .eq("section_key", "file_upload")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const newConfig = {
          title: data.title || config.title,
          description: data.description || config.description,
          highlighted_description: (data as any).highlighted_description || config.highlighted_description,
        };
        setConfig(newConfig);
        setEditConfig(newConfig);
      }
    } catch (error) {
      console.error("Error fetching section config:", error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      // Try to update first
      const { data: existingData } = await supabase
        .from("survey_section_config")
        .select("id")
        .eq("section_key", "file_upload")
        .single();

      if (existingData) {
        const { error } = await supabase
          .from("survey_section_config")
          .update({
            title: editConfig.title,
            description: editConfig.description,
            highlighted_description: editConfig.highlighted_description,
          } as any)
          .eq("section_key", "file_upload");

        if (error) throw error;
      } else {
        // Insert if doesn't exist
        const { error } = await supabase.from("survey_section_config").insert({
          section_key: "file_upload",
          title: editConfig.title,
          description: editConfig.description,
          highlighted_description: editConfig.highlighted_description,
        } as any);

        if (error) throw error;
      }

      setConfig(editConfig);
      setIsEditing(false);
      toast.success("Szekció beállítások mentve");
    } catch (error) {
      console.error("Error saving section config:", error);
      toast.error("Hiba történt a mentéskor");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `survey/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("survey-attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("survey-attachments")
          .getPublicUrl(filePath);

        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
        });
      }

      onFilesChange([...uploadedFiles, ...newFiles]);
      toast.success(`${files.length} fájl sikeresen feltöltve`);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Hiba történt a fájl feltöltésekor");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (fileId: string) => {
    onFilesChange(uploadedFiles.filter((f) => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-primary" />;
    } else if (type.includes("pdf")) {
      return <FileText className="h-5 w-5 text-destructive" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  if (isEditing) {
    return (
      <div className="bg-card rounded-xl shadow-lg border border-dashed border-primary/50 overflow-hidden">
        <div className="bg-primary/10 border-b border-border px-4 py-3">
          <h2 className="font-semibold text-foreground">Szekció szerkesztése</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <Label>Szekció címe:</Label>
            <Input
              value={editConfig.title}
              onChange={(e) => setEditConfig({ ...editConfig, title: e.target.value })}
              placeholder="Szekció címe"
            />
          </div>
          <div>
            <Label>Leírás szöveg:</Label>
            <Textarea
              value={editConfig.description}
              onChange={(e) => setEditConfig({ ...editConfig, description: e.target.value })}
              placeholder="Leírás szöveg"
              rows={3}
            />
          </div>
          <div>
            <Label>Kiemelt leírás (félkövér):</Label>
            <Textarea
              value={editConfig.highlighted_description}
              onChange={(e) => setEditConfig({ ...editConfig, highlighted_description: e.target.value })}
              placeholder="Kiemelt leírás szöveg"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveConfig}>
              <Check className="h-4 w-4 mr-1" /> Mentés
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditConfig(config);
                setIsEditing(false);
              }}
            >
              <X className="h-4 w-4 mr-1" /> Mégse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{config.title}</h2>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground whitespace-pre-line">{config.description}</p>
        {config.highlighted_description && (
          <p className="text-sm font-semibold text-foreground whitespace-pre-line">{config.highlighted_description}</p>
        )}

        {/* Upload area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            Kattintson a fájlok feltöltéséhez
          </p>
          <p className="text-xs text-muted-foreground">
            Támogatott formátumok: képek, PDF, Word, Excel
          </p>
        </div>

        {isUploading && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Feltöltés...</span>
          </div>
        )}

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Feltöltött fájlok:</Label>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(file.type)}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground hover:text-primary truncate"
                    >
                      {file.name}
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
