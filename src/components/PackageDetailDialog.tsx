import { useState } from "react";
import { Package } from "@/hooks/usePackages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sun, Zap, Battery, Check, Shield, Info, ChevronLeft, ChevronRight, Award } from "lucide-react";

interface PackageDetailDialogProps {
  pkg: Package;
  trigger?: React.ReactNode;
}

const getBrandLabel = (brand: string) => {
  const brands: Record<string, string> = {
    deye: "a Deye márka",
    huawei: "a Huawei márka",
    solax: "a SolaX márka",
    solaredge: "a SolarEdge márka",
    other: "ez a márka",
  };
  return brands[brand] || "ez a márka";
};

const PackageDetailDialog = ({ pkg, trigger }: PackageDetailDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const allImages = pkg.images.length > 0 ? pkg.images : (pkg.image_url ? [pkg.image_url] : []);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full gap-2">
            <Info className="h-4 w-4" />
            További információk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{pkg.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Carousel */}
          {allImages.length > 0 && (
            <div className="relative rounded-xl overflow-hidden bg-muted flex items-center justify-center min-h-[200px] max-h-[500px]">
              <img
                src={allImages[currentImageIndex]}
                alt={`${pkg.title} - ${currentImageIndex + 1}`}
                className="max-w-full max-h-[500px] w-auto h-auto object-contain"
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-primary" : "bg-background/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Main Specs */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
            <div className="text-center">
              <Sun className="h-10 w-10 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Napelem</p>
              <p className="text-xl font-bold">{pkg.power_kwp}</p>
            </div>
            <div className="text-center">
              <Zap className="h-10 w-10 mx-auto text-accent mb-2" />
              <p className="text-sm text-muted-foreground">Inverter</p>
              <p className="text-xl font-bold">{pkg.inverter_power}</p>
            </div>
            <div className="text-center">
              <Battery className="h-10 w-10 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Akkumulátor</p>
              <p className="text-xl font-bold">{pkg.battery_kwh}</p>
            </div>
          </div>

          {/* Price */}
          {pkg.price && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-primary">{pkg.price}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Tájékoztató jellegű ár, a végleges ár a helyszíni felmérés után kerül megállapításra.
              </p>
            </div>
          )}

          {/* Description */}
          {pkg.description && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Leírás
              </h4>
              <p className="text-muted-foreground">{pkg.description}</p>
            </div>
          )}

          {/* Detailed Description */}
          {pkg.detailed_description && (
            <div>
              <h4 className="font-semibold mb-2">Részletes információk</h4>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {pkg.detailed_description}
              </div>
            </div>
          )}

          {/* Why This Brand */}
          {pkg.brand_description && (
            <div className="p-4 border border-accent/30 rounded-lg bg-accent/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-accent">
                <Award className="h-5 w-5" />
                Miért pont {getBrandLabel(pkg.brand)}?
              </h4>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {pkg.brand_description}
              </div>
            </div>
          )}

          {/* Features */}
          {pkg.features.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">A csomag tartalma</h4>
              <ul className="grid md:grid-cols-2 gap-2">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warranty Info */}
          <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Shield className="h-5 w-5" />
              10 év garancia
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDetailDialog;