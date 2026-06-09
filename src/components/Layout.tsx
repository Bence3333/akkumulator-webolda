import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, MessageCircle, MessageSquare, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/spark-solar-logo.png";
import colorLogo from "@/assets/spark-solar-logo-color.png";
import { ThemeToggle } from "./ThemeToggle";
import { useChatPanel } from "./GlobalOverlays";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { setIsChatPanelOpen } = useChatPanel();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  
  const publicNavLinks = [
    { href: "/", label: "Főoldal" },
    { href: "/szolgaltatasok", label: "Szolgáltatások" },
    { href: "/csomagok", label: "Csomagajánlatok" },
    { href: "/palyazatok", label: "Pályázatok" },
    { href: "/referenciak", label: "Referenciák" },
    { href: "/kapcsolat", label: "Kapcsolat" },
    { href: "/gyik", label: "GYIK" },
  ];

  const adminMenuItems = [
    { href: "/ugyfelek", label: "Ügyfelek" },
    { href: "/telepitesi-naptar", label: "Telepítési naptár" },
    { href: "/ajanlatok", label: "Ajánlatkérések" },
    { href: "/arajanlat-keszites-pro", label: "Árajánlatkészítő" },
    { href: "/mentett-arajanlatok", label: "Mentett árajánlatok" },
    { href: "/termekek", label: "Termékek" },
    { href: "/email-sablonok", label: "E-mail sablonok" },
    { href: "/beallitasok", label: "Beállítások" },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  const isAdminActive = adminMenuItems.some(item => location.pathname === item.href);
  
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  const isHomePage = location.pathname === "/";
  
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Combined header with smooth gradient */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500`}>
        {/* Unified background - seamless gradient */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isScrolled 
            ? 'bg-background/80 dark:bg-[#04131d]/80 backdrop-blur-md border-b border-border' 
            : 'bg-[#04131d]/95'
        }`} />
        
        {/* Top info bar - only visible when not scrolled */}
        <div className={`relative transition-all duration-500 ${
          isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'
        }`}>
          <div className="container mx-auto px-4">
            <div className="hidden lg:flex items-center justify-between h-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/60 text-[11px]">
                  <MessageCircle className="h-2.5 w-2.5" />
                  <span>info@sparksolar.hu</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="flex items-center gap-0.5 text-white/60 hover:text-white text-[11px] transition-colors">
                      Admin
                      <ChevronDown className="h-2.5 w-2.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
                      {adminMenuItems.map((item) => (
                        <DropdownMenuItem 
                          key={item.href}
                          onClick={() => navigate(item.href)}
                          className={`cursor-pointer ${isActive(item.href) ? "bg-primary/10 text-primary" : ""}`}
                        >
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setIsChatPanelOpen(true)}
                        className="cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <ThemeToggle isScrolled={isScrolled} />
                {user ? (
                  <button onClick={handleLogout} className="flex items-center gap-1 text-white/60 hover:text-white text-[11px] transition-colors">
                    <LogOut className="h-2.5 w-2.5" />
                    <span>Kilépés</span>
                  </button>
                ) : (
                  <Link to="/belepes" className="flex items-center gap-1 text-white/60 hover:text-white text-[11px] transition-colors">
                    <LogIn className="h-2.5 w-2.5" />
                    <span>Belépés</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom navigation bar */}
        <nav className="relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Logo */}
            <Link to="/" className="flex lg:hidden items-center">
              <img src={logo} alt="Spark Solar Logo" className="h-10" />
            </Link>

            {/* Desktop: Logo on left */}
            <Link to="/" className="hidden lg:flex items-center">
              <img src={isScrolled ? colorLogo : logo} alt="Spark Solar Logo" className="h-12 transition-all" />
            </Link>

            {/* Desktop: Centered Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center gap-1">
                {publicNavLinks.map(link => (
                  <Link 
                    key={link.href} 
                    to={link.href} 
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                      isActive(link.href) 
                        ? "text-primary" 
                        : isScrolled 
                          ? "text-foreground/80 hover:text-foreground" 
                          : "text-white/80 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - CTA button */}
            <div className="hidden lg:flex items-center">
              <Link to="/ajanlatkeres" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-all">
                Ajánlatkérés
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className={`lg:hidden p-2 ${isScrolled ? 'text-foreground' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && <div className="lg:hidden py-6 border-t border-border animate-slide-up">
              <div className="flex flex-col gap-2">
                {publicNavLinks.map(link => (
                  <Link 
                    key={link.href} 
                    to={link.href} 
                    onClick={() => setIsOpen(false)} 
                    className={`px-4 py-3 font-medium transition-colors rounded-lg ${
                      isActive(link.href) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Admin items in mobile */}
                {user && (
                  <>
                    <div className="border-t border-border my-2 pt-2">
                      <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Admin
                      </p>
                    </div>
                    {adminMenuItems.map(item => (
                      <Link 
                        key={item.href} 
                        to={item.href} 
                        onClick={() => setIsOpen(false)} 
                        className={`px-4 py-3 font-medium transition-colors rounded-lg ${
                          isActive(item.href) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        setIsChatPanelOpen(true);
                      }}
                      className="px-4 py-3 font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted text-left flex items-center gap-2 rounded-lg"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </button>
                  </>
                )}
                
                <Link to="/ajanlatkeres" onClick={() => setIsOpen(false)} className="mx-4 mt-4 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-center rounded-lg">
                  Ajánlatkérés
                </Link>
              </div>
            </div>}
        </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <img src={logo} alt="Spark Solar Logo" className="h-12 mb-4" />
              <p className="text-muted-foreground max-w-md">
                Professzionális napelemes rendszerek telepítése magánszemélyek és vállalkozások számára. 
                Forduljon hozzánk a fenntartható jövőért!
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Navigáció</h4>
              <div className="flex flex-col gap-2">
                {publicNavLinks.map(link => (
                  <Link 
                    key={link.href} 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Elérhetőség</h4>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <p>+36 30 123 4567</p>
                <p>info@sparksolar.hu</p>
                <p>1234 Budapest</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground text-sm">
            © 2024 Spark Solar. Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </div>;
};
export default Layout;
