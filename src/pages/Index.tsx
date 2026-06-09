import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhySolar from "@/components/WhySolar";
import TargetGroups from "@/components/TargetGroups";
import PackageOffers from "@/components/PackageOffers";
import Services from "@/components/Services";
import EnergyStorage from "@/components/EnergyStorage";
import InstallationSteps from "@/components/InstallationSteps";
import GoogleReviews from "@/components/GoogleReviews";
import FAQ from "@/components/FAQ";
import QuickQuoteForm from "@/components/QuickQuoteForm";
import Footer from "@/components/Footer";
import TvtCertificate from "@/components/TvtCertificate";
import WhyUs from "@/components/WhyUs";
import WelcomePopup from "@/components/WelcomePopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <WelcomePopup />
      <Navbar />
      <main>
        <Hero />
        <WhySolar />
        <TargetGroups />
        <PackageOffers />
        <Services />
        <EnergyStorage />
        <WhyUs />
        <InstallationSteps />
        <GoogleReviews />
        <FAQ />
        <QuickQuoteForm />
        <TvtCertificate />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
