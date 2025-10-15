import React, { useState } from 'react';
import { 
  ChevronRight, 
  Users, 
  Fish, 
  Leaf, 
  Handshake, 
  Clock, 
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
import HeaderBanner from '../../components/landing/HeaderBanner';

interface Module {
  id: number;
  name: string;
  category: string;
  icon: React.ReactNode;
  image: string;
  features: string[];
  badge: string;
  description: string;
  benefits: string[];
  pricing: string;
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

const HRFeaturesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const categories: string[] = [
    'All', 
    'Workforce Management', 
    'Training & Development', 
    'Sustainability Tracking', 
    'Community Engagement'
  ];

  const modules: Module[] = [
    {
      id: 1,
      name: "Aquaculture Workforce Management",
      category: "Workforce Management",
      icon: <Users className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1574491822372-ad5cef67a454?w=400&h=400&fit=crop",
      features: ["Farmer Profiles", "Shift Scheduling", "Performance Tracking", "Payroll Integration"],
      badge: "Essential",
      description: "Manage fish farmers and hatchery staff with comprehensive profiles, schedules, and performance tracking tailored to aquaculture operations.",
      benefits: ["Centralized data", "Efficient scheduling", "Performance insights", "Streamlined payroll"],
      pricing: "Included in core plan"
    },
    {
      id: 2,
      name: "Sustainable Farming Training",
      category: "Training & Development",
      icon: <BookOpen className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop",
      features: ["Eco-Friendly Courses", "Hatchery Training", "Certification Tracking", "Skill Assessments"],
      badge: "Growth Focused",
      description: "Deliver training programs for sustainable cage farming and hatchery operations in partnership with Karongi TVET.",
      benefits: ["Sustainable skills", "Certified farmers", "Skill development", "Community upliftment"],
      pricing: "Starting at $3/employee"
    },
    {
      id: 3,
      name: "Environmental Impact Tracking",
      category: "Sustainability Tracking",
      icon: <Leaf className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1511537190424-a864f26a6c1d?w=400&h=400&fit=crop",
      features: ["Compliance Monitoring", "Water Quality Reports", "Eco-Metrics", "Sustainability Audits"],
      badge: "Eco-Friendly",
      description: "Track and report environmental impact to ensure Lake Kivu’s ecosystem is preserved through sustainable practices.",
      benefits: ["Regulatory compliance", "Eco-friendly operations", "Data-driven insights", "Sustainability reporting"],
      pricing: "Starting at $5/employee"
    },
    {
      id: 4,
      name: "Community Hiring Portal",
      category: "Community Engagement",
      icon: <Handshake className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      features: ["Job Postings", "Local Recruitment", "Interview Scheduling", "Community Outreach"],
      badge: "Impactful",
      description: "Streamline hiring of local farmers and youth to support Rwanda’s Vision 2050 and community empowerment.",
      benefits: ["Local employment", "Youth empowerment", "Efficient hiring", "Community integration"],
      pricing: "Starting at $40/month"
    },
    {
      id: 5,
      name: "Performance Analytics",
      category: "Workforce Management",
      icon: <Target className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
      features: ["Productivity Reports", "Goal Tracking", "Farmer Analytics", "Performance Reviews"],
      badge: "Intelligent",
      description: "Data-driven insights to optimize workforce productivity and align with aquaculture goals.",
      benefits: ["Performance insights", "Goal alignment", "Productivity boost", "Data-driven decisions"],
      pricing: "Starting at $8/month"
    },
    {
      id: 6,
      name: "Certification Management",
      category: "Training & Development",
      icon: <Award className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
      features: ["Certification Tracking", "Compliance Records", "Training Certificates", "Audit Support"],
      badge: "Certified",
      description: "Manage certifications for sustainable aquaculture practices to ensure industry leadership and compliance.",
      benefits: ["Compliance assurance", "Certification tracking", "Industry standards", "Audit readiness"],
      pricing: "Starting at $4/employee"
    },
  ];

  const keyFeatures: KeyFeature[] = [
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud-Based",
      description: "Access workforce data anywhere, anytime with secure cloud infrastructure."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Ready",
      description: "Manage farmers and training via native iOS and Android apps."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Data",
      description: "Protect employee and farmer data with enterprise-grade encryption."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Language",
      description: "Support for Kinyarwanda, English, and French for local accessibility."
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Customizable",
      description: "Tailor workflows for aquaculture-specific HR needs."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Integration",
      description: "Integrate with aquaculture management systems for seamless operations."
    }
  ];

  const partners: Partner[] = [
    { name: "Rwanda Agriculture Board", logo: "https://placehold.co/150x50?text=RAB&bg=1e3a8a&fg=ffffff" },
    { name: "Karongi TVET", logo: "https://placehold.co/150x50?text=Karongi+TVET&bg=1e3a8a&fg=ffffff" },
    { name: "Ministry of Agriculture", logo: "https://placehold.co/150x50?text=MinAgri&bg=1e3a8a&fg=ffffff" },
    { name: "Lake Kivu Fisheries", logo: "https://placehold.co/150x50?text=Kivu+Fisheries&bg=1e3a8a&fg=ffffff" },
  ];

  const filteredModules: Module[] = activeCategory === 'All' 
    ? modules 
    : modules.filter(module => module.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary-300 rounded-full opacity-15"></div>
      </div>
      
      <HeaderBanner
        title="Aquaculture HR Features"
        subtitle="Home / Features"
        backgroundStyle="image"
        icon={<Star className="w-10 h-10" />}
      />

      {/* Overview Stats */}
      <section className="py-12 relative">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">6+</div>
              <div className="text-gray-600">Core Modules</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">20+</div>
              <div className="text-gray-600">Features</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">100+</div>
              <div className="text-gray-600">Farmers Trained</div>
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
              Why Choose Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Aquaculture HR System</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built to support sustainable aquaculture, community empowerment, and Rwanda’s Vision 2050.
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

      {/* Main Features Section */}
      <section className="py-20 bg-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Core <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Aquaculture HR Modules</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored solutions to manage fish farmers, ensure sustainability, and empower communities.
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
            {filteredModules.map((module, index) => (
              <div
                key={module.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => setSelectedModule(module)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={module.image} 
                    alt={module.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {module.badge}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white rounded-full p-2 text-primary-600">
                      {module.icon}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-primary-600 text-sm font-medium">{module.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{module.name}</h3>
                  
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {module.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                    {module.features.length > 3 && (
                      <div className="text-primary-600 text-sm font-medium">
                        +{module.features.length - 3} more features
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">{module.pricing}</div>
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
              Collaborating to advance Rwanda’s aquaculture workforce and sustainability goals.
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

      {/* Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedModule.image} 
                alt={selectedModule.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedModule(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="absolute top-4 left-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedModule.badge}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-primary-600">
                  {selectedModule.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedModule.name}</h2>
                  <p className="text-primary-600">{selectedModule.category}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedModule.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="space-y-2">
                    {selectedModule.features.map((feature, idx) => (
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
                    {selectedModule.benefits.map((benefit, idx) => (
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
                  <span className="font-semibold text-gray-900">Pricing</span>
                  <span className="text-primary-600 font-semibold">{selectedModule.pricing}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Start Free Trial
                </button>
                <button className="flex-1 border border-primary-600 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRFeaturesPage;
