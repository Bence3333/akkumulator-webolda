import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CallbackModal from "@/components/CallbackModal";
import { CheckCircle2, Home, Phone } from "lucide-react";

const StepSuccess = () => {
  const navigate = useNavigate();
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  return (
    <>
      <CallbackModal
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
      />

      <div className="max-w-xl mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-3xl md:text-4xl font-bold mb-4"
        >
          Köszönjük az ajánlatkérést!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg mb-8"
        >
          Munkatársunk hamarosan felveszi Önnel a kapcsolatot a megadott elérhetőségeken.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card p-6 rounded-2xl border border-border mb-8"
        >
          <h3 className="font-semibold mb-3">Mi történik ezután?</h3>
          <ul className="text-left text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <span>24 órán belül felvesszük Önnel a kapcsolatot</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <span>Személyre szabott ajánlatot készítünk</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <span>Helyszíni felmérést végzünk ingyenesen</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="hero" onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            Vissza a főoldalra
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsCallbackModalOpen(true)}
          >
            <Phone className="w-4 h-4" />
            Hívjon minket
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default StepSuccess;
