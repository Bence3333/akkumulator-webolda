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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Owner {
  id: string;
  name: string;
  birthPlace: string;
  birthDate: string;
  motherName: string;
  ownershipShareNumerator: string;
  ownershipShareDenominator: string;
}

interface SectionConfig {
  title: string;
  description: string;
  countLabel: string;
}

interface PropertyOwnersSectionProps {
  owners: Owner[];
  onOwnersChange: (owners: Owner[]) => void;
  isAdmin?: boolean;
  invalidIndices?: Set<number>;
}

export type { Owner };

export default function PropertyOwnersSection({ owners, onOwnersChange, isAdmin = false, invalidIndices = new Set() }: PropertyOwnersSectionProps) {
  const [ownerCount, setOwnerCount] = useState<string>("1");
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState<SectionConfig>({
    title: "Beruházással érintett ingatlan tulajdonviszonyai",
    description: "A pályázó személyén kívül, további tulajdonosok adatai:",
    countLabel: "További tulajdonosok száma:",
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
        .eq("section_key", "property_owners")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        const newConfig = {
          title: data.title || config.title,
          description: data.description || config.description,
          countLabel: data.count_label || config.countLabel,
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
        })
        .eq("section_key", "property_owners");
      
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
    const count = parseInt(ownerCount) || 0;
    if (count < 1) return;
    
    const newOwners: Owner[] = [];
    for (let i = 0; i < count; i++) {
      if (owners[i]) {
        newOwners.push(owners[i]);
      } else {
        newOwners.push({
          id: crypto.randomUUID(),
          name: "",
          birthPlace: "",
          birthDate: "",
          motherName: "",
          ownershipShareNumerator: "",
          ownershipShareDenominator: "",
        });
      }
    }
    onOwnersChange(newOwners);
  };

  const updateOwner = (index: number, field: keyof Owner, value: string) => {
    const updated = [...owners];
    updated[index] = { ...updated[index], [field]: value };
    onOwnersChange(updated);
  };

  const removeOwner = (index: number) => {
    const updated = owners.filter((_, i) => i !== index);
    onOwnersChange(updated);
    setOwnerCount(String(updated.length));
  };

  const addOwner = () => {
    const newOwner: Owner = {
      id: crypto.randomUUID(),
      name: "",
      birthPlace: "",
      birthDate: "",
      motherName: "",
      ownershipShareNumerator: "",
      ownershipShareDenominator: "",
    };
    onOwnersChange([...owners, newOwner]);
    setOwnerCount(String(owners.length + 1));
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
    <div id="property-owners-section" className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
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
        {/* Owner count input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 sm:w-1/2">
            <Label className="text-sm">{config.countLabel}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adja meg a tulajdonosok számát, majd kattintson a Rögzítés gombra</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 sm:w-1/2">
            <Input
              type="number"
              min="0"
              value={ownerCount}
              onChange={(e) => setOwnerCount(e.target.value)}
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

        {/* Owners table */}
        {owners.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
            
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[60px_1fr_120px_40px] gap-2 px-2 py-2 bg-muted/50 rounded-t-lg border border-border text-xs font-medium text-muted-foreground">
              <div className="text-center">Sorszám</div>
              <div className="text-center">
                <div>Tulajdonos adatai</div>
                <div className="font-normal">Név, Születési hely, Születési dátum, Anyja neve</div>
              </div>
              <div className="text-center">
                <div>Tulajdoni hányad</div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 inline ml-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pl.: 1/2, 1/4, stb.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div></div>
            </div>

            {/* Owner rows */}
            <div className="space-y-3">
              {owners.map((owner, index) => (
                <div
                  key={owner.id}
                  className={`border rounded-lg p-3 bg-background ${invalidIndices.has(index) ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`}
                >
                  <div className="flex items-start gap-2">
                    {/* Row number */}
                    <div className="w-8 text-center font-medium text-muted-foreground pt-2">
                      {index + 1}.
                    </div>

                    {/* Owner fields */}
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          placeholder="Tulajdonos neve"
                          value={owner.name}
                          onChange={(e) => updateOwner(index, "name", e.target.value)}
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="1"
                            placeholder="pl. 1"
                            value={owner.ownershipShareNumerator}
                            onChange={(e) => updateOwner(index, "ownershipShareNumerator", e.target.value)}
                            className="w-20 text-center"
                          />
                          <span className="text-lg font-medium text-muted-foreground">/</span>
                          <Input
                            type="number"
                            min="1"
                            placeholder="pl. 2"
                            value={owner.ownershipShareDenominator}
                            onChange={(e) => updateOwner(index, "ownershipShareDenominator", e.target.value)}
                            className="w-20 text-center"
                          />
                          <span className="text-xs text-muted-foreground ml-1">hányad</span>
                        </div>
                      </div>
                      <Input
                        placeholder="Tulajdonos születési helye"
                        value={owner.birthPlace}
                        onChange={(e) => updateOwner(index, "birthPlace", e.target.value)}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="Születési dátum"
                          value={owner.birthDate}
                          onChange={(e) => updateOwner(index, "birthDate", e.target.value)}
                        />
                        <Input
                          placeholder="Tulajdonos anyja neve"
                          value={owner.motherName}
                          onChange={(e) => updateOwner(index, "motherName", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Delete button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeOwner(index)}
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
              onClick={addOwner}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              További tulajdonos hozzáadása
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
