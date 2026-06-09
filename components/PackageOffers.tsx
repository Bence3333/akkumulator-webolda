import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Upload, X, Check, Loader2, Phone } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CallbackModal from "./CallbackModal";
import PackageSelectModal from "./PackageSelectModal";
import BatterySelector from "./BatterySelector";
interface Package {
  id: string;
  title: string;
  description: string | null;
  price: string;
  original_price: string;
  features: string[];
  image_url: string | null;
  highlighted: boolean;
  sort_order: number;
  brand: string;
  subcategory: string;
  package_code: string | null;
}

interface PackageBrand {
  id: string;
  name: string;
  display_name: string;
  sort_order: number;
}

interface PackageSubcategory {
  id: string;
  name: string;
  display_name: string;
  sort_order: number;
}

const PackageOffers = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { isAdmin } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [brands, setBrands] = useState<PackageBrand[]>([]);
  const [subcategories, setSubcategories] = useState<PackageSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  
  // Package select modal state
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  // Battery selection state - tracks modified prices/images per package
  const [packageBatteryState, setPackageBatteryState] = useState<Record<string, {
    selectedBatteryName: string | null;
    displayPrice: string;
    displayOriginalPrice: string;
    displayImageUrl: string | null;
  }>>({});
  
  // Brand editing state
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandDisplayName, setNewBrandDisplayName] = useState("");
  
  // Subcategory editing state
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: "",
    original_price: "",
    features: [""],
    image_url: null as string | null,
    highlighted: false,
    brand: "",
    subcategory: "akksi1",
    package_code: ""
  });

  const activeBrand = brands[activeBrandIndex];
  const filteredPackages = packages.filter(pkg => 
    activeBrand ? pkg.brand === activeBrand.name : true
  );

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const [packagesRes, brandsRes, subcategoriesRes] = await Promise.all([
        supabase.from('packages').select('*').order('sort_order', { ascending: true }),
        supabase.from('package_brands').select('*').order('sort_order', { ascending: true }),
        supabase.from('package_subcategories').select('*').order('sort_order', { ascending: true })
      ]);
      
      if (packagesRes.error) throw packagesRes.error;
      if (brandsRes.error) throw brandsRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;
      
      setPackages(packagesRes.data || []);
      setBrands(brandsRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Hiba az adatok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (file: File, maxWidth = 800, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        let { width, height } = img;
        
        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image'));
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id);
    
    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file, 800, 0.85);
      const fileName = `${id}-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('package-images')
        .upload(fileName, compressedBlob, { 
          upsert: true,
          contentType: 'image/jpeg'
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('package-images')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('packages')
        .update({ image_url: publicUrl })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setPackages(packages.map(pkg => 
        pkg.id === id ? { ...pkg, image_url: publicUrl } : pkg
      ));
      
      toast.success('Kép feltöltve');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Hiba a kép feltöltésekor');
    } finally {
      setUploadingId(null);
    }
  };

  const handleNewImageUpload = async (file: File) => {
    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file, 800, 0.85);
      const fileName = `temp-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('package-images')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg'
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('package-images')
        .getPublicUrl(fileName);
      
      setNewPackage({ ...newPackage, image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Hiba a kép feltöltésekor');
    }
  };

  const updatePackage = async (id: string, field: keyof Package, value: any) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { ...pkg, [field]: value } : pkg
    ));
  };

  const savePackage = async (id: string) => {
    setSaving(true);
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    
    try {
      const { error } = await supabase
        .from('packages')
        .update({
          title: pkg.title,
          description: pkg.description,
          price: pkg.price,
          original_price: pkg.original_price,
          features: pkg.features,
          highlighted: pkg.highlighted,
          package_code: pkg.package_code,
          sort_order: pkg.sort_order,
          subcategory: pkg.subcategory
        })
        .eq('id', id);
      
      if (error) throw error;
      setEditingId(null);
      // Re-fetch to get correct order
      await fetchData();
      toast.success('Csomag mentve');
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error('Hiba a csomag mentésekor');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = (id: string) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { ...pkg, features: [...pkg.features, "Új funkció"] } : pkg
    ));
  };

  const updateFeature = (id: string, featureIndex: number, value: string) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { 
        ...pkg, 
        features: pkg.features.map((f, i) => i === featureIndex ? value : f) 
      } : pkg
    ));
  };

  const removeFeature = (id: string, featureIndex: number) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { 
        ...pkg, 
        features: pkg.features.filter((_, i) => i !== featureIndex) 
      } : pkg
    ));
  };

  const addPackage = async () => {
    if (!newPackage.title.trim() || !activeBrand) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert({
          title: newPackage.title.trim(),
          description: newPackage.description.trim() || null,
          price: newPackage.price.trim(),
          original_price: newPackage.original_price.trim(),
          features: newPackage.features.filter(f => f.trim()),
          image_url: newPackage.image_url,
          highlighted: newPackage.highlighted,
          sort_order: packages.length + 1,
          brand: activeBrand.name,
          subcategory: newPackage.subcategory,
          package_code: newPackage.package_code.trim() || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setPackages([...packages, data]);
      setNewPackage({
        title: "",
        description: "",
        price: "",
        original_price: "",
        features: [""],
        image_url: null,
        highlighted: false,
        brand: activeBrand.name,
        subcategory: "akksi1",
        package_code: ""
      });
      setIsAdding(false);
      toast.success('Csomag hozzáadva');
    } catch (error) {
      console.error('Error adding package:', error);
      toast.error('Hiba a csomag hozzáadásakor');
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPackages(packages.filter(pkg => pkg.id !== id));
      toast.success('Csomag törölve');
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Hiba a csomag törlésekor');
    }
  };

  // Brand management functions
  const saveBrand = async (id: string, displayName: string) => {
    try {
      const { error } = await supabase
        .from('package_brands')
        .update({ display_name: displayName })
        .eq('id', id);
      
      if (error) throw error;
      
      setBrands(brands.map(b => b.id === id ? { ...b, display_name: displayName } : b));
      setEditingBrandId(null);
      toast.success('Márka mentve');
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Hiba a márka mentésekor');
    }
  };

  const addBrand = async () => {
    if (!newBrandName.trim() || !newBrandDisplayName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('package_brands')
        .insert({
          name: newBrandName.trim().toLowerCase(),
          display_name: newBrandDisplayName.trim(),
          sort_order: brands.length + 1
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setBrands([...brands, data]);
      setNewBrandName("");
      setNewBrandDisplayName("");
      setIsAddingBrand(false);
      toast.success('Márka hozzáadva');
    } catch (error) {
      console.error('Error adding brand:', error);
      toast.error('Hiba a márka hozzáadásakor');
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      const { error } = await supabase
        .from('package_brands')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setBrands(brands.filter(b => b.id !== id));
      if (activeBrandIndex >= brands.length - 1) {
        setActiveBrandIndex(Math.max(0, brands.length - 2));
      }
      toast.success('Márka törölve');
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Hiba a márka törlésekor');
    }
  };

  // Subcategory management functions
  const saveSubcategory = async (id: string, displayName: string) => {
    try {
      const { error } = await supabase
        .from('package_subcategories')
        .update({ display_name: displayName })
        .eq('id', id);
      
      if (error) throw error;
      
      setSubcategories(subcategories.map(s => s.id === id ? { ...s, display_name: displayName } : s));
      setEditingSubcategoryId(null);
      toast.success('Alkategória mentve');
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error('Hiba az alkategória mentésekor');
    }
  };

  // Update sort order for a package
  const updateSortOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ sort_order: newOrder })
        .eq('id', id);
      
      if (error) throw error;
      
      setPackages(packages.map(pkg => 
        pkg.id === id ? { ...pkg, sort_order: newOrder } : pkg
      ));
      toast.success('Sorrend mentve');
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast.error('Hiba a sorrend mentésekor');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <>
      <CallbackModal isOpen={isCallbackModalOpen} onClose={() => setIsCallbackModalOpen(false)} />
      <PackageSelectModal
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        packageTitle={selectedPackage?.title || ""}
        packageCode={selectedPackage?.package_code || null}
        batterySize={selectedPackage ? (packageBatteryState[selectedPackage.id]?.selectedBatteryName || null) : null}
      />
      
      {/* Add Package Modal - Fixed position overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            id="add-package-form"
            className="bg-card rounded-2xl border-2 border-primary/30 p-6 space-y-4 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xl text-foreground">
                Új csomag hozzáadása
              </h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Kategória: <span className="font-semibold text-primary">{subcategories.find(s => s.name === newPackage.subcategory)?.display_name || newPackage.subcategory}</span>
            </p>
            
            {/* Image upload for new package */}
            <div 
              className="h-32 bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors border-2 border-dashed border-border"
              onClick={() => document.getElementById('new-pkg-image')?.click()}
            >
              {newPackage.image_url ? (
                <img src={newPackage.image_url} alt="Preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Kép feltöltése</p>
                </div>
              )}
            </div>
            <input
              id="new-pkg-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleNewImageUpload(e.target.files[0])}
            />
            
            <input
              value={newPackage.title}
              onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })}
              placeholder="Csomag neve"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground"
            />
            <input
              value={newPackage.package_code}
              onChange={(e) => setNewPackage({ ...newPackage, package_code: e.target.value })}
              placeholder="Csomag azonosító (pl: PKG-001)"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground"
            />
            <input
              value={newPackage.description}
              onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
              placeholder="Rövid leírás"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground"
            />
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Árazás:</p>
              <input
                value={newPackage.original_price}
                onChange={(e) => setNewPackage({ ...newPackage, original_price: e.target.value })}
                placeholder="Eredeti ár (pl: 1.500.000 Ft)"
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground"
              />
              <input
                value={newPackage.price}
                onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                placeholder="Önrész támogatással (pl: 200.000 Ft)"
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Funkciók:</p>
              {newPackage.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...newPackage.features];
                      newFeatures[index] = e.target.value;
                      setNewPackage({ ...newPackage, features: newFeatures });
                    }}
                    placeholder="Funkció"
                    className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  {newPackage.features.length > 1 && (
                    <button
                      onClick={() => {
                        const newFeatures = newPackage.features.filter((_, i) => i !== index);
                        setNewPackage({ ...newPackage, features: newFeatures });
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setNewPackage({ ...newPackage, features: [...newPackage.features, ""] })}
                className="gap-1"
              >
                <Plus className="w-4 h-4" /> Funkció hozzáadása
              </Button>
            </div>
            
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={newPackage.highlighted}
                onChange={(e) => setNewPackage({ ...newPackage, highlighted: e.target.checked })}
                className="rounded"
              />
              Kiemelt csomag
            </label>
            
            {!activeBrand && (
              <p className="text-sm text-destructive">Először adj hozzá egy márkát!</p>
            )}
            
            <div className="flex gap-3 pt-2">
              <Button 
                variant="hero" 
                onClick={addPackage} 
                disabled={saving || !activeBrand}
                className="flex-1"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Csomag hozzáadása
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Mégse
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <section id="packages" className="py-20 bg-muted/20">
        <div ref={ref} className="container mx-auto px-4">
          <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-6'} opacity-100`}>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Csomagajánlataink
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Válassza ki az Önnek legmegfelelőbb csomagot, és kezdje el a megtakarítást már ma!
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsCallbackModalOpen(true)}
              >
                <Phone className="w-4 h-4" />
                Visszahívást kérek
              </Button>
              
              {/* Admin: Add new package button - in header too */}
              {isAdmin && (
                <Button
                  onClick={() => {
                    const firstSubcategory = subcategories[0]?.name || 'akksi1';
                    setNewPackage({ ...newPackage, subcategory: firstSubcategory });
                    setIsAdding(true);
                  }}
                  className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Új csomag hozzáadása
                </Button>
              )}
            </div>
          </div>

          {/* Brand Filter Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-card rounded-2xl p-1.5 border border-border/50 shadow-lg items-center gap-1">
              {brands.map((brand, index) => (
                <div key={brand.id} className="relative group">
                  {isAdmin && editingBrandId === brand.id ? (
                    <input
                      value={brand.display_name}
                      onChange={(e) => setBrands(brands.map(b => b.id === brand.id ? { ...b, display_name: e.target.value } : b))}
                      onBlur={() => saveBrand(brand.id, brand.display_name)}
                      onKeyDown={(e) => e.key === 'Enter' && saveBrand(brand.id, brand.display_name)}
                      className="px-6 py-3 rounded-xl font-semibold text-sm bg-muted border border-primary w-24 text-center"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setActiveBrandIndex(index)}
                      className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        activeBrandIndex === index
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {brand.display_name}
                    </button>
                  )}
                  
                  {isAdmin && (
                    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingBrandId(brand.id)}
                        className="p-1 bg-card border border-border rounded-full hover:bg-muted"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {brands.length > 1 && (
                        <button
                          onClick={() => deleteBrand(brand.id)}
                          className="p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isAdmin && (
                isAddingBrand ? (
                  <div className="flex items-center gap-2 px-2">
                    <input
                      value={newBrandDisplayName}
                      onChange={(e) => {
                        setNewBrandDisplayName(e.target.value);
                        setNewBrandName(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                      }}
                      placeholder="Márka neve"
                      className="px-3 py-2 rounded-lg bg-muted border border-border text-sm w-24"
                      autoFocus
                    />
                    <button
                      onClick={addBrand}
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingBrand(false);
                        setNewBrandName("");
                        setNewBrandDisplayName("");
                      }}
                      className="p-2 bg-muted rounded-lg hover:bg-muted/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingBrand(true)}
                    className="px-4 py-3 rounded-xl text-primary hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Subcategory Sections */}
          <div className="space-y-14 max-w-5xl mx-auto">
            {subcategories.map((subcategory, subIndex) => {
              const subcategoryPackages = filteredPackages.filter(
                pkg => pkg.subcategory === subcategory.name
              );

              // Don't render empty sections for non-admins (clients shouldn't see empty categories)
              const hasPackages = subcategoryPackages.length > 0;
              if (!hasPackages && !isAdmin) return null;

              return (
                <div key={subcategory.id}>
                  {/* Full Width Section Header with Add Button */}
                  <div className="mb-8 relative group/subcat flex items-center gap-3">
                    <div className="flex-1">
                      {isAdmin && editingSubcategoryId === subcategory.id ? (
                        <input
                          value={subcategory.display_name}
                          onChange={(e) => setSubcategories(subcategories.map(s => 
                            s.id === subcategory.id ? { ...s, display_name: e.target.value } : s
                          ))}
                          onBlur={() => saveSubcategory(subcategory.id, subcategory.display_name)}
                          onKeyDown={(e) => e.key === 'Enter' && saveSubcategory(subcategory.id, subcategory.display_name)}
                          className="w-full text-lg font-heading font-semibold text-primary bg-primary/10 px-6 py-3 rounded-xl border-2 border-primary text-center"
                          autoFocus
                        />
                      ) : (
                        <h3 className="w-full text-lg font-heading font-semibold text-primary bg-primary/10 px-6 py-3 rounded-xl border border-primary/20 text-center">
                          {subcategory.display_name}
                        </h3>
                      )}
                      
                      {isAdmin && editingSubcategoryId !== subcategory.id && (
                        <button
                          onClick={() => setEditingSubcategoryId(subcategory.id)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-card border border-border rounded-full opacity-0 group-hover/subcat:opacity-100 transition-opacity hover:bg-muted"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {/* Admin Add Button - Always visible in subcategory header */}
                    {isAdmin && (
                      <Button
                        onClick={() => {
                          setNewPackage({ ...newPackage, subcategory: subcategory.name, brand: activeBrand?.name || 'deye' });
                          setIsAdding(true);
                        }}
                        className="h-12 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg flex items-center gap-2 shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Új csomag</span>
                      </Button>
                    )}
                  </div>

                  {/* Packages Grid */}
                  <div className={`grid gap-6 ${
                    (() => {
                      const totalItems = subcategoryPackages.length + (isAdmin ? 1 : 0);
                      if (totalItems === 1) return 'grid-cols-1 max-w-md mx-auto';
                      if (totalItems === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto';
                      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
                    })()
                  }`}>
                    {subcategoryPackages.map((pkg, index) => (
                      <div
                        key={pkg.id}
                        className={`group relative bg-card rounded-2xl overflow-hidden transition-all duration-300 ${
                          pkg.highlighted 
                            ? 'border-2 border-primary shadow-xl shadow-primary/20 lg:scale-105 z-10' 
                            : 'border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10'
                        } ${isVisible ? 'translate-y-0' : 'translate-y-6'} opacity-100`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                      >
                        {pkg.highlighted && (
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-primary-foreground text-center py-2 text-sm font-semibold z-20">
                            Legnépszerűbb
                          </div>
                        )}
                        
                        {/* Image Section */}
                        <div className={`relative h-56 bg-gradient-to-br from-muted to-muted/50 overflow-hidden ${pkg.highlighted ? 'mt-8' : ''}`}>
                          {(() => {
                            const batteryState = packageBatteryState[pkg.id];
                            const displayImage = batteryState?.displayImageUrl ?? pkg.image_url;
                            return displayImage ? (
                              <img src={displayImage} alt={pkg.title} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/40" />
                                </div>
                              </div>
                            );
                          })()}
                          
                          {uploadingId === pkg.id && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                          )}
                          
                          {isAdmin && (
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button
                                onClick={() => {
                                  // Don't set uploadingId until file is actually selected
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      handleImageUpload(pkg.id, file);
                                    }
                                  };
                                  input.click();
                                }}
                                className="p-2 bg-card/90 rounded-lg hover:bg-card transition-colors"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(editingId === pkg.id ? null : pkg.id)}
                                className="p-2 bg-card/90 rounded-lg hover:bg-card transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deletePackage(pkg.id)}
                                className="p-2 bg-destructive/90 text-destructive-foreground rounded-lg hover:bg-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {editingId === pkg.id ? (
                            <div className="space-y-3">
                              {/* Sort order input */}
                              <div className="flex items-center gap-2 pb-3 border-b border-border/50 mb-4">
                                <label className="text-sm font-semibold whitespace-nowrap">Sorrend:</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={pkg.sort_order}
                                  onChange={(e) => updatePackage(pkg.id, "sort_order", parseInt(e.target.value) || 0)}
                                  className="w-20 bg-muted/50 border border-border rounded px-2 py-1 text-sm"
                                />
                                <span className="text-xs text-muted-foreground">(kisebb = előrébb)</span>
                              </div>
                              
                              {/* Subcategory select */}
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold whitespace-nowrap">Alkategória:</label>
                                <select
                                  value={pkg.subcategory}
                                  onChange={(e) => updatePackage(pkg.id, "subcategory", e.target.value)}
                                  className="flex-1 bg-muted/50 border border-border rounded px-2 py-1 text-sm"
                                >
                                  {subcategories.map(sub => (
                                    <option key={sub.id} value={sub.name}>{sub.display_name}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <input
                                value={pkg.title}
                                onChange={(e) => updatePackage(pkg.id, "title", e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded px-3 py-2 font-heading font-bold"
                                placeholder="Csomag neve"
                              />
                              <input
                                value={pkg.package_code || ''}
                                onChange={(e) => updatePackage(pkg.id, "package_code", e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm"
                                placeholder="Csomag azonosító (pl: PKG-001)"
                              />
                              <input
                                value={pkg.description || ''}
                                onChange={(e) => updatePackage(pkg.id, "description", e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm"
                                placeholder="Leírás"
                              />
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">Árazás:</p>
                                <input
                                  value={pkg.original_price}
                                  onChange={(e) => updatePackage(pkg.id, "original_price", e.target.value)}
                                  className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-muted-foreground"
                                  placeholder="Eredeti ár (pl: 1.500.000 Ft)"
                                />
                                <input
                                  value={pkg.price}
                                  onChange={(e) => updatePackage(pkg.id, "price", e.target.value)}
                                  className="w-full bg-muted/50 border border-border rounded px-3 py-2 font-bold text-primary"
                                  placeholder="Önrész támogatással (pl: 200.000 Ft)"
                                />
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">Funkciók:</p>
                                {pkg.features.map((feature, fIndex) => (
                                  <div key={fIndex} className="flex gap-2">
                                    <input
                                      value={feature}
                                      onChange={(e) => updateFeature(pkg.id, fIndex, e.target.value)}
                                      className="flex-1 bg-muted/50 border border-border rounded px-2 py-1 text-sm"
                                    />
                                    <button
                                      onClick={() => removeFeature(pkg.id, fIndex)}
                                      className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addFeature(pkg.id)}>
                                  <Plus className="w-4 h-4 mr-1" /> Funkció
                                </Button>
                              </div>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={pkg.highlighted}
                                  onChange={(e) => updatePackage(pkg.id, "highlighted", e.target.checked)}
                                  className="rounded"
                                />
                                Kiemelt csomag
                              </label>
                              <Button 
                                variant="hero" 
                                size="sm" 
                                onClick={() => savePackage(pkg.id)}
                                disabled={saving}
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mentés'}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-heading text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{pkg.title}</h3>
                              <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                              
                              {/* Battery Selector - For inverter2 and akksi3 packages */}
                              {(subcategory.name === 'inverter2' || subcategory.name === 'akksi3') && (
                                <BatterySelector
                                  packageId={pkg.id}
                                  basePrice={pkg.price}
                                  baseOriginalPrice={pkg.original_price}
                                  baseImageUrl={pkg.image_url}
                                  isAdmin={isAdmin}
                                  onSelectionChange={(option, newPrice, newOriginalPrice, newImageUrl) => {
                                    setPackageBatteryState(prev => ({
                                      ...prev,
                                      [pkg.id]: {
                                        selectedBatteryName: option?.name || null,
                                        displayPrice: newPrice,
                                        displayOriginalPrice: newOriginalPrice,
                                        displayImageUrl: newImageUrl
                                      }
                                    }));
                                  }}
                                />
                              )}
                              
                              {(() => {
                                const batteryState = packageBatteryState[pkg.id];
                                const displayPrice = batteryState?.displayPrice ?? pkg.price;
                                const displayOriginalPrice = batteryState?.displayOriginalPrice ?? pkg.original_price;
                                
                                return (displayPrice || displayOriginalPrice) ? (
                                  <div className="mb-4 mt-4">
                                    {displayOriginalPrice && (
                                      <p className="text-sm text-muted-foreground">
                                        <span className="line-through">{displayOriginalPrice}</span>
                                        <span className="ml-1">helyett</span>
                                      </p>
                                    )}
                                    {displayPrice && (
                                      <>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                          támogatással most csak
                                        </p>
                                        <div className="inline-block px-4 py-2 rounded-md bg-gradient-to-r from-amber-400 to-orange-400">
                                          <p className="text-3xl font-bold text-white drop-shadow-sm">{displayPrice}</p>
                                          <p className="text-sm font-medium text-white/90">önrésszel</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mb-4">
                                    <p className="text-sm text-muted-foreground italic">Ár hamarosan</p>
                                  </div>
                                );
                              })()}
                              
                              <ul className="space-y-2 mb-6">
                                {pkg.features.map((feature, fIndex) => (
                                  <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                              <Button 
                                variant={pkg.highlighted ? "hero" : "outline"} 
                                className={`w-full transition-all duration-300 ${!pkg.highlighted ? 'group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary' : ''}`}
                                onClick={() => {
                                  const batteryState = packageBatteryState[pkg.id];
                                  // Create a modified package with battery selection info
                                  const modifiedPackage = batteryState?.selectedBatteryName 
                                    ? {
                                        ...pkg,
                                        title: `${pkg.title} + ${batteryState.selectedBatteryName}`,
                                        price: batteryState.displayPrice,
                                        original_price: batteryState.displayOriginalPrice
                                      }
                                    : pkg;
                                  setSelectedPackage(modifiedPackage);
                                }}
                              >
                                Ezt választom
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add New Package Card - Admin Only */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setNewPackage({ ...newPackage, subcategory: subcategory.name, brand: activeBrand?.name || 'deye' });
                          setIsAdding(true);
                          // Scroll to make sure form is visible
                          setTimeout(() => {
                            document.getElementById('add-package-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/30 rounded-2xl text-primary hover:bg-primary/5 transition-colors bg-card"
                      >
                        <Plus className="w-10 h-10" />
                        <span className="font-semibold">Új csomag hozzáadása</span>
                        <span className="text-sm text-muted-foreground">{subcategory.display_name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hidden file input for image uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0] && uploadingId) {
                handleImageUpload(uploadingId, e.target.files[0]);
              }
            }}
          />
        </div>
      </section>
    </>
  );
};

export default PackageOffers;
