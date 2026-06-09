import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, Shield, List, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import CallbackModal from "./CallbackModal";
import EditableText from "./EditableText";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const { isAdmin } = useAdmin();

  const defaultBenefits = [
    "Kevesebb hálózati vételezés, alacsonyabb villanyszámla",
    "A megtermelt energia tárolása esti felhasználásra",
    "Teljes folyamat: felmérés → tervezés → telepítés",
    "Gyors visszajelzés a következő lépésekről",
  ];

  const [benefits, setBenefits] = useState(defaultBenefits);

  // Load benefits from database
  useEffect(() => {
    const loadBenefits = async () => {
      const loadedBenefits: string[] = [];
      for (let i = 0; i < 4; i++) {
        const { data } = await supabase
          .from('editable_content')
          .select('content')
          .eq('storage_key', `hero_benefit_${i}`)
          .maybeSingle();
        if (data?.content) {
          loadedBenefits[i] = data.content;
        } else {
          loadedBenefits[i] = defaultBenefits[i];
        }
      }
      setBenefits(loadedBenefits);
    };
    loadBenefits();
  }, []);

  return (
    <>
      <CallbackModal isOpen={isCallbackModalOpen} onClose={() => setIsCallbackModalOpen(false)} />
      <section className="relative min-h-screen flex items-center overflow-hidden pb-24">
        {/* Bottom fade to white - more gradual transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-64 z-[5] pointer-events-none"
          style={{
            background: `linear-gradient(to top, 
              hsl(45 33% 97%) 0%, 
              hsl(45 33% 97% / 0.95) 15%,
              hsl(45 33% 97% / 0.7) 35%,
              hsl(45 33% 97% / 0.4) 55%,
              hsl(45 33% 97% / 0.15) 75%,
              transparent 100%
            )`
          }}
        />
        {/* Background with solar panel image */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(900px 520px at 18% 45%,
                rgba(255,255,255,0.95) 0%,
                rgba(255,255,255,0.78) 45%,
                rgba(255,255,255,0.40) 68%,
                rgba(255,255,255,0.10) 100%
              ),
              linear-gradient(to bottom,
                rgba(255,255,255,0.35),
                rgba(255,255,255,0.10)
              ),
              url('/solar-hero-bg.png')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.22) saturate(1.32)',
            transform: 'scale(1.02)',
          }}
        />
        
        {/* Accent glow overlay */}
        <div 
          className="absolute -inset-10 pointer-events-none"
          style={{
            background: `
              radial-gradient(520px 360px at 30% 20%, rgba(255,179,0,0.22), transparent 60%),
              radial-gradient(520px 360px at 75% 70%, rgba(15,118,110,0.14), transparent 60%)
            `,
          }}
        />

        <div ref={ref} className="container mx-auto px-4 md:px-[6vw] relative z-10 py-16 md:py-20">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/90 border border-slate-900/10 shadow-lg backdrop-blur-md text-sm font-bold text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_0_6px_rgba(255,179,0,0.18)]" />
                <EditableText 
                  initialText="Most elérhető:" 
                  storageKey="hero_badge_prefix" 
                  as="span"
                />
                {" "}
                <EditableText 
                  initialText="akár 80% támogatás" 
                  storageKey="hero_badge_highlight" 
                  as="span"
                  className="font-black"
                />
                {" "}
                <EditableText 
                  initialText="energiatárolóra" 
                  storageKey="hero_badge_suffix" 
                  as="span"
                />
              </div>

              {/* Headline */}
              <h1 className="mt-6 mb-3 text-[clamp(40px,5.2vw,70px)] leading-[1.02] tracking-tight font-bold text-slate-900">
                <EditableText 
                  initialText="Spórolj az energián" 
                  storageKey="hero_headline_1" 
                  as="span"
                />
                <br />
                <span className="font-black bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  <EditableText 
                    initialText="80% támogatással" 
                    storageKey="hero_headline_highlight" 
                    as="span"
                  />
                </span>
                <span className="block mt-2.5 text-[clamp(18px,2.1vw,22px)] font-extrabold text-slate-900">
                  <EditableText 
                    initialText="napelem–akkumulátor rendszerre" 
                    storageKey="hero_subheadline" 
                    as="span"
                  />
                </span>
              </h1>

              {/* Lead text */}
              <p className="mt-3.5 max-w-[60ch] text-lg leading-relaxed text-slate-600">
                <EditableText 
                  initialText="Növeld az önfogyasztásod, használd fel a megtermelt energiát este is. Előminősítés, tervezés és telepítés – egy kézből, támogatással." 
                  storageKey="hero_lead_text" 
                  as="span"
                  multiline
                />
              </p>

              {/* Trust chips */}
              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/90 border border-slate-900/10 shadow-lg backdrop-blur-md text-[13px] font-bold text-slate-900">
                  <Shield className="w-4 h-4 text-slate-700" />
                  <EditableText 
                    initialText="Gyors előminősítés" 
                    storageKey="hero_chip_1" 
                    as="span"
                  />
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/90 border border-slate-900/10 shadow-lg backdrop-blur-md text-[13px] font-bold text-slate-900">
                  <List className="w-4 h-4 text-slate-700" />
                  <EditableText 
                    initialText="Teljes ügyintézés" 
                    storageKey="hero_chip_2" 
                    as="span"
                  />
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/90 border border-slate-900/10 shadow-lg backdrop-blur-md text-[13px] font-bold text-slate-900">
                  <Plus className="w-4 h-4 text-slate-700" />
                  <EditableText 
                    initialText="Napelemhez optimalizálva" 
                    storageKey="hero_chip_3" 
                    as="span"
                  />
                </span>
              </div>

              {/* CTA buttons */}
              <div className="mt-7 flex flex-wrap gap-3.5 items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/quote")} 
                  className="px-6 py-4 text-base font-black bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 shadow-xl hover:shadow-2xl transition-all duration-200 rounded-2xl animate-pulse-glow"
                >
                  <EditableText 
                    initialText="ELŐMINŐSÍTÉS" 
                    storageKey="hero_cta_primary" 
                    as="span"
                  />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-6 py-4 text-base font-black bg-white/90 border border-slate-900/10 text-teal-700 hover:bg-white shadow-lg transition-all duration-200 rounded-2xl"
                  onClick={() => setIsCallbackModalOpen(true)}
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  <EditableText 
                    initialText="Visszahívást kérek" 
                    storageKey="hero_cta_secondary" 
                    as="span"
                  />
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="mt-3.5 text-xs text-slate-900/70 max-w-[74ch]">
                <EditableText 
                  initialText="Tájékoztató jellegű tartalom. A támogatás mértéke és feltételei programonként eltérhetnek; a pontos jogosultságot előminősítésben egyeztetjük." 
                  storageKey="hero_disclaimer" 
                  as="span"
                  multiline
                />
              </p>
            </div>

            {/* Right side - Glass card */}
            <aside className={`rounded-[22px] p-8 bg-white/80 border border-slate-900/10 shadow-xl backdrop-blur-lg transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {/* Stat */}
              <div className="flex items-baseline gap-2.5 mb-4">
                <span className="text-5xl font-black leading-none bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  <EditableText 
                    initialText="80%" 
                    storageKey="hero_stat_value" 
                    as="span"
                  />
                </span>
                <div className="font-black text-slate-900">
                  <EditableText 
                    initialText="támogatás" 
                    storageKey="hero_stat_label" 
                    as="span"
                  />
                  <span className="block font-extrabold text-slate-500 text-sm">
                    <EditableText 
                      initialText="otthoni energiatárolóra" 
                      storageKey="hero_stat_sublabel" 
                      as="span"
                    />
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3.5">
                <EditableText 
                  initialText="Miért éri meg most?" 
                  storageKey="hero_card_title" 
                  as="span"
                />
              </h3>

              <ul className="space-y-3 text-[15px] text-slate-700">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-lg bg-green-600/10 border border-green-600/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                    </span>
                    <EditableText 
                      initialText={defaultBenefits[index]} 
                      storageKey={`hero_benefit_${index}`} 
                      as="span"
                    />
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
