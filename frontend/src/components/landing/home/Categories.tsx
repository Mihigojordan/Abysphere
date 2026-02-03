import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Package, TrendingDown, Users, Bell, Calendar, ArrowLeftRight, BarChart3, Shield, ArrowRight, Handshake } from 'lucide-react';

const StockFeaturesSection = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const features = [
    {
      icon: Package,
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070",
      tag: "Organize Inventory",
      title: "Product & Category Management",
      description: "Efficiently organize your products with hierarchical categories, custom attributes, SKU management, and bulk operations for seamless inventory control.",
    },
    {
      icon: TrendingDown,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070",
      tag: "Track Movement",
      title: "Stock In / Stock Out",
      description: "Monitor every item entering and leaving your warehouse with detailed transaction logs, real-time updates, and automated stock level adjustments.",
    },
    {
      icon: Users,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070",
      tag: "Vendor Relations",
      title: "Supplier & Purchase Management",
      description: "Streamline procurement with supplier profiles, purchase orders, quotation comparisons, and automated reordering based on stock thresholds.",
    },
    {
      icon: Bell,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2074",
      tag: "Stay Informed",
      title: "Low Stock Alerts",
      description: "Never run out of critical items with customizable alert thresholds, email notifications, and automated purchase suggestions to maintain optimal inventory levels.",
    },
    {
      icon: Calendar,
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072",
      tag: "Reduce Waste",
      title: "Expiry Tracking",
      description: "Minimize losses with automated expiry date monitoring, FIFO/FEFO management, and advance warnings for items approaching expiration.",
    },
    {
      icon: ArrowLeftRight,
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070",
      tag: "Multi-Location",
      title: "Stock Transfer Between Branches",
      description: "Seamlessly move inventory across multiple locations with transfer requests, approval workflows, and real-time tracking of goods in transit.",
    },
    {
      icon: BarChart3,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070",
      tag: "Data Insights",
      title: "Full Reporting & Analytics",
      description: "Make informed decisions with comprehensive dashboards, custom reports, trend analysis, and predictive insights for inventory optimization.",
    },
    {
      icon: Shield,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070",
      tag: "Secure Access",
      title: "User Roles & Permissions",
      description: "Control access with granular permission settings, role-based authentication, audit trails, and multi-level approval workflows for critical operations.",
    },
       {
      icon: Handshake,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2087",
      tag: "Hiring Made Easy",
      title: "Executive Search & Leadership Hiring",
      description: "Strategic executive recruitment services that connect you with visionary leaders who can transform your organization and navigate complex business challenges.",
    },
  ];

  return (
    <div className="bg-slate-50 py-20 px-8 md:px-16">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
            </div>
            <span className="text-sm tracking-widest uppercase font-semibold">Core Features Preview</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to Manage Stock
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to simplify inventory management for businesses of all sizes
          </p>
        </div>

        {/* Features Grid - Quick Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-4 rounded-xl text-center hover:shadow-lg transition-shadow">
              <feature.icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">{feature.tag}</p>
            </div>
          ))}
        </div>

        {/* Features Swiper */}
        <div className="mb-12">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            slidesPerGroup={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            onSlideChange={() => {
              setActiveIndex(1);
            }}
            onInit={() => {
              setActiveIndex(1);
            }}
            onSwiper={(swiper) => setSwiperInstance(swiper)}
            breakpoints={{
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
              },
            }}
          >
            {features.map((feature, index) => (
              <SwiperSlide key={index}>
                <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Image Container with Icon Badge */}
                  <div className="relative p-6 h-80 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 rounded-lg transition-transform duration-500"
                    />
                    {/* Icon Badge */}
                    <div className="absolute z-10 bottom-2 right-0 w-20 h-20 p-1.5 bg-white rounded-full flex justify-center shadow-xl">
                      <div className="w-full h-full bg-primary-700 flex items-center justify-center rounded-full group-hover:bg-primary-600 transition-colors">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Tag */}
                    <div className="text-primary-600 text-sm font-semibold mb-3">
                      {feature.tag}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-primary-700 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Divider */}
                    <div className="w-16 h-0.5 bg-slate-300 mb-4 group-hover:bg-primary-600 group-hover:w-24 transition-all duration-300"></div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Custom Pagination Dots */}
        <div className="flex justify-center items-center gap-3 mb-12">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => {
                if (swiperInstance) {
                  if (index === 0) {
                    swiperInstance.slidePrev();
                  } else if (index === 2) {
                    swiperInstance.slideNext();
                  }
                }
              }}
              className={`rounded-full transition-all duration-300 ${
                activeIndex === index ? 'bg-primary-600 w-8 h-3' : 'bg-slate-300 w-3 h-3'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl">
            View All Features
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockFeaturesSection;