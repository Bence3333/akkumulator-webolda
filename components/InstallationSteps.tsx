import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ChevronRight } from 'lucide-react';
import EditableText from '@/components/EditableText';

const steps = [
  {
    number: "01",
    titleKey: "step-1-title",
    descKey: "step-1-desc",
    defaultTitle: "Konzultáció",
    defaultDesc: "Igényfelmérés és helyszíni szemle"
  },
  {
    number: "02",
    titleKey: "step-2-title",
    descKey: "step-2-desc",
    defaultTitle: "Tervezés",
    defaultDesc: "Egyedi rendszerterv készítése"
  },
  {
    number: "03",
    titleKey: "step-3-title",
    descKey: "step-3-desc",
    defaultTitle: "Engedélyek",
    defaultDesc: "Teljes körű ügyintézés"
  },
  {
    number: "04",
    titleKey: "step-4-title",
    descKey: "step-4-desc",
    defaultTitle: "Telepítés",
    defaultDesc: "Professzionális kivitelezés"
  },
  {
    number: "05",
    titleKey: "step-5-title",
    descKey: "step-5-desc",
    defaultTitle: "Átadás",
    defaultDesc: "Betanítás és dokumentáció"
  }
];

const InstallationSteps = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="installation" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <EditableText 
              initialText="Telepítési Folyamat"
              storageKey="installation-title"
            />
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <EditableText 
              initialText="Egyszerű és átlátható folyamat az elejétől a végéig"
              storageKey="installation-subtitle"
            />
          </p>
        </div>

        <div 
          ref={ref}
          className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex flex-col md:flex-row items-stretch justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex-1 px-4 lg:px-6 py-8 text-center md:text-left min-w-0">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3">
                    {step.number}
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">
                    <EditableText 
                      initialText={step.defaultTitle}
                      storageKey={step.titleKey}
                    />
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    <EditableText 
                      initialText={step.defaultDesc}
                      storageKey={step.descKey}
                    />
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center px-2 self-center">
                    <ChevronRight className="w-8 h-8 text-muted-foreground/50" strokeWidth={2} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstallationSteps;
