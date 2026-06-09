import { motion } from "framer-motion";
import { QuoteFormData } from "@/pages/QuoteRequest";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
}

const INVERTER_BRANDS = [
  { id: "deye", name: "Deye" },
  { id: "huawei", name: "Huawei" },
  { id: "growatt", name: "Growatt" },
  { id: "solaredge", name: "SolarEdge" },
  { id: "fronius", name: "Fronius" },
];

const StepInverterBrand = ({ formData, updateFormData }: Props) => {
  const isOtherSelected = formData.inverterBrand && !INVERTER_BRANDS.some(b => b.name === formData.inverterBrand);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Milyen márkájú az invertere?
        </h1>
        <p className="text-muted-foreground text-lg mb-12">
          Válassza ki a meglévő napelemes rendszerének inverter márkáját.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {INVERTER_BRANDS.map((brand, index) => (
          <motion.button
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => updateFormData({ inverterBrand: brand.name })}
            className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
              formData.inverterBrand === brand.name
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <h3 className="font-heading text-lg font-semibold">{brand.name}</h3>
            
            {formData.inverterBrand === brand.name && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* Other option */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + INVERTER_BRANDS.length * 0.05 }}
          onClick={() => updateFormData({ inverterBrand: "Egyéb" })}
          className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
            isOtherSelected
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <h3 className="font-heading text-lg font-semibold">Egyéb</h3>
          
          {isOtherSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Custom input for "Other" */}
      {isOtherSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="max-w-md mx-auto"
        >
          <Label htmlFor="customBrand" className="text-left block mb-2">
            Írja be az inverter márkáját
          </Label>
          <Input
            id="customBrand"
            value={formData.inverterBrand === "Egyéb" ? "" : formData.inverterBrand}
            onChange={(e) => updateFormData({ inverterBrand: e.target.value || "Egyéb" })}
            placeholder="pl. Goodwe, Sungrow..."
            className="text-center"
          />
        </motion.div>
      )}
    </div>
  );
};

export default StepInverterBrand;
