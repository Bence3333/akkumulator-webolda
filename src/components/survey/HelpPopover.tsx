import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle, X } from "lucide-react";

interface HelpPopoverProps {
  description: string;
}

export default function HelpPopover({ description }: HelpPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.button 
          type="button"
          className="p-0.5 rounded-full hover:bg-muted transition-colors flex-shrink-0 mt-0.5"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.button>
      </PopoverTrigger>
      <AnimatePresence>
        {isOpen && (
          <PopoverContent 
            className="max-w-xs relative overflow-hidden" 
            side="top"
            forceMount
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.button 
                type="button"
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-3 w-3" />
              </motion.button>
              <p className="text-sm pr-6">{description}</p>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}
