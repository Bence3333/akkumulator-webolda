import { useState, useEffect } from "react";
import hero1 from "@/assets/hero-1.png";
import hero2 from "@/assets/hero-2.png";
import hero3 from "@/assets/hero-3.png";
import hero4 from "@/assets/hero-4.png";
import hero5 from "@/assets/hero-5.png";
import hero6 from "@/assets/hero-6.png";

const images = [hero1, hero2, hero3, hero4, hero5, hero6];

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {/* Overlay - balanced for image visibility and text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/40 dark:via-background/90 dark:to-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/10 dark:via-background/40 dark:to-background/30" />
    </div>
  );
};

export default HeroSlideshow;
