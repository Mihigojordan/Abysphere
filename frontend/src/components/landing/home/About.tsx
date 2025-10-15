import { useState, useEffect, type ReactNode } from "react";
import {
  Fish,
  Shield,
  Waves,
  Heart,
  TrendingUp,
  Building,
  Calendar,
  Star,
  Globe,
  Award,
  Users,
  Leaf,
} from "lucide-react";

import image2 from '../../../assets/image2.jpg'
import image3 from '../../../assets/image1.jpg'
import image1 from '../../../assets/image2.jpg'
import image4 from '../../../assets/image4.jpg'
import image5 from '../../../assets/image5.jpg'

// Types
interface CountUpState {
  cages: number;
  years: number;
  tonnes: number;
  fingerlings: number;
}

interface Stat {
  key: keyof CountUpState;
  number: string;
  label: string;
  icon: ReactNode;
  color: string;
}

interface ValueItem {
  icon: ReactNode;
  title: string;
  description: string;
  highlight: string;
}

interface Achievement {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function AboutSection() {
  const [activeValue, setActiveValue] = useState<number>(0);
  const [countUp, setCountUp] = useState<CountUpState>({
    cages: 0,
    years: 0,
    tonnes: 0,
    fingerlings: 0,
  });

  // Counter animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCountUp({
        cages: 200,
        years: 8,
        tonnes: 90,
        fingerlings: 5,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const stats: Stat[] = [
    {
      key: "cages",
      number: `${countUp.cages}+`,
      label: "Floating Cages",
      icon: <Building className="w-6 h-6" />,
      color: "text-primary-600",
    },
    {
      key: "years",
      number: `${countUp.years}+`,
      label: "Years of Excellence",
      icon: <Calendar className="w-6 h-6" />,
      color: "text-secondary-600",
    },
    {
      key: "tonnes",
      number: `${countUp.tonnes}+`,
      label: "Tonnes Monthly",
      icon: <Fish className="w-6 h-6" />,
      color: "text-primary-600",
    },
    {
      key: "fingerlings",
      number: `${countUp.fingerlings}M+`,
      label: "Fingerlings Annually",
      icon: <Star className="w-6 h-6" />,
      color: "text-secondary-600",
    },
  ];

  const values: ValueItem[] = [
    {
      icon: <Waves className="w-8 h-8" />,
      title: "Sustainable Cage Farming",
      description:
        "Operating over 200 floating cages on Lake Kivu and Lake Muhazi, we use deep-water techniques that preserve biodiversity and maintain pristine water quality.",
      highlight: "Eco-Friendly Operations",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Certified Hatchery",
      description:
        "Our government-approved hatchery in Rwamagana produces millions of healthy Nile tilapia fingerlings annually, supporting farmers nationwide.",
      highlight: "RAB Approved",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Community Empowerment",
      description:
        "Through partnerships with Karongi TVET and local cooperatives, we provide training and job opportunities in modern aquaculture practices.",
      highlight: "Skills Development",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Vision 2050 Partner",
      description:
        "Contributing to Rwanda's goal of 80,000–112,000 tonnes annually by 2035, advancing the secondary economy and reducing fish imports.",
      highlight: "National Impact",
    },
  ];

  const achievements: Achievement[] = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Industry Pioneer",
      description: "Leading sustainable aquaculture in Rwanda",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Dual Lake Operations",
      description: "Farming on Lake Kivu and Lake Muhazi",
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Sustainable Practices",
      description: "Protecting ecosystems while feeding communities",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Local Employment",
      description: "Creating jobs and training opportunities",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      
      {/* Wave patterns */}
      <div className="absolute top-0 left-0 w-full h-32 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,50 350,50 600,20 C850,50 1050,50 1200,0 L1200,120 L0,120 Z" fill="currentColor" className="text-primary-600"/>
        </svg>
      </div>
      
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
            <Fish className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Pioneering Sustainable <span className="text-primary-600">Aquaculture</span> in Rwanda
          </h2>
          <p className="text-xl text-gray-600 w-full mx-auto leading-relaxed">
            From the shores of Lake Kivu to tables across Rwanda, Fine Fish Ltd delivers premium Nile tilapia through eco-friendly farming practices
          </p>
        </div>

        {/* Hero Image Section with Fish Cages */}
        <div className="mb-20 relative">
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
            {/* Real fish farming image from Unsplash */}
            <img 
              src={image2} 
              alt="Fish farming cages on water"
              className="w-full h-full object-cover object-bottom"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/40 to-transparent"></div>
            
            {/* Overlay content */}
            <div className="absolute inset-0 flex items-end justify-center pb-12">
              <div className="text-center text-white p-8">
                <Fish className="w-20 h-20 mx-auto mb-4 opacity-90" />
                <h3 className="text-3xl font-bold mb-2">Lake Kivu Operations</h3>
                <p className="text-xl text-white/90">200+ Floating Cages Producing Premium Tilapia</p>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute bottom-8 left-8 bg-white/20 backdrop-blur-md rounded-xl p-4 text-white border border-white/30">
              <div className="flex items-center space-x-2">
                <Waves className="w-5 h-5" />
                <span className="font-semibold">Sustainable Farming</span>
              </div>
            </div>
            <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-md rounded-xl p-4 text-white border border-white/30">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5" />
                <span className="font-semibold">Eco-Friendly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section with Animation */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-primary-100 mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-all duration-300 group-hover:scale-110">
                  <div className={`${stat.color} transition-colors duration-300`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className=" mx-auto mb-20">
          
          {/* Company Story Section with Image */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
              {/* Image */}
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src={image3} 
                  alt="Tilapia fish"
                  className="w-full h-96 object-cover"
                />
              </div>
              
              {/* Story Content */}
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20"></div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6">Our Story</h3>
                  <p className="text-lg text-primary-100 leading-relaxed mb-6">
                    Founded by Themistocle Munyangeyo, Fine Fish Ltd was born from a vision to revolutionize Rwanda's aquaculture industry. 
                    Based on the shores of Lake Kivu in Karongi, Western Province, we specialize in sustainable Nile tilapia farming, 
                    providing nutritious, locally sourced protein to communities across Rwanda.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-primary-100">
                      <div className="w-3 h-3 bg-primary-300 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Founded in Karongi</span>
                    </div>
                    <div className="flex items-center text-primary-100">
                      <div className="w-3 h-3 bg-primary-300 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Expanded to Lake Muhazi</span>
                    </div>
                    <div className="flex items-center text-primary-100">
                      <div className="w-3 h-3 bg-primary-300 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">RAB Certified Hatchery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What Sets Us Apart */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What We Do</h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Leading Rwanda's aquaculture industry through innovation and sustainability</p>
            </div>

            {/* Values in Cards */}
            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              {values.map((value, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveValue(index)}
                  className={`group cursor-pointer transition-all duration-500 ${
                    activeValue === index ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className={`p-8 rounded-2xl h-full transition-all duration-300 ${
                    activeValue === index 
                      ? 'bg-primary-600 text-white shadow-2xl' 
                      : 'bg-white hover:bg-primary-50 text-gray-900 shadow-lg hover:shadow-xl border-2 border-gray-100 hover:border-primary-200'
                  }`}>
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        activeValue === index 
                          ? 'bg-white/20' 
                          : 'bg-primary-100 group-hover:bg-primary-200'
                      }`}>
                        <div className={`transition-all duration-300 ${
                          activeValue === index ? 'text-white' : 'text-primary-600'
                        }`}>
                          {value.icon}
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold mb-4">{value.title}</h4>
                      <p className={`leading-relaxed mb-6 ${
                        activeValue === index ? 'text-white/90' : 'text-gray-600'
                      }`}>
                        {value.description}
                      </p>
                      
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeValue === index 
                          ? 'bg-white/20 text-white' 
                          : 'bg-primary-100 text-primary-700 group-hover:bg-primary-200'
                      }`}>
                        {value.highlight}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Gallery Section */}
          <div className="mb-16">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={image3} 
                  alt="Fresh fish"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={image4}
                  alt="Lake and nature"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={image5}
                  alt="Aquaculture operations"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Impact</h3>
              <p className="text-lg text-gray-600">Contributing to Rwanda's food security and secondary economy</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-center group hover:scale-105">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors duration-300">
                    <div className="text-primary-600">
                      {achievement.icon}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{achievement.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision Section with Background Image */}
          <div className="mt-16 relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1541441056316-443fff347c40?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Vision background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary-800/50 to-primary-900/95"></div>
            </div>
            
            <div className="relative z-10 text-center p-12 text-white">
              <Globe className="w-16 h-16 mx-auto mb-6 text-primary-300" />
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-xl leading-relaxed w-full mx-auto mb-8 text-primary-100">
                To lead East Africa in sustainable aquaculture, delivering affordable, high-quality fish 
                while protecting natural ecosystems and uplifting communities across Rwanda and beyond.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white font-medium border border-white/30">
                  🌊 Sustainable Growth
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white font-medium border border-white/30">
                  🐟 Quality Production
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white font-medium border border-white/30">
                  🤝 Community Impact
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}