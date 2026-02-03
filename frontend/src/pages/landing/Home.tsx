import React, { useState } from 'react';
import HeroSection from '../../components/landing/home/HeroSection';
import Categories from '../../components/landing/home/Categories';
import Featured from '../../components/landing/home/Featured';
import Testimonials from '../../components/landing/home/Testimonials';
import Blog from '../../components/landing/home/Blog';
import AboutSection from '../../components/landing/home/About';
import WhyChooseUsSection from '../../components/landing/home/WhyChooseUsSection';
import FAQ from '../../components/landing/home/FAQ';
import { 
  Check, 
  X, 
  Zap, 
  Building2, 
  Rocket, 
  ArrowRight,
  Package,
  TrendingUp,
  Users,
  Target,
  Award,
  Star,
  Send,
  MapPin,
  Headphones,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Briefcase,
  PhoneCall,
  BarChart3,
  Building2 as BuildingIcon,
  ChevronRight,
  CheckCircle,
  Cloud,
  Smartphone,
  Lock,
  Globe,
  Settings,
  Database,
  Leaf,
  Handshake,
  BookOpen,
  Fish
} from 'lucide-react';
import img1 from "../../assets/contact.jpg";

const Home = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [hoveredService, setHoveredService] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Contact Form submitted:', formData);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Pricing Plans Data
  const pricingPlans = [
    {
      name: "Starter Plan",
      subtitle: "For small shops",
      icon: Zap,
      iconBg: "bg-blue-500",
      price: "To be defined",
      popular: false,
      features: [
        { text: "1 Branch", included: true },
        { text: "1 User", included: true },
        { text: "Basic stock features", included: true },
        { text: "Reports", included: true },
        { text: "Email support", included: true },
        { text: "Alerts & notifications", included: false },
        { text: "Supplier management", included: false },
        { text: "Advanced reports", included: false },
        { text: "Priority support", included: false },
      ],
      ctaText: "Start Free Trial",
      ctaStyle: "bg-primary-700 text-white hover:bg-primary-600",
    },
    {
      name: "Standard Plan",
      subtitle: "For growing businesses",
      icon: Building2,
      iconBg: "bg-secondary-400",
      price: "To be defined",
      popular: true,
      features: [
        { text: "3 Branches", included: true },
        { text: "Up to 5 users", included: true },
        { text: "All stock features", included: true },
        { text: "Alerts & notifications", included: true },
        { text: "Supplier management", included: true },
        { text: "Reports", included: true },
        { text: "Email support", included: true },
        { text: "Advanced reports", included: false },
        { text: "Priority support", included: false },
      ],
      ctaText: "Start Free Trial",
      ctaStyle: "bg-secondary-400 text-gray-900 hover:bg-secondary-500",
    },
    {
      name: "Business Plan",
      subtitle: "For large businesses",
      icon: Rocket,
      iconBg: "bg-primary-900",
      price: "To be defined",
      popular: false,
      features: [
        { text: "Unlimited branches", included: true },
        { text: "Unlimited users", included: true },
        { text: "All stock features", included: true },
        { text: "Advanced reports", included: true },
        { text: "Integrations", included: true },
        { text: "Priority support", included: true },
        { text: "Alerts & notifications", included: true },
        { text: "Supplier management", included: true },
        { text: "Dedicated account manager", included: true },
      ],
      ctaText: "Start Free Trial",
      ctaStyle: "bg-primary-700 text-white hover:bg-primary-600",
    },
  ];

  // Core Features Data
  const coreFeatures = [
    {
      icon: Package,
      title: "Product & Category Management",
      description: "Organize your inventory with flexible product categorization, SKU management, and detailed product information tracking."
    },
    {
      icon: TrendingUp,
      title: "Stock In / Stock Out",
      description: "Real-time tracking of all stock movements with automatic inventory updates and detailed transaction history."
    },
    {
      icon: Users,
      title: "Supplier & Purchase Management",
      description: "Manage supplier relationships, track purchase orders, and maintain complete supplier performance records."
    },
    {
      icon: Target,
      title: "Low Stock Alerts",
      description: "Automated notifications when inventory levels reach minimum thresholds, preventing stockouts and lost sales."
    },
    {
      icon: Award,
      title: "Expiry Tracking",
      description: "Monitor product expiration dates with advance warnings to minimize waste and ensure product quality."
    },
    {
      icon: TrendingUp,
      title: "Stock Transfer Between Branches",
      description: "Seamlessly move inventory between locations with complete tracking and automated documentation."
    },
    {
      icon: Star,
      title: "Full Reporting & Analytics",
      description: "Comprehensive dashboards and reports providing insights into sales trends, inventory turnover, and business performance."
    },
    {
      icon: Briefcase,
      title: "User Roles & Permissions",
      description: "Granular access control allowing you to define who can view, edit, or manage different aspects of your inventory."
    }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section id="home">
        <HeroSection />
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <AboutSection />
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-gray-50">
        <Categories />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4" />
              <span>CORE FEATURES</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Stock
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive features designed to handle every aspect of your inventory management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((service, index) => {
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
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                    isHovered 
                      ? 'bg-primary-600 scale-110' 
                      : 'bg-primary-50'
                  }`}>
                    <Icon className={`w-8 h-8 transition-colors duration-300 ${
                      isHovered ? 'text-white' : 'text-primary-600'
                    }`} />
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className={`flex items-center gap-2 text-primary-600 font-semibold transition-all duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <span className="text-sm">Learn More</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>

                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 opacity-0 transition-opacity duration-300 -z-10 ${
                    isHovered ? 'opacity-5' : ''
                  }`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section id="services" className="py-16 bg-gray-50">
        <Featured />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="mx-auto px-6 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose the Perfect Plan for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Flexible pricing options designed to scale with your business. Start with a free trial and upgrade as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-gray-100 rounded-full p-2">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary-700 text-white"
                    : "text-gray-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === "yearly"
                    ? "bg-primary-700 text-white"
                    : "text-gray-600"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-secondary-400 text-gray-900 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl ${
                    plan.popular
                      ? "border-secondary-400 shadow-xl scale-105"
                      : "border-gray-200 hover:border-primary-700"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-secondary-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 ${plan.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{plan.subtitle}</p>
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </div>
                      {plan.price !== "To be defined" && (
                        <div className="text-gray-600 mt-2">
                          per {billingCycle === "monthly" ? "month" : "year"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary-700" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <X className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "text-gray-700 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${plan.ctaStyle}`}
                  >
                    {plan.ctaText}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <Testimonials />
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-16 bg-white">
        <WhyChooseUsSection />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <FAQ />
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="mx-auto px-6 md:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-teal-600 to-gray-800 bg-clip-text text-transparent mb-6">
              Have Questions? Need a Demo? We're Here to Help.
            </h2>
            <p className="text-md md:text-lg text-gray-600 mx-auto leading-relaxed mb-6 max-w-3xl">
              Connect with our expert team for inventory management solutions, product demos, and business consultations.
            </p>
            
            {/* Quick contact badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm">
                <Package size={16} className="mr-2" />
                <span className="font-medium">Inventory Solutions</span>
              </div>
              <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm">
                <Phone size={16} className="mr-2" />
                <span className="font-medium">250 788 771 508</span>
              </div>
              <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm">
                <Mail size={16} className="mr-2" />
                <span className="font-medium">support@izubagen.rw</span>
              </div>
            </div>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-teal-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-8 h-8" />
                <h3 className="text-xl font-bold">Our Office</h3>
              </div>
              <p className="text-teal-100">
                Norrsken House Kigali<br/>
                Kigali, Rwanda
              </p>
            </div>

            <div className="bg-blue-100 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="w-8 h-8 text-teal-600" />
                <h3 className="text-xl font-bold text-gray-800">Support</h3>
              </div>
              <p className="text-gray-600">
                250 788 771 508<br/>
                support@izubagen.rw
              </p>
            </div>

            <div className="bg-white border-2 border-teal-600 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-8 h-8 text-teal-600" />
                <h3 className="text-xl font-bold text-gray-800">Business Hours</h3>
              </div>
              <p className="text-gray-600">
                Mon - Fri: 8AM - 6PM<br/>
                Sat: 9AM - 2PM
              </p>
            </div>
          </div>

          {/* Contact Form and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-8 h-8 text-teal-600" />
                <h2 className="text-3xl font-bold text-gray-800">Send Us a Message</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Fill out the form below and our team will get back to you within 24 hours
              </p>
              
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                      placeholder="+250 788 XXX XXX"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors resize-none"
                    placeholder="Tell us about your inventory management needs or request a demo..."
                  ></textarea>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>

            {/* Office Map */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Find Us - Norrsken House Kigali
              </h3>
              
              <div className="bg-gray-100 rounded-xl overflow-hidden h-96 relative mb-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5201744334447!2d30.060163!3d-1.9440727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425d7f48189%3A0x39e5e7a4b99c3e9b!2sNorrsken%20House%20Kigali!5e0!3m2!1sen!2srw!4v1690000000000!5m2!1sen!2srw"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Norrsken House Kigali Location"
                />
              </div>
              
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="font-bold text-teal-800 mb-2">Office Location</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Norrsken House Kigali<br/>
                  KN 78 St<br/>
                  Kigali, Rwanda
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-teal-600">4.9</span>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary-400 text-secondary-400" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-teal-600 mb-2">Client Satisfaction Rating</div>
                <a 
                  href="https://www.google.com/maps/dir//Norrsken+House+Kigali" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-600 hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 bg-gray-50">
        <Blog />
      </section>
    </main>
  );
};

export default Home;