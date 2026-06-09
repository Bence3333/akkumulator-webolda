import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Beneficiary {
  id: string;
  name: string;
  birthPlace: string;
  birthDate: string;
  motherName: string;
}

interface SectionConfig {
  title: string;
  description: string;
  countLabel: string;
  questionLabel: string;
}

interface BeneficiariesSectionProps {
  hasBeneficiaries: boolean | null;
  onHasBeneficiariesChange: (value: boolean | null) => void;
  beneficiaries: Beneficiary[];
  onBeneficiariesChange: (beneficiaries: Beneficiary[]) => void;
  isAdmin?: boolean;
  invalidIndices?: Set<number>;
}

export type { Beneficiary };

export default function BeneficiariesSection({
  hasBeneficiaries,
  onHasBeneficiariesChange,
  beneficiaries,
  onBeneficiariesChange,
  isAdmin = false,
  invalidIndices = new Set(),
}: BeneficiariesSectionProps) {
  const [beneficiaryCount, setBeneficiaryCount] = useState<string>("1");
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState<SectionConfig>({
    title: "Haszonélvezeti jog",
    questionLabel: "A beruházással érintett ingatlan haszonélvezeti joggal terhelt:",
    countLabel: "Haszonélvezők száma:",
    description: "A beruházással érintett ingatlan haszonélvezőinek adatai:",
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
        .eq("section_key", "beneficiaries")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        const newConfig = {
          title: data.title || config.title,
          description: data.description || config.description,
          countLabel: data.count_label || config.countLabel,
          questionLabel: data.question_label || config.questionLabel,
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
      const { error } = await supabase
        .from("survey_section_config")
        .update({
          title: editConfig.title,
          description: editConfig.description,
          count_label: editConfig.countLabel,
          question_label: editConfig.questionLabel,
        })
        .eq("section_key", "beneficiaries");
      
      if (error) throw error;
      
      setConfig(editConfig);
      setIsEditing(false);
      toast.success("Szekció beállítások mentve");
    } catch (error) {
      console.error("Error saving section config:", error);
      toast.error("Hiba történt a mentéskor");
    }
  };

  const handleLockCount = () => {
    const count = parseInt(beneficiaryCount) || 0;
    if (count < 1) return;

    const newBeneficiaries: Beneficiary[] = [];
    for (let i = 0; i < count; i++) {
      if (beneficiaries[i]) {
        newBeneficiaries.push(beneficiaries[i]);
      } else {
        newBeneficiaries.push({
          id: crypto.randomUUID(),
          name: "",
          birthPlace: "",
          birthDate: "",
          motherName: "",
        });
      }
    }
    onBeneficiariesChange(newBeneficiaries);
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string) => {
    const updated = [...beneficiaries];
    updated[index] = { ...updated[index], [field]: value };
    onBeneficiariesChange(updated);
  };

  const removeBeneficiary = (index: number) => {
    const updated = beneficiaries.filter((_, i) => i !== index);
    onBeneficiariesChange(updated);
    setBeneficiaryCount(String(updated.length));
  };

  const addBeneficiary = () => {
    const newBeneficiary: Beneficiary = {
      id: crypto.randomUUID(),
      name: "",
      birthPlace: "",
      birthDate: "",
      motherName: "",
    };
    onBeneficiariesChange([...beneficiaries, newBeneficiary]);
    setBeneficiaryCount(String(beneficiaries.length + 1));
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
            <Label>Kérdés szövege:</Label>
            <Input
              value={editConfig.questionLabel}
              onChange={(e) => setEditConfig({ ...editConfig, questionLabel: e.target.value })}
              placeholder="Kérdés szövege"
            />
          </div>
          <div>
            <Label>Számlálómező címkéje:</Label>
            <Input
              value={editConfig.countLabel}
              onChange={(e) => setEditConfig({ ...editConfig, countLabel: e.target.value })}
              placeholder="Számlálómező címkéje"
            />
          </div>
          <div>
            <Label>Leírás szöveg:</Label>
            <Textarea
              value={editConfig.description}
              onChange={(e) => setEditConfig({ ...editConfig, description: e.target.value })}
              placeholder="Leírás szöveg"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveConfig}>
              <Check className="h-4 w-4 mr-1" /> Mentés
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setEditConfig(config); setIsEditing(false); }}>
              <X className="h-4 w-4 mr-1" /> Mégse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="beneficiaries-section" className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">
          {config.title}
        </h2>
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
        {/* Has beneficiaries question */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 sm:w-1/2">
            <Label className="text-sm">{config.questionLabel}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Van-e haszonélvező az ingatlanon?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="sm:w-1/2">
            <Select
              value={hasBeneficiaries === null ? "" : hasBeneficiaries ? "yes" : "no"}
              onValueChange={(value) => {
                if (value === "yes") {
                  onHasBeneficiariesChange(true);
                } else if (value === "no") {
                  onHasBeneficiariesChange(false);
                  onBeneficiariesChange([]);
                } else {
                  onHasBeneficiariesChange(null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Válasszon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Igen</SelectItem>
                <SelectItem value="no">Nem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Show count input and beneficiary forms only if "Igen" selected */}
        {hasBeneficiaries === true && (
          <>
            {/* Beneficiary count input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-1.5 sm:w-1/2">
                <Label className="text-sm">{config.countLabel}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adja meg a haszonélvezők számát, majd kattintson a Rögzítés gombra</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 sm:w-1/2">
                <Input
                  type="number"
                  min="1"
                  value={beneficiaryCount}
                  onChange={(e) => setBeneficiaryCount(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">db</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleLockCount}
                  className="bg-primary/80 hover:bg-primary text-primary-foreground"
                >
                  Rögzítés
                </Button>
              </div>
            </div>

            {/* Beneficiaries list */}
            {beneficiaries.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>

                {/* Table header */}
                <div className="hidden md:grid md:grid-cols-[60px_1fr_40px] gap-2 px-2 py-2 bg-muted/50 rounded-t-lg border border-border text-xs font-medium text-muted-foreground">
                  <div className="text-center">Sorszám</div>
                  <div className="text-center">
                    <div>Haszonélvező adatai</div>
                    <div className="font-normal">Név, Születési hely, Születési dátum, Anyja neve</div>
                  </div>
                  <div></div>
                </div>

                {/* Beneficiary rows */}
                <div className="space-y-3">
                  {beneficiaries.map((beneficiary, index) => (
                    <div
                      key={beneficiary.id}
                      className={`border rounded-lg p-3 bg-background ${invalidIndices.has(index) ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Row number */}
                        <div className="w-8 text-center font-medium text-muted-foreground pt-2">
                          {index + 1}.
                        </div>

                        {/* Beneficiary fields */}
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Haszonélvező neve"
                            value={beneficiary.name}
                            onChange={(e) => updateBeneficiary(index, "name", e.target.value)}
                          />
                          <Input
                            placeholder="Haszonélvező születési helye"
                            value={beneficiary.birthPlace}
                            onChange={(e) => updateBeneficiary(index, "birthPlace", e.target.value)}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              type="date"
                              placeholder="Születési dátum"
                              value={beneficiary.birthDate}
                              onChange={(e) => updateBeneficiary(index, "birthDate", e.target.value)}
                            />
                            <Input
                              placeholder="Haszonélvező anyja neve"
                              value={beneficiary.motherName}
                              onChange={(e) => updateBeneficiary(index, "motherName", e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Delete button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeBeneficiary(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBeneficiary}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  További haszonélvező hozzáadása
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
