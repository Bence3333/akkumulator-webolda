import { useState, useEffect, useRef } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadableIconProps {
  storageKey: string;
  defaultIcon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const UploadableIcon = ({ 
  storageKey, 
  defaultIcon, 
  className = "w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center",
  iconClassName = "w-7 h-7 text-primary-foreground"
}: UploadableIconProps) => {
  const { isAdmin } = useAdmin();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadIcon();
  }, [storageKey]);

  const loadIcon = async () => {
    try {
      // Check if custom icon exists in storage
      const { data } = supabase.storage
        .from('custom-icons')
        .getPublicUrl(`${storageKey}.png`);

      // Verify the image exists by checking the URL
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (response.ok) {
        setImageUrl(data.publicUrl + `?t=${Date.now()}`);
      }
    } catch (err) {
      console.error('Error loading icon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Csak képfájl tölthető fel");
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('custom-icons')
        .upload(`${storageKey}.png`, file, { 
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('custom-icons')
        .getPublicUrl(`${storageKey}.png`);

      setImageUrl(data.publicUrl + `?t=${Date.now()}`);
      toast.success("Ikon feltöltve");
    } catch (err) {
      console.error('Error uploading icon:', err);
      toast.error("Hiba történt a feltöltés során");
    }
  };

  const handleDelete = async () => {
    try {
      await supabase.storage
        .from('custom-icons')
        .remove([`${storageKey}.png`]);
      
      setImageUrl(null);
      toast.success("Ikon törölve, alapértelmezett visszaállítva");
    } catch (err) {
      console.error('Error deleting icon:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        {defaultIcon}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={className}>
        {imageUrl ? (
          <img src={imageUrl} alt="Icon" className={`${iconClassName} object-contain`} />
        ) : (
          defaultIcon
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <div 
        className={`${className} cursor-pointer ring-2 ring-primary/30 hover:ring-primary transition-all`}
        onClick={() => fileInputRef.current?.click()}
        title="Kattints az ikon módosításához"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Icon" className={`${iconClassName} object-contain`} />
        ) : (
          defaultIcon
        )}
      </div>
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shadow-lg"
          title="Feltöltés"
        >
          <Upload className="w-3 h-3" />
        </button>
        {imageUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs shadow-lg"
            title="Törlés"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadableIcon;
