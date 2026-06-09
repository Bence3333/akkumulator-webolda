import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import EditableText from "@/components/EditableText";
import UploadableIcon from "@/components/UploadableIcon";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { Award, Shield, Clock, Users, Wrench, ThumbsUp, Headphones, Zap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const defaultFeatures = [
  {
    id: "why-us-1",
    icon: Award,
    defaultTitle: "Szakértelem és tapasztalat",
    defaultDesc: "Több éves tapasztalattal rendelkezünk a napelem és energiatároló rendszerek telepítésében.",
  },
  {
    id: "why-us-2",
    icon: Shield,
    defaultTitle: "Garancia és megbízhatóság",
    defaultDesc: "Minden munkánkra garanciát vállalunk, és csak prémium minőségű eszközöket használunk.",
  },
  {
    id: "why-us-3",
    icon: Clock,
    defaultTitle: "Gyors ügyintézés",
    defaultDesc: "Az ajánlatkéréstől a telepítésig minden lépést gyorsan és hatékonyan intézünk.",
  },
  {
    id: "why-us-4",
    icon: Users,
    defaultTitle: "Személyre szabott megoldások",
    defaultDesc: "Minden ügyfél egyedi igényeire szabott rendszert tervezünk és telepítünk.",
  },
  {
    id: "why-us-5",
    icon: Wrench,
    defaultTitle: "Professzionális telepítés",
    defaultDesc: "Szakképzett csapatunk precíz és gondos munkát végez minden telepítésnél.",
  },
  {
    id: "why-us-6",
    icon: Headphones,
    defaultTitle: "Folyamatos támogatás",
    defaultDesc: "A telepítés után is számíthatsz ránk - kérdések esetén mindig elérhetőek vagyunk.",
  }
];

const gradients = [
  { gradient: "from-amber-500 to-orange-500", iconBg: "bg-gradient-to-br from-amber-100 to-orange-100", iconColor: "text-amber-600" },
  { gradient: "from-emerald-500 to-teal-500", iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100", iconColor: "text-emerald-600" },
  { gradient: "from-blue-500 to-indigo-500", iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100", iconColor: "text-blue-600" },
  { gradient: "from-purple-500 to-pink-500", iconBg: "bg-gradient-to-br from-purple-100 to-pink-100", iconColor: "text-purple-600" },
  { gradient: "from-rose-500 to-red-500", iconBg: "bg-gradient-to-br from-rose-100 to-red-100", iconColor: "text-rose-600" },
  { gradient: "from-cyan-500 to-blue-500", iconBg: "bg-gradient-to-br from-cyan-100 to-blue-100", iconColor: "text-cyan-600" },
];

const WhyUs = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { isAdmin } = useAdmin();
  const [featureCount, setFeatureCount] = useState(6);

  useEffect(() => {
    const loadFeatureCount = async () => {
      const { data } = await supabase
        .from('editable_content')
        .select('content')
        .eq('storage_key', 'why-us-count')
        .single();
      
      if (data) {
        setFeatureCount(parseInt(data.content, 10) || 6);
      }
    };
    loadFeatureCount();
  }, []);

  const addFeature = async () => {
    const newCount = featureCount + 1;
    setFeatureCount(newCount);
    
    await supabase
      .from('editable_content')
      .upsert({ 
        storage_key: 'why-us-count', 
        content: newCount.toString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'storage_key' });
    
    toast.success("Új elem hozzáadva!");
  };

  const removeFeature = async (index: number) => {
    if (featureCount <= 1) return;
    
    const newCount = featureCount - 1;
    setFeatureCount(newCount);
    
    await supabase
      .from('editable_content')
      .upsert({ 
        storage_key: 'why-us-count', 
        content: newCount.toString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'storage_key' });
    
    toast.success("Elem törölve!");
  };

  const features = Array.from({ length: featureCount }, (_, i) => {
    const defaultFeature = defaultFeatures[i] || {
      id: `why-us-${i + 1}`,
      icon: Zap,
      defaultTitle: "Új előny",
      defaultDesc: "Kattints ide a szerkesztéshez",
    };
    const gradient = gradients[i % gradients.length];
    return { ...defaultFeature, ...gradient, index: i };
  });

  return (
    <section id="why-us" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div ref={ref} className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className={`mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-flex items-center gap-3 text-xs uppercase tracking-wider text-primary font-semibold">
              <span className="w-12 h-0.5 bg-gradient-to-r from-transparent to-primary rounded-full" />
              <EditableText initialText="MIÉRT VÁLASSZ MINKET" storageKey="why-us-label" />
              <span className="w-12 h-0.5 bg-gradient-to-l from-transparent to-primary rounded-full" />
            </span>
          </div>
          
          <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <EditableText initialText="Miért pont mi?" storageKey="why-us-title" />
          </h2>
          
          <p className={`text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <EditableText 
              initialText="Több okból is bízhatod ránk napelemes rendszered tervezését és telepítését. Íme néhány érv, ami mellettünk szól."
              storageKey="why-us-subtitle"
              multiline
            />
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group relative bg-card rounded-2xl border-2 border-border/50 p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30 overflow-hidden ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {/* Top gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              
              {/* Admin delete button */}
              {isAdmin && (
                <button
                  onClick={() => removeFeature(index)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all duration-200 z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Icon */}
              <div className="mb-5">
                <UploadableIcon
                  storageKey={`${feature.id}-icon`}
                  defaultIcon={<feature.icon className={`w-7 h-7 ${feature.iconColor}`} />}
                  className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  iconClassName="w-7 h-7"
                />
              </div>

              {/* Title */}
              <h3 className="font-heading font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                <EditableText initialText={feature.defaultTitle} storageKey={`${feature.id}-title`} />
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                <EditableText initialText={feature.defaultDesc} storageKey={`${feature.id}-desc`} multiline />
              </p>

              {/* Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
          ))}
        </div>

        {/* Add new button (admin only) */}
        {isAdmin && (
          <div className="flex justify-center mt-8">
            <Button onClick={addFeature} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Új elem hozzáadása
            </Button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className={`mt-16 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '900ms' }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 transition-all duration-300 hover:bg-primary/20 hover:scale-105">
            <ThumbsUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              <EditableText initialText="Több mint 500 elégedett ügyfél bízott már meg minket" storageKey="why-us-cta-text" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
