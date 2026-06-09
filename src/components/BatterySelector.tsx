import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Upload, X, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BatteryOption {
  id: string;
  package_id: string;
  name: string;
  price_modifier: string;
  original_price_modifier: string | null;
  image_url: string | null;
  sort_order: number;
}

interface BatterySelectorProps {
  packageId: string;
  basePrice: string;
  baseOriginalPrice: string;
  baseImageUrl: string | null;
  isAdmin: boolean;
  onSelectionChange: (option: BatteryOption | null, newPrice: string, newOriginalPrice: string, newImageUrl: string | null) => void;
}

const BatterySelector = ({ 
  packageId, 
  basePrice, 
  baseOriginalPrice, 
  baseImageUrl,
  isAdmin, 
  onSelectionChange 
}: BatterySelectorProps) => {
  const [options, setOptions] = useState<BatteryOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  const [newOption, setNewOption] = useState({
    name: "",
    price_modifier: "",
    original_price_modifier: "",
    image_url: null as string | null
  });

  useEffect(() => {
    fetchOptions();
  }, [packageId]);

  // Auto-select first option when options are loaded
  useEffect(() => {
    if (options.length > 0 && selectedOptionId === null) {
      const firstOption = options[0];
      handleSelect(firstOption);
    }
  }, [options]);

  const fetchOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('package_battery_options')
        .select('*')
        .eq('package_id', packageId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setOptions(data || []);
    } catch (error) {
      console.error('Error fetching battery options:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (base: string, modifier: string): string => {
    const parsePrice = (p: string) => {
      const cleaned = p.replace(/[^\d]/g, '');
      return parseInt(cleaned) || 0;
    };
    
    const formatPrice = (n: number) => {
      return n.toLocaleString('hu-HU').replace(/\s/g, '.') + ' Ft';
    };
    
    const baseValue = parsePrice(base);
    const modValue = parsePrice(modifier);
    return formatPrice(baseValue + modValue);
  };

  const handleSelect = (option: BatteryOption | null) => {
    setSelectedOptionId(option?.id || null);
    
    if (option) {
      const newPrice = calculatePrice(basePrice, option.price_modifier);
      // If original_price_modifier is set and looks like a full price (contains digits and spaces/dots),
      // use it directly as the original price, otherwise add it to the base
      let newOriginalPrice = baseOriginalPrice;
      if (option.original_price_modifier) {
        const modifier = option.original_price_modifier.trim();
        // Check if it starts with + or - (modifier to add) or is a full price value
        if (modifier.startsWith('+') || modifier.startsWith('-')) {
          // It's a modifier, calculate the new price
          newOriginalPrice = calculatePrice(baseOriginalPrice, modifier);
        } else {
          // It's a full price value, use it directly
          newOriginalPrice = modifier;
        }
      }
      onSelectionChange(option, newPrice, newOriginalPrice, option.image_url || baseImageUrl);
    } else {
      onSelectionChange(null, basePrice, baseOriginalPrice, baseImageUrl);
    }
  };

  const compressImage = async (file: File, maxWidth = 400, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to compress')),
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (optionId: string, file: File) => {
    setUploadingId(optionId);
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `battery-${optionId}-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('package-images')
        .upload(fileName, compressedBlob, { upsert: true, contentType: 'image/jpeg' });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('package-images')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('package_battery_options')
        .update({ image_url: publicUrl })
        .eq('id', optionId);
      
      if (updateError) throw updateError;
      
      setOptions(options.map(opt => 
        opt.id === optionId ? { ...opt, image_url: publicUrl } : opt
      ));
      toast.success('Kép feltöltve');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Hiba a kép feltöltésekor');
    } finally {
      setUploadingId(null);
    }
  };

  const saveOption = async (id: string) => {
    setSaving(true);
    const opt = options.find(o => o.id === id);
    if (!opt) return;
    
    try {
      const { error } = await supabase
        .from('package_battery_options')
        .update({
          name: opt.name,
          price_modifier: opt.price_modifier,
          original_price_modifier: opt.original_price_modifier,
          sort_order: opt.sort_order
        })
        .eq('id', id);
      
      if (error) throw error;
      setEditingId(null);
      toast.success('Akkumulátor opció mentve');
    } catch (error) {
      console.error('Error saving option:', error);
      toast.error('Hiba a mentéskor');
    } finally {
      setSaving(false);
    }
  };

  const addOption = async () => {
    if (!newOption.name.trim()) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('package_battery_options')
        .insert({
          package_id: packageId,
          name: newOption.name.trim(),
          price_modifier: newOption.price_modifier.trim() || '0 Ft',
          original_price_modifier: newOption.original_price_modifier.trim() || null,
          image_url: newOption.image_url,
          sort_order: options.length
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setOptions([...options, data]);
      setNewOption({ name: "", price_modifier: "", original_price_modifier: "", image_url: null });
      setIsAdding(false);
      toast.success('Akkumulátor opció hozzáadva');
    } catch (error) {
      console.error('Error adding option:', error);
      toast.error('Hiba a hozzáadáskor');
    } finally {
      setSaving(false);
    }
  };

  const deleteOption = async (id: string) => {
    try {
      const { error } = await supabase
        .from('package_battery_options')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setOptions(options.filter(o => o.id !== id));
      if (selectedOptionId === id) {
        handleSelect(null);
      }
      toast.success('Akkumulátor opció törölve');
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('Hiba a törléskor');
    }
  };

  const updateOption = (id: string, field: keyof BatteryOption, value: any) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  if (loading) {
    return <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;
  }

  if (options.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Akkumulátor méret:</p>
      
      <div className="flex flex-wrap gap-2">
        
        {options.map((option) => (
          <div key={option.id} className="relative group">
            {editingId === option.id ? (
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-2">
                <input
                  value={option.name}
                  onChange={(e) => updateOption(option.id, 'name', e.target.value)}
                  className="w-20 bg-muted/50 border border-border rounded px-2 py-1 text-xs"
                  placeholder="Név"
                />
                <input
                  value={option.price_modifier}
                  onChange={(e) => updateOption(option.id, 'price_modifier', e.target.value)}
                  className="w-24 bg-muted/50 border border-border rounded px-2 py-1 text-xs"
                  placeholder="+ár"
                />
                <button
                  onClick={() => saveOption(option.id)}
                  className="p-1 bg-primary text-primary-foreground rounded"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 bg-muted rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                  selectedOptionId === option.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <span className="font-semibold">{option.name}</span>
                {option.price_modifier && option.price_modifier !== '0 Ft' && (
                  <span className={`text-[11px] font-bold ${
                    selectedOptionId === option.id 
                      ? 'text-primary-foreground' 
                      : 'text-primary'
                  }`}>
                    +{option.price_modifier}
                  </span>
                )}
              </button>
            )}
            
            {isAdmin && editingId !== option.id && (
              <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (ev) => {
                      const file = (ev.target as HTMLInputElement).files?.[0];
                      if (file) handleImageUpload(option.id, file);
                    };
                    input.click();
                  }}
                  className="p-1 bg-card border border-border rounded-full hover:bg-muted"
                >
                  {uploadingId === option.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Upload className="w-2.5 h-2.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingId(option.id); }}
                  className="p-1 bg-card border border-border rounded-full hover:bg-muted"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteOption(option.id); }}
                  className="p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {/* Add new option - admin only */}
        {isAdmin && (
          isAdding ? (
            <div className="flex items-center gap-1 bg-card border border-primary/30 rounded-lg p-2">
              <input
                value={newOption.name}
                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                className="w-20 bg-muted/50 border border-border rounded px-2 py-1 text-xs"
                placeholder="Név (pl: 15kWh)"
                autoFocus
              />
              <input
                value={newOption.price_modifier}
                onChange={(e) => setNewOption({ ...newOption, price_modifier: e.target.value })}
                className="w-24 bg-muted/50 border border-border rounded px-2 py-1 text-xs"
                placeholder="+ár (pl: 200.000 Ft)"
              />
              <button
                onClick={addOption}
                className="p-1 bg-primary text-primary-foreground rounded"
                disabled={saving || !newOption.name.trim()}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewOption({ name: "", price_modifier: "", original_price_modifier: "", image_url: null });
                }}
                className="p-1 bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-2 rounded-lg text-xs font-medium border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Akksi opció
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default BatterySelector;
