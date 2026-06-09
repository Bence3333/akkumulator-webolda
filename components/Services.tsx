import { Wrench, FileCheck, ClipboardList, Headphones, Shield, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import EditableText from "@/components/EditableText";
import UploadableIcon from "@/components/UploadableIcon";

const services = [
  {
    icon: Wrench,
    titleKey: "service-1-title",
    descKey: "service-1-desc",
    defaultTitle: "Telepítés",
    defaultDesc: "Professzionális rendszer telepítés"
  },
  {
    icon: FileCheck,
    titleKey: "service-2-title",
    descKey: "service-2-desc",
    defaultTitle: "Engedélyeztetés",
    defaultDesc: "Teljes körű ügyintézés"
  },
  {
    icon: ClipboardList,
    titleKey: "service-3-title",
    descKey: "service-3-desc",
    defaultTitle: "Pályázati ügyintézés",
    defaultDesc: "80%-os támogatás igénylése"
  },
  {
    icon: Headphones,
    titleKey: "service-4-title",
    descKey: "service-4-desc",
    defaultTitle: "Ügyfélszolgálat",
    defaultDesc: "Folyamatos támogatás"
  },
  {
    icon: Shield,
    titleKey: "service-5-title",
    descKey: "service-5-desc",
    defaultTitle: "Garancia",
    defaultDesc: "Hosszú távú biztonság"
  },
  {
    icon: Zap,
    titleKey: "service-6-title",
    descKey: "service-6-desc",
    defaultTitle: "Karbantartás",
    defaultDesc: "Rendszeres ellenőrzés"
  }
];

const Services = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
      <div ref={ref} className="container mx-auto px-4">
        <div className={`text-center mb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            <EditableText 
              initialText="Teljes Körű Szolgáltatás"
              storageKey="services-title"
            />
          </h2>
          <p className="text-muted-foreground">
            <EditableText 
              initialText="Mindent megoldunk Önnek – a tervezéstől a kulcsrakész átadásig"
              storageKey="services-subtitle"
            />
          </p>
        </div>

        <div className={`relative transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 md:p-8">
            {services.map((service, index) => (
              <div
                key={service.titleKey}
                className={`group flex flex-col items-center text-center p-4 rounded-2xl bg-card/50 hover:bg-card border border-transparent hover:border-primary/20 transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <UploadableIcon
                  storageKey={`${service.titleKey}-icon`}
                  defaultIcon={<service.icon className="w-7 h-7 text-primary" />}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                  iconClassName="w-7 h-7"
                />
                <h3 className="font-heading font-semibold text-foreground text-sm md:text-base mb-1">
                  <EditableText 
                    initialText={service.defaultTitle}
                    storageKey={service.titleKey}
                  />
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  <EditableText 
                    initialText={service.defaultDesc}
                    storageKey={service.descKey}
                  />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className={`flex justify-center mt-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Services;
