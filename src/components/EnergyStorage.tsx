import { Receipt, BatteryCharging, Zap, CircuitBoard, Cog, Leaf } from "lucide-react";
import EditableText from "@/components/EditableText";
import UploadableIcon from "@/components/UploadableIcon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const benefits = [
  {
    icon: Receipt,
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
    iconColor: "text-emerald-600",
    title: "Villanyszámla Csökkentés",
    description: "Az energiatároló segítségével a nappal megtermelt áramot éjszaka is felhasználhatja.",
    key: "storage-benefit-1"
  },
  {
    icon: BatteryCharging,
    gradient: "from-teal-500 to-cyan-500",
    iconBg: "bg-gradient-to-br from-teal-100 to-cyan-100",
    iconColor: "text-teal-600",
    title: "Áramszünet Védelem",
    description: "Legyen független a hálózati kimaradásoktól, az akkumulátor átmeneti áramforrásként működik.",
    key: "storage-benefit-2"
  },
  {
    icon: Zap,
    gradient: "from-blue-500 to-indigo-500",
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
    iconColor: "text-blue-600",
    title: "Csúcsidő Kikerülése",
    description: "Tárolja az olcsóbb időszakban termelt energiát és használja fel drágább csúcsidőben.",
    key: "storage-benefit-3"
  },
  {
    icon: CircuitBoard,
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
    iconColor: "text-amber-600",
    title: "Okos energiamenedzsment",
    description: "Intelligens napelem akkumulátor vezérlés és energiagazdálkodás",
    key: "storage-benefit-4"
  },
  {
    icon: Cog,
    gradient: "from-orange-500 to-rose-500",
    iconBg: "bg-gradient-to-br from-orange-100 to-rose-100",
    iconColor: "text-orange-600",
    title: "Energiafüggetlenség otthon",
    description: "Független otthoni energiatárolás napelem rendszerrel",
    key: "storage-benefit-5"
  },
  {
    icon: Leaf,
    gradient: "from-green-500 to-emerald-500",
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-100",
    iconColor: "text-green-600",
    title: "Környezetbarát megoldás",
    description: "Csökkentse CO₂ kibocsátását napelem energiatárolóval",
    key: "storage-benefit-6"
  }
];

const EnergyStorage = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div ref={ref} className="container mx-auto px-4 relative z-10">
        {/* Title Section */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold mb-4">
            <span className="w-8 h-0.5 bg-primary rounded-full" />
            ELŐNYÖK
            <span className="w-8 h-0.5 bg-primary rounded-full" />
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <EditableText 
              initialText="Miért van szükséged energiatárolóra?"
              storageKey="storage-title"
            />
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <EditableText 
              initialText="Fedezd fel az otthoni energiatárolás előnyeit és válj energiafüggetlenné"
              storageKey="storage-subtitle"
              multiline
            />
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.key}
                className={`group relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                
                <div className="relative z-10">
                  <UploadableIcon
                    storageKey={`${benefit.key}-icon`}
                    defaultIcon={<Icon className={`w-7 h-7 ${benefit.iconColor}`} />}
                    className={`w-14 h-14 ${benefit.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    iconClassName="w-7 h-7 object-contain"
                  />
                  <h3 className="font-heading font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    <EditableText 
                      initialText={benefit.title}
                      storageKey={`${benefit.key}-title`}
                    />
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <EditableText 
                      initialText={benefit.description}
                      storageKey={`${benefit.key}-desc`}
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

export default EnergyStorage;
