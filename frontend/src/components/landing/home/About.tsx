import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

const AboutUsSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      number: "01",
      title: "Eliminate Stock Errors",
      description: "Say goodbye to manual counting mistakes and spreadsheet chaos. Our automated system ensures 99.9% accuracy in tracking every item, reducing losses and improving customer satisfaction.",
    },
    {
      number: "02",
      title: "Save Time & Money",
      description: "Cut inventory management time by 75% with automated tracking, real-time updates, and smart alerts. Focus on growing your business instead of counting stock.",
    },
    {
      number: "03",
      title: "Scale Your Business",
      description: "Manage multiple locations effortlessly with centralized control. From one shop to nationwide operations, our system grows with you.",
    },
  ];

  const cards = [
    {
      number: "01",
      tag: "Real-Time",
      title: "Live Stock Tracking Across All Locations",
    },
    {
      number: "02",
      tag: "Automation",
      title: "Smart Alerts for Low Stock & Expiry Dates",
    },
    {
      number: "03",
      tag: "Analytics",
      title: "Powerful Reports to Drive Business Decisions",
    },
    {
      number: "04",
      tag: "Integration",
      title: "Seamless Multi-Branch Stock Management",
    },
  ];

  return (
    <div className="bg-slate-50">
      {/* About Section */}
      <div className="py-10 px-6 md:px-16">
        <div className=" mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary-600 mb-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
                  </div>
                  <span className="text-sm tracking-widest uppercase font-semibold">About Us</span>
                </div>

                <h2 className="text-4xl lg:text-3xl font-bold text-slate-900 leading-tight -mb-4">
                  Streamline Your Inventory with Smart Stock Management
                </h2>


              </div>

              {/* Features List */}
              <div className="space-y-8 mt-12">
                {features.map((feature, index) => (
                  <div key={index} className="border-b border-slate-200 pb-8 last:border-b-0">
                    <div className="flex gap-6">
                      {/* Number Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {feature.number}
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[550px]">
                <img
                  src="/About_us.png"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />

                {/* Quote Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/70 to-transparent p-8">
                  <p className="text-white text-lg italic leading-relaxed">
                    "Good inventory management is the backbone of any successful business. Know what you have, where it is, and when to reorder."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="pb-20">
        <div className=" mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 ">
            {cards.map((card, index) => (
              <div
                key={index}
                className="relative h-[60vh] md:h-full  border-r flex  overflow-hidden group cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Background Color instead of Image */}
                <div className={`absolute inset-0 bg-primary-900 transition-all duration-300 ${hoveredCard === index ? 'bg-primary-800' : ''}`}></div>

                {/* Large Number Watermark */}
                <div className={`absolute ${index % 2 == 0 ? ' top-8' : ' bottom-8'} left-1/3 text-8xl font-bold text-white/20`}>
                  {card.number}
                </div>

                {/* Arrow Icon (visible on hover) */}
                <div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${hoveredCard === index ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                >
                  <div className="w-20 h-20 bg-secondary-400/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-primary-900" />
                  </div>
                </div>

                {/* Content at Bottom */}
                <div className={`absolute text-center ${index % 2 == 0 ? ' bottom-0' : ' top-0'} left-0 right-0 p-8`}>
                  {/* Tag */}
                  <div className="inline-block px-6 py-2 border-2 border-secondary-400 rounded-full text-secondary-400 text-sm font-semibold mb-4">
                    {card.tag}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    {card.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsSection;