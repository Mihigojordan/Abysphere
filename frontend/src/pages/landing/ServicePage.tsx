import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Briefcase,
  TrendingUp,
  Settings,
  ArrowRight,
  Phone,
  Mail,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";


// Import HeaderBanner (adjust path as needed)
import HeaderBanner from "../../components/landing/HeaderBanner";



const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openFaq, setOpenFaq] = useState(0);
  
  const serviceCategories = [
    { title: "Workforce Planning & Strategy", active: false },
    { title: "Design & Optimization", active: false },
    { title: "Workplace Safety", active: false },
    { title: "Retention Strategies", active: true },
    { title: "Executive Search", active: false },
    { title: "Leadership Development", active: false },
  ];

  
  // Get active service from URL or default to first active one
  const getActiveServiceIndex = () => {
    const serviceParam = searchParams.get("service");
    const index = serviceCategories.findIndex(cat => cat.title === serviceParam);
    return index !== -1 ? index : serviceCategories.findIndex(cat => cat.active);
  };

  const [activeServiceIndex, setActiveServiceIndex] = useState(getActiveServiceIndex());

  // Sync with URL on mount
  useEffect(() => {
    const index = getActiveServiceIndex();
    setActiveServiceIndex(index);
  }, [searchParams]);


  // Service-specific content
  const serviceContent = {
    0: {
      title: "Workforce Planning & Strategy",
      description: "Strategic workforce planning to align human capital with business objectives through data-driven forecasting and organizational design.",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=600&fit=crop",
      steps: [
        {
          step: "01",
          title: "Workforce Analysis",
          description: "Comprehensive assessment of current workforce capabilities and future needs.",
        },
        {
          step: "02",
          title: "Strategic Planning",
          description: "Develop long-term workforce strategies aligned with business goals.",
        },
      ],
    },
    1: {
      title: "Design & Optimization",
      description: "Organizational design and process optimization to enhance efficiency and employee performance through streamlined structures.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=600&fit=crop",
      steps: [
        {
          step: "01",
          title: "Structure Design",
          description: "Create optimal organizational structures for maximum efficiency.",
        },
        {
          step: "02",
          title: "Process Optimization",
          description: "Streamline workflows to boost productivity and reduce costs.",
        },
      ],
    },
    2: {
      title: "Workplace Safety",
      description: "Comprehensive safety programs ensuring compliance and creating secure work environments that protect employees.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
      steps: [
        {
          step: "01",
          title: "Risk Assessment",
          description: "Identify and evaluate workplace hazards and risks.",
        },
        {
          step: "02",
          title: "Safety Implementation",
          description: "Deploy comprehensive safety training and protocols.",
        },
      ],
    },
    3: {
      title: "Retention Strategies",
      description: "Proven retention programs that reduce turnover and maximize employee engagement through targeted initiatives.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop",
      steps: [
        {
          step: "01",
          title: "Engagement Analysis",
          description: "Identify key retention drivers through employee surveys.",
        },
        {
          step: "02",
          title: "Retention Programs",
          description: "Implement customized retention strategies and benefits.",
        },
      ],
    },
    4: {
      title: "Executive Search",
      description: "Targeted executive recruitment to secure top-tier leadership talent for strategic organizational growth.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
      steps: [
        {
          step: "01",
          title: "Leadership Profiling",
          description: "Define ideal executive competencies and cultural fit.",
        },
        {
          step: "02",
          title: "Talent Sourcing",
          description: "Executive search across global networks and databases.",
        },
      ],
    },
    5: {
      title: "Leadership Development",
      description: "Customized leadership programs to build high-performing executives and future-ready leaders.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
      steps: [
        {
          step: "01",
          title: "Leadership Assessment",
          description: "Evaluate current leadership capabilities and gaps.",
        },
        {
          step: "02",
          title: "Development Programs",
          description: "Tailored coaching and training for leadership excellence.",
        },
      ],
    },
  };

  const currentService = serviceContent[activeServiceIndex];
  const processSteps = currentService ? currentService.steps : [];

  // Handle service navigation
  const handleServiceClick = (index) => {
    setActiveServiceIndex(index);
    const serviceTitle = serviceCategories[index].title;
    setSearchParams({ service: serviceTitle });
  };

  // DYNAMIC PREVIOUS/NEXT NAVIGATION
  const prevServiceIndex = activeServiceIndex > 0 ? activeServiceIndex - 1 : null;
  const nextServiceIndex = activeServiceIndex < serviceCategories.length - 1 ? activeServiceIndex + 1 : null;

    useEffect(()=>{

    document.body.scrollIntoView({behavior:"smooth", block:"start"});

  },[prevServiceIndex,nextServiceIndex])
  const handleNavClick = (index:number) => {
    handleServiceClick(index);
  };

  const whyChooseFeatures = [
    {
      icon: Shield,
      title: "Trusted Expertise",
      description: `15+ years specializing in ${currentService?.title || "HR solutions"}`,
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "95% client satisfaction with measurable ROI",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "50+ certified professionals in your industry",
    },
    {
      icon: Clock,
      title: "Timely Solutions",
      description: `Rapid implementation for ${currentService?.title || "your needs"}`,
    },
  ];

  const faqs = [
    {
      question: `How does ${currentService?.title || "HR"} benefit my organization?`,
      answer: `${currentService?.title || "This service"} drives organizational success by aligning human capital with strategic objectives, improving efficiency, and creating sustainable growth.`
    },
    {
      question: `What is included in ${currentService?.title || "HR"} services?`,
      answer: `Comprehensive ${currentService?.title?.toLowerCase() || "HR"} solutions including assessment, strategy development, implementation, and ongoing support tailored to your business needs.`
    },
    {
      question: `How long does ${currentService?.title || "implementation"} take?`,
      answer: `Typical implementation ranges from 4-12 weeks depending on scope, with immediate value delivered through our proven methodologies.`
    },
    {
      question: `What results can I expect from ${currentService?.title || "our services"}?`,
      answer: `Clients typically see 20-40% improvement in key metrics like retention, productivity, or compliance within the first year.`
    },
    {
      question: `Is ${currentService?.title || "this service"} customizable?`,
      answer: `Absolutely! Every program is tailored to your organization's size, industry, and specific challenges for maximum impact.`
    },
    {
      question: `How do we measure ${currentService?.title || "success"}?`,
      answer: `We use KPIs aligned with your goals - ROI, engagement scores, compliance rates, or leadership effectiveness metrics.`
    },
    {
      question: `What's the first step for ${currentService?.title || "getting started"}?`,
      answer: `Schedule a free consultation where we assess your needs and create a customized roadmap for success.`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* DYNAMIC HeaderBanner */}
      <HeaderBanner
        title={currentService?.title || "HR Management Insights"}
        subtitle="Home / Services / HR Solutions"
        backgroundStyle="image"
        icon={<Users className="w-10 h-10" />}
      />

      {/* Main Content Section with Sidebar */}
      <div className="py-20 px-6">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Services List */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-teal-700" />
                  Our Services
                </h3>
                <div className="space-y-3">
                  {serviceCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleServiceClick(index)}
                      className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between group ${
                        activeServiceIndex === index
                          ? "bg-yellow-400 text-gray-900 shadow-lg"
                          : "bg-teal-700 text-white hover:bg-teal-600"
                      }`}
                    >
                      <span>{category.title}</span>
                      <ArrowRight className={`w-5 h-5 transition-transform ${
                        activeServiceIndex === index ? "translate-x-1" : "group-hover:translate-x-1"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact CTA Card */}
              <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-teal-700 bg-opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-700 bg-opacity-20 rounded-full translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Transform Your {currentService?.title || "HR"}?
                  </h4>
                  <p className="text-gray-800 mb-6">
                    Grow Your Business With Expert Solutions.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <a href="tel:+250788123456" className="flex items-center gap-3 text-gray-900 font-semibold transition-all hover:gap-4">
                      <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <span>+(250) 788-123-456</span>
                    </a>
                    <a href="mailto:info@abysphere.com" className="flex items-center gap-3 text-gray-900 font-semibold transition-all hover:gap-4">
                      <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <span>info@abysphere.com</span>
                    </a>
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop"
                    alt="HR Expert"
                    className="rounded-2xl shadow-xl w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8">
              <div className="mb-12">
                <img
                  src={currentService?.image}
                  alt={currentService?.title}
                  className="w-full h-96 object-cover rounded-3xl shadow-2xl"
                />
              </div>

              <div className="mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Expert {currentService?.title || "HR"} Solutions
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {currentService?.description}
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Our specialized approach ensures your organization achieves measurable results through strategic implementation and continuous support tailored to your unique business challenges.
                </p>
              </div>

              {/* Process Steps */}
              <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-3xl p-12 mb-16">
                <div className="grid md:grid-cols-2 gap-8">
                  {processSteps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-teal-800 bg-opacity-50 rounded-2xl p-8 border-2 border-teal-700 border-opacity-50 hover:border-yellow-400 hover:border-opacity-50 transition-all duration-300"
                    >
                      <div className="inline-block px-4 py-2 bg-yellow-400 rounded-lg text-gray-900 font-bold text-sm mb-4">
                        STEP {step.step}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {step.title}
                      </h3>
                      <p className="text-white text-opacity-80 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Choose Us Section */}
              <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Why Choose <span className="text-teal-700">Abysphere</span> for {currentService?.title}?
                    </h3>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      Industry-leading expertise with proven results in {currentService?.title || "HR solutions"}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {whyChooseFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={index}
                          className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-2 border border-gray-100"
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-teal-700 to-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-3">
                            {feature.title}
                          </h4>
                          <p className="text-gray-600 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white p-8 rounded-3xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                  FAQs: {currentService?.title || "HR Services"}
                </h1>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                        className="w-full flex items-center justify-between text-left group"
                      >
                        <h2 className="text-lg font-semibold text-gray-700 group-hover:text-teal-700 transition-colors">
                          {faq.question}
                        </h2>
                        {openFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-teal-700" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-teal-700" />
                        )}
                      </button>
                      {openFaq === index && (
                        <div className="mt-3 pl-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* DYNAMIC PREVIOUS/NEXT NAVIGATION */}
                <div className="mt-8 flex gap-4">
                  {prevServiceIndex !== null && (
                    <button
                      onClick={() => handleNavClick(prevServiceIndex)}
                      className="flex items-center gap-2 bg-yellow-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
                    >
                      ← {serviceCategories[prevServiceIndex].title}
                    </button>
                  )}
                  {nextServiceIndex !== null && (
                    <button
                      onClick={() => handleNavClick(nextServiceIndex)}
                      className="flex items-center gap-2 bg-yellow-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-300 transition ml-auto"
                    >
                      {serviceCategories[nextServiceIndex].title} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;