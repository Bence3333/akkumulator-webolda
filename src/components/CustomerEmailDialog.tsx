import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, X, FileText, Loader2 } from "lucide-react";

interface CustomerEmailDialogProps {
  open: boolean;
  onClose: () => void;
  customerName: string;
  customerEmail: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "quote_reminder",
    name: "Árajánlat emlékeztető",
    subject: "Emlékeztető - Napelemes árajánlat",
    body: `Kedves {customerName}!

Reméljük, jól van! Szeretnénk érdeklődni, hogy volt-e lehetősége áttekinteni a napelemes rendszerre küldött árajánlatunkat.

Tudjuk, hogy ez egy fontos döntés, ezért szívesen válaszolunk bármilyen kérdésére, vagy ha szeretné, személyesen is átbeszélhetjük a részleteket.

Amennyiben már döntött, kérjük, jelezze felénk, hogy tudjuk a következő lépéseket megtenni.

Üdvözlettel,
Spark Solar csapat`,
  },
  {
    id: "survey_schedule",
    name: "Felmérés időpont egyeztetés",
    subject: "Helyszíni felmérés időpont egyeztetése",
    body: `Kedves {customerName}!

Köszönjük, hogy az árajánlatunkat elfogadta! A következő lépés a helyszíni felmérés, amelynek során pontosítjuk a telepítés részleteit.

Kérjük, jelezze, hogy az alábbi időpontok közül melyik lenne Önnek megfelelő:
- [Dátum 1]
- [Dátum 2]
- [Dátum 3]

Ha egyik sem megfelelő, kérjük, javasoljon Önnek alkalmas időpontokat!

Üdvözlettel,
Spark Solar csapat`,
  },
  {
    id: "installation_info",
    name: "Telepítési információk",
    subject: "Telepítési információk - Napelemes rendszer",
    body: `Kedves {customerName}!

A telepítés dátuma közeleg, ezért szeretnénk néhány fontos információt megosztani Önnel:

1. A telepítés időtartama várhatóan 1-2 munkanap
2. Kérjük, biztosítson hozzáférést a tetőhöz és az elektromos rendszerhez
3. A telepítés alatt az áramellátás rövid időre megszűnhet

Ha bármilyen kérdése van a telepítéssel kapcsolatban, kérjük, vegye fel velünk a kapcsolatot!

Üdvözlettel,
Spark Solar csapat`,
  },
  {
    id: "thank_you",
    name: "Köszönő levél",
    subject: "Köszönjük a bizalmat!",
    body: `Kedves {customerName}!

Ezúton szeretnénk megköszönni, hogy a Spark Solar csapatát választotta napelemes rendszerének telepítéséhez.

Reméljük, hogy elégedett a munkánkkal! Ha bármilyen kérdése vagy észrevétele van, kérjük, ne habozzon felvenni velünk a kapcsolatot.

Kérjük, ha elégedett volt szolgáltatásunkkal, ajánljon minket ismerőseinek is!

Üdvözlettel,
Spark Solar csapat`,
  },
  {
    id: "custom",
    name: "Egyedi üzenet",
    subject: "",
    body: "",
  },
];

const CustomerEmailDialog = ({
  open,
  onClose,
  customerName,
  customerEmail,
}: CustomerEmailDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body.replace(/{customerName}/g, customerName.split(' ')[0]));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Hiba",
        description: "A tárgy és az üzenet mező kitöltése kötelező",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Convert attachments to base64
      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };
            reader.readAsDataURL(file);
          });
          return {
            filename: file.name,
            content: base64,
          };
        })
      );

      const { error } = await supabase.functions.invoke('send-customer-email', {
        body: {
          to: customerEmail,
          subject,
          body,
          attachments: attachmentData,
        },
      });

      if (error) throw error;

      toast({
        title: "Sikeres",
        description: "Az email elküldve",
      });
      
      // Reset form
      setSelectedTemplate("custom");
      setSubject("");
      setBody("");
      setAttachments([]);
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Hiba",
        description: "Nem sikerült elküldeni az emailt",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Email küldése - {customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Címzett</Label>
            <p className="font-medium">{customerEmail}</p>
          </div>

          <div className="space-y-2">
            <Label>Sablon</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Válasszon sablont..." />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tárgy</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email tárgya..."
            />
          </div>

          <div className="space-y-2">
            <Label>Üzenet</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email szövege..."
              rows={12}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Csatolmányok</Label>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-2 py-1 px-2"
                >
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Csatolás
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Mégse
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Küldés...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Küldés
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEmailDialog;
