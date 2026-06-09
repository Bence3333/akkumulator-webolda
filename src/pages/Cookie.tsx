import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import { useAdmin } from "@/contexts/AdminContext";

const Cookie = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a főoldalra
          </button>

          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
            <EditableText 
              initialText="Cookie (Süti) Tájékoztató" 
              storageKey="cookie-page-title" 
            />
          </h1>

          {isAdmin && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                Admin mód: Kattints a szövegre a szerkesztéshez
              </p>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <EditableText 
              initialText={`1. Mi az a cookie (süti)?

A cookie (süti) egy kisméretű szöveges fájl, amelyet a weboldal helyez el az Ön számítógépén vagy mobileszközén, amikor meglátogatja oldalunkat.

2. Milyen sütiket használunk?

Elengedhetetlenül szükséges sütik:
Ezek a sütik nélkülözhetetlenek a weboldal működéséhez. Lehetővé teszik az alapvető funkciók használatát.

Teljesítmény sütik:
Ezek a sütik információkat gyűjtenek arról, hogyan használják a látogatók a weboldalt, például melyik oldalakat látogatják a leggyakrabban.

Funkcionális sütik:
Ezek a sütik lehetővé teszik, hogy a weboldal megjegyezze az Ön választásait (például a felhasználónevet vagy a nyelvi beállításokat).

Marketing sütik:
Ezeket a sütiket arra használjuk, hogy releváns hirdetéseket jelenítsünk meg Önnek.

3. A sütik kezelése

Böngészője beállításaiban bármikor módosíthatja a sütik elfogadását. A legtöbb böngészőben lehetőség van:
- Az összes süti letiltására
- Csak bizonyos típusú sütik engedélyezésére
- Értesítés kérésére, mielőtt egy süti mentésre kerül

4. Kapcsolat

Ha kérdése van a sütik használatával kapcsolatban, kérjük, lépjen kapcsolatba velünk a weboldalon található elérhetőségeken.

Utolsó frissítés: 2025. január`}
              storageKey="cookie-page-content"
              className="whitespace-pre-wrap"
              as="div"
              multiline
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookie;
