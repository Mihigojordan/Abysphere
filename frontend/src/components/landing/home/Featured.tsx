import React from 'react';
import { Check, Star, ArrowUpRight } from 'lucide-react';

export default function WhoCanUseSection() {
  const sectors = [
    {
      image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=2073",
      title: "Retail & Supermarkets",
      description: "Track products, expiry dates, and daily stock usage with automated alerts and real-time inventory updates.",
      benefits: ["Product tracking", "Expiry monitoring", "Daily stock reports"]
    },
    {
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070",
      title: "Restaurants & Bars",
      description: "Manage ingredients, recipes, kitchen usage, and wastage to reduce costs and optimize menu planning.",
      benefits: ["Recipe management", "Ingredient tracking", "Wastage control"]
    },
    {
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=2068",
      title: "Pharmacies",
      description: "Track batch numbers, expiry alerts, and medicine inventory with compliance-ready reporting systems.",
      benefits: ["Batch tracking", "Expiry alerts", "Medicine inventory"]
    },
    {
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053",
      title: "Clinics & Medical Centers",
      description: "Monitor medicine, medical equipment, and consumables to ensure continuous patient care supply.",
      benefits: ["Equipment tracking", "Medicine stock", "Consumables monitoring"]
    },
    {
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070",
      title: "Hardware & Construction",
      description: "Manage tools, building materials, and supplier orders with project-based inventory allocation.",
      benefits: ["Tools management", "Materials tracking", "Supplier orders"]
    },
    {
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070",
      title: "Fashion & Boutique",
      description: "Track sizes, colors, and product variations with visual inventory management for apparel businesses.",
      benefits: ["Size tracking", "Color variants", "Style management"]
    }
  ];

  return (
    <div className="bg-gray-50 p-8 md:p-16 py-8">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
            </div>
            <span className="text-sm tracking-widest uppercase font-semibold">Solutions for Every Sector</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Who Can Use Mysystem?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Mysystem supports businesses of all sectors with tailored inventory management solutions designed to meet your unique operational needs.
          </p>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sectors.map((sector, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={sector.image}
                  alt={sector.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              <div className="p-8">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {sector.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {sector.description}
                </p>

                {/* Benefits List */}
                <div className="space-y-2">
                  {sector.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-3xl p-12 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                No matter what sector you're in, Mysystem adapts to your workflow. Say goodbye to stock errors, manual tracking, and spreadsheet chaos.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-semibold">
                  ✓ Real-time tracking
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-semibold">
                  ✓ Multi-branch support
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-semibold">
                  ✓ Automated alerts
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-semibold">
                  ✓ Easy reporting
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              {/* Trustpilot-style Rating */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-white">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                      alt="User 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-white -ml-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                      alt="User 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-white -ml-3">
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                      alt="User 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-secondary-400 fill-secondary-400" />
                    ))}
                  </div>
                  <div className="text-white text-sm font-semibold">500+ Happy Businesses</div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full md:w-auto bg-secondary-400 hover:bg-secondary-500 text-gray-900 font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl mx-auto md:mx-0 md:ml-auto">
                Get Started Now
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* About Summary Section */}
        <div className="mt-16 bg-white rounded-3xl p-12 shadow-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              About Mysystem
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Mysystem is a comprehensive stock management solution built for businesses that want to move beyond Excel sheets and manual tracking. Whether you run a small boutique or manage multiple warehouse locations, our platform provides real-time visibility, automated alerts, and powerful reporting tools.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              With support for unlimited products, multi-branch operations, and role-based access control, Mysystem scales with your business. Our system integrates seamlessly into your existing workflow, helping you reduce waste, prevent stockouts, and make data-driven decisions that drive growth.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">7+</div>
                <div className="text-sm text-gray-600 font-semibold">Sectors Supported</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-sm text-gray-600 font-semibold">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600 font-semibold">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600 font-semibold">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}