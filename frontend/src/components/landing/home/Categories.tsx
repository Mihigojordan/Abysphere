import { useState } from "react";
import {
  Fish,
  Sprout,
  Truck,
  GraduationCap,
  Waves,
  Shield,
  TrendingUp,
  CheckCircle,

  Heart,
  Award,
} from "lucide-react";
import image3 from '../../../assets/image1.jpg'
import image1 from '../../../assets/image2.jpg'
import image4 from '../../../assets/image4.jpg'
import image5 from '../../../assets/image5.jpg'
// import image6 from '../../../assets/farm.jpg'
import { useNavigate } from "react-router-dom";




export default function ServicesSection() {
  const [activeService, setActiveService] = useState(0);
  const navigate = useNavigate();

  const services = [
    {
      id: 0,
      icon: Fish,
      title: "Cage Fish Farming",
      description:
        "Our flagship operation features over 200 floating cages strategically placed on Lake Kivu and Lake Muhazi, producing premium Nile tilapia using sustainable deep-water farming techniques.",
      features: [
        "200+ floating cages across two major lakes",
        "90+ tonnes of fresh tilapia produced monthly",
        "Deep-water farming preserves lake biodiversity",
        "Consistent year-round supply to markets",
        "Quality-controlled harvesting processes",
      ],
      image:image1,
      highlight: "90+ Tonnes Monthly",
      stats: [
        { value: "200+", label: "Active Cages" },
        { value: "90T", label: "Monthly Output" },
        { value: "2", label: "Lake Locations" },
      ],
    },
    {
      id: 1,
      icon: Sprout,
      title: "Certified Hatchery Operations",
      description:
        "Our government-approved hatchery in Rwamagana is equipped with state-of-the-art facilities to breed and raise healthy Nile tilapia fingerlings, supporting Rwanda's aquaculture expansion.",
      features: [
        "RAB certified and approved facility",
        "5+ million fingerlings produced annually",
        "Advanced breeding and nursery systems",
        "Quality genetics for optimal growth",
        "Technical support for fingerling buyers",
      ],
      image: image3,
      highlight: "RAB Certified",
      stats: [
        { value: "5M+", label: "Fingerlings/Year" },
        { value: "100%", label: "Survival Rate" },
        { value: "RAB", label: "Certified" },
      ],
    },
    {
      id: 2,
      icon: Truck,
      title: "Distribution & Supply Chain",
      description:
        "We maintain a robust distribution network ensuring fresh tilapia reaches markets, restaurants, and retailers across Rwanda promptly while maintaining the cold chain.",
      features: [
        "Direct supply to major markets nationwide",
        "Cold chain logistics for freshness",
        "Partnerships with leading retailers",
        "Bulk orders for institutions and hotels",
        "Flexible delivery scheduling",
      ],
      image: image4,
      highlight: "Nationwide Coverage",
      stats: [
        { value: "50+", label: "Distribution Points" },
        { value: "24hr", label: "Fresh Guarantee" },
        { value: "15+", label: "Cities Served" },
      ],
    },
    {
      id: 3,
      icon: GraduationCap,
      title: "Training & Capacity Building",
      description:
        "Through partnerships with Karongi TVET and local cooperatives, we provide comprehensive training programs in modern aquaculture practices, empowering communities.",
      features: [
        "Hands-on aquaculture training programs",
        "Partnership with Karongi TVET",
        "Support for local fish farming cooperatives",
        "Best practices in sustainable fishing",
        "Employment opportunities for graduates",
      ],
      image: image5,
      highlight: "Community First",
      stats: [
        { value: "500+", label: "Trained Farmers" },
        { value: "10+", label: "Cooperatives" },
        { value: "100+", label: "Jobs Created" },
      ],
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Every fish meets strict quality standards",
    },
    {
      icon: Waves,
      title: "Sustainable Practices",
      description: "Eco-friendly farming protecting our lakes",
    },
    {
      icon: TrendingUp,
      title: "Consistent Supply",
      description: "Reliable production year-round",
    },
    {
      icon: Award,
      title: "Industry Leading",
      description: "Rwanda's premier aquaculture company",
    },
  ];

  const currentService = services[activeService];

  return (
    <section className="py-3 px-10 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-100 rounded-full filter blur-3xl opacity-20"></div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-2 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
            <Waves className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary-600">Services</span>
          </h2>
          <p className="text-xl text-gray-600 w-full mx-auto leading-relaxed">
            Comprehensive aquaculture solutions from breeding to distribution, supporting Rwanda's food security
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => setActiveService(index)}
                className={`flex items-center space-x-3 px-6 py-4 -mb-6 -mt-10  rounded-xl font-semibold transition-all duration-300 ${
                  activeService === index
                    ? "bg-primary-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="hidden sm:inline">{service.title}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={currentService.image}
                alt={currentService.title}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/20 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-around">
                {currentService.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center border border-white/30"
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/90">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="absolute top-6 right-6 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {currentService.highlight}
              </div>
            </div>

            <div>
             
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {currentService.title}
              </h3>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {currentService.description}
              </p>

              <div className="space-y-4 mb-8">
                {currentService.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center mt-0.5 group-hover:bg-primary-200 transition-colors">
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>

           
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12 mb-5 -mt-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Fine Fish Ltd
            </h3>
            <p className="text-lg text-gray-600  mx-auto">
              Our commitment to quality and sustainability sets us apart
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                    <IconComponent className="w-7 h-7 text-primary-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0">
            <img
              src={image5}
              alt="Lake view"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/45 to-secondary-900/60"></div>
          </div>

          <div className="relative z-10 py-16 px-8 text-center text-white">
            <Heart className="w-16 h-16 mx-auto mb-6 text-primary-300" />
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Partner With Rwanda's Leading Fish Farm
            </h3>
            <p className="text-xl text-primary-100 mb-8  mx-auto">
              Whether you need fresh fish, fingerlings, or training services, we're here to support your needs
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
               onClick={()=> navigate('/contact')}  
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300 hover:scale-105 shadow-lg">
                Contact Us Today
              </button>
              <button 
               onClick={()=> navigate('/about')}  
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300">
                More About Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}