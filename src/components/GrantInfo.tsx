import { Button } from "@/components/ui/button";
import { Check, ArrowRight, AlertCircle } from "lucide-react";
import EditableText from "@/components/EditableText";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  { text: "Lakossági pályázóknak szól", key: "grant-feature-1" },
  { text: "Maximum 80% támogatási intenzitás", key: "grant-feature-2" },
  { text: "Meglévő napelemes rendszerhez", key: "grant-feature-3" },
  { text: "Új napelemes rendszerhez is", key: "grant-feature-4" },
  { text: "5-15 kWh kapacitású akkumulátorok", key: "grant-feature-5" },
  { text: "Teljes körű ügyintézés", key: "grant-feature-6" },
];

const GrantInfo = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="palyazat" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <span className="inline-block px-4 py-1 bg-secondary/10 text-secondary font-medium rounded-full text-sm">
              Aktuális Pályázat
            </span>
            
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              <EditableText 
                initialText="Akkumulátor Pályázat"
                storageKey="grant-title"
                className="block"
                as="span"
              />
              <span className="text-gradient block">
                <EditableText 
                  initialText="80% Támogatással"
                  storageKey="grant-subtitle"
                />
              </span>
            </h2>

            <EditableText 
              initialText="A magyar kormány történelmi pályázata lehetővé teszi, hogy az energiatároló rendszerek árának akár 80%-át visszakapja. Ne hagyja ki ezt az egyedülálló lehetőséget!"
              storageKey="grant-description"
              className="text-lg text-muted-foreground block"
              as="p"
              multiline
            />

            {/* Features list */}
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li 
                  key={feature.key} 
                  className={`flex items-center gap-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <EditableText 
                    initialText={feature.text}
                    storageKey={feature.key}
                    className="text-foreground"
                  />
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="hero" size="xl">
                Pályázati Konzultáció
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Info Card */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-card border border-border">
              {/* Urgency badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full mb-6">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Korlátozott keret!</span>
              </div>

              <h3 className="font-heading text-2xl md:text-3xl font-bold mb-6">
                <EditableText 
                  initialText="Pályázati Feltételek"
                  storageKey="grant-card-title"
                />
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 border-b border-border">
                  <span className="text-muted-foreground">Támogatási intenzitás</span>
                  <span className="font-heading font-bold text-2xl text-gradient">
                    <EditableText initialText="80%" storageKey="grant-percent" />
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-border">
                  <span className="text-muted-foreground">Akkumulátor kapacitás</span>
                  <span className="font-heading font-bold text-lg">
                    <EditableText initialText="5-15 kWh" storageKey="grant-capacity" />
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-border">
                  <span className="text-muted-foreground">Pályázók köre</span>
                  <span className="font-heading font-bold text-lg">
                    <EditableText initialText="Lakosság" storageKey="grant-target" />
                  </span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-muted-foreground">Ügyintézési díj</span>
                  <span className="font-heading font-bold text-lg text-primary">
                    <EditableText initialText="Ingyenes*" storageKey="grant-fee" />
                  </span>
                </div>
              </div>

              <EditableText 
                initialText="*Sikeres pályázat esetén. Részletekért kérjen konzultációt!"
                storageKey="grant-disclaimer"
                className="text-sm text-muted-foreground mt-6 block"
                as="p"
              />
            </div>

            {/* Decorative element */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-secondary to-secondary/50 rounded-full blur-2xl opacity-50" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-primary to-primary/50 rounded-full blur-2xl opacity-30" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrantInfo;
