import { useState } from "react";
import { 
  Phone, Mail, MapPin, Clock, Info, Globe, 
  MessageCircle, Headphones, Building, Users,
  Calendar, FileText, Shield, Heart, Star,
  Zap, Sun, Home, Briefcase, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  clock: Clock,
  info: Info,
  globe: Globe,
  "message-circle": MessageCircle,
  headphones: Headphones,
  building: Building,
  users: Users,
  calendar: Calendar,
  "file-text": FileText,
  shield: Shield,
  heart: Heart,
  star: Star,
  zap: Zap,
  sun: Sun,
  home: Home,
  briefcase: Briefcase,
  award: Award,
};

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Info;
};

const IconPicker = ({ value, onChange, disabled }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const CurrentIcon = getIconComponent(value);

  if (disabled) {
    return (
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <CurrentIcon className="w-5 h-5 text-primary" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0 bg-primary/10 border-primary/30 hover:bg-primary/20 rounded-xl"
        >
          <CurrentIcon className="w-5 h-5 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(iconMap).map(([name, Icon]) => (
            <Button
              key={name}
              variant={value === name ? "default" : "ghost"}
              size="sm"
              className="w-10 h-10 p-0"
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
