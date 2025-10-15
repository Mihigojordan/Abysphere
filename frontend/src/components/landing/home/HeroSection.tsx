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
      title: "HR Excellence Starts Here.",
      subtitle: "We believe in thinking ahead and creating solutions that meet today's challenges and pave the way for future success.",
      stat: "300+",
      statLabel: "Vacancy Hiring",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074",
    },
    {
      title: "Transform Your Workforce.",
      subtitle: "Strategic talent management solutions designed to elevate your organization's performance and drive sustainable growth.",
      stat: "500+",
      statLabel: "Clients Served",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070",
    },
    {
      title: "Recruit With Confidence.",
      subtitle: "Find the perfect candidates faster with our data-driven recruitment platform and expert HR consulting services.",
      stat: "1000+",
      statLabel: "Placements Made",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069",
    },
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
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Gradient Overlay for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent lg:to-white/30"></div>

      {/* Vertical "Scroll To Explore" Text */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50">
  <div className="flex flex-col items-center gap-4">
    <div className="writing-mode-vertical text-sm tracking-widest text-slate-600 font-medium transform -rotate-180">
      Scroll To Explore
    </div>
    <div className="w-px h-16 bg-slate-300"></div>


    <div className="relative">
      <div
        className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer hover:bg-primary-600 hover:text-white transition-all
        before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-primary-700/40 before:animate-[ping_1s_ease-in-out_infinite]"
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
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="grid lg:grid-cols-2 h-full">
              {/* Left Content Section */}
              <div className="flex flex-col justify-center px-16 lg:px-24 py-16">
                {/* Logo/Brand */}
                <div
                  className={`mb-8 transition-all duration-700 delay-100 ${
                    currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2 text-primary-600 mb-8">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
                    </div>
                    <span className="text-xs tracking-widest uppercase font-semibold">Make Your Vision To Reality</span>
                  </div>
                </div>

                {/* Main Heading */}
                <h1
                  className={`text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-6 leading-tight transition-all duration-700 delay-200 ${
                    currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p
                  className={`text-lg text-slate-600 mb-10 max-w-xl leading-relaxed transition-all duration-700 delay-300 ${
                    currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  {slide.subtitle}
                </p>

                {/* CTA Button */}
                <div
                  className={`transition-all duration-700 delay-400 ${
                    currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  <button className="group px-8 py-4 bg-slate-900 text-white font-semibold rounded hover:bg-primary-600 transition-all duration-300 flex items-center gap-2">
                    LEARN MORE
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Phone Number */}
                <div
                  className={`mt-16 flex items-center gap-4 transition-all duration-700 delay-500 ${
                    currentSlide === index && isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="w-24 h-px bg-slate-300"></div>
                  <a href="tel:+5284567592" className="text-xl font-semibold text-slate-900 hover:text-primary-600 transition-colors">
                    +(528) 456-7592
                  </a>
                </div>
              </div>

              {/* Right Side - Stats and Navigation */}
              <div className="relative flex items-center justify-center">
                {/* Stat Badge - secondary Circle */}
                <div
                  className={`absolute bottom-32 left-12 transition-all duration-700 delay-600 ${
                    currentSlide === index && isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
                  }`}
                >
                  <div className="w-48 h-48 bg-secondary-400 rounded-full flex flex-col animate-float items-center justify-center shadow-2xl">
                    <div className="text-primary-600 mb-2">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div className="text-5xl font-bold text-slate-900">{slide.stat}</div>
                    <div className="text-sm font-medium text-slate-700">{slide.statLabel}</div>
                  </div>
                </div>

                {/* "Find jobs in global" Card */}
                <div
                  className={`absolute top-32 right-12 transition-all duration-700 delay-700 ${
                    currentSlide === index && isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                  }`}
                >
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-64">
                    <div className="flex items-center justify-center mb-3">
                      <div className="flex gap-1">
                        <div className="text-primary-600 text-3xl">★</div>
                        <div className="text-primary-600 text-3xl">★</div>
                        <div className="text-primary-600 text-3xl">★</div>
                      </div>
                    </div>
                    <div className="text-center text-lg font-semibold text-slate-900">
                      Find jobs in global
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute bottom-12 right-12 flex gap-3">
                  <button
                    onClick={prevSlide}
                    className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-all shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
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