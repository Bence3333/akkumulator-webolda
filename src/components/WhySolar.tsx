import { Sun, Battery, Zap, Leaf, Wallet, Shield } from "lucide-react";
import EditableText from "@/components/EditableText";
import UploadableIcon from "@/components/UploadableIcon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const reasons = [
  {
    icon: Wallet,
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
    iconColor: "text-emerald-600",
    title: "Alacsony Költségek",
    description: "Csökkentse villanyszámláját akár 90%-kal és szabaduljon meg a növekvő áraktól.",
    key: "reason-1"
  },
  {
    icon: Leaf,
    gradient: "from-green-500 to-emerald-500",
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-100",
    iconColor: "text-green-600",
    title: "Környezetbarát",
    description: "Tiszta, megújuló energia, amely nem terheli a környezetet és csökkenti a CO2 kibocsátást.",
    key: "reason-2"
  },
  {
    icon: Shield,
    gradient: "from-blue-500 to-indigo-500",
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
    iconColor: "text-blue-600",
    title: "Energiafüggetlenség",
    description: "Legyen független a szolgáltatóktól és az áramszünetektől saját energiatermeléssel.",
    key: "reason-3"
  },
  {
    icon: Zap,
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
    iconColor: "text-amber-600",
    title: "Gyors Megtérülés",
    description: "A támogatásoknak köszönhetően akár 3-5 év alatt megtérülhet a beruházás.",
    key: "reason-4"
  },
  {
    icon: Sun,
    gradient: "from-orange-500 to-rose-500",
    iconBg: "bg-gradient-to-br from-orange-100 to-rose-100",
    iconColor: "text-orange-500",
    title: "Hosszú Élettartam",
    description: "A modern napelemek 25-30 évig is megbízhatóan működnek minimális karbantartással.",
    key: "reason-5"
  },
  {
    icon: Battery,
    gradient: "from-purple-500 to-violet-500",
    iconBg: "bg-gradient-to-br from-purple-100 to-violet-100",
    iconColor: "text-purple-600",
    title: "Energiatárolás",
    description: "Akkumulátorral a nappal termelt energiát éjszaka is felhasználhatja.",
    key: "reason-6"
  }
];

const WhySolar = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold mb-4">
            <span className="w-8 h-0.5 bg-primary rounded-full" />
            ELŐNYÖK
            <span className="w-8 h-0.5 bg-primary rounded-full" />
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <EditableText 
              initialText="Miért válassza a napenergiát?"
              storageKey="why-solar-title"
            />
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <EditableText 
              initialText="Fedezze fel a napelemes rendszer előnyeit és változtassa meg energiafogyasztását örökre"
              storageKey="why-solar-subtitle"
              multiline
            />
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.key}
                className={`group relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${reason.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                
                <div className="relative z-10">
                  <UploadableIcon
                    storageKey={`${reason.key}-icon`}
                    defaultIcon={<Icon className={`w-7 h-7 ${reason.iconColor}`} />}
                    className={`w-14 h-14 ${reason.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    iconClassName={`w-7 h-7 ${reason.iconColor}`}
                  />
                  <h3 className="font-heading font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    <EditableText 
                      initialText={reason.title}
                      storageKey={`${reason.key}-title`}
                    />
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <EditableText 
                      initialText={reason.description}
                      storageKey={`${reason.key}-desc`}
                      multiline
                    />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhySolar;
