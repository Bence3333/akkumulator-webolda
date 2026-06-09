import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CallbackModal = ({ isOpen, onClose }: CallbackModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Kérjük töltse ki az összes mezőt!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert callback request
      const { error } = await supabase.from("callback_requests").insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

      if (error) throw error;

      // Send email notification
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "callback",
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
      });

      toast.success("Visszahívás kérése sikeres! Hamarosan felvesszük Önnel a kapcsolatot.");
      setName("");
      setPhone("");
      setEmail("");
      onClose();
    } catch (error) {
      console.error("Error submitting callback request:", error);
      toast.error("Hiba történt, kérjük próbálja újra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 px-4 py-6 flex items-center justify-center"
          >
            <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold">Visszahívás kérése</h2>
                    <p className="text-sm text-muted-foreground">Hamarosan felhívjuk!</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="callback-name">Név *</Label>
                  <Input
                    id="callback-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Teljes név"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="callback-phone">Telefonszám *</Label>
                  <Input
                    id="callback-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+36 XX XXX XXXX"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="callback-email">E-mail cím *</Label>
                  <Input
                    id="callback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelda@email.hu"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Kérem a visszahívást"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CallbackModal;
