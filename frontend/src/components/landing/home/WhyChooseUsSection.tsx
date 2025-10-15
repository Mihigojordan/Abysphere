import React from 'react';
import { Play } from 'lucide-react';

export default function WhyChooseUsSection() {
  const stats = [
    {
      id: 1,
      label: "Team",
      value: "+56M",
      description: "Promote physical and mental well-being with access to wellness resources, fitness programs, and mental health support."
    },
    {
      id: 2,
      label: "Awards",
      value: "32M",
      description: "Celebrate your team's achievements with recognition programs, incentives, and rewards that foster a culture of appreciation."
    },
    {
      id: 3,
      label: "Projects",
      value: "25M",
      description: "Foster open dialogue with tools that make it easy for employees to share feedback, ask questions, and stay connected with leadership."
    }
  ];

  return (
    <div className="min-h-screen bg-primary-800 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop" 
          alt="Team background" 
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
            Why Choose Us
          </h2>

          {/* Video Play Card */}
          <div className="bg-primary-700/40 backdrop-blur-sm border border-primary-600/50 rounded-3xl p-12 text-center max-w-md">
            <button className="w-24 h-24 rounded-full bg-amber-400 hover:bg-amber-500 flex items-center justify-center mx-auto mb-6 transition-all shadow-lg hover:scale-105">
              <Play className="w-10 h-10 text-primary-900 fill-primary-900 ml-1" />
            </button>
            <h3 className="text-2xl font-bold text-white">
              View What Our<br />Client Feels
            </h3>
          </div>
        </div>

        {/* Right Section - Stats Cards */}
        <div className="space-y-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.id}
              className="bg-primary-700/40 backdrop-blur-sm border border-primary-600/50 rounded-3xl p-8 flex items-center gap-6 hover:bg-primary-700/50 transition-all"
              style={{
                borderColor: index === 1 ? '#fbbf24' : 'rgba(13, 148, 136, 0.5)'
              }}
            >
              {/* Stat Box */}
              <div className="bg-primary-800/60 rounded-2xl px-8 py-6 min-w-[140px] text-center flex-shrink-0">
                <div className="text-white/80 text-sm font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-4xl font-bold text-white">
                  {stat.value}
                </div>
              </div>

              {/* Description */}
              <p className="text-white/90 text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}