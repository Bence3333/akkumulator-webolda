import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import logo from "@/assets/sparksolar-logo-v2.png";
import { FileText, Shield } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="SparkSolar" className="h-12 md:h-14 w-auto object-contain" />
          </a>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-orange-500 font-medium bg-orange-500/10 px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/quotes")} className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajánlatkérések</span>
                </Button>
              </>
            )}
            <Button variant="hero" size="sm" onClick={() => navigate("/quote")}>
              Kérjen Ajánlatot
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
