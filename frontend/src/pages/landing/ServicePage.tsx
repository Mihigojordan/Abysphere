import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Fish,
  Droplets,
  Leaf,
  Target,
  Award,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import HeaderBanner from "../../components/landing/HeaderBanner";

// Interface definitions
interface Service {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
}

interface Feature {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}

const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("core");

  // Core Services data
  const coreServices: Service[] = [
    {
      icon: Fish,
      title: "Tilapia Production",
      description: "High-quality Nile tilapia production from Lake Kivu and Muhazi",
      features: [
        "90+ tonnes monthly",
        "Premium quality fish",
        "Sustainable cage farming",
        "Global standard compliance",
      ],
    },
    {
      icon: Droplets,
      title: "Fingerling Supply",
      description: "Certified hatchery supplying healthy fingerlings nationwide",
      features: [
        "2M+ fingerlings yearly",
        "Quality assurance",
        "Farmer support",
        "Nationwide distribution",
      ],
    },
    {
      icon: Leaf,
      title: "Sustainable Practices",
      description: "Eco-friendly aquaculture preserving Rwanda’s lakes",
      features: [
        "Eco-conscious farming",
        "Water quality monitoring",
        "Low environmental impact",
        "Sustainable feed use",
      ],
    },
    {
      icon: Target,
      title: "Community Training",
      description: "Empowering local farmers with aquaculture skills",
      features: [
        "Karongi TVET partnership",
        "Skill development",
        "Youth empowerment",
        "Practical workshops",
      ],
    },
  ];

  // Advanced Services data
  const advancedServices: Service[] = [
    {
      icon: Users,
      title: "Workforce Development",
      description: "Creating jobs and building local capacity",
      features: [
        "100+ jobs created",
        "Local employment focus",
        "Skill enhancement",
        "Community upliftment",
      ],
    },
    {
      icon: Award,
      title: "Industry Leadership",
      description: "Driving innovation in Rwanda’s aquaculture sector",
      features: [
        "Vision 2050 alignment",
        "Innovative practices",
        "Sector growth",
        "Regional influence",
      ],
    },
    {
      icon: Zap,
      title: "Research & Development",
      description: "Advancing aquaculture through innovative techniques",
      features: [
        "Fish health research",
        "Feed optimization",
        "Breeding innovation",
        "Technology adoption",
      ],
    },
    {
      icon: Settings,
      title: "Operational Excellence",
      description: "Streamlined operations for maximum efficiency",
      features: [
        "200+ cages managed",
        "Automated systems",
        "Quality control",
        "Efficient logistics",
      ],
    },
  ];

  // Key Features data
  const features: Feature[] = [
    {
      icon: Leaf,
      title: "Sustainability First",
      description: "Eco-friendly practices protecting Lake Kivu and Muhazi ecosystems.",
    },
    {
      icon: Fish,
      title: "Premium Quality",
      description: "Producing tilapia and fingerlings meeting global standards.",
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Creating jobs and training opportunities for local communities.",
    },
    {
      icon: Award,
      title: "Industry Pioneer",
      description: "Leading Rwanda’s aquaculture with innovative, sustainable solutions.",
    },
  ];

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderBanner
        title="Fine Fish ltd Services"
        subtitle="Home / Services"
        icon={<Fish className="w-10 h-10 mx-auto" />}
        backgroundStyle="image"
      />

      {/* Services Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-8 bg-white"
      >
        <div className="w-12/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 ">
              Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-lg text-gray-600  mx-auto">
              Comprehensive aquaculture solutions driving Rwanda’s secondary economy
            </p>
          </div>

          {/* Service Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary-50 p-2 rounded-xl flex space-x-2">
              <button
                onClick={() => setActiveTab("core")}
                className={`px-8 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === "core"
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-primary-700 hover:bg-primary-100"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Core Services</span>
              </button>
              <button
                onClick={() => setActiveTab("advanced")}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === "advanced"
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-primary-700 hover:bg-primary-100"
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>Advanced Services</span>
              </button>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(activeTab === "core" ? coreServices : advancedServices).map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-600 hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h4>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <svg
                        className="w-5 h-5 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full bg-primary-50 text-primary-700 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 group-hover:bg-primary-600 group-hover:text-white">
                  <span>Learn More</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-8 bg-gradient-to-r from-primary-50 to-secondary-50"
      >
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Fine Fish Ltd</span>?
            </h3>
            <p className="text-lg text-gray-600 mx-auto">
              Delivering sustainable aquaculture solutions with unmatched expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group bg-white p-6 rounded-lg border border-primary-100 hover:border-primary-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ServicesPage;