import React, { useState, useEffect } from 'react';
import { Fish, Waves, Users, TrendingUp, ChevronDown, Package, Truck, ArrowRight } from 'lucide-react';

const FineFishHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: { clientX: number; clientY: number }) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const slides = [
    {
      title: "Certified Hatchery Excellence",
      subtitle: "Supplying Millions of Healthy Fingerlings Nationwide",
      stat: "5M+",
      statLabel: "Fingerlings Annually",
      icon: Fish,
      image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070",
      gradient: "from-primary-600 to-primary-400",
      features: ["ISO Certified", "Disease-Free", "Fast Growth"],
    },
    {
      title: "Premium Fish Feed Production",
      subtitle: "Scientifically Formulated Nutrition for Optimal Growth",
      stat: "100T+",
      statLabel: "Monthly Feed Production",
      icon: Package,
      image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=2071",
      gradient: "from-secondary-600 to-secondary-400",
      features: ["High Protein", "Natural Ingprimaryients", "Cost Effective"],
    },
    {
      title: "Advanced Cage Farming",
      subtitle: "Sustainable Aquaculture on Lake Kivu's Crystal Waters",
      stat: "200+",
      statLabel: "Floating Cages",
      icon: Waves,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070",
      gradient: "from-primary-600 to-primary-400",
      features: ["Eco-Friendly", "Deep Water", "Modern Tech"],
    },
    {
      title: "Reliable Fish Delivery",
      subtitle: "Fresh From Our Farms to Your Destination Nationwide",
      stat: "90T+",
      statLabel: "Monthly Distribution",
      icon: Truck,
      image: "https://images.unsplash.com/photo-1565373679544-1531f57e2be8?q=80&w=2070",
      gradient: "from-secondary-600 to-secondary-400",
      features: ["24/7 Service", "Cold Chain", "Quality Assuprimary"],
    },
  ];

  const stats = [
    { icon: TrendingUp, value: "90+", label: "Tonnes Monthly" },
    { icon: Fish, value: "200+", label: "Floating Cages" },
    { icon: Package, value: "100T+", label: "Feed Production" },
    { icon: Users, value: "5M+", label: "Fingerlings" },
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary-500/10"
            style={{
              width: Math.random() * 100 + 50 + "px",
              height: Math.random() * 100 + 50 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 20 + 15}s infinite ease-in-out`,
              animationDelay: Math.random() * 5 + "s",
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay Animation */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} transition-all duration-1000`} />
      </div>

      {/* Main Hero Slider */}
      <div className="relative h-screen">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              currentSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            {/* Background Image with Parallax */}
            <div
              className="absolute inset-0"
              style={{
                transform:
                  currentSlide === index
                    ? `scale(1.1) translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
                    : "scale(1.2)",
                transition: "transform 0.3s ease-out",
              }}
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-8xl mx-auto px-6 lg:px-8 w-full md:-mt-28">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <div>
                    {/* Logo Badge */}
                    <div
                      className={`flex items-center gap-3 mb-8 transition-all duration-700 delay-100 ${
                        currentSlide === index && isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                      }`}
                    >
                      <div className={`p-3 bg-gradient-to-br ${slide.gradient} rounded-2xl shadow-2xl`}>
                        <slide.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">Fine Fish Ltd</h1>
                        <p className="text-cyan-400 text-sm">Rwanda's Aquaculture Leader</p>
                      </div>
                    </div>

                    {/* Main Title with Gradient */}
                    <h2
                      className={`text-5xl lg:text-7xl font-black mb-6 leading-tight transition-all duration-700 delay-200 ${
                        currentSlide === index && isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                      }`}
                    >
                      <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                        {slide.title}
                      </span>
                    </h2>

                    {/* Subtitle */}
                    <p
                      className={`text-xl text-slate-300 mb-8 transition-all duration-700 delay-300 ${
                        currentSlide === index && isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                      }`}
                    >
                      {slide.subtitle}
                    </p>

                    {/* Feature Pills */}
                    <div
                      className={`flex flex-wrap gap-3 mb-10 transition-all duration-700 delay-400 ${
                        currentSlide === index && isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                      }`}
                    >
                      {slide.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white text-sm font-medium"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA Buttons */}
                    <div
                      className={`flex flex-wrap gap-4 transition-all duration-700 delay-500 ${
                        currentSlide === index && isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                      }`}
                    >
                      <button
                        className={`group px-8 py-4 bg-gradient-to-r ${slide.gradient} text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2`}
                      >
                        Explore Our Services
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
                        Contact Us
                      </button>
                    </div>
                  </div>

                  {/* Right Content - Stat Card */}
                  <div
                    className={`transition-all duration-700 delay-600 ${
                      currentSlide === index && isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
                    }`}
                  >
                    <div className="relative">
                      {/* Glowing Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} blur-3xl opacity-30 animate-pulse`}></div>

                      {/* Card */}
                      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`p-4 bg-gradient-to-br ${slide.gradient} rounded-2xl`}>
                            <slide.icon className="w-12 h-12 text-white" />
                          </div>
                          <div>
                            <div className="text-6xl font-black text-white">{slide.stat}</div>
                            <div className="text-cyan-300 text-lg font-medium">{slide.statLabel}</div>
                          </div>
                        </div>

                        {/* Mini Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                          {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <stat.icon className="w-6 h-6 text-cyan-400 mb-2" />
                              <div className="text-2xl font-bold text-white">{stat.value}</div>
                              <div className="text-slate-400 text-xs">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Modern Slider Navigation */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex gap-3 bg-white/10 backdrop-blur-lg p-3 rounded-full border border-white/20">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`group relative transition-all duration-300 ${currentSlide === index ? "w-16" : "w-12"}`}
              >
                <div
                  className={`h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentSlide === index ? `bg-gradient-to-r ${slide.gradient}` : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  <slide.icon
                    className={`transition-all duration-300 ${
                      currentSlide === index ? "w-6 h-6 text-white" : "w-5 h-5 text-slate-300"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Indicator with Animation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <div className="text-white text-sm font-medium">Scroll to explore</div>
            <ChevronDown className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0px) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default FineFishHero;
