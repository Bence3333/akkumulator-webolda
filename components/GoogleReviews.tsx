import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

interface GoogleReviewsData {
  name: string;
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

// Fallback data in case API fails
const fallbackData: GoogleReviewsData = {
  name: "SparkSolar",
  rating: 5.0,
  totalReviews: 127,
  reviews: [
    {
      authorName: "Kovács István",
      rating: 5,
      text: "Nagyon elégedett vagyok a SparkSolar csapatával! Gyors és precíz munkát végeztek, a napelem rendszer tökéletesen működik.",
      relativeTime: "2 hete",
    },
    {
      authorName: "Nagy Erzsébet",
      rating: 5,
      text: "Kiváló szolgáltatás, professzionális hozzáállás. Az akkumulátoros rendszer telepítése zökkenőmentesen zajlott.",
      relativeTime: "3 hete",
    },
    {
      authorName: "Szabó Péter",
      rating: 5,
      text: "A 80%-os támogatással fantasztikus áron kaptam meg a napelemes rendszert. Mindent elintéztek helyettem!",
      relativeTime: "1 hónapja",
    },
    {
      authorName: "Tóth Katalin",
      rating: 5,
      text: "Már fél éve működik a rendszer és tökéletesen teljesít. A monitoring alkalmazás is nagyon hasznos.",
      relativeTime: "1 hónapja",
    },
  ],
};

const GoogleReviews = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState<GoogleReviewsData>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: responseData, error } = await supabase.functions.invoke('google-reviews');
        
        if (error) {
          console.error('Error fetching reviews:', error);
          return;
        }

        if (responseData && responseData.reviews && responseData.reviews.length > 0) {
          setData(responseData);
        }
      } catch (err) {
        console.error('Failed to fetch Google reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const reviews = data.reviews;
  const maxIndex = Math.max(0, reviews.length - 2);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + maxIndex + 1) % (maxIndex + 1));
  };

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 2);
  if (visibleReviews.length < 2 && reviews.length > 1) {
    visibleReviews.push(...reviews.slice(0, 2 - visibleReviews.length));
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <section className="py-16 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4">
        <div
          className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Summary Section */}
          <div className="flex flex-col items-center text-center lg:min-w-[200px]">
            <span className="text-2xl font-bold text-foreground mb-2">KIVÁLÓ</span>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.round(data.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <svg
              className="h-8"
              viewBox="0 0 272 92"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill="#EA4335"
              />
              <path
                d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill="#FBBC05"
              />
              <path
                d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
                fill="#4285F4"
              />
              <path
                d="M225 3v65h-9.5V3h9.5z"
                fill="#34A853"
              />
              <path
                d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
                fill="#EA4335"
              />
              <path
                d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
                fill="#4285F4"
              />
            </svg>
          </div>

          {/* Reviews Carousel */}
          <div className="flex-1 relative flex items-center gap-4 w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={prevReview}
              className="shrink-0 rounded-full h-10 w-10 border-border/50 hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
              {visibleReviews.map((review, idx) => (
                <Card
                  key={`${review.authorName}-${idx}`}
                  className="p-5 bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.authorPhoto ? (
                        <img 
                          src={review.authorPhoto} 
                          alt={review.authorName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(review.authorName)} flex items-center justify-center text-white font-semibold`}>
                          {getInitial(review.authorName)}
                        </div>
                      )}
                      <span className="font-medium text-foreground text-sm">{review.authorName}</span>
                    </div>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm line-clamp-3">
                    {review.text}
                  </p>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextReview}
              className="shrink-0 rounded-full h-10 w-10 border-border/50 hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
