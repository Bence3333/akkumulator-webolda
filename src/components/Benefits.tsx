import { Battery, Zap, Leaf, PiggyBank, Shield, Clock } from "lucide-react";
import EditableText from "@/components/EditableText";
import UploadableIcon from "@/components/UploadableIcon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const benefits = [
  {
    icon: PiggyBank,
    title: "80% Támogatás",
    description: "A pályázat révén az akkumulátor árának akár 80%-át visszakaphatja.",
    key: "benefit-1"
  },
  {
    icon: Battery,
    title: "Energiafüggetlenség",
    description: "Tárolja el a megtermelt energiát és használja fel este is.",
    key: "benefit-2"
  },
  {
    icon: Zap,
    title: "Áramszünet Védelem",
    description: "Áramszünet esetén is működik az otthona az akkumulátorral.",
    key: "benefit-3"
  },
  {
    icon: Leaf,
    title: "Környezetbarát",
    description: "Csökkentse CO2 lábnyomát és védje a környezetet.",
    key: "benefit-4"
  },
  {
    icon: Shield,
    title: "10 Év Garancia",
    description: "Prémium akkumulátorok hosszú távú garanciával.",
    key: "benefit-5"
  },
  {
    icon: Clock,
    title: "Gyors Telepítés",
    description: "Pályázati ügyintézéstől a telepítésig mindent intézünk.",
    key: "benefit-6"
  },
];

const Benefits = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="elonyok" className="py-24 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm mb-4">
            Miért válasszon minket?
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            <EditableText 
              initialText="Az Akkumulátor"
              storageKey="benefits-title-1"
              className="inline"
            />
            {" "}
            <span className="text-gradient">
              <EditableText 
                initialText="Előnyei"
                storageKey="benefits-title-2"
                className="inline"
              />
            </span>
          </h2>
          <EditableText 
            initialText="Fedezze fel, miért érdemes most belevágni a napelemes akkumulátor telepítésébe."
            storageKey="benefits-subtitle"
            className="text-muted-foreground text-lg block"
            as="p"
            multiline
          />
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.key}
              className={`group bg-card rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-500 hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <UploadableIcon
                storageKey={`${benefit.key}-icon`}
                defaultIcon={<benefit.icon className="w-7 h-7 text-primary-foreground" />}
                className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                iconClassName="w-7 h-7 text-primary-foreground"
              />
              <EditableText 
                initialText={benefit.title}
                storageKey={`${benefit.key}-title`}
                className="font-heading text-xl font-semibold mb-3 block"
                as="h3"
              />
              <EditableText 
                initialText={benefit.description}
                storageKey={`${benefit.key}-desc`}
                className="text-muted-foreground block"
                as="p"
                multiline
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
