import React, { useState } from 'react';
import { 
  ChevronRight, 
  Users, 
  Fish, 
  Leaf, 
  Handshake, 
  BookOpen, 
  Target, 
  Award, 
  Star, 
  CheckCircle, 
  Cloud, 
  Smartphone, 
  Lock, 
  Globe, 
  Settings, 
  Database 
} from 'lucide-react';
import HeaderBanner from '../../../components/landing/HeaderBanner';
import Testimonials from '../../../components/landing/home/Testimonials';

interface Service {
  id: number;
  name: string;
  category: string;
  icon: React.ReactNode;
  image: string;
  features: string[];
  badge: string;
  description: string;
  benefits: string[];
  availability: string;
}

interface KeyFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Partner {
  name: string;
  logo: string;
}

const FarmerSupportPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const categories: string[] = [
    'All', 
    'Training Programs', 
    'Fingerling Supply', 
    'Technical Assistance', 
    'Community Programs'
  ];

  const services: Service[] = [
    {
      id: 1,
      name: "Sustainable Farming Training",
      category: "Training Programs",
      icon: <BookOpen className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop",
      features: ["Cage Farming Techniques", "Hatchery Operations", "Eco-Friendly Practices", "Certification Courses"],
      badge: "Growth Focused",
      description: "Comprehensive training programs with Karongi TVET to equip farmers with sustainable aquaculture skills for tilapia production.",
      benefits: ["Enhanced farming skills", "Sustainability certifications", "Increased yields", "Community empowerment"],
      availability: "Available year-round"
    },
    {
      id: 2,
      name: "Fingerling Supply Program",
      category: "Fingerling Supply",
      icon: <Fish className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
      features: ["High-Quality Fingerlings", "Certified Hatchery", "Nationwide Delivery", "Health Monitoring"],
      badge: "Quality Assured",
      description: "Supply millions of healthy fingerlings annually from our Rwamagana hatchery to support farmers across Rwanda.",
      benefits: ["Reliable supply", "Healthy stock", "Nationwide access", "Improved farm output"],
      availability: "Seasonal batches"
    },
    {
      id: 3,
      name: "Technical Cage Farming Support",
      category: "Technical Assistance",
      icon: <Target className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1568727349458-1bb59fb3fb63?w=400&h=400&fit=crop",
      features: ["Cage Maintenance", "Water Quality Testing", "Production Optimization", "On-Site Support"],
      badge: "Expert Led",
      description: "Provide technical assistance for cage farming on Lake Kivu, ensuring optimal production and sustainability.",
      benefits: ["Higher yields", "Eco-friendly operations", "Expert guidance", "Reduced downtime"],
      availability: "On-demand"
    },
    {
      id: 4,
      name: "Community Empowerment Program",
      category: "Community Programs",
      icon: <Handshake className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1574491822372-ad5cef67a454?w=400&h=400&fit=crop",
      features: ["Youth Employment", "Farmer Cooperatives", "Skill Workshops", "Financial Support"],
      badge: "Impactful",
      description: "Empower local communities through job creation, cooperative formation, and financial support for farmers.",
      benefits: ["Job creation", "Community upliftment", "Financial stability", "Youth engagement"],
      availability: "Ongoing"
    },
    {
      id: 5,
      name: "Sustainability Compliance Monitoring",
      category: "Technical Assistance",
      icon: <Leaf className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1511537190424-a864f26a6c1d?w=400&h=400&fit=crop",
      features: ["Eco-Metrics Tracking", "Compliance Audits", "Water Quality Reports", "Sustainability Training"],
      badge: "Eco-Friendly",
      description: "Monitor and ensure compliance with environmental standards to protect Lake Kivu’s ecosystem.",
      benefits: ["Regulatory compliance", "Sustainable practices", "Environmental protection", "Audit readiness"],
      availability: "Continuous"
    },
    {
      id: 6,
      name: "Farmer Performance Analytics",
      category: "Technical Assistance",
      icon: <Award className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
      features: ["Yield Tracking", "Performance Reports", "Goal Setting", "Data Insights"],
      badge: "Intelligent",
      description: "Data-driven analytics to optimize farmer productivity and align with Fine Fish Ltd’s sustainability goals.",
      benefits: ["Improved productivity", "Data-driven decisions", "Goal alignment", "Performance insights"],
      availability: "Subscription-based"
    },
  ];

  const keyFeatures: KeyFeature[] = [
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud-Based Access",
      description: "Access support services and resources anytime, anywhere with secure cloud infrastructure."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Support",
      description: "Connect with support services via native iOS and Android apps for farmers."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Data",
      description: "Protect farmer data with enterprise-grade encryption."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Language",
      description: "Support in Kinyarwanda, English, and French for local accessibility."
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Customizable",
      description: "Tailor support services to meet specific farmer needs."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Integrated Systems",
      description: "Seamless integration with aquaculture management tools."
    }
  ];

  const partners: Partner[] = [
    { name: "Rwanda Agriculture Board", logo: "https://placehold.co/150x50?text=RAB&bg=1e3a8a&fg=ffffff" },
    { name: "Karongi TVET", logo: "https://placehold.co/150x50?text=Karongi+TVET&bg=1e3a8a&fg=ffffff" },
    { name: "Ministry of Agriculture", logo: "https://placehold.co/150x50?text=MinAgri&bg=1e3a8a&fg=ffffff" },
    { name: "Lake Kivu Fisheries", logo: "https://placehold.co/150x50?text=Kivu+Fisheries&bg=1e3a8a&fg=ffffff" },
  ];

  const filteredServices: Service[] = activeCategory === 'All' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary-300 rounded-full opacity-15"></div>
      </div>
      
      <HeaderBanner
        title="Farmer Support Services"
        subtitle="Home / Farmer Support"
        backgroundStyle="image"
        icon={<Star className="w-10 h-10" />}
      />

      {/* Overview Stats */}
      <section className="py-12 relative">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Farmers Supported</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">2M+</div>
              <div className="text-gray-600">Fingerlings Supplied</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Training Hours</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">90%+</div>
              <div className="text-gray-600">Sustainability Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Farmer Support</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering farmers with sustainable aquaculture solutions, aligning with Rwanda’s Vision 2050.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-20 bg-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Farmer Support Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions to support farmers in sustainable tilapia production and community development.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => setSelectedService(service)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {service.badge}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white rounded-full p-2 text-primary-600">
                      {service.icon}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-primary-600 text-sm font-medium">{service.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                  
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <div className="text-primary-600 text-sm font-medium">
                        +{service.features.length - 3} more features
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">{service.availability}</div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                    Learn More <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Partners</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Collaborating to empower farmers and advance Rwanda’s aquaculture industry.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-16 object-contain mx-auto mb-4"
                />
                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                <p className="text-sm text-gray-600 mt-2">Key Partner</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedService.image} 
                alt={selectedService.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="absolute top-4 left-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedService.badge}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-primary-600">
                  {selectedService.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                  <p className="text-primary-600">{selectedService.category}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedService.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="space-y-2">
                    {selectedService.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                  <div className="space-y-2">
                    {selectedService.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Availability</span>
                  <span className="text-primary-600 font-semibold">{selectedService.availability}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Request Service
                </button>
                <button className="flex-1 border border-primary-600 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerSupportPage;