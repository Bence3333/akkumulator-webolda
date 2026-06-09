import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import EditableText from "@/components/EditableText";
import UploadableIcon from "@/components/UploadableIcon";
import { Sun, TrendingDown, AlertTriangle, Battery, Moon, CloudRain, Shield } from "lucide-react";

const withoutStorageItems = [
  { icon: Sun, defaultText: "Nappal, amikor dolgozol, a napelemek csúcsra járnak – pont akkor termelnek a legtöbbet, amikor alig használsz áramot", color: "text-amber-600", bg: "bg-amber-100" },
  { icon: TrendingDown, defaultText: "Bruttó elszámolásban a felesleges áramot ~5 Ft/kWh-ért veszik át tőled, este viszont akár 70 Ft/kWh-ért veszed vissza", color: "text-rose-500", bg: "bg-rose-100" },
  { icon: AlertTriangle, defaultText: "A rendszer megtérülése jelentősen romlik akkumulátor nélkül", color: "text-orange-500", bg: "bg-orange-100" }
];

const withStorageItems = [
  { icon: Battery, defaultText: "A nappali többletet eltárolod és este, éjjel felhasználod – nem kell fillérekért eladnod", color: "text-emerald-600", bg: "bg-emerald-100" },
  { icon: CloudRain, defaultText: "Borús időben és éjszaka is a saját energiádból élsz – kevesebb áramot veszel a hálózatból", color: "text-blue-500", bg: "bg-blue-100" },
  { icon: Shield, defaultText: "Back-up funkcióval áramszünet esetén is megy a hűtő, WiFi és más fontos készülékek", color: "text-teal-500", bg: "bg-teal-100" }
];

const EnergyComparison = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="energy-comparison" className="py-20 bg-gradient-to-b from-muted/20 via-background to-muted/20 overflow-hidden">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold mb-4">
            <span className="w-8 h-0.5 bg-primary rounded-full" />
            ÖSSZEHASONLÍTÁS
            <span className="w-8 h-0.5 bg-primary rounded-full" />
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <EditableText 
              initialText="Miért van szükséged energiatárolóra?"
              storageKey="energy-comparison-title"
            />
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <EditableText 
              initialText="2026-ra már közel 30.000 háztartás esik ki a szaldós elszámolásból"
              storageKey="energy-comparison-subtitle"
            />
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Without storage */}
          <div
            className={`group bg-card rounded-2xl border-2 border-border hover:border-amber-300 p-7 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center font-bold text-amber-600 text-xl group-hover:scale-110 transition-transform duration-300">
                A
              </span>
              <h3 className="font-heading font-bold text-xl text-foreground">
                <EditableText 
                  initialText="Tároló nélkül"
                  storageKey="energy-comparison-without-title"
                />
              </h3>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {withoutStorageItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-all duration-200 group/item"
                >
                  <UploadableIcon
                    storageKey={`energy-comparison-without-item-${index}-icon`}
                    defaultIcon={<item.icon className={`w-5 h-5 ${item.color}`} />}
                    className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200`}
                    iconClassName="w-5 h-5"
                  />
                  <p className="text-sm text-foreground leading-relaxed">
                    <EditableText 
                      initialText={item.defaultText}
                      storageKey={`energy-comparison-without-item-${index}-text`}
                      multiline
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* With storage */}
          <div
            className={`group bg-card rounded-2xl border-2 border-primary/30 hover:border-primary p-7 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
            style={{ transitionDelay: '350ms' }}
          >
            {/* Recommended badge */}
            <div className="absolute -top-1 -right-1">
              <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                AJÁNLOTT
              </div>
            </div>
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-xl group-hover:scale-110 transition-transform duration-300">
                B
              </span>
              <h3 className="font-heading font-bold text-xl text-foreground">
                <EditableText 
                  initialText="Energiatárolással"
                  storageKey="energy-comparison-with-title"
                />
              </h3>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {withStorageItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-primary/5 transition-all duration-200 group/item"
                >
                  <UploadableIcon
                    storageKey={`energy-comparison-with-item-${index}-icon`}
                    defaultIcon={<item.icon className={`w-5 h-5 ${item.color}`} />}
                    className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200`}
                    iconClassName="w-5 h-5"
                  />
                  <p className="text-sm text-foreground leading-relaxed">
                    <EditableText 
                      initialText={item.defaultText}
                      storageKey={`energy-comparison-with-item-${index}-text`}
                      multiline
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnergyComparison;
