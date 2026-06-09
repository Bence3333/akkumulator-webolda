import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, X, ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/sparksolar-logo-v2.png";
import fazisszamImg from "@/assets/adatbekero/fazisszam.png";
import inverterTavoliImg from "@/assets/adatbekero/inverter-tavoli.jpg";
import inverterAdattablaImg from "@/assets/adatbekero/inverter-adattabla.jpg";
import inverterAljaImg from "@/assets/adatbekero/inverter-alja.jpg";
import lakaselosztoPeldaImg from "@/assets/adatbekero/lakaseloszto-pelda.png";
import lakaselosztoMaszkImg from "@/assets/adatbekero/lakaseloszto-maszk.jpg";
import szamlaNevImg from "@/assets/adatbekero/szamla-nev.png";
import szamlaCimImg from "@/assets/adatbekero/szamla-cim.png";
import szamlaMeroGyariImg from "@/assets/adatbekero/szamla-mero-gyari.png";
import szamlaPodImg from "@/assets/adatbekero/szamla-pod.png";
import szamlaFelhasznaloAzonositoImg from "@/assets/adatbekero/szamla-felhasznalo-azonosito.png";
import amper1FazisImg from "@/assets/adatbekero/amper-1fazis.png";
import amper2FazisImg from "@/assets/adatbekero/amper-2fazis.png";
import amper3FazisImg from "@/assets/adatbekero/amper-3fazis.png";
import meroPeldaImg from "@/assets/adatbekero/mero-pelda.png";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  name: string;
  url: string;
}

const INVERTER_BRANDS = [
  "Huawei", "Deye", "SolaX", "ABB", "Fronius", "GoodWe", "Growatt",
  "Kaco", "SAJ", "SMA", "Sofar", "SolarEdge", "Solinteg", "Solis", "Solplanet", "Egyéb"
];

const STRING_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const SZOLGALTATOK = [
  "ELMŰ/E.ON szolgáltató",
  "ÉMÁSZ szolgáltató",
  "DÉMÁSZ szolgáltató",
  "Opus-Titász szolgáltató",
];

const ROOF_TYPES = ["Cserép", "Lemez", "Zsindely", "Pala", "Gerard", "Lapostető", "Földi tartószerkezet"];

export default function Adatbekero() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1 - Alapadatok
  const [email, setEmail] = useState("");
  const [palyazoElter, setPalyazoElter] = useState("");
  const [palyazoFelNeve, setPalyazoFelNeve] = useState("");
  const [hasSolar, setHasSolar] = useState("");
  const [fazisok, setFazisok] = useState("");

  // Step 2 - Inverter (conditional)
  const [inverterMarka, setInverterMarka] = useState("");
  const [inverterTipus, setInverterTipus] = useState("");
  const [inverterTeljesitmeny, setInverterTeljesitmeny] = useState("");
  const [inverterFazis, setInverterFazis] = useState("");
  const [inverterSzeriaszam, setInverterSzeriaszam] = useState("");

  // Step 3 - Napelemek (conditional)
  const [optimalizalt, setOptimalizalt] = useState("");
  const [napelemDarab, setNapelemDarab] = useState("");
  const [napelemTeljesitmeny, setNapelemTeljesitmeny] = useState("");
  const [napelemOsszteljesitmeny, setNapelemOsszteljesitmeny] = useState("");
  const [stringekSzama, setStringekSzama] = useState("");

  // Step 4 - Fotók (conditional)
  const [arajanlat, setArajanlat] = useState<UploadedFile[]>([]);
  const [inverterTavoli, setInverterTavoli] = useState<UploadedFile[]>([]);
  const [inverterAdattabla, setInverterAdattabla] = useState<UploadedFile[]>([]);
  const [inverterAlja, setInverterAlja] = useState<UploadedFile[]>([]);

  // Step 5 - Szolgáltató
  const [szolgaltato, setSzolgaltato] = useState("");

  // Step 6 - Ingatlan
  const [tetoTipus, setTetoTipus] = useState("");
  const [arnyekolo, setArnyekolo] = useState("");
  const [tetoFotok, setTetoFotok] = useState<UploadedFile[]>([]);

  // Step 7 - Lakáselosztó + megjegyzés
  const [lakaselosztoFoto, setLakaselosztoFoto] = useState<UploadedFile[]>([]);
  const [megjegyzes, setMegjegyzes] = useState("");
  const [consent, setConsent] = useState(false);

  // Step 8 - Pályázó személyes adatai (ELMŰ/EON: conditional, ÉMÁSZ: always)
  const [palyazoNev, setPalyazoNev] = useState("");
  const [szuletesiNev, setSzuletesiNev] = useState("");
  const [anyjaNeve, setAnyjaNeve] = useState("");
  const [szuletesiHely, setSzuletesiHely] = useState("");
  const [szuletesiDatum, setSzuletesiDatum] = useState("");
  const [allandoLakcim, setAllandoLakcim] = useState("");
  const [szemelyiSzam, setSzemelyiSzam] = useState("");
  const [adoazonositoJel, setAdoazonositoJel] = useState("");
  const [palyazoEmail, setPalyazoEmail] = useState("");
  const [palyazoTelefon, setPalyazoTelefon] = useState("");
  // ÉMÁSZ split address fields
  const [allandoLakcimIrszam, setAllandoLakcimIrszam] = useState("");
  const [allandoLakcimTelepules, setAllandoLakcimTelepules] = useState("");
  const [allandoLakcimUtca, setAllandoLakcimUtca] = useState("");

  // Step 9 - Villanyszámla & mérőóra adatok
  const [villanyszamlaFotok, setVillanyszamlaFotok] = useState<UploadedFile[]>([]);
  const [felhasznaloNev, setFelhasznaloNev] = useState("");
  const [felhasznaloTelefon, setFelhasznaloTelefon] = useState("");
  const [felhasznaloEmail, setFelhasznaloEmail] = useState("");
  const [felhasznalasiCim, setFelhasznalasiCim] = useState("");
  const [helyrajziSzam, setHelyrajziSzam] = useState("");
  const [meroGyariSzam, setMeroGyariSzam] = useState("");
  const [podAzonosito, setPodAzonosito] = useState("");
  const [felhasznaloAzonosito, setFelhasznaloAzonosito] = useState("");
  const [bankszamlaszam, setBankszamlaszam] = useState("");
  const [amper1, setAmper1] = useState("");
  const [amper2, setAmper2] = useState("");
  const [amper3, setAmper3] = useState("");
  const [meroFoto, setMeroFoto] = useState<UploadedFile[]>([]);

  // ÉMÁSZ-specific villanyszámla fields
  const [szamlaSzuletesiNev, setSzamlaSzuletesiNev] = useState("");
  const [szamlaAnyjaNeve, setSzamlaAnyjaNeve] = useState("");
  const [szamlaSzuletesiHely, setSzamlaSzuletesiHely] = useState("");
  const [szamlaSzuletesiDatum, setSzamlaSzuletesiDatum] = useState("");
  const [szamlaLevelezesiCim, setSzamlaLevelezesiCim] = useState("");
  const [felhasznalasiCimIrszam, setFelhasznalasiCimIrszam] = useState("");
  const [felhasznalasiCimTelepules, setFelhasznalasiCimTelepules] = useState("");
  const [felhasznalasiCimUtca, setFelhasznalasiCimUtca] = useState("");
  const [felhasznalasiCimHazszam, setFelhasznalasiCimHazszam] = useState("");
  const [meroGyariSzamVezerelt, setMeroGyariSzamVezerelt] = useState("");
  const [meroGyariSzamHTarifa, setMeroGyariSzamHTarifa] = useState("");
  const [podAzonositoVezerelt, setPodAzonositoVezerelt] = useState("");
  const [podAzonositoHTarifa, setPodAzonositoHTarifa] = useState("");
  // ÉMÁSZ extra amper fields
  const [amperOsszeg, setAmperOsszeg] = useState("");
  const [amperVezerelt1, setAmperVezerelt1] = useState("");
  const [amperVezerelt2, setAmperVezerelt2] = useState("");
  const [amperVezerelt3, setAmperVezerelt3] = useState("");
  const [amperHTarifa1, setAmperHTarifa1] = useState("");
  const [amperHTarifa2, setAmperHTarifa2] = useState("");
  const [amperHTarifa3, setAmperHTarifa3] = useState("");
  const [meroFotoTavoli, setMeroFotoTavoli] = useState<UploadedFile[]>([]);
  const [csatlakozasTipusa, setCsatlakozasTipusa] = useState("");

  // OETP fields (for non-SparkSolar applicants)
  const [oetpDokumentum, setOetpDokumentum] = useState<UploadedFile[]>([]);
  const [oetpAzonosito, setOetpAzonosito] = useState("");

  // ÉMÁSZ-specific: Vevő (Fizető) Azonosító
  const [vevoFizetoAzonosito, setVevoFizetoAzonosito] = useState("");

  // Szaldós elszámolás (only for solar owners)
  const [szaldosElszamolas, setSzaldosElszamolas] = useState("");
  const [szaldosLejarat, setSzaldosLejarat] = useState("");

  // Térképmásolat & Tulajdoni lap uploads
  const [terkepmasolat, setTerkepmasolat] = useState<UploadedFile[]>([]);
  const [tulajdoniLap, setTulajdoniLap] = useState<UploadedFile[]>([]);

  // Step 10 - Dokumentumok (removed - no longer needed)

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadField, setActiveUploadField] = useState<string>("");

  const isSolar = hasSolar === "Igen";
  const isEmasz = szolgaltato === "ÉMÁSZ szolgáltató" || szolgaltato === "DÉMÁSZ szolgáltató";
  const isOpusTitasz = szolgaltato === "Opus-Titász szolgáltató";
  const isDetailedProvider = isEmasz || isOpusTitasz;

  // Dynamic steps based on whether user has solar and provider
  const getSteps = () => {
    const steps = [
      { id: "alapadatok", title: "Alapadatok" },
    ];
    if (isSolar) {
      steps.push(
        { id: "inverter", title: "Meglévő inverter adatai" },
        { id: "napelemek", title: "Meglévő napelemek adatai" },
        { id: "fotok", title: "Meglévő rendszer fotók" },
      );
    }
    if (!isSolar) {
      steps.push({ id: "ingatlan", title: "Ingatlan adatai" });
    }
    steps.push(
      { id: "lakaseloszto", title: "Lakáselosztó & megjegyzés" },
      { id: "szolgaltato", title: "Szolgáltató kiválasztása" },
    );
    if (palyazoElter === "Nem") {
      // Only show personal data step when SparkSolar did NOT submit the application
      if (isDetailedProvider || szolgaltato === "ELMŰ/E.ON szolgáltató") {
        steps.push({ id: "szemelyes_adatok", title: "Személyes adatok" });
      } else {
        steps.push({ id: "palyazo_adatok", title: "Pályázó személyes adatai" });
      }
    }
    steps.push(
      { id: "villany_adatok", title: "Villanyszámla & mérőóra adatok" },
      { id: "befejezés", title: "Befejezés" },
    );
    return steps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const setterMap: Record<string, React.Dispatch<React.SetStateAction<UploadedFile[]>>> = {
      arajanlat: setArajanlat,
      inverterTavoli: setInverterTavoli,
      inverterAdattabla: setInverterAdattabla,
      inverterAlja: setInverterAlja,
      tetoFotok: setTetoFotok,
      lakaselosztoFoto: setLakaselosztoFoto,
      villanyszamlaFotok: setVillanyszamlaFotok,
      meroFoto: setMeroFoto,
      meroFotoTavoli: setMeroFotoTavoli,
      oetpDokumentum: setOetpDokumentum,
      terkepmasolat: setTerkepmasolat,
      tulajdoniLap: setTulajdoniLap,
    };
    const getterMap: Record<string, UploadedFile[]> = {
      arajanlat, inverterTavoli, inverterAdattabla, inverterAlja, tetoFotok, lakaselosztoFoto, villanyszamlaFotok, meroFoto, meroFotoTavoli, oetpDokumentum, terkepmasolat, tulajdoniLap,
    };

    const setter = setterMap[activeUploadField];
    const current = getterMap[activeUploadField] || [];
    if (!setter) return;

    for (const file of Array.from(files)) {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split(".").pop() || "jpg";
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 50);
      const fileName = `adatbekero/${timestamp}-${randomId}-${sanitizedName}.${fileExt}`;
      try {
        const { error } = await supabase.storage
          .from("survey-attachments")
          .upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("survey-attachments")
          .getPublicUrl(fileName);
        current.push({ name: file.name, url: urlData.publicUrl });
        toast.success(`${file.name} feltöltve`);
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(`Hiba: ${file.name} feltöltése sikertelen`);
      }
    }
    setter([...current]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFileUpload = (field: string) => {
    setActiveUploadField(field);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const removeFile = (field: string, index: number) => {
    const setterMap: Record<string, React.Dispatch<React.SetStateAction<UploadedFile[]>>> = {
      arajanlat: setArajanlat,
      inverterTavoli: setInverterTavoli,
      inverterAdattabla: setInverterAdattabla,
      inverterAlja: setInverterAlja,
      tetoFotok: setTetoFotok,
      lakaselosztoFoto: setLakaselosztoFoto,
      villanyszamlaFotok: setVillanyszamlaFotok,
      meroFoto: setMeroFoto,
      meroFotoTavoli: setMeroFotoTavoli,
      oetpDokumentum: setOetpDokumentum,
      terkepmasolat: setTerkepmasolat,
      tulajdoniLap: setTulajdoniLap,
    };
    const getterMap: Record<string, UploadedFile[]> = {
      arajanlat, inverterTavoli, inverterAdattabla, inverterAlja, tetoFotok, lakaselosztoFoto, villanyszamlaFotok, meroFoto, meroFotoTavoli, oetpDokumentum, terkepmasolat, tulajdoniLap,
    };
    const setter = setterMap[field];
    const current = getterMap[field] || [];
    setter(current.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    const currentStepId = steps[step]?.id;
    switch (currentStepId) {
      case "alapadatok":
        if (!email || !email.includes("@")) { toast.error("Kérjük, adjon meg érvényes email címet"); return false; }
        if (!palyazoElter) { toast.error("Kérjük, válassza ki, hogy a pályázatot a SparkSolar csapata adta-e be"); return false; }
        if (!palyazoFelNeve) { toast.error("Kérjük, adja meg a pályázó fél nevét"); return false; }
        if (!hasSolar) { toast.error("Kérjük, válassza ki, hogy rendelkezik-e napelemes rendszerrel"); return false; }
        if (hasSolar === "Igen" && !szaldosElszamolas) { toast.error("Kérjük, válassza ki, hogy szaldós elszámolásban van-e"); return false; }
        if (hasSolar === "Igen" && szaldosElszamolas === "Igen" && !szaldosLejarat) { toast.error("Kérjük, adja meg a szaldós elszámolás lejáratát"); return false; }
        if (!fazisok) { toast.error("Kérjük, válassza ki a fázisok számát"); return false; }
        return true;
      case "inverter":
        if (!inverterMarka) { toast.error("Kérjük, válassza ki az inverter márkáját"); return false; }
        if (!inverterTeljesitmeny) { toast.error("Kérjük, adja meg az inverter teljesítményét"); return false; }
        if (!inverterFazis) { toast.error("Kérjük, válassza ki az inverter fázisszámát"); return false; }
        if (!inverterSzeriaszam) { toast.error("Kérjük, adja meg az inverter szériaszámát"); return false; }
        return true;
      case "napelemek":
        if (!optimalizalt) { toast.error("Kérjük, válassza ki, hogy optimalizáltak-e"); return false; }
        if (!napelemDarab) { toast.error("Kérjük, adja meg a napelemek darabszámát"); return false; }
        if (!napelemTeljesitmeny) { toast.error("Kérjük, adja meg egy napelem teljesítményét"); return false; }
        return true;
      case "fotok":
        if (inverterTavoli.length === 0) { toast.error("Kérjük, töltsön fel egy távoli fotót az inverterről"); return false; }
        if (inverterAdattabla.length === 0) { toast.error("Kérjük, töltsön fel fotót az inverter adattáblájáról"); return false; }
        if (inverterAlja.length === 0) { toast.error("Kérjük, töltsön fel fotót az inverter aljáról"); return false; }
        return true;
      case "szolgaltato":
        if (!szolgaltato) { toast.error("Kérjük, válassza ki a szolgáltatót"); return false; }
        return true;
      case "ingatlan":
        if (!tetoTipus) { toast.error("Kérjük, válassza ki a tető típusát"); return false; }
        if (!arnyekolo) { toast.error("Kérjük, jelölje meg, van-e árnyékoló tényező"); return false; }
        if (tetoFotok.length === 0) { toast.error("Kérjük, töltsön fel fotókat a tetőről"); return false; }
        return true;
      case "lakaseloszto":
        if (lakaselosztoFoto.length === 0) { toast.error("Kérjük, töltsön fel fotót a lakáselosztóról"); return false; }
        return true;
      case "szemelyes_adatok":
        // Personal data validation (only shown when SparkSolar did NOT submit)
        if (!palyazoNev) { toast.error("Kérjük, adja meg a teljes nevét"); return false; }
        if (!szuletesiNev) { toast.error("Kérjük, adja meg a születéskori nevét"); return false; }
        if (!anyjaNeve) { toast.error("Kérjük, adja meg anyja leánykori nevét"); return false; }
        if (!szuletesiHely) { toast.error("Kérjük, adja meg a születési helyét"); return false; }
        if (!szuletesiDatum) { toast.error("Kérjük, adja meg a születési dátumát"); return false; }
        if (!allandoLakcimIrszam) { toast.error("Kérjük, adja meg az állandó lakcím irányítószámát"); return false; }
        if (!allandoLakcimTelepules) { toast.error("Kérjük, adja meg az állandó lakcím települését"); return false; }
        if (!allandoLakcimUtca) { toast.error("Kérjük, adja meg az állandó lakcím utcáját, házszámát"); return false; }
        if (!szemelyiSzam) { toast.error("Kérjük, adja meg a személyazonosító igazolvány számát"); return false; }
        if (!adoazonositoJel) { toast.error("Kérjük, adja meg az adóazonosító jelét"); return false; }
        if (!palyazoEmail || !palyazoEmail.includes("@")) { toast.error("Kérjük, adjon meg érvényes e-mail címet"); return false; }
        if (!palyazoTelefon) { toast.error("Kérjük, adja meg a telefonszámát"); return false; }
        if (!oetpAzonosito) { toast.error("Kérjük, adja meg az OETP azonosítót"); return false; }
        if (oetpDokumentum.length === 0) { toast.error("Kérjük, töltse fel az OETP dokumentumot"); return false; }
        return true;
      case "palyazo_adatok":
        if (!palyazoNev) { toast.error("Kérjük, adja meg a teljes nevét"); return false; }
        if (!szuletesiNev) { toast.error("Kérjük, adja meg a születéskori nevét"); return false; }
        if (!anyjaNeve) { toast.error("Kérjük, adja meg anyja leánykori nevét"); return false; }
        if (!szuletesiHely) { toast.error("Kérjük, adja meg a születési helyét"); return false; }
        if (!szuletesiDatum) { toast.error("Kérjük, adja meg a születési dátumát"); return false; }
        if (!allandoLakcim) { toast.error("Kérjük, adja meg az állandó lakcímét"); return false; }
        if (!szemelyiSzam) { toast.error("Kérjük, adja meg a személyazonosító igazolvány számát"); return false; }
        if (!adoazonositoJel) { toast.error("Kérjük, adja meg az adóazonosító jelét"); return false; }
        if (!palyazoEmail || !palyazoEmail.includes("@")) { toast.error("Kérjük, adjon meg érvényes e-mail címet"); return false; }
        if (!palyazoTelefon) { toast.error("Kérjük, adja meg a telefonszámát"); return false; }
        if (!oetpAzonosito) { toast.error("Kérjük, adja meg az OETP azonosítót"); return false; }
        if (oetpDokumentum.length === 0) { toast.error("Kérjük, töltse fel az OETP dokumentumot"); return false; }
        return true;
      case "villany_adatok":
        if (villanyszamlaFotok.length === 0) { toast.error("Kérjük, töltse fel a villanyszámla másolatát"); return false; }
        if (!felhasznaloNev) { toast.error("Kérjük, adja meg a felhasználó teljes nevét"); return false; }
        if (isDetailedProvider) {
          if (!szamlaSzuletesiNev) { toast.error("Kérjük, adja meg a villanyszámlán szereplő személy születéskori nevét"); return false; }
          if (!szamlaAnyjaNeve) { toast.error("Kérjük, adja meg a villanyszámlán szereplő anyja nevét"); return false; }
          if (!szamlaSzuletesiHely) { toast.error("Kérjük, adja meg a villanyszámlán szereplő születési helyet"); return false; }
          if (!szamlaSzuletesiDatum) { toast.error("Kérjük, adja meg a villanyszámlán szereplő születési dátumot"); return false; }
          if (!felhasznalasiCimIrszam) { toast.error("Kérjük, adja meg a felhasználási cím irányítószámát"); return false; }
          if (!felhasznalasiCimTelepules) { toast.error("Kérjük, adja meg a felhasználási cím települését"); return false; }
          if (!felhasznalasiCimUtca) { toast.error("Kérjük, adja meg a felhasználási cím utcáját"); return false; }
          if (!felhasznalasiCimHazszam) { toast.error("Kérjük, adja meg a felhasználási cím házszámát"); return false; }
          if (isOpusTitasz && !szamlaLevelezesiCim) { toast.error("Kérjük, adja meg a villanyszámlán szereplő levelezési címet"); return false; }
        } else {
          if (!felhasznalasiCim) { toast.error("Kérjük, adja meg a felhasználási címet"); return false; }
        }
        if (!felhasznaloTelefon) { toast.error("Kérjük, adja meg a felhasználó telefonszámát"); return false; }
        if (!felhasznaloEmail || !felhasznaloEmail.includes("@")) { toast.error("Kérjük, adjon meg érvényes felhasználó e-mail címet"); return false; }
        if (!helyrajziSzam) { toast.error("Kérjük, adja meg a helyrajzi számot"); return false; }
        if (!meroGyariSzam) { toast.error("Kérjük, adja meg a mérőóra gyári számát"); return false; }
        if (!podAzonosito) { toast.error("Kérjük, adja meg a POD azonosítót"); return false; }
        if (!felhasznaloAzonosito) { toast.error("Kérjük, adja meg a felhasználó azonosítót"); return false; }
        if (isEmasz && !vevoFizetoAzonosito) { toast.error("Kérjük, adja meg a Vevő (Fizető) Azonosítót"); return false; }
        if (!isOpusTitasz && !bankszamlaszam) { toast.error("Kérjük, adja meg a bankszámlaszámot"); return false; }
        if (!amper1) { toast.error("Kérjük, adja meg az 1. fázis áramerősségét"); return false; }
        if (isDetailedProvider) {
          if (!amperOsszeg) { toast.error("Kérjük, adja meg az áramerősség összegét"); return false; }
          if (meroFoto.length === 0) { toast.error("Kérjük, töltse fel a mérőóra közelkép fényképét"); return false; }
          if (meroFotoTavoli.length === 0) { toast.error("Kérjük, töltse fel a mérőóra távoli fényképét"); return false; }
          if (!csatlakozasTipusa) { toast.error("Kérjük, válassza ki a csatlakozás típusát"); return false; }
        } else {
          if (meroFoto.length === 0) { toast.error("Kérjük, töltse fel a mérőóra fényképét"); return false; }
        }
        return true;
      case "befejezés":
        if (!consent) { toast.error("Kérjük, fogadja el az adatkezelési tájékoztatót"); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const filesToString = (files: UploadedFile[]) => files.map(f => f.url).join(", ");

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);

    try {
      const surveyData: Record<string, string> = {
        "Beküldés ideje": new Date().toLocaleString("hu-HU"),
        "E-mail": email,
        "SparkSolar adta be a pályázatot?": palyazoElter,
        "Pályázó fél neve": palyazoFelNeve,
        "Rendelkezik napelemes rendszerrel?": hasSolar,
        "Szaldós elszámolásban van?": szaldosElszamolas,
        "Szaldós elszámolás lejárata": szaldosLejarat,
        "Fázisok száma": fazisok,
        "Inverter márkája": inverterMarka,
        "Inverter típusa": inverterTipus,
        "Inverter teljesítménye (kW)": inverterTeljesitmeny,
        "Inverter fázisszáma": inverterFazis,
        "Inverter szériaszáma": inverterSzeriaszam,
        "Napelemek optimalizáltak?": optimalizalt,
        "Napelemek darabszáma": napelemDarab,
        "Napelem teljesítménye (W)": napelemTeljesitmeny,
        "Napelem összteljesítménye (kWp)": napelemOsszteljesitmeny,
        "Stringek száma": stringekSzama,
        "Korábbi árajánlat": filesToString(arajanlat),
        "Inverter távoli fotó": filesToString(inverterTavoli),
        "Inverter adattábla fotó": filesToString(inverterAdattabla),
        "Inverter alja fotó": filesToString(inverterAlja),
        "Áramszolgáltató": szolgaltato,
        "Tető típusa": tetoTipus,
        "Árnyékoló tényező": arnyekolo,
        "Tető fotók": filesToString(tetoFotok),
        "Lakáselosztó fotó": filesToString(lakaselosztoFoto),
        "Térképmásolat": filesToString(terkepmasolat),
        "Tulajdoni lap": filesToString(tulajdoniLap),
        "Megjegyzés": megjegyzes,
        // Pályázó személyes adatai
        "Pályázó teljes neve": palyazoNev,
        "Születéskori név": szuletesiNev,
        "Anyja leánykori neve": anyjaNeve,
        "Születési hely": szuletesiHely,
        "Születési dátum": szuletesiDatum,
        "Személyazonosító ig. száma": szemelyiSzam,
        "Adóazonosító jel": adoazonositoJel,
        "Pályázó e-mail": palyazoEmail,
        "Pályázó telefonszám": palyazoTelefon,
        "OETP azonosító": oetpAzonosito,
        "OETP dokumentum": filesToString(oetpDokumentum),
        "Vevő (Fizető) Azonosító": vevoFizetoAzonosito,
      };

      if (isDetailedProvider) {
        surveyData["Állandó lakcím irányítószám"] = allandoLakcimIrszam;
        surveyData["Állandó lakcím település"] = allandoLakcimTelepules;
        surveyData["Állandó lakcím utca, házszám"] = allandoLakcimUtca;
        // Detailed villanyszámla extra fields
        surveyData["Számlán szereplő születéskori név"] = szamlaSzuletesiNev;
        surveyData["Számlán szereplő anyja neve"] = szamlaAnyjaNeve;
        surveyData["Számlán szereplő születési hely"] = szamlaSzuletesiHely;
        surveyData["Számlán szereplő születési dátum"] = szamlaSzuletesiDatum;
        surveyData["Számlán szereplő levelezési cím"] = szamlaLevelezesiCim;
        surveyData["Felhasználási cím irányítószám"] = felhasznalasiCimIrszam;
        surveyData["Felhasználási cím település"] = felhasznalasiCimTelepules;
        surveyData["Felhasználási cím utca"] = felhasznalasiCimUtca;
        surveyData["Felhasználási cím házszám"] = felhasznalasiCimHazszam;
        surveyData["Áramerősség összege"] = amperOsszeg;
        surveyData["Mérőóra fénykép távolról"] = filesToString(meroFotoTavoli);
        surveyData["Meglévő csatlakozás típusa"] = csatlakozasTipusa;
        if (isEmasz) {
          // ÉMÁSZ/DÉMÁSZ specific
          surveyData["Mérőóra gyári sz. (vezérelt)"] = meroGyariSzamVezerelt;
          surveyData["Mérőóra gyári sz. (H tarifa)"] = meroGyariSzamHTarifa;
          surveyData["POD azonosító (vezérelt)"] = podAzonositoVezerelt;
          surveyData["POD azonosító (H tarifa)"] = podAzonositoHTarifa;
          surveyData["Amper vezérelt 1. fázis"] = amperVezerelt1;
          surveyData["Amper vezérelt 2. fázis"] = amperVezerelt2;
          surveyData["Amper vezérelt 3. fázis"] = amperVezerelt3;
          surveyData["Amper H tarifa 1. fázis"] = amperHTarifa1;
          surveyData["Amper H tarifa 2. fázis"] = amperHTarifa2;
          surveyData["Amper H tarifa 3. fázis"] = amperHTarifa3;
        }
      } else {
        surveyData["Állandó lakcím"] = allandoLakcim;
        surveyData["Felhasználási cím"] = felhasznalasiCim;
        surveyData["Számlán szereplő születéskori név"] = szamlaSzuletesiNev;
        surveyData["Számlán szereplő anyja neve"] = szamlaAnyjaNeve;
        surveyData["Számlán szereplő születési hely"] = szamlaSzuletesiHely;
        surveyData["Számlán szereplő születési dátum"] = szamlaSzuletesiDatum;
      }

      // Common villanyszámla fields
      surveyData["Villanyszámla fotók"] = filesToString(villanyszamlaFotok);
      surveyData["Felhasználó teljes neve"] = felhasznaloNev;
      surveyData["Felhasználó telefonszáma"] = felhasznaloTelefon;
      surveyData["Felhasználó e-mail címe"] = felhasznaloEmail;
      surveyData["Helyrajzi szám"] = helyrajziSzam;
      surveyData["Mérőóra gyári száma"] = meroGyariSzam;
      surveyData["Mérési pont (POD) azonosító"] = podAzonosito;
      surveyData["POD azonosító (vezérelt)"] = podAzonositoVezerelt;
      surveyData["POD azonosító (H tarifa)"] = podAzonositoHTarifa;
      surveyData["Felhasználó azonosító"] = felhasznaloAzonosito;
      surveyData["Bankszámlaszám"] = bankszamlaszam;
      surveyData["Áramerősség 1. fázis"] = amper1;
      surveyData["Áramerősség 2. fázis"] = amper2;
      surveyData["Áramerősség 3. fázis"] = amper3;
      surveyData["Mérőóra fénykép"] = filesToString(meroFoto);

      const { error } = await supabase.functions.invoke("send-notification", {
        body: {
          type: "survey",
          sheetName: "Adatbekero",
          surveyData,
          skipEmails: true,
        },
      });

      if (error) throw error;
      setIsSubmitted(true);
      toast.success("Adatbekérő sikeresen beküldve!");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Hiba történt a beküldés során. Kérjük, próbálja újra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadBox = ({ field, files, label, required = false, exampleImages = [] }: {
    field: string;
    files: UploadedFile[];
    label: string;
    required?: boolean;
    exampleImages?: string[];
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <div
        onClick={() => openFileUpload(field)}
        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Kattintson a fájlok feltöltéséhez</p>
        <p className="text-xs text-muted-foreground mt-1">Támogatott: képek, PDF, Word</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex-1">
                {file.name}
              </a>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => { e.stopPropagation(); removeFile(field, i); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {exampleImages.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2 italic">Példa fotó(k):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {exampleImages.map((src, i) => (
              <img key={i} src={src} alt="Példa" className="rounded-lg border border-border max-h-72 w-auto object-contain" />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6"
        >
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Köszönjük!</h2>
          <p className="text-muted-foreground">
            Az adatbekérő sikeresen beküldésre került. Munkatársunk hamarosan felveszi Önnel a kapcsolatot.
          </p>
          <Button onClick={() => window.location.href = "/"} className="mt-4">
            Vissza a főoldalra
          </Button>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    const currentStepId = steps[step]?.id;

    switch (currentStepId) {
      case "alapadatok":
        return (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-foreground text-lg">Kedves Leendő Ügyfelünk!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A műszaki adatbekérő kitöltése során néhány fotót is kérni fogunk az ingatlanról és a meglévő napelemes rendszerről. Ezekre a képekre a pontosabb műszaki felméréshez, az engedélyeztetés előkészítéséhez van szükségünk.
              </p>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Az adatbekérő kitöltéséhez az alábbi adatokra, dokumentumokra lesz szükség, ezeket kérjük készítse elő:</p>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
                  <li>A telepítés helyszínéhez tartozó villanyszámla</li>
                  <li>Mérőóráról készült fotók</li>
                  <li>Tulajdoni lap (<a href="https://www.foldhivatal.hu/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">INNEN</a> kérhető le)</li>
                  <li>Térképmásolat (<a href="https://kau.foldhivatal.hu/auth/login2" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">INNEN</a> kérhető le – 3 hónapnál nem régebbi)</li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">A fotók tekintetében az alábbiakra lesz szükség:</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Amennyiben már rendelkezik napelemes rendszerrel:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Távoli fotó, ahol látszódik az inverter és környezete</li>
                      <li>Fotó az inverter adattáblájáról</li>
                      <li>Fotó az inverter aljáról</li>
                      <li>Meglévő rendszer korábbi árajánlata</li>
                      <li>Fotó a lakáselosztóról</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Amennyiben még nincs napelemes rendszere:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Fotók a tetőről, a napelem panelek tervezett helyéről</li>
                      <li>Fotó a lakáselosztóról</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">E-mail:<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">(regisztrációkor megadott email cím)</p>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pelda@email.hu" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">A pályázatot Önnek a SparkSolar csapata adta be?<span className="text-destructive ml-0.5">*</span></Label>
              <Select value={palyazoElter} onValueChange={setPalyazoElter}>
                <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Igen">Igen</SelectItem>
                  <SelectItem value="Nem">Nem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {palyazoElter && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Pályázó fél neve:<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={palyazoFelNeve} onChange={(e) => setPalyazoFelNeve(e.target.value)} placeholder="A pályázó személy teljes neve" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Rendelkezik napelemes rendszerrel?<span className="text-destructive ml-0.5">*</span></Label>
              <Select value={hasSolar} onValueChange={(val) => { setHasSolar(val); if (val === "Nem") { setSzaldosElszamolas(""); setSzaldosLejarat(""); } }}>
                <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Igen">Igen</SelectItem>
                  <SelectItem value="Nem">Nem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasSolar === "Igen" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Szaldós elszámolásban van?<span className="text-destructive ml-0.5">*</span></Label>
                  <Select value={szaldosElszamolas} onValueChange={(val) => { setSzaldosElszamolas(val); if (val === "Nem") setSzaldosLejarat(""); }}>
                    <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Igen">Igen</SelectItem>
                      <SelectItem value="Nem">Nem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {szaldosElszamolas === "Igen" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Mikor jár le a szaldós elszámolás?<span className="text-destructive ml-0.5">*</span></Label>
                    <Input type="date" value={szaldosLejarat} onChange={(e) => setSzaldosLejarat(e.target.value)} />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Hány fázis van kialakítva az ingatlanon?<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">
                Az alábbi fotón látható példa szerint, a mérőórán található kismegszakítók száma alapján állapítható meg. 
                1 kismegszakító = 1 fázis; 3 kismegszakító = 3 fázis. <em>(a példa fotón 3 fázisos ingatlan látható.)</em>
              </p>
              <Select value={fazisok} onValueChange={setFazisok}>
                <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
              <img src={fazisszamImg} alt="Fázisszám példa" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
            </div>
          </div>
        );

      case "inverter":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Meglévő inverter adatai</h2>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő inverter márkája:<span className="text-destructive ml-0.5">*</span></Label>
              <Select value={inverterMarka} onValueChange={setInverterMarka}>
                <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                <SelectContent>
                  {INVERTER_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő inverter típusa:</Label>
              <Input value={inverterTipus} onChange={(e) => setInverterTipus(e.target.value)} placeholder="Pl. SUN-8K-SG04LP3-EU" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő inverter teljesítménye (kW):<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="number" value={inverterTeljesitmeny} onChange={(e) => setInverterTeljesitmeny(e.target.value)} placeholder="Pl. 8" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő inverter fázisszáma:<span className="text-destructive ml-0.5">*</span></Label>
              <RadioGroup value={inverterFazis} onValueChange={setInverterFazis} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="inv-fazis-1" />
                  <Label htmlFor="inv-fazis-1" className="cursor-pointer">1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="inv-fazis-3" />
                  <Label htmlFor="inv-fazis-3" className="cursor-pointer">3</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő inverter szériaszáma:<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">Az inverter adattábláján vagy az inverter oldalán található.</p>
              <Input value={inverterSzeriaszam} onChange={(e) => setInverterSzeriaszam(e.target.value)} placeholder="Pl. 2340120456" />
            </div>
          </div>
        );

      case "napelemek":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Meglévő napelemek adatai</h2>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő napelemek optimalizáltak-e?<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">Található-e panelenkénti optimalizáló a napelemek alatt?</p>
              <RadioGroup value={optimalizalt} onValueChange={setOptimalizalt} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Igen" id="opt-igen" />
                  <Label htmlFor="opt-igen" className="cursor-pointer">Igen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nem" id="opt-nem" />
                  <Label htmlFor="opt-nem" className="cursor-pointer">Nem</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő napelemek darabszáma:<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="number" value={napelemDarab} onChange={(e) => setNapelemDarab(e.target.value)} placeholder="Pl. 20" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő napelem teljesítménye (W vagy Wp):<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">Egy db napelem teljesítménye. Általában 250Wp-től (régebbi rendszerek esetén) 4-500Wp-ig (újabb rendszerek esetén) terjed.</p>
              <Input type="number" value={napelemTeljesitmeny} onChange={(e) => setNapelemTeljesitmeny(e.target.value)} placeholder="Pl. 400" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő napelem összteljesítménye (kWp):</Label>
              <p className="text-xs text-muted-foreground">Az összes napelem, a teljes rendszer teljesítménye kilowattban (kWp).</p>
              <Input type="number" step="0.1" value={napelemOsszteljesitmeny} onChange={(e) => setNapelemOsszteljesitmeny(e.target.value)} placeholder="Pl. 8.0" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Meglévő stringek (körök) száma:</Label>
              <p className="text-xs text-muted-foreground">Ha nem tudja, küldjön fotót a következő oldalon az inverter aljáról, ahol beérkeznek a kábelek.</p>
              <Select value={stringekSzama} onValueChange={setStringekSzama}>
                <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                <SelectContent>
                  {STRING_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "fotok":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Meglévő rendszer fotók</h2>

            <FileUploadBox
              field="arajanlat"
              files={arajanlat}
              label="Meglévő rendszer korábbi árajánlata vagy készrejelentési dokumentációja"
              exampleImages={[]}
            />

            <FileUploadBox
              field="inverterTavoli"
              files={inverterTavoli}
              label="Távoli fotó, ahol látszódik az inverter és környezete"
              required
              exampleImages={[inverterTavoliImg]}
            />

            <FileUploadBox
              field="inverterAdattabla"
              files={inverterAdattabla}
              label="Fotó az inverter adattáblájáról"
              required
              exampleImages={[inverterAdattablaImg]}
            />

            <FileUploadBox
              field="inverterAlja"
              files={inverterAlja}
              label="Fotó az inverter aljáról"
              required
              exampleImages={[inverterAljaImg]}
            />
          </div>
        );

      case "szolgaltato":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Szolgáltató kiválasztása</h2>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Melyik áramszolgáltatóhoz tartozik az ingatlan?<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">
                Ha nem biztos benne, ezen a térképen ellenőrizheti:{" "}
                <a href="https://www.google.com/maps/d/u/0/viewer?hl=hu&ll=47.14732477156111%2C19.71495354010465&z=8&mid=1JQPofVlYVXlyBv1G4gtZ3SrnLA2Ww4Cn" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline hover:no-underline">
                  Áramszolgáltatók térképe
                </a>
              </p>
              <RadioGroup value={szolgaltato} onValueChange={setSzolgaltato} className="space-y-3">
                {SZOLGALTATOK.map((s, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <RadioGroupItem value={s} id={`szolgaltato-${i}`} className="mt-0.5" />
                    <Label htmlFor={`szolgaltato-${i}`} className="cursor-pointer text-sm">{s}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case "ingatlan":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Ingatlan adatai</h2>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tető héjazat típusa:<span className="text-destructive ml-0.5">*</span></Label>
              <Select value={tetoTipus} onValueChange={setTetoTipus}>
                <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
                <SelectContent>
                  {ROOF_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Van bármilyen tetőt árnyékoló tényező?<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">Magas fa, magas szomszédos épület, kémény, magas szellőző stb.</p>
              <RadioGroup value={arnyekolo} onValueChange={setArnyekolo} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Igen, van" id="arny-igen" />
                  <Label htmlFor="arny-igen" className="cursor-pointer">Igen, van</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nem, nincs" id="arny-nem" />
                  <Label htmlFor="arny-nem" className="cursor-pointer">Nem, nincs</Label>
                </div>
              </RadioGroup>
            </div>

            <FileUploadBox
              field="tetoFotok"
              files={tetoFotok}
              label="Fotók a tetőről, a napelem panelek tervezett helyéről"
              required
            />
          </div>
        );

      case "lakaseloszto":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Lakáselosztó, dokumentumok & megjegyzés</h2>
            <FileUploadBox
              field="lakaselosztoFoto"
              files={lakaselosztoFoto}
              label="Fotó a lakáselosztóról"
              required
              exampleImages={[lakaselosztoPeldaImg, lakaselosztoMaszkImg]}
            />
            <p className="text-xs text-muted-foreground italic">
              Lehetőség szerint az ajtó (maszk) nyitva vagy leszerelve legyen a fotón, hogy pontosan lássuk a kismegszakítókat, vezetékeket.
            </p>

            {hasSolar === "Nem" && (
              <>
                <FileUploadBox
                  field="terkepmasolat"
                  files={terkepmasolat}
                  label="Térképmásolat"
                />
                <p className="text-xs text-muted-foreground italic">
                  3 hónapnál nem régebbi térképmásolat.{" "}
                  <a href="https://kau.foldhivatal.hu/auth/login2" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                    Innen kérhető le
                  </a>
                </p>
              </>
            )}

            <FileUploadBox
              field="tulajdoniLap"
              files={tulajdoniLap}
              label="Tulajdoni lap"
            />
            <p className="text-xs text-muted-foreground italic">
              <a href="https://www.foldhivatal.hu/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                Innen kérhető le
              </a>
            </p>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Megjegyzés:</Label>
              <p className="text-xs text-muted-foreground">(bármilyen egyéb információ: extra kérések, kiegészítők, stb.)</p>
              <Textarea value={megjegyzes} onChange={(e) => setMegjegyzes(e.target.value)} rows={4} placeholder="Írja ide megjegyzését..." />
            </div>
          </div>
        );

      case "szemelyes_adatok":
        // ÉMÁSZ personal data - always shown
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Személyes adatok</h2>
            <p className="text-sm text-muted-foreground">Az alábbi adatokat kérjük szépen a velünk szerződést kötő, a rendszert megrendelő adataival kitölteni.</p>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Teljes név<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={palyazoNev} onChange={(e) => setPalyazoNev(e.target.value)} placeholder="Teljes név" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Születéskori név<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szuletesiNev} onChange={(e) => setSzuletesiNev(e.target.value)} placeholder="Születéskori név" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Anyja leánykori neve<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={anyjaNeve} onChange={(e) => setAnyjaNeve(e.target.value)} placeholder="Anyja leánykori neve" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Születési hely<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szuletesiHely} onChange={(e) => setSzuletesiHely(e.target.value)} placeholder="Születési hely" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Születési dátum<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="date" value={szuletesiDatum} onChange={(e) => setSzuletesiDatum(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Állandó lakcím irányítószám<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={allandoLakcimIrszam} onChange={(e) => setAllandoLakcimIrszam(e.target.value)} placeholder="1234" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Állandó lakcím település<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={allandoLakcimTelepules} onChange={(e) => setAllandoLakcimTelepules(e.target.value)} placeholder="Budapest" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Állandó lakcím utca, házszám<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={allandoLakcimUtca} onChange={(e) => setAllandoLakcimUtca(e.target.value)} placeholder="Példa utca 12." />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Személyazonosító igazolvány száma<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szemelyiSzam} onChange={(e) => setSzemelyiSzam(e.target.value)} placeholder="123456AB" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Adóazonosító jel<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={adoazonositoJel} onChange={(e) => setAdoazonositoJel(e.target.value)} placeholder="1234567890" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">E-mail cím<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="email" value={palyazoEmail} onChange={(e) => setPalyazoEmail(e.target.value)} placeholder="pelda@email.hu" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Telefonszám<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="tel" value={palyazoTelefon} onChange={(e) => setPalyazoTelefon(e.target.value)} placeholder="+36 30 123 4567" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">OETP azonosító<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">A pályázat beadásakor kapott OETP azonosító.</p>
              <Input value={oetpAzonosito} onChange={(e) => setOetpAzonosito(e.target.value)} placeholder="OETP azonosító" />
            </div>

            <FileUploadBox
              field="oetpDokumentum"
              files={oetpDokumentum}
              label="OETP dokumentum (pályázat beadásakor kapott PDF fájl)"
              required
            />
          </div>
        );

      case "palyazo_adatok":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Pályázó személyes adatai</h2>
            <p className="text-sm text-muted-foreground">Kérjük, adja meg a pályázó (az energiatároló rendszerre igénylő személy) személyes adatait.</p>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Teljes név<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={palyazoNev} onChange={(e) => setPalyazoNev(e.target.value)} placeholder="Teljes név" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Születéskori név<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szuletesiNev} onChange={(e) => setSzuletesiNev(e.target.value)} placeholder="Születéskori név" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Anyja leánykori neve<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={anyjaNeve} onChange={(e) => setAnyjaNeve(e.target.value)} placeholder="Anyja leánykori neve" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Születési hely<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szuletesiHely} onChange={(e) => setSzuletesiHely(e.target.value)} placeholder="Születési hely" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Születési dátum<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="date" value={szuletesiDatum} onChange={(e) => setSzuletesiDatum(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Állandó lakcím irányítószám, település, utca, házszám<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={allandoLakcim} onChange={(e) => setAllandoLakcim(e.target.value)} placeholder="1234 Budapest, Példa utca 12." />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Személyazonosító igazolvány száma<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szemelyiSzam} onChange={(e) => setSzemelyiSzam(e.target.value)} placeholder="123456AB" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Adóazonosító jel<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={adoazonositoJel} onChange={(e) => setAdoazonositoJel(e.target.value)} placeholder="1234567890" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">E-mail cím<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="email" value={palyazoEmail} onChange={(e) => setPalyazoEmail(e.target.value)} placeholder="pelda@email.hu" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Telefonszám<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="tel" value={palyazoTelefon} onChange={(e) => setPalyazoTelefon(e.target.value)} placeholder="+36 30 123 4567" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">OETP azonosító<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">A pályázat beadásakor kapott OETP azonosító.</p>
              <Input value={oetpAzonosito} onChange={(e) => setOetpAzonosito(e.target.value)} placeholder="OETP azonosító" />
            </div>

            <FileUploadBox
              field="oetpDokumentum"
              files={oetpDokumentum}
              label="OETP dokumentum (pályázat beadásakor kapott PDF fájl)"
              required
            />
          </div>
        );

      case "villany_adatok":
        if (isDetailedProvider) {
          return (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-primary">
                {isOpusTitasz ? "Áramszolgáltatói igénybejelentéshez - Opus-Titász" : "Villanyszámla & mérőóra adatok"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isOpusTitasz 
                  ? "Az alábbi adatokat kérjük szépen a telepítés helyszínéhez tartozó villanyszámlán szereplő adatokkal kitölteni."
                  : "Kérjük a villanyszámlán szereplő adatokat pontosan, a számlán található formátumban adja meg."}
              </p>

              <FileUploadBox
                field="villanyszamlaFotok"
                files={villanyszamlaFotok}
                label="Villanyszámla összes oldalának másolata"
                required
              />

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználó teljes neve (villanyszámlán szereplő teljes név)<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={felhasznaloNev} onChange={(e) => setFelhasznaloNev(e.target.value)} placeholder="A villanyszámlán szereplő név" />
                <img src={szamlaNevImg} alt="Felhasználó neve a számlán" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Villanyszámlán szereplő személy születéskori neve<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={szamlaSzuletesiNev} onChange={(e) => setSzamlaSzuletesiNev(e.target.value)} placeholder="Születéskori név" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Villanyszámlán szereplő anyja neve<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={szamlaAnyjaNeve} onChange={(e) => setSzamlaAnyjaNeve(e.target.value)} placeholder="Anyja neve" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Villanyszámlán szereplő születési helye<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={szamlaSzuletesiHely} onChange={(e) => setSzamlaSzuletesiHely(e.target.value)} placeholder="Születési hely" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Villanyszámlán szereplő születési dátuma<span className="text-destructive ml-0.5">*</span></Label>
                <Input type="date" value={szamlaSzuletesiDatum} onChange={(e) => setSzamlaSzuletesiDatum(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználó telefonszáma<span className="text-destructive ml-0.5">*</span></Label>
                <Input type="tel" value={felhasznaloTelefon} onChange={(e) => setFelhasznaloTelefon(e.target.value)} placeholder="+36 30 123 4567" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználó e-mail címe<span className="text-destructive ml-0.5">*</span></Label>
                <Input type="email" value={felhasznaloEmail} onChange={(e) => setFelhasznaloEmail(e.target.value)} placeholder="pelda@email.hu" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Villanyszámlán szereplő levelezési címe{isOpusTitasz && <span className="text-destructive ml-0.5">*</span>}</Label>
                <p className="text-xs text-muted-foreground">(mely egyben a számlázási cím)</p>
                <Input value={szamlaLevelezesiCim} onChange={(e) => setSzamlaLevelezesiCim(e.target.value)} placeholder="Levelezési cím" />
                <img src={szamlaCimImg} alt="Levelezési cím a számlán" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználási cím irányítószám<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={felhasznalasiCimIrszam} onChange={(e) => setFelhasznalasiCimIrszam(e.target.value)} placeholder="1234" />
                <img src={szamlaCimImg} alt="Felhasználási cím irányítószám" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználási cím település<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={felhasznalasiCimTelepules} onChange={(e) => setFelhasznalasiCimTelepules(e.target.value)} placeholder="Budapest" />
                <img src={szamlaCimImg} alt="Felhasználási cím település" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználási cím utca<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={felhasznalasiCimUtca} onChange={(e) => setFelhasznalasiCimUtca(e.target.value)} placeholder="Példa utca" />
                <img src={szamlaCimImg} alt="Felhasználási cím utca" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználási cím házszám<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={felhasznalasiCimHazszam} onChange={(e) => setFelhasznalasiCimHazszam(e.target.value)} placeholder="12." />
                <img src={szamlaCimImg} alt="Felhasználási cím házszám" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  A telepítés helyszínének helyrajzi száma<span className="text-destructive ml-0.5">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ügyfélkapuból ingyenesen lekérhető:{" "}
                  <a href="https://ugyintezes.magyarorszag.hu/szolgaltatasok/foldhiv_nyilvantart.html" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                    https://ugyintezes.magyarorszag.hu/szolgaltatasok/foldhiv_nyilvantart.html
                  </a>
                </p>
                <Input value={helyrajziSzam} onChange={(e) => setHelyrajziSzam(e.target.value)} placeholder="Helyrajzi szám" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Mérőóra gyári száma (nappali mérőóra - A1 díjszámítás)<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={meroGyariSzam} onChange={(e) => setMeroGyariSzam(e.target.value)} placeholder="Pl. 1234567893" />
                <img src={szamlaMeroGyariImg} alt="Mérő gyári száma" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              {isEmasz && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Mérőóra gyári száma (vezérelt mérőóra, ha van)</Label>
                    <Input value={meroGyariSzamVezerelt} onChange={(e) => setMeroGyariSzamVezerelt(e.target.value)} placeholder="Ha van vezérelt mérőóra" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Mérőóra gyári száma (H tarifa mérőóra, ha van)</Label>
                    <Input value={meroGyariSzamHTarifa} onChange={(e) => setMeroGyariSzamHTarifa(e.target.value)} placeholder="Ha van H tarifa mérőóra" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Mérési pont (POD) azonosító<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={podAzonosito} onChange={(e) => setPodAzonosito(e.target.value)} placeholder="Pl. HU111111111-S111111111111111111 'A1'" />
                <img src={szamlaPodImg} alt="POD azonosító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              {isEmasz && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Mérési pont azonosító (vezérelt mérőóra, ha van)</Label>
                    <Input value={podAzonositoVezerelt} onChange={(e) => setPodAzonositoVezerelt(e.target.value)} placeholder="Ha van vezérelt mérőóra" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Mérési pont azonosító (H tarifa mérőóra, ha van)</Label>
                    <Input value={podAzonositoHTarifa} onChange={(e) => setPodAzonositoHTarifa(e.target.value)} placeholder="Ha van H tarifa mérőóra" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Felhasználó azonosító<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={felhasznaloAzonosito} onChange={(e) => setFelhasznaloAzonosito(e.target.value)} placeholder="Pl. 12345678" />
                <img src={szamlaFelhasznaloAzonositoImg} alt="Felhasználó azonosító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              {isEmasz && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Vevő (Fizető) Azonosító<span className="text-destructive ml-0.5">*</span></Label>
                  <Input value={vevoFizetoAzonosito} onChange={(e) => setVevoFizetoAzonosito(e.target.value)} placeholder="Pl. 12345678" />
                </div>
              )}

              {!isOpusTitasz && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Napelemes rendszert fizető bankszámlaszáma<span className="text-destructive ml-0.5">*</span></Label>
                  <p className="text-xs text-muted-foreground">
                    Adatvédelmi irányelvek:{" "}
                    <a href="/adatkezelesi-tajekoztato" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                      https://akkumulator-tamogatas.hu/adatkezelesi-tajekoztato
                    </a>
                  </p>
                  <Input value={bankszamlaszam} onChange={(e) => setBankszamlaszam(e.target.value)} placeholder="12345678-12345678-12345678" />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Áramerősség - 1. fázis{isOpusTitasz ? "" : " (nappali mérőóra - A1)"}<span className="text-destructive ml-0.5">*</span></Label>
                <p className="text-xs text-muted-foreground">A mérőóra kismegszakítóján feltüntetett áramerősség (pl. B16, C32 stb.)</p>
                <Input value={amper1} onChange={(e) => setAmper1(e.target.value)} placeholder="Pl. B16" />
                <img src={amper1FazisImg} alt="1. fázis kismegszakító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
              </div>

              {fazisok === "3" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Áramerősség - 2. fázis{isOpusTitasz ? " (ha van)" : " (nappali mérőóra - A1)"}
                      {!isOpusTitasz && <span className="text-destructive ml-0.5">*</span>}
                    </Label>
                    <Input value={amper2} onChange={(e) => setAmper2(e.target.value)} placeholder="Pl. B16" />
                    <img src={amper2FazisImg} alt="2. fázis kismegszakító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Áramerősség - 3. fázis{isOpusTitasz ? " (ha van)" : " (nappali mérőóra - A1)"}
                      {!isOpusTitasz && <span className="text-destructive ml-0.5">*</span>}
                    </Label>
                    <Input value={amper3} onChange={(e) => setAmper3(e.target.value)} placeholder="Pl. B16" />
                    <img src={amper3FazisImg} alt="3. fázis kismegszakító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Áramerősség összege (1., 2. és 3. fázisok áramerősségének összege)<span className="text-destructive ml-0.5">*</span></Label>
                <Input value={amperOsszeg} onChange={(e) => setAmperOsszeg(e.target.value)} placeholder="Pl. 48" />
              </div>

              {isEmasz && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Áramerősség - 1. fázis (vezérelt mérőóra, ha van)</Label>
                    <Input value={amperVezerelt1} onChange={(e) => setAmperVezerelt1(e.target.value)} placeholder="" />
                  </div>

                  {fazisok === "3" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Áramerősség - 2. fázis (vezérelt mérőóra, ha van)</Label>
                        <Input value={amperVezerelt2} onChange={(e) => setAmperVezerelt2(e.target.value)} placeholder="" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Áramerősség - 3. fázis (vezérelt mérőóra, ha van)</Label>
                        <Input value={amperVezerelt3} onChange={(e) => setAmperVezerelt3(e.target.value)} placeholder="" />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Áramerősség - 1. fázis (H tarifa mérőóra, ha van)</Label>
                    <Input value={amperHTarifa1} onChange={(e) => setAmperHTarifa1(e.target.value)} placeholder="" />
                  </div>

                  {fazisok === "3" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Áramerősség - 2. fázis (H tarifa mérőóra, ha van)</Label>
                        <Input value={amperHTarifa2} onChange={(e) => setAmperHTarifa2(e.target.value)} placeholder="" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Áramerősség - 3. fázis (H tarifa mérőóra, ha van)</Label>
                        <Input value={amperHTarifa3} onChange={(e) => setAmperHTarifa3(e.target.value)} placeholder="" />
                      </div>
                    </>
                  )}
                </>
              )}

              <FileUploadBox
                field="meroFoto"
                files={meroFoto}
                label="Mérőóra fényképe közelről, amin jól látszik a mérőóra gyári száma és a kismegszakítók (biztosítékok)"
                required
                exampleImages={[meroPeldaImg]}
              />

              <FileUploadBox
                field="meroFotoTavoli"
                files={meroFotoTavoli}
                label="Mérőóra fényképe távolról"
                required
              />

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Meglévő csatlakozás típusa<span className="text-destructive ml-0.5">*</span></Label>
                <p className="text-xs text-muted-foreground">Földkábeles csatlakozás esetén a kábelek a földben vezetve jutnak el a mérőórához. Szabadvezeték esetén a kábelek a földön kívül, általában látható módon, vagy a falban jutnak el a mérőórához.</p>
                <RadioGroup value={csatlakozasTipusa} onValueChange={setCsatlakozasTipusa} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Földkábel" id="csatl-fold" />
                    <Label htmlFor="csatl-fold" className="cursor-pointer">Földkábel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Szabadvezetékes" id="csatl-szabad" />
                    <Label htmlFor="csatl-szabad" className="cursor-pointer">Szabadvezetékes</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          );
        }

        // ELMŰ/EON and others - original villanyszámla form
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Villanyszámla & mérőóra adatok</h2>
            <p className="text-sm text-muted-foreground">
              Kérjük a villanyszámlán szereplő adatokat pontosan, a számlán található formátumban adja meg. 
              Az alábbi segédképek mutatják, hol találhatók az egyes adatok.
            </p>

            <FileUploadBox
              field="villanyszamlaFotok"
              files={villanyszamlaFotok}
              label="Villanyszámla összes oldalának másolata"
              required
            />

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Felhasználó teljes neve (villanyszámlán szereplő teljes név)<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={felhasznaloNev} onChange={(e) => setFelhasznaloNev(e.target.value)} placeholder="A villanyszámlán szereplő név" />
              <img src={szamlaNevImg} alt="Felhasználó neve a számlán" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Villanyszámlán szereplő személy születéskori neve<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szamlaSzuletesiNev} onChange={(e) => setSzamlaSzuletesiNev(e.target.value)} placeholder="Születéskori név" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Villanyszámlán szereplő anyja neve<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szamlaAnyjaNeve} onChange={(e) => setSzamlaAnyjaNeve(e.target.value)} placeholder="Anyja neve" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Villanyszámlán szereplő születési helye<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={szamlaSzuletesiHely} onChange={(e) => setSzamlaSzuletesiHely(e.target.value)} placeholder="Születési hely" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Villanyszámlán szereplő születési dátuma<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="date" value={szamlaSzuletesiDatum} onChange={(e) => setSzamlaSzuletesiDatum(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Felhasználó telefonszáma<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="tel" value={felhasznaloTelefon} onChange={(e) => setFelhasznaloTelefon(e.target.value)} placeholder="+36 30 123 4567" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Felhasználó e-mail címe<span className="text-destructive ml-0.5">*</span></Label>
              <Input type="email" value={felhasznaloEmail} onChange={(e) => setFelhasznaloEmail(e.target.value)} placeholder="pelda@email.hu" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Felhasználási cím irányítószám, település, utca, házszám<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={felhasznalasiCim} onChange={(e) => setFelhasznalasiCim(e.target.value)} placeholder="1234 Budapest, Példa utca 12." />
              <img src={szamlaCimImg} alt="Felhasználási hely címe a számlán" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                A telepítés helyszínének helyrajzi száma<span className="text-destructive ml-0.5">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Ügyfélkapuból ingyenesen lekérhető:{" "}
                <a href="https://ugyintezes.magyarorszag.hu/szolgaltatasok/foldhiv_nyilvantart.html" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                  https://ugyintezes.magyarorszag.hu/szolgaltatasok/foldhiv_nyilvantart.html
                </a>
              </p>
              <Input value={helyrajziSzam} onChange={(e) => setHelyrajziSzam(e.target.value)} placeholder="Helyrajzi szám" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Mérőóra gyári száma (nappali mérőóra - A1 díjszámítás)<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">A számlarészletezőn találja meg, a "Mérő gyártási száma" rovatban.</p>
              <Input value={meroGyariSzam} onChange={(e) => setMeroGyariSzam(e.target.value)} placeholder="Pl. 1234567893" />
              <img src={szamlaMeroGyariImg} alt="Mérő gyári száma a számlarészletezőn" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Mérési pont (POD) azonosító<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">A számlarészletezőn találja meg, a "Mérési pont azonosító" rovatban (HU-vel kezdődő kód).</p>
              <Input value={podAzonosito} onChange={(e) => setPodAzonosito(e.target.value)} placeholder="Pl. HU111111111-S111111111111111111 'A1'" />
              <img src={szamlaPodImg} alt="POD azonosító a számlarészletezőn" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">B (vezérelt) mérőóra POD azonosító</Label>
              <p className="text-xs text-muted-foreground">Csak akkor töltse ki, ha van vezérelt (B tarifás) mérőórája.</p>
              <Input value={podAzonositoVezerelt} onChange={(e) => setPodAzonositoVezerelt(e.target.value)} placeholder="Ha van vezérelt mérőóra" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">H tarifa mérőóra POD azonosító</Label>
              <p className="text-xs text-muted-foreground">Csak akkor töltse ki, ha van H tarifás mérőórája.</p>
              <Input value={podAzonositoHTarifa} onChange={(e) => setPodAzonositoHTarifa(e.target.value)} placeholder="Ha van H tarifa mérőóra" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Felhasználó azonosító<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">A villamos energia elszámoló számlán található "Felhasználó azonosító száma" rovatban.</p>
              <Input value={felhasznaloAzonosito} onChange={(e) => setFelhasznaloAzonosito(e.target.value)} placeholder="Pl. 12345678" />
              <img src={szamlaFelhasznaloAzonositoImg} alt="Felhasználó azonosító a számlán" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Napelemes rendszert fizető bankszámlaszáma<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">
                Adatvédelmi irányelvek:{" "}
                <a href="/adatkezelesi-tajekoztato" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                  https://akkumulator-tamogatas.hu/adatkezelesi-tajekoztato
                </a>
              </p>
              <Input value={bankszamlaszam} onChange={(e) => setBankszamlaszam(e.target.value)} placeholder="12345678-12345678-12345678" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Áramerősség - 1. fázis (nappali mérőóra - A1)<span className="text-destructive ml-0.5">*</span></Label>
              <p className="text-xs text-muted-foreground">A mérőóra kismegszakítóján feltüntetett áramerősség (pl. B16, C32 stb.)</p>
              <Input value={amper1} onChange={(e) => setAmper1(e.target.value)} placeholder="Pl. B16" />
              <img src={amper1FazisImg} alt="1. fázis kismegszakító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
            </div>

            {fazisok === "3" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Áramerősség - 2. fázis (nappali mérőóra - A1)<span className="text-destructive ml-0.5">*</span></Label>
                  <Input value={amper2} onChange={(e) => setAmper2(e.target.value)} placeholder="Pl. B16" />
                  <img src={amper2FazisImg} alt="2. fázis kismegszakító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Áramerősség - 3. fázis (nappali mérőóra - A1)<span className="text-destructive ml-0.5">*</span></Label>
                  <Input value={amper3} onChange={(e) => setAmper3(e.target.value)} placeholder="Pl. B16" />
                  <img src={amper3FazisImg} alt="3. fázis kismegszakító" className="rounded-lg border border-border max-h-72 w-auto object-contain mt-2" />
                </div>
              </>
            )}

            <FileUploadBox
              field="meroFoto"
              files={meroFoto}
              label="Mérőóra fényképe közelről, amin jól látszik a mérőóra gyári száma és a kismegszakítók (biztosítékok)"
              required
              exampleImages={[meroPeldaImg]}
            />
          </div>
        );


      case "befejezés":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Befejezés</h2>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
              <p className="text-xs text-muted-foreground">
                Személyes adatait csak a fiók kezelése és a kért termékek, szolgáltatások biztosítása céljából használjuk.
              </p>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(c) => setConsent(c === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="consent" className="text-sm cursor-pointer leading-relaxed">
                  Hozzájárulok, hogy a Spark Electric Kft. e-mail üzeneteket küldjön a megadott e-mail címemre és elfogadom az{" "}
                  <a href="/adatkezelesi-tajekoztato" target="_blank" className="text-primary hover:underline">adatkezelési tájékoztatót</a>.<span className="text-destructive ml-0.5">*</span>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground italic">
                *Fontosnak tartjuk, hogy ne kapjon spam e-maileket, így kizárólag releváns tartalmat küldünk, és az e-mailekről bármikor leiratkozhat.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStep = step === totalSteps - 1;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <a href="/">
            <img src={logo} alt="SparkSolar" className="h-14 mx-auto mb-4" />
          </a>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">
            Műszaki Felmérés - Otthoni Energiatároló Program 2026
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{steps[step]?.title}</span>
            <span>{step + 1}/{totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Előző
            </Button>
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? "Küldés..." : "Beküldés"}
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                Következő <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
