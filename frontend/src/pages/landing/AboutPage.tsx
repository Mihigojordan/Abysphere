import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Users, Target, Award, TrendingUp, Star, Briefcase, ChevronRight, GoalIcon } from 'lucide-react';
import TestimonialSection from '../../components/landing/home/Testimonials';
import HeaderBanner from '../../components/landing/HeaderBanner';

export default function AboutUsSection() {
  const [hoveredService, setHoveredService] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      icon: Users,
      title: "Talent Acquisition",
      description: "Strategic recruitment solutions to find and attract top talent that aligns with your organizational culture and goals."
    },
    {
      icon: Target,
      title: "Performance Management",
      description: "Comprehensive systems for goal-setting, continuous feedback, and employee development planning."
    },
    {
      icon: Award,
      title: "Compensation & Benefits",
      description: "Competitive packages designed to attract, retain, and motivate your most valuable assets."
    },
    {
      icon: TrendingUp,
      title: "HR Analytics",
      description: "Data-driven insights for strategic workforce planning and organizational effectiveness."
    }
  ];

  const stats = [
    { value: "20+", label: "Years Experience" },
    { value: "500+", label: "Happy Clients" },
    { value: "98%", label: "Success Rate" },
    { value: "50+", label: "HR Experts" }
  ];

  const features = [
    "ISO 9001:2015 Certified",
    "Award-Winning HR Solutions",
    "24/7 Support Available",
    "Global Reach, Local Expertise"
  ];

  return (
    <div className="bg-white   overflow-hidden"
    
    >

        <HeaderBanner
              title="About Us"
              subtitle="Home / About Us"
              backgroundStyle="image"
              icon={ <GoalIcon className="w-8 h-8" />}
            />
      <div className=" mx-auto py-24 px-6 md:px-16">
        {/* Header Section */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-6">
            <Star className="w-4 h-4 fill-primary-600" />
            <span>ABOUT OUR COMPANY</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Strategic HR
            <span className="text-primary-600"> Partner</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Empowering organizations worldwide with innovative HR solutions that transform workplaces and drive business success.
          </p>
        </div>

        {/* Main Content Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 items-center">
          {/* Left - Image Section with Overlays */}
          <div className="relative">
            <div className="relative rounded-3xl  shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=900&fit=crop"
                alt="Professional HR Team"
                className="w-full h-[600px] object-cover rounded-3xl "
              />
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -left-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 shadow-2xl max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">500+</div>
                    <div className="text-white/90 text-sm font-medium">Projects Completed</div>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Trusted by Leading Companies</span>
                  </div>
                </div>
              </div>

              {/* Satisfaction Badge */}
              <div className="absolute top-8 right-8 bg-white rounded-2xl p-6 shadow-xl text-center">
                <div className="text-5xl font-bold text-primary-600 mb-1">98%</div>
                <div className="text-sm text-gray-700 font-semibold">Client Satisfaction</div>
                <div className="flex gap-1 mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary-400 text-secondary-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -z-10 top-8 left-8 w-full h-full bg-primary-100 rounded-3xl"></div>
          </div>

          {/* Right - Content Section */}
          <div className="space-y-8">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Transforming HR Management for the Modern Workplace
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                With over two decades of industry expertise, we've helped hundreds of organizations streamline their HR operations, build high-performing teams, and create workplace cultures where employees thrive.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our comprehensive approach combines cutting-edge technology with proven HR strategies to deliver measurable results. From recruitment to retention, we're with you every step of the way.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center gap-3 shadow-lg hover:shadow-xl">
                Discover Our Solutions
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4" />
              <span>OUR SERVICES</span>
            </div>
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive HR Solutions
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              End-to-end services designed to manage every aspect of your human resources operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isHovered = hoveredService === index;
              
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer group ${
                    isHovered 
                      ? 'border-primary-600 shadow-xl -translate-y-2' 
                      : 'border-gray-100 shadow-sm hover:shadow-lg'
                  }`}
                  onMouseEnter={() => setHoveredService(index)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                    isHovered 
                      ? 'bg-primary-600 scale-110' 
                      : 'bg-primary-50'
                  }`}>
                    <Icon className={`w-8 h-8 transition-colors duration-300 ${
                      isHovered ? 'text-white' : 'text-primary-600'
                    }`} />
                  </div>

                  {/* Content */}
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  <div className={`flex items-center gap-2 text-primary-600 font-semibold transition-all duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <span className="text-sm">Learn More</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>

                  {/* Hover Border Effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 opacity-0 transition-opacity duration-300 -z-10 ${
                    isHovered ? 'opacity-5' : ''
                  }`}></div>
                </div>
              );
            })}
          </div>
        </div>

        <TestimonialSection />

        {/* Bottom CTA */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative px-12 py-16 text-center">
            <h3 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your HR Operations?
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Schedule a consultation with our HR experts and discover how we can help your organization thrive.
            </p>
            <button className="group px-10 py-5 bg-white hover:bg-gray-100 text-primary-600 font-bold rounded-xl transition-all flex items-center gap-3 mx-auto shadow-xl text-lg">
              Schedule Consultation
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}