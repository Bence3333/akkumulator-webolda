import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import tvtCertificate from "@/assets/tvt-certificate.png";

const TvtCertificate = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-6 mb-4">
      <div ref={ref} className="container mx-auto px-4">
        <div className={`flex justify-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <img 
            src={tvtCertificate} 
            alt="Tisztességes Vállalkozás Tanúsítvány 2025" 
            className="h-20 md:h-24 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>
    </section>
  );
};

export default TvtCertificate;
