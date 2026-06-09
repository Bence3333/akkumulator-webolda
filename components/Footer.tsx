import { Facebook, Plus, Trash2, ExternalLink, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/sparksolar-logo-v2.png";
import EditableText from "@/components/EditableText";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FooterLink {
  id: string;
  title: string;
  url: string;
  sort_order: number;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAdmin, user, logout } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [showAddLink, setShowAddLink] = useState(false);

  // SEO Keywords
  const seoKeywords = [
    "lakossági energiatároló pályázat",
    "lakossági energiatároló támogatás 2026",
    "akkumulátor pályázat 2026",
    "80% támogatás",
    "Napelemes energiatároló"
  ];

  useEffect(() => {
    loadFooterLinks();
  }, []);

  const loadFooterLinks = async () => {
    const { data, error } = await supabase
      .from("footer_links")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (!error && data) {
      setFooterLinks(data);
    }
  };

  const addFooterLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    
    const { error } = await supabase.from("footer_links").insert({
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
      sort_order: footerLinks.length,
    });

    if (!error) {
      loadFooterLinks();
      setNewLinkTitle("");
      setNewLinkUrl("");
      setShowAddLink(false);
      toast({ title: "Link hozzáadva" });
    }
  };

  const deleteFooterLink = async (id: string) => {
    const { error } = await supabase.from("footer_links").delete().eq("id", id);
    if (!error) {
      setFooterLinks(footerLinks.filter(l => l.id !== id));
      toast({ title: "Link törölve" });
    }
  };

  const updateFooterLink = async (id: string, title: string, url: string) => {
    await supabase.from("footer_links").update({ title, url }).eq("id", id);
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Kijelentkezve" });
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <img src={logo} alt="SparkSolar" className="h-10 w-auto" />
            <EditableText 
              initialText="Megbízható partner a napenergia hasznosításában. Segítünk az energiafüggetlenség felé vezető úton."
              storageKey="footer-description"
              className="text-background/70 block"
              as="p"
              multiline
            />
            <div className="flex gap-4">
              <a 
                href="https://facebook.com/sparkvill.hu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Szolgáltatások</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">
                  Napelem Telepítés
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">
                  Akkumulátor Telepítés
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">
                  Pályázati Ügyintézés
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">
                  Karbantartás
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Kapcsolat</h4>
            <ul className="space-y-3 text-background/70">
              <li>
                <EditableText initialText="Spark Electric Kft." storageKey="footer-company" />
              </li>
              <li>
                <EditableText initialText="+36 30 123 4567" storageKey="footer-phone" />
              </li>
              <li>
                <EditableText initialText="info@sparksolar.hu" storageKey="footer-email" />
              </li>
              <li>
                <EditableText initialText="1234 Budapest, Nap utca 12." storageKey="footer-address" />
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Hasznos linkek</h4>
            <ul className="space-y-3 text-background/70">
              {footerLinks.map((link) => (
                <li key={link.id} className="flex items-center gap-2">
                  {isAdmin ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        defaultValue={link.title}
                        onBlur={(e) => updateFooterLink(link.id, e.target.value, link.url)}
                        className="bg-transparent border-b border-background/30 focus:border-primary outline-none flex-1 text-sm"
                      />
                      <input
                        type="text"
                        defaultValue={link.url}
                        onBlur={(e) => updateFooterLink(link.id, link.title, e.target.value)}
                        className="bg-transparent border-b border-background/30 focus:border-primary outline-none w-24 text-xs"
                        placeholder="URL"
                      />
                      <button
                        onClick={() => deleteFooterLink(link.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {link.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))}
              
              {isAdmin && (
                <>
                  {showAddLink ? (
                    <li className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Link címe"
                        className="bg-transparent border-b border-background/30 focus:border-primary outline-none flex-1 text-sm"
                      />
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="URL"
                        className="bg-transparent border-b border-background/30 focus:border-primary outline-none w-24 text-xs"
                      />
                      <button onClick={addFooterLink} className="text-green-400 hover:text-green-300">
                        <Plus className="w-4 h-4" />
                      </button>
                    </li>
                  ) : (
                    <li>
                      <button
                        onClick={() => setShowAddLink(true)}
                        className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Link hozzáadása
                      </button>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>

        {/* SEO Keywords */}
        <div className="border-t border-background/10 mt-12 pt-8">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {seoKeywords.map((keyword, index) => (
              <span 
                key={index}
                className="text-background/40 text-xs px-3 py-1 bg-background/5 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            <EditableText 
              initialText={`© ${currentYear} Spark Electric Kft. Minden jog fenntartva.`}
              storageKey="footer-copyright"
            />
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/adatkezelesi-tajekoztato" className="text-background/50 hover:text-primary transition-colors">
              Adatkezelési tájékoztató
            </Link>
            <Link to="/cookie" className="text-background/50 hover:text-primary transition-colors">
              Cookie tájékoztató
            </Link>
            <Link to="/impresszum" className="text-background/50 hover:text-primary transition-colors">
              Impresszum
            </Link>
          </div>
        </div>

        {/* Admin Login/Logout */}
        <div className="mt-8 pt-4 border-t border-background/5">
          {user ? (
            <div className="flex items-center justify-center gap-4">
              <span className="text-background/50 text-xs">
                {isAdmin ? "Admin mód aktív" : "Bejelentkezve"} ({user.email})
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-background/30 hover:text-background/50 text-xs gap-1"
              >
                <LogOut className="w-3 h-3" />
                Kijelentkezés
              </Button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center justify-center gap-1 mx-auto text-background/20 hover:text-background/40 transition-colors text-xs"
            >
              <LogIn className="w-3 h-3" />
              <span>Admin belépés</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
