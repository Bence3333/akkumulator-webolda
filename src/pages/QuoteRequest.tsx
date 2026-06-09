import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sun, SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { toast } from "@/hooks/use-toast";

import StepHasSolar from "@/components/quote/StepHasSolar";
import StepInverterBrand from "@/components/quote/StepInverterBrand";
import StepRoofDetails from "@/components/quote/StepRoofDetails";
import StepContactInfo from "@/components/quote/StepContactInfo";
import StepSuccess from "@/components/quote/StepSuccess";

export interface QuoteFormData {
  hasSolar: boolean | null;
  hasExistingSolar: boolean;
  inverterBrand: string;
  roofAngle: number;
  roofOrientation: string;
  roofType: string;
  annualConsumption: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  lat: number | null;
  lng: number | null;
  notes: string;
  images: File[];
  privacyAccepted: boolean;
}

const QuoteRequest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>({
    hasSolar: null,
    hasExistingSolar: false,
    inverterBrand: "",
    roofAngle: 30,
    roofOrientation: "south",
    roofType: "",
    annualConsumption: 5000,
    name: "",
    phone: "",
    email: "",
    address: "",
    lat: null,
    lng: null,
    notes: "",
    images: [],
    privacyAccepted: false,
  });

  const updateFormData = (data: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const getSteps = () => {
    if (formData.hasSolar === true) {
      return ["has_solar", "inverter_brand", "contact", "success"];
    } else if (formData.hasSolar === false) {
      return ["has_solar", "roof_details", "contact", "success"];
    }
    return ["has_solar"];
  };

  const steps = getSteps();
  const totalSteps = steps.length - 1; // Exclude success step from count

  const canProceed = () => {
    const step = steps[currentStep];
    if (step === "has_solar") return formData.hasSolar !== null;
    if (step === "inverter_brand") return formData.inverterBrand !== "";
    if (step === "roof_details") return formData.roofType !== "";
    if (step === "contact") {
      return formData.name && formData.phone && formData.email && formData.address && formData.privacyAccepted;
    }
    return true;
  };

  const handleNext = async () => {
    if (steps[currentStep + 1] === "success") {
      await handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    const isSuccess = steps[currentStep] === "success";
    if (currentStep === 0 || isSuccess) {
      navigate("/");
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload images if any
      const imageUrls: string[] = [];
      const base64Images: { base64: string; name: string }[] = [];
      
      for (const image of formData.images) {
        const fileName = `${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("quote-images")
          .upload(fileName, image);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("quote-images")
            .getPublicUrl(fileName);
          imageUrls.push(urlData.publicUrl);
        }

        // Convert image to base64 for external API
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data URL prefix (e.g., "data:image/png;base64,")
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(image);
          });
          base64Images.push({ base64, name: image.name });
        } catch (e) {
          console.error("Error converting image to base64:", e);
        }
      }

      // Map roof orientation to external API format
      const orientationMap: Record<string, string> = {
        south: "del",
        southeast: "delkelet",
        southwest: "delnyugat",
        east: "kelet",
        west: "nyugat",
        north: "eszak",
        flat: "laposteto",
      };

      // Map roof angle to external API format
      const getAngleRange = (angle: number): string => {
        if (angle < 15) return "0-15";
        if (angle < 30) return "15-30";
        if (angle < 45) return "30-45";
        return "45+";
      };

      // Determine has_solar value: true if either hasSolar step was "yes" OR hasExistingSolar checkbox is checked
      const hasSolarValue = formData.hasSolar || formData.hasExistingSolar;

      // Insert into external database (main business database)
      // Note: External DB uses different column names!
      const externalInsertData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        has_existing_solar: hasSolarValue,
        inverter_brand: formData.inverterBrand || null,
        roof_orientation: hasSolarValue ? null : formData.roofOrientation,
        roof_angle: hasSolarValue ? null : formData.roofAngle,
        roof_type: hasSolarValue ? null : (formData.roofType as any),
        annual_energy_kwh: hasSolarValue ? null : formData.annualConsumption,
        message: formData.notes || null,
        customer_type: "maganszemely",
      };
      console.log("QuoteRequest: External DB INSERT DATA:", JSON.stringify(externalInsertData, null, 2));
      
      const { error: saveError } = await externalSupabase.from("quote_requests").insert(externalInsertData);
      
      if (saveError) {
        console.error("QuoteRequest: External DB error:", saveError);
        throw saveError;
      }
      console.log("QuoteRequest: External DB save successful");

      // Send email notification and wait for it to complete
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "quote",
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          hasSolar: formData.hasSolar,
          inverterBrand: formData.inverterBrand,
          roofType: formData.roofType,
          roofOrientation: formData.roofOrientation,
          roofAngle: formData.roofAngle,
          annualConsumption: formData.annualConsumption,
          images: imageUrls,
        },
      });

      setCurrentStep(prev => prev + 1);
      toast({
        title: "Sikeres beküldés!",
        description: "Hamarosan felvesszük Önnel a kapcsolatot.",
      });
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast({
        title: "Hiba történt",
        description: "Kérjük próbálja újra később.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    switch (step) {
      case "has_solar":
        return <StepHasSolar formData={formData} updateFormData={updateFormData} />;
      case "inverter_brand":
        return <StepInverterBrand formData={formData} updateFormData={updateFormData} />;
      case "roof_details":
        return <StepRoofDetails formData={formData} updateFormData={updateFormData} />;
      case "contact":
        return <StepContactInfo formData={formData} updateFormData={updateFormData} showImages={!formData.hasSolar} />;
      case "success":
        return <StepSuccess />;
      default:
        return null;
    }
  };

  const isSuccess = steps[currentStep] === "success";

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Vissza
          </Button>
          
          {!isSuccess && (
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < currentStep ? "bg-primary" : i === currentStep ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
          
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 pt-24 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      {!isSuccess && (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vissza
            </Button>
            
            <Button 
              variant="hero" 
              onClick={handleNext} 
              disabled={!canProceed() || isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                "Küldés..."
              ) : steps[currentStep + 1] === "success" ? (
                <>
                  Beküldés
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Tovább
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default QuoteRequest;
