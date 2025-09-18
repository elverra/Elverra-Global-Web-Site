import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Crown, Gift, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  page_type: string;
  is_featured?: boolean;
}

interface HeroSliderProps {
  cmsContent?: CMSPage;
}

const HeroSlider = ({ cmsContent }: HeroSliderProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    // Auto-scroll every 5 seconds with smooth infinite loop
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // Reset to first slide for infinite loop
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const slides = [
    {
      id: 1,
      title: "ZENIKA Cards",
      subtitle: "Your Digital Value Card",
      description:
        "Enjoy your digital value card with QR code for quick access to services and exclusive discounts across our service and partnership network.",
      backgroundImage:
        "/lovable-uploads/0.jpeg",
      primaryButton: { text: "Get My Card", link: "/register" },
      secondaryButton: { text: "View Benefits", link: "/about" },
    },
    {
      id: 2,
      title: "Professional Solutions",
      subtitle: "Business Services & Partnerships",
      description:
        "Innovative financial solutions, strategic advice and partnership opportunities to develop your professional activity.",
      backgroundImage:
        "/lovable-uploads/1.jpeg",
      primaryButton: { text: "Pro Services", link: "/services" },
      secondaryButton: { text: "Become Partner", link: "/dahsboard" },
    },
    {
      id: 3,
      title: "Career & Employment",
      subtitle: "Professional Opportunities",
      description:
        "Find your dream job or recruit the best talent through our platform dedicated to our client network.",
      backgroundImage:
        "/lovable-uploads/2.jpeg",
      primaryButton: { text: "Find a Job", link: "/job-center" },
      secondaryButton: { text: "Recruit", link: "/dashboard" },
    },
    {
      id: 4,
      title: "Education & Scholarships",
      subtitle: "Community Projects",
      description:
        "Access scholarships, educational projects and personal development programs for our youths network.",
      backgroundImage:
        "/lovable-uploads/3.jpeg",
      primaryButton: { text: "View Projects", link: "/about/projects" },
      secondaryButton: {
        text: "Apply for Scholarship",
        link: "/about/projects",
      },
    },
  ];

  return (
    <section className="relative overflow-hidden">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          duration: 35,
        }}
      >
        <CarouselContent className="transition-all duration-7000 ease-out">
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative py-20 md:py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
                {/* Background image with reduced transparency overlay */}
                <div className="absolute inset-0 opacity-60">
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-[12000ms] ease-out hover:scale-110"
                    style={{
                      backgroundImage: `url('${slide.backgroundImage}')`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/30 to-purple-800/40"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 text-white animate-fade-in">
                      <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 transition-all duration-300 hover:bg-white/20">
                        <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {slide.subtitle}
                        </span>
                      </div>

                      <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                        {slide.title.includes("ZENIKA") ? (
                          <>
                            ZENIKA
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-300">
                              {" "}
                              Cards
                            </span>
                          </>
                        ) : slide.title.includes("Professional") ? (
                          <>
                            Professional
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-300">
                              {" "}
                              Solutions
                            </span>
                          </>
                        ) : slide.title.includes("Career") ? (
                          <>
                            Career &
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-300">
                              {" "}
                              Employment
                            </span>
                          </>
                        ) : slide.title.includes("Education") ? (
                          <>
                            Education &
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-300">
                              {" "}
                              Scholarships
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-300">
                              Elverra
                            </span>{" "}
                            Global
                          </>
                        )}
                      </h1>

                      <p className="text-xl md:text-2xl text-gray-300 max-w-lg leading-relaxed">
                        {slide.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                          asChild
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-xl transform transition-all duration-300 hover:scale-105"
                        >
                          <Link to={slide.primaryButton.link}>
                            {slide.primaryButton.text}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="border-white/30 text-black hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        >
                          <Link to={slide.secondaryButton.link}>
                            {slide.secondaryButton.text}
                          </Link>
                        </Button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-6 pt-8">
                        <div className="text-center transform transition-all duration-500 hover:scale-110">
                          <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="h-6 w-6 text-green-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">5-40%</p>
                          <p className="text-sm text-gray-300">
                            Client Discounts
                          </p>
                        </div>
                        <div className="text-center transform transition-all duration-500 hover:scale-110">
                          <div className="flex items-center justify-center mb-2">
                            <Gift className="h-6 w-6 text-yellow-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">10%</p>
                          <p className="text-sm text-gray-300">
                            Referral Bonus
                          </p>
                        </div>
                        <div className="text-center transform transition-all duration-500 hover:scale-110">
                          <div className="flex items-center justify-center mb-2">
                            <Users className="h-6 w-6 text-blue-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">2M+</p>
                          <p className="text-sm text-gray-300">Clients</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        className="relative z-20 animate-fade-in"
                        style={{ animationDelay: "0.5s" }}
                      >
                        {/* ZENIKA Card Design - Elite */}
                        <div
                          className="relative overflow-hidden rounded-2xl shadow-2xl transform rotate-2 z-10 transition-all duration-500 hover:rotate-1 hover:scale-105"
                          style={{
                            backgroundImage: `url('/lovable-uploads/elite-card.png')`,
                            aspectRatio: "1.6/1",
                            width: "300px",
                          }}
                        ></div>

                        {/* ZENIKA Card Design - Premium */}
                        <div
                          className="relative overflow-hidden rounded-2xl shadow-xl transform -rotate-3 absolute -top-8 -left-8 z-0 transition-all duration-500 hover:-rotate-2"
                          style={{
                            border: "3px solid #22c55e",
                            backgroundImage: `url('/lovable-uploads/premium-card.png')`,
                            aspectRatio: "1.6/1",
                            width: "280px",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom Navigation */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110" />

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                current === index + 1
                  ? "bg-white scale-125"
                  : "bg-white/30 hover:bg-white/50 hover:scale-110"
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
};

export default HeroSlider;