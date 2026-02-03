import React, { useState, useEffect } from 'react';
import { Users, Briefcase, TrendingUp, Award, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const HRExcellenceHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      title: "Stop Losing Money to Stock Errors",
      subtitle: "Manual tracking is costing you sales. Get real-time visibility into every item, eliminate stockouts, and boost profits with automated inventory management.",
      stat: "99.5%",
      statLabel: "Accuracy Rate",
      image: "/stock.png",
    },
    {
      title: "Manage Inventory Like a Pro",
      subtitle: "From one location to nationwide operations — track stock movements, set smart alerts, and make data-driven decisions that grow your business.",
      stat: "75%",
      statLabel: "Time Saved",
      image: "/stock.png",
    },
    {
      title: "Your Business Deserves Better Than Spreadsheets",
      subtitle: "Join 500+ businesses using Mysystem to automate stock tracking, reduce waste, and scale effortlessly across multiple branches.",
      stat: "500+",
      statLabel: "Happy Businesses",
      image: "/stock.png",
    },
    // {
    //   title: "Transform Your Workforce.",
    //   subtitle: "Strategic talent management solutions designed to elevate your organization's performance and drive sustainable growth.",
    //   stat: "500+",
    //   statLabel: "Clients Served",
    //   image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070",
    // },
    // {
    //   title: "Recruit With Confidence.",
    //   subtitle: "Find the perfect candidates faster with our data-driven recruitment platform and expert HR consulting services.",
    //   stat: "1000+",
    //   statLabel: "Placements Made",
    //   image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069",
    // },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image with transitions */}
      {slides.map((slide, index) => (
        <div
          key={`bg-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlay for text visibility */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

      {/* Vertical "Scroll To Explore" Text */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="writing-mode-vertical text-sm tracking-widest text-slate-600 font-medium transform -rotate-180">
            Scroll To Explore
          </div>
          <div className="w-px h-16 bg-slate-300"></div>

          <div className="relative">
            <div
              className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer hover:bg-emerald-600 hover:text-white transition-all
              before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-emerald-700/40 before:animate-[ping_1s_ease-in-out_infinite]"
            >
              ↓
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="flex items-center justify-center h-full w-full">
              {/* Centered Content Section */}
              <div className="flex flex-col items-center justify-center px-6 lg:px-24 py-16 text-center max-w-5xl">
                {/* Logo/Brand Tag */}
                <div
                  className={`mb-8 transition-all duration-700 delay-100 ${currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}
                >
                  <div className="flex flex-col items-center gap-2 text-emerald-600 mb-8">
                    <div className="flex justify-center gap-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                    </div>
                    <span className="text-xs tracking-widest uppercase font-semibold">Make Your Vision To Reality</span>
                  </div>
                </div>

                {/* Main Heading */}
                <h1
                  className={`text-5xl lg:text-5xl xl:text-7xl font-bold text-emerald-900 mb-6 leading-tight transition-all duration-700 delay-200 ${currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}
                >
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p
                  className={`text-lg text-emerald-800 mb-10 max-w-2xl leading-relaxed transition-all duration-700 delay-300 mx-auto ${currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}
                >
                  {slide.subtitle}
                </p>

                {/* CTA Buttons */}
                <div
                  className={`transition-all duration-700 delay-400 flex flex-wrap justify-center gap-4 ${currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}
                >
                  <button className="group px-8 py-4 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center gap-2 shadow-lg">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-emerald-900 font-semibold rounded-lg border-2 border-emerald-700 hover:bg-emerald-700 hover:text-white transition-all duration-300 shadow-lg">
                    Request a Demo
                  </button>
                </div>

                {/* Phone Number */}
                <div
                  className={`mt-16 flex items-center gap-4 transition-all duration-700 delay-500 ${currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}
                >
                  <div className="w-12 h-px bg-emerald-400"></div>
                  <a href="tel:+250791813289" className="text-xl font-semibold text-emerald-900 hover:text-emerald-600 transition-colors">
                    +(250) 791-813-289
                  </a>
                  <div className="w-12 h-px bg-emerald-400"></div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-12 right-12 flex gap-3 z-50">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-emerald-600/80 text-white flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-emerald-600/80 text-white flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg backdrop-blur-sm"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
        }
      `}</style>
    </div>
  );
};

export default HRExcellenceHero;