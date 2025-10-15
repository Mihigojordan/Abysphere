import React from 'react';
import { Check, Star, ArrowUpRight } from 'lucide-react';

export default function SuccessStoriesHero() {
  return (
    <div className="min-h-screen bg-gray-50 p-16 py-0 flex items-center justify-center">
      <div className="  grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Section */}
        <div className="lg:col-span-5 relative">
          {/* 50+ Years Card - Larger, behind */}
          <div className="relative bg-gradient-to-br from-primary-900 to-primary-700 rounded-3xl overflow-hidden shadow-lg w-full h-[500px]">
            <div className="absolute inset-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
              <div className="text-8xl font-bold text-white/30 mb-2">50+</div>
              <div className="text-6xl font-bold text-white/30">Years</div>
            </div>
          </div>

          {/* Header Card - Overlapping on top */}
          <div className="absolute -top-1/4 shodow-xl -left-[5%] bg-gradient-to-br from-gray-100 to-white rounded-3xl p-8 shadow-lg max-w-md z-10">
            <div className="flex items-center gap-2 text-primary-700 text-sm font-semibold mb-3">
              <span className="text-primary-600">✓</span>
              <span>SOLUTIONS WE PROVIDE</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Success Stories that Inspire
            </h1>
          </div>
        </div>

        {/* Center Section - Professional Image */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="relative">
            <div className="w-80 h-96 rounded-full overflow-hidden bg-white shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=top" 
                alt="Professional" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-4 -right-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-2 h-2 rounded-full bg-gray-300"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Chart Card */}
          <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm w-full max-w-sm">
            <div className="flex items-center gap-6">
              {/* Donut Chart */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Customer Growth - primary */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="20"
                    strokeDasharray="150 251"
                  />
                  {/* Business Transformation - Yellow */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="20"
                    strokeDasharray="60 251"
                    strokeDashoffset="-150"
                  />
                  {/* Company Development - primary Dark */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="20"
                    strokeDasharray="41 251"
                    strokeDashoffset="-210"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                  <span className="text-gray-700">Customer Growth</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span className="text-gray-700">Business Transformation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <span className="text-gray-700">Company Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Employer Branding Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <Check className="w-5 h-5 text-primary-600 mt-1" />
              <h3 className="text-xl font-bold text-gray-900">Employer Branding</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              A strong employer brand helps attract top talent, improve employee retention.
            </p>
          </div>

          {/* Industry Knowledge Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <Check className="w-5 h-5 text-primary-600 mt-1" />
              <h3 className="text-xl font-bold text-gray-900">Industry Knowledge</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Related to workforce management, organizational development, and compliance.
            </p>
          </div>

          {/* Make Appointment Card */}
          <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-3xl p-8 shadow-lg text-center">
            <h3 className="text-white text-2xl font-bold mb-6">MAKE APPOINTMENT</h3>
            
            {/* Trustpilot Rating */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                    alt="User 1" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white -ml-3">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                    alt="User 2" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span className="text-white font-semibold text-sm">Trustpilot</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <button className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
              CONTACT US
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}