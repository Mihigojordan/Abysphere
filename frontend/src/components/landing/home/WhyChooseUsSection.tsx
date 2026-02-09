import React from 'react';
import { Play, RefreshCw, Building2, FileSpreadsheet, Users } from 'lucide-react';

export default function WhyMysystemSection() {
  const features = [
    {
      id: 1,
      icon: RefreshCw,
      label: "Real-time Updates",
      title: "Real-time Stock Updates",
      description: "Always know what's in, out, or running low. Track inventory movements instantly with live updates across all your devices and locations.",
      color: "teal"
    },
    {
      id: 2,
      icon: Building2,
      label: "Multi-branch",
      title: "Multi-branch Support",
      description: "Manage all your locations from one dashboard. Centralized control with branch-specific insights and seamless stock transfers.",
      color: "amber"
    },
    {
      id: 3,
      icon: FileSpreadsheet,
      label: "Digital First",
      title: "Replace Excel & Paper",
      description: "No more errors, no more manual calculations. Automate your inventory processes and eliminate human mistakes with smart digital tools.",
      color: "teal"
    },
    {
      id: 4,
      icon: Users,
      label: "All Sectors",
      title: "Designed for All Sectors",
      description: "Retail, restaurants, clinics, pharmacies, and more. Flexible system that adapts to your industry-specific needs and workflows.",
      color: "teal"
    }
  ];

  return (
    <div className="min-h-screen bg-primary-800 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=1600&h=900&fit=crop"
          alt="Stock management background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Decorative Vertical Lines */}
      <div className="absolute inset-0 flex justify-around pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-px h-full bg-primary-600/30"
            style={{ opacity: 0.5 }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Section */}
        <div>
          <div className="flex items-center gap-2 text-white/90 text-sm font-semibold mb-4">
            <span className="text-white">✓</span>
            <span>Solutions We Provide</span>
          </div>
          <h2 className="text-6xl font-bold text-white mb-12 leading-tight">
            Why Mysystem?
          </h2>

          {/* Video Play Card */}
          <div className="bg-primary-700/40 backdrop-blur-sm border border-primary-600/50 rounded-3xl p-12 text-center max-w-md">
            <button className="w-24 h-24 rounded-full bg-secondary-400 hover:bg-secondary-500 flex items-center justify-center mx-auto mb-6 transition-all shadow-lg hover:scale-105">
              <Play className="w-10 h-10 text-primary-900 fill-primary-900 ml-1" />
            </button>
            <h3 className="text-2xl font-bold text-white">
              See How Mysystem<br />Transforms Business
            </h3>
          </div>
        </div>

        {/* Right Section - Feature Cards */}
        <div className="space-y-6">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="bg-primary-700/40 backdrop-blur-sm border border-primary-600/50 rounded-3xl p-8 flex items-center gap-6 hover:bg-primary-700/50 transition-all group"
              style={{
                borderColor: feature.color === 'amber' ? '#fbbf24' : 'rgba(13, 148, 136, 0.5)'
              }}
            >
              {/* Icon Box */}
              <div className="bg-primary-800/60 rounded-2xl px-6 py-6 min-w-[120px] text-center flex-shrink-0 flex flex-col items-center gap-2">
                <feature.icon className="w-10 h-10 text-secondary-400 group-hover:scale-110 transition-transform" />
                <div className="text-white/80 text-xs font-semibold">
                  {feature.label}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}