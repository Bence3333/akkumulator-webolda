import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, Send, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import EditableText from "@/components/EditableText";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import IconPicker, { getIconComponent } from "@/components/IconPicker";

interface ContactItem {
  id: string;
  icon_name: string;
  label: string;
  value: string;
  link_url: string | null;
  sort_order: number;
}

const Contact = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { isAdmin } = useAdmin();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const [extraItems, setExtraItems] = useState<ContactItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ icon_name: "info", label: "", value: "", link_url: "" });

  useEffect(() => {
    loadExtraItems();
  }, []);

  const loadExtraItems = async () => {
    const { data, error } = await supabase
      .from("contact_items")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (!error && data) {
      setExtraItems(data);
    }
  };

  const addExtraItem = async () => {
    if (!newItem.label.trim() || !newItem.value.trim()) return;
    
    const { error } = await supabase.from("contact_items").insert({
      icon_name: newItem.icon_name,
      label: newItem.label.trim(),
      value: newItem.value.trim(),
      link_url: newItem.link_url.trim() || null,
      sort_order: extraItems.length,
    });

    if (!error) {
      loadExtraItems();
      setNewItem({ icon_name: "info", label: "", value: "", link_url: "" });
      setShowAddItem(false);
      toast.success("Kapcsolati elem hozzáadva");
    }
  };

  const deleteExtraItem = async (id: string) => {
    const { error } = await supabase.from("contact_items").delete().eq("id", id);
    if (!error) {
      setExtraItems(extraItems.filter(i => i.id !== id));
      toast.success("Elem törölve");
    }
  };

  const updateExtraItem = async (id: string, field: keyof ContactItem, value: string) => {
    await supabase.from("contact_items").update({ [field]: value }).eq("id", id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Köszönjük üzenetét! Hamarosan felvesszük Önnel a kapcsolatot.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="kapcsolat" className="py-24 bg-muted/30">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm mb-4">
            Kapcsolat
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            <EditableText 
              initialText="Kérjen"
              storageKey="contact-title-1"
              className="inline"
            />
            {" "}
            <span className="text-gradient">
              <EditableText 
                initialText="Ingyenes Árajánlatot"
                storageKey="contact-title-2"
                className="inline"
              />
            </span>
          </h2>
          <EditableText 
            initialText="Vegye fel velünk a kapcsolatot és szakértőink segítenek a pályázat benyújtásában!"
            storageKey="contact-subtitle"
            className="text-muted-foreground text-lg block"
            as="p"
            multiline
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className={`space-y-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="font-heading text-xl font-semibold mb-6">
                <EditableText initialText="Elérhetőségeink" storageKey="contact-info-title" />
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Telefon</p>
                    <a href="tel:+36301234567" className="text-muted-foreground hover:text-primary transition-colors">
                      <EditableText initialText="+36 30 123 4567" storageKey="contact-phone" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:info@sparksolar.hu" className="text-muted-foreground hover:text-primary transition-colors">
                      <EditableText initialText="info@sparksolar.hu" storageKey="contact-email" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Cím</p>
                    <p className="text-muted-foreground">
                      <EditableText initialText="1234 Budapest, Nap utca 12." storageKey="contact-address" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Nyitvatartás</p>
                    <p className="text-muted-foreground">
                      <EditableText initialText="H-P: 8:00 - 17:00" storageKey="contact-hours" />
                    </p>
                  </div>
                </div>

                {/* Company name */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Cégnév</p>
                    <p className="text-muted-foreground">
                      <EditableText initialText="Spark Electric Kft." storageKey="contact-company" />
                    </p>
                  </div>
                </div>

                {/* Extra contact items from database */}
                {extraItems.map((item) => {
                  const IconComponent = getIconComponent(item.icon_name);
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      {isAdmin ? (
                        <IconPicker
                          value={item.icon_name}
                          onChange={(iconName) => updateExtraItem(item.id, "icon_name", iconName)}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        {isAdmin ? (
                          <>
                            <input
                              type="text"
                              defaultValue={item.label}
                              onBlur={(e) => updateExtraItem(item.id, "label", e.target.value)}
                              className="font-medium bg-transparent border-b border-border focus:border-primary outline-none w-full"
                            />
                            <input
                              type="text"
                              defaultValue={item.value}
                              onBlur={(e) => updateExtraItem(item.id, "value", e.target.value)}
                              className="text-muted-foreground bg-transparent border-b border-border focus:border-primary outline-none w-full text-sm mt-1"
                            />
                            <input
                              type="text"
                              defaultValue={item.link_url || ""}
                              onBlur={(e) => updateExtraItem(item.id, "link_url", e.target.value)}
                              placeholder="Link URL (opcionális)"
                              className="text-muted-foreground bg-transparent border-b border-border/50 focus:border-primary outline-none w-full text-xs mt-1"
                            />
                          </>
                        ) : (
                          <>
                            <p className="font-medium">{item.label}</p>
                            {item.link_url ? (
                              <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-muted-foreground">{item.value}</p>
                            )}
                          </>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => deleteExtraItem(item.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add new contact item (admin only) */}
                {isAdmin && (
                  <>
                    {showAddItem ? (
                      <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-dashed border-primary/30">
                        <IconPicker
                          value={newItem.icon_name}
                          onChange={(iconName) => setNewItem({ ...newItem, icon_name: iconName })}
                        />
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={newItem.label}
                            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                            placeholder="Címke (pl. Weboldal)"
                            className="bg-transparent border-b border-border focus:border-primary outline-none w-full"
                          />
                          <input
                            type="text"
                            value={newItem.value}
                            onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                            placeholder="Érték (pl. www.pelda.hu)"
                            className="text-muted-foreground bg-transparent border-b border-border focus:border-primary outline-none w-full text-sm"
                          />
                          <input
                            type="text"
                            value={newItem.link_url}
                            onChange={(e) => setNewItem({ ...newItem, link_url: e.target.value })}
                            placeholder="Link URL (opcionális)"
                            className="text-muted-foreground bg-transparent border-b border-border/50 focus:border-primary outline-none w-full text-xs"
                          />
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={addExtraItem}>Hozzáadás</Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowAddItem(false)}>Mégsem</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddItem(true)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Új kapcsolati elem hozzáadása
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`bg-card rounded-2xl p-8 shadow-card transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h3 className="font-heading text-xl font-semibold mb-6">
              <EditableText initialText="Írjon nekünk" storageKey="contact-form-title" />
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Teljes név
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Kovács János"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email cím
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="pelda@email.hu"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Telefonszám
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="+36 30 123 4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Üzenet
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Érdeklődöm a pályázattal kapcsolatban..."
                />
              </div>

              <Button type="submit" variant="hero" size="xl" className="w-full">
                Üzenet Küldése
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
