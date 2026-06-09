import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import { useAdmin } from "@/contexts/AdminContext";

const Privacy = () => {
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
            Adatvédelmi Tájékoztató
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <EditableText
              initialText={`1. Az adatkezelő megnevezése

SparkSolar Kft.
Székhely: 1234 Budapest, Nap utca 12.
E-mail: info@sparksolar.hu
Telefon: +36 30 123 4567

2. Az adatkezelés célja

Személyes adatait kizárólag az Ön által igényelt szolgáltatás nyújtása, kapcsolattartás és tájékoztatás céljából kezeljük.

3. A kezelt adatok köre

- Név
- E-mail cím
- Telefonszám
- Lakcím/Telepítési cím
- Ingatlannal kapcsolatos adatok (tetőtípus, fogyasztás)

4. Az adatkezelés jogalapja

Az Ön önkéntes hozzájárulása, amelyet az ajánlatkérés vagy visszahívás kérése során ad meg.

5. Az adatkezelés időtartama

Személyes adatait az adatkezelési cél megvalósulásáig, de legfeljebb 5 évig őrizzük meg.

6. Adattovábbítás

Személyes adatait harmadik félnek nem adjuk át, kivéve, ha erre jogszabály kötelez minket.

7. Az érintettek jogai

Ön bármikor kérheti személyes adatai törlését, módosítását, vagy tájékoztatást kérhet az adatkezelésről.

8. Kapcsolat

Adatvédelmi kérdésekben kérjük, forduljon hozzánk a fenti elérhetőségeken.`}
              storageKey="privacy-policy-content"
              className="text-foreground/80 whitespace-pre-wrap"
              as="div"
              multiline
            />
          </div>

          {isAdmin && (
            <p className="mt-8 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              Admin mód: Kattintson a szövegre a szerkesztéshez.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;