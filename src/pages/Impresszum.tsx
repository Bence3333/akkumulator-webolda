import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditableText from "@/components/EditableText";
import { useAdmin } from "@/contexts/AdminContext";

const Impresszum = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza
          </Button>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            <EditableText
              initialText="Impresszum"
              storageKey="impresszum-title"
              as="span"
            />
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-semibold mb-4">
              <EditableText
                initialText="Céginformációk"
                storageKey="impresszum-company-title"
                as="span"
              />
            </h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <EditableText
                initialText={`Cégnév: SparkSolar Kft.
Székhely: 1234 Budapest, Napfény utca 1.
Cégjegyzékszám: 01-09-123456
Adószám: 12345678-2-41
EU VAT szám: HU12345678

Képviselő: Minta János ügyvezető`}
                storageKey="impresszum-company-content"
                as="p"
                className="whitespace-pre-line text-muted-foreground"
                multiline
              />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mb-4">
              <EditableText
                initialText="Elérhetőségek"
                storageKey="impresszum-contact-title"
                as="span"
              />
            </h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <EditableText
                initialText={`Telefon: +36 1 234 5678
Email: info@sparksolar.hu
Weboldal: www.sparksolar.hu

Ügyfélszolgálat nyitvatartás:
Hétfő - Péntek: 8:00 - 17:00
Szombat - Vasárnap: Zárva`}
                storageKey="impresszum-contact-content"
                as="p"
                className="whitespace-pre-line text-muted-foreground"
                multiline
              />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mb-4">
              <EditableText
                initialText="Tárhelyszolgáltató"
                storageKey="impresszum-hosting-title"
                as="span"
              />
            </h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <EditableText
                initialText={`Név: Lovable Technologies Ltd.
Cím: 123 Tech Street, London, UK
Weboldal: www.lovable.dev`}
                storageKey="impresszum-hosting-content"
                as="p"
                className="whitespace-pre-line text-muted-foreground"
                multiline
              />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold mb-4">
              <EditableText
                initialText="Jogi nyilatkozat"
                storageKey="impresszum-legal-title"
                as="span"
              />
            </h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <EditableText
                initialText={`A weboldalon található tartalmak szerzői jogi védelem alatt állnak. A tartalmak másolása, terjesztése vagy bármilyen módon történő felhasználása csak a SparkSolar Kft. előzetes írásbeli engedélyével lehetséges.

A weboldalon található információk tájékoztató jellegűek, azok pontosságáért és teljességéért felelősséget nem vállalunk. A szolgáltatásainkra vonatkozó részletes feltételeket az egyedi szerződések tartalmazzák.`}
                storageKey="impresszum-legal-content"
                as="p"
                className="whitespace-pre-line text-muted-foreground"
                multiline
              />
            </div>
          </section>
        </div>

        {isAdmin && (
          <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-sm text-primary font-medium">
              🔧 Admin mód: Kattints bármelyik szövegre a szerkesztéshez
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Impresszum;
