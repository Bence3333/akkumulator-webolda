import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, Sparkles } from "lucide-react";
import packagesPreview from "@/assets/packages-preview.png";

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after 5 seconds - only once per day using localStorage
    const lastShown = localStorage.getItem("welcomePopupShownAt");
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    const shouldShow = !lastShown || (now - parseInt(lastShown)) > oneDayMs;
    
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("welcomePopupShownAt", now.toString());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGoToPackages = () => {
    setIsOpen(false);
    const packagesSection = document.getElementById("packages");
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-0 gap-0">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors border border-border"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left side - Content */}
          <div className="bg-gradient-to-br from-background to-muted p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">Pályázatírás, tervezés, kivitelezés</span>
            </div>
            
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary leading-tight mb-2">
              Akciós energiatároló
            </h2>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary leading-tight mb-6">
              csomagok
            </h2>
            
            <p className="text-foreground font-semibold text-lg mb-1">
              MINDEN EGY HELYEN,
            </p>
            <p className="text-primary font-bold text-xl mb-8">
              GYORSAN ÉS GÖRDÜLÉKENYEN!
            </p>
            
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleGoToPackages}
              className="w-fit group"
            >
              Ajánlatok böngészése
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Right side - Image */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 hidden md:flex items-center justify-center">
            <img 
              src={packagesPreview}
              alt="Csomagajánlatok"
              className="w-full max-w-sm object-contain rounded-lg shadow-card"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
