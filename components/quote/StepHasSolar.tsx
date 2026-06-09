import { motion } from "framer-motion";
import { Sun, SunMedium } from "lucide-react";
import { QuoteFormData } from "@/pages/QuoteRequest";

interface Props {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
}

const StepHasSolar = ({ formData, updateFormData }: Props) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Van már napelemes rendszere?
        </h1>
        <p className="text-muted-foreground text-lg mb-12">
          A válasz alapján személyre szabott ajánlatot készítünk Önnek.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => updateFormData({ hasSolar: true })}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            formData.hasSolar === true
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
            formData.hasSolar === true ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
          }`}>
            <Sun className="w-10 h-10" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2">Igen, van</h3>
          <p className="text-muted-foreground text-sm">
            Már rendelkezem napelemes rendszerrel és bővíteni vagy karbantartani szeretném.
          </p>
          
          {formData.hasSolar === true && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => updateFormData({ hasSolar: false })}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            formData.hasSolar === false
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
            formData.hasSolar === false ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20"
          }`}>
            <SunMedium className="w-10 h-10" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2">Nem, nincs</h3>
          <p className="text-muted-foreground text-sm">
            Még nem rendelkezem napelemes rendszerrel és szeretnék telepíttetni.
          </p>
          
          {formData.hasSolar === false && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default StepHasSolar;
