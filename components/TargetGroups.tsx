import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import EditableText from "@/components/EditableText";
import UploadableIcon from "@/components/UploadableIcon";
import { Users, Battery, Sun, Zap, RotateCcw, Calculator, AlertCircle, Check, Home, Settings } from "lucide-react";

const groups = [
  {
    id: "group-1",
    label: "Csoport 01",
    defaultTitle: "Akik már napelemesek, és a szaldó miatt terveznek előre",
    defaultDesc: "Ha már működik a HMKE-d, és a szaldós időszak vége (vagy közelgő vége) miatt szeretnél kiszámíthatóbb működést, ez a kategória neked szól.",
    gradient: "from-blue-500 to-blue-600",
    lightGradient: "from-blue-50 to-blue-100",
    accentColor: "bg-blue-500",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    iconBg: "bg-blue-100",
    items: [
      { icon: RotateCcw, defaultText: "Szaldóból kiesett vagy 2030-ig kieső", color: "text-blue-500", bg: "bg-blue-100" },
      { icon: Settings, defaultText: "Invertercsere is szóba jöhet", color: "text-emerald-500", bg: "bg-emerald-100" },
      { icon: Calculator, defaultText: "Az elszámolás logikáját érdemes optimalizálni", color: "text-amber-500", bg: "bg-amber-100" },
      { icon: AlertCircle, defaultText: "Érintett rendszerek száma: jelentős", color: "text-rose-500", bg: "bg-rose-100" }
    ]
  },
  {
    id: "group-2",
    label: "Csoport 02",
    defaultTitle: "Akik már bruttó elszámolásban vannak",
    defaultDesc: "Ha a rendszered már bruttó elszámolás szerint működik, a tároló célja tipikusan az, hogy növeld a helyben felhasznált energiát és csökkentsd a hálózati vételezést.",
    gradient: "from-orange-500 to-orange-600",
    lightGradient: "from-orange-50 to-orange-100",
    accentColor: "bg-orange-500",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    hoverBorder: "hover:border-orange-400",
    iconBg: "bg-orange-100",
    items: [
      { icon: Zap, defaultText: "Bruttó elszámolású HMKE", color: "text-orange-500", bg: "bg-orange-100" },
      { icon: AlertCircle, defaultText: "Napenergia Plusz nyertes: nem jogosult", color: "text-pink-500", bg: "bg-pink-100" },
      { icon: Battery, defaultText: "Tároló méret: felső korlát nélkül", color: "text-purple-500", bg: "bg-purple-100" },
      { icon: Users, defaultText: "Előny: 5000 fő alatti települések", color: "text-teal-500", bg: "bg-teal-100" }
    ]
  },
  {
    id: "group-3",
    label: "Csoport 03",
    defaultTitle: "Akik most vágnának bele napelem + tároló rendszerbe",
    defaultDesc: "Ha még nincs napelemed, de új rendszerben gondolkodsz, a cél a kezdetektől olyan konfiguráció, ami a fogyasztási szokásaidhoz illeszkedik és hosszú távon rugalmas.",
    gradient: "from-green-500 to-green-600",
    lightGradient: "from-green-50 to-green-100",
    accentColor: "bg-green-500",
    textColor: "text-green-600",
    borderColor: "border-green-200",
    hoverBorder: "hover:border-green-400",
    iconBg: "bg-green-100",
    items: [
      { icon: Sun, defaultText: "Új napelemes rendszer vállalása", color: "text-green-500", bg: "bg-green-100" },
      { icon: Home, defaultText: "Inverter: legfeljebb 5 kW", color: "text-rose-500", bg: "bg-rose-100" },
      { icon: Battery, defaultText: "Tároló méret: felső korlát nélkül", color: "text-amber-500", bg: "bg-amber-100" },
      { icon: Check, defaultText: "Előny: 5000 fő alatti települések", color: "text-cyan-500", bg: "bg-cyan-100" }
    ]
  }
];

const TargetGroups = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="target-groups" className="py-20 bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section header */}
        <div className={`mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
            <span className="w-8 h-0.5 bg-primary rounded-full" />
            <EditableText 
              initialText="JOGOSULTSÁG / CÉLCSOPORT"
              storageKey="target-groups-label"
            />
          </span>
        </div>
        
        <div className={`mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <EditableText 
              initialText="Kiknek szól?"
              storageKey="target-groups-title"
            />
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            <EditableText 
              initialText="Három tipikus helyzetet különítünk el. Válaszd ki azt, amelyik a legjobban illik a háztartásodra – a feltételek és előnyök csoportonként eltérhetnek."
              storageKey="target-groups-subtitle"
              multiline
            />
          </p>
        </div>

        {/* Groups grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {groups.map((group, groupIndex) => (
            <div
              key={group.id}
              className={`group relative bg-card rounded-2xl border-2 ${group.borderColor} p-6 pb-8 pt-8 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 ${group.hoverBorder} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
              style={{ transitionDelay: `${200 + groupIndex * 150}ms` }}
            >
              {/* Top gradient bar wrapper */}
              <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden rounded-t-xl">
                <div className={`h-full w-full bg-gradient-to-r ${group.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
              
              {/* Group label */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${group.accentColor} text-white shadow-lg`}>
                  <EditableText 
                    initialText={group.label}
                    storageKey={`${group.id}-label`}
                  />
                </span>
              </div>

              {/* Group title */}
              <h3 className="font-heading font-bold text-xl text-foreground mb-3 mt-4 group-hover:text-primary transition-colors duration-300">
                <EditableText 
                  initialText={group.defaultTitle}
                  storageKey={`${group.id}-title`}
                />
              </h3>

              {/* Group description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                <EditableText 
                  initialText={group.defaultDesc}
                  storageKey={`${group.id}-desc`}
                  multiline
                />
              </p>

              {/* Divider */}
              <div className="w-full h-px bg-border/50 mb-5" />

              {/* Items */}
              <div className="space-y-3">
                {group.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors duration-200 cursor-default"
                  >
                    <UploadableIcon
                      storageKey={`${group.id}-item-${itemIndex}-icon`}
                      defaultIcon={<item.icon className={`w-4 h-4 ${item.color}`} />}
                      className={`w-9 h-9 ${item.bg} rounded-full flex items-center justify-center flex-shrink-0`}
                      iconClassName="w-4 h-4"
                    />
                    <span className="text-sm text-foreground font-medium">
                      <EditableText 
                        initialText={item.defaultText}
                        storageKey={`${group.id}-item-${itemIndex}-text`}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetGroups;
