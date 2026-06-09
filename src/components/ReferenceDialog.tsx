import { Sun, Building2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Reference } from "@/hooks/useReferences";

interface ReferenceDialogProps {
  reference: Reference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReferenceDialog = ({ reference, open, onOpenChange }: ReferenceDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!reference) return null;

  const images = reference.images?.filter(img => img) || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-wider mb-2">
            {reference.category === "lakossagi" ? (
              <>
                <Sun className="h-4 w-4" />
                Lakossági
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                Ipari
              </>
            )}
            <span className="ml-auto text-muted-foreground">{reference.year}</span>
          </div>
          <DialogTitle className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {reference.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {reference.description}
          </DialogDescription>
        </DialogHeader>

        {/* Image Gallery */}
        {hasImages && (
          <div className="relative aspect-video bg-background border border-border overflow-hidden mt-4">
            <img
              src={images[currentImageIndex]}
              alt={reference.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentImageIndex ? "bg-primary" : "bg-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!hasImages && (
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center mt-4 border border-border">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(142_76%_45%_/_0.05)_25%,hsl(142_76%_45%_/_0.05)_50%,transparent_50%,transparent_75%,hsl(142_76%_45%_/_0.05)_75%)] bg-[length:20px_20px]" />
            {reference.category === "lakossagi" ? (
              <Sun className="h-20 w-20 text-primary/30" />
            ) : (
              <Building2 className="h-20 w-20 text-primary/30" />
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-8 py-4 border-y border-border mt-4">
          <div>
            <div className="text-sm text-muted-foreground">Teljesítmény</div>
            <div className="font-display text-2xl font-bold text-primary">{reference.power}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Panelek száma</div>
            <div className="font-display text-2xl font-bold text-foreground">{reference.panels}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Telepítés éve</div>
            <div className="font-display text-2xl font-bold text-foreground">{reference.year}</div>
          </div>
        </div>

        {/* Detailed Description */}
        {reference.detailed_description && (
          <div className="mt-4">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Projekt részletei
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {reference.detailed_description}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceDialog;
