import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Users, Target, Award, TrendingUp, Star, Briefcase, ChevronRight, Package, ChevronDown } from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';

export default function AboutUsSection() {
  const [hoveredService, setHoveredService] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const stats = [
    { value: "100%", label: "Cloud-Based" },
    { value: "24/7", label: "System Availability" },
    { value: "∞", label: "Branch Support" },
    { value: "All", label: "Industries Supported" }
  ];

  const features = [
    "Built for African Businesses",
    "Works for All Industries",
    "Simple, Clean Interface",
    "Continuous Updates",
    "Dedicated Support",
    "Secure Cloud Platform"
  ];

  const faqs = [
    {
      question: "What is IzubaSystem?",
      answer: "IzubaSystem is a comprehensive cloud-based stock management system designed specifically for all types of businesses across Rwanda and Africa. Our platform helps you move away from manual records, Excel sheets, and guessing by providing real-time inventory tracking, automated stock alerts, detailed reporting and analytics, multi-location management capabilities, and seamless integration with your business operations. Whether you're managing a single store or multiple warehouses across different locations, IzubaSystem provides you with the tools you need to streamline your operations, reduce costs, minimize stock losses, and maximize profitability. The system is built with modern technology to ensure fast performance, high security, and user-friendly interfaces that require minimal training."
    },
    {
      question: "Can I manage multiple branches?",
      answer: "Yes, absolutely! IzubaSystem is specifically designed to handle multi-branch operations with ease. You can add unlimited branches to your account and manage them all from one centralized dashboard. Each branch can have its own inventory, staff members, sales reports, and pricing structures, while still maintaining visibility across all locations. You can transfer stock between branches with complete tracking, compare performance metrics across locations, consolidate reports, and make informed decisions based on comprehensive data from all your branches. The system allows you to set different user permissions for each branch, ensuring that branch managers only see relevant information while head office administrators have full access to everything. This makes it perfect for growing businesses with multiple retail outlets, warehouses, or distribution centers throughout Rwanda and beyond."
    },
    {
      question: "Can I use it without the internet?",
      answer: "Yes, IzubaSystem comes with a powerful offline mode that ensures your business never stops running, even when internet connectivity is unstable or unavailable. When you're offline, you can continue to process sales, add new products, update inventory levels, manage customers, record stock movements, and perform all essential daily operations without any interruption. The system stores all your data locally on your device, ensuring that everything runs smoothly regardless of your connection status. Once you regain internet access, the system automatically synchronizes all the changes you made while offline with the cloud servers, ensuring that your data is always up-to-date, backed up, and accessible from all your devices. This feature is particularly valuable for businesses in areas with unreliable internet connections or for mobile sales operations. You'll never lose a sale or miss recording important transactions due to connectivity issues."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a generous free trial period so you can thoroughly explore IzubaSystem before making any financial commitment. During the trial, you'll have full access to all premium features including inventory management, sales tracking, multi-branch capabilities, stock transfer functionality, low stock alerts, expiry tracking, comprehensive reporting tools, user role management, offline mode, and our dedicated customer support team. This gives you ample time to test the system with your actual business data, train your staff, set up your inventory, configure your branches, and ensure that IzubaSystem meets all your specific requirements. There's no credit card required to start the trial, and you won't be automatically charged when the trial ends. We believe in letting our product speak for itself, and we're confident that once you experience the efficiency, accuracy, and time-saving benefits of IzubaSystem, you'll want to continue using it to grow your business. Our support team is also available throughout your trial to help you get set up and answer any questions you may have."
    },
    {
      question: "What devices can I use?",
      answer: "IzubaSystem is built to be fully accessible across all your devices, providing you with maximum flexibility in how you run your business. You can use the system on desktop computers (Windows, Mac, or Linux), laptops, tablets (iPad, Android tablets, or Windows tablets), and smartphones (iPhone or Android). The interface automatically adapts to your screen size, providing an optimized experience whether you're working on a large desktop monitor in your office or a small mobile phone screen while on the sales floor. This means you can check inventory levels while walking through your warehouse using your phone, process sales on a tablet at a pop-up location or market stall, generate detailed reports on your office computer, or approve stock transfers while traveling. All your data syncs automatically across all devices in real-time, so you can start a task on one device and finish it on another without missing a beat. This cross-platform compatibility ensures that you and your team can manage your business from anywhere, at any time, giving you the freedom to focus on growing your business rather than being tied to a specific location or device."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Header Banner */}
  <HeaderBanner
        title="About Us"
        subtitle="Home / About Us"
        backgroundStyle="image"
        icon={<Package className="w-10 h-10" />}
      />

      <div className="mx-auto py-24 px-6 md:px-16">
        {/* Header Section */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-6">
            <Star className="w-4 h-4 fill-primary-600" />
            <span>WHO WE ARE</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Modern Stock Management
            <span className="text-primary-600"> Made Simple</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            IzubaSystem is a modern stock management platform built to help businesses move away from manual records, Excel sheets, and guessing. We provide a simple, smart, and efficient way to control stock across multiple branches, departments, and business types.
          </p>
        </div>

        {/* Main Content Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 items-center">
          {/* Left - Image Section with Overlays */}
          <div className="relative">
            <div className="relative rounded-3xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=900&fit=crop"
                alt="Stock Management"
                className="w-full h-[600px] object-cover rounded-3xl"
              />
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -left-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 shadow-2xl max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">∞</div>
                    <div className="text-white/90 text-sm font-medium">Unlimited Branches</div>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Trusted by African Businesses</span>
                  </div>
                </div>
              </div>

              {/* Satisfaction Badge */}
              <div className="absolute top-8 right-8 bg-white rounded-2xl p-6 shadow-xl text-center">
                <div className="text-5xl font-bold text-primary-600 mb-1">24/7</div>
                <div className="text-sm text-gray-700 font-semibold">Always Available</div>
                <div className="flex gap-1 mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
                Our Mission & Vision
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-primary-600 mb-3">Our Mission</h4>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    To empower businesses in Rwanda and Africa with affordable, reliable, and easy-to-use digital tools that improve daily operations and drive growth.
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-primary-600 mb-3">Our Vision</h4>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    A future where every business — small or large — can manage stock with accuracy, speed, and confidence, transforming the way African businesses operate.
                  </p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">What We Offer</h4>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "A complete stock management solution",
                  "Real-time monitoring",
                  "Accurate reports & analytics",
                  "Multi-business support",
                  "Secure, scalable cloud platform"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center gap-3 shadow-lg hover:shadow-xl">
                Start Free Trial
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

        {/* Why Choose Us Section */}
        <div className="mb-24 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-12">Why Choose IzubaSystem?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-primary-50 rounded-xl p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Features Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4" />
              <span>CORE FEATURES</span>
            </div>
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Stock
            </h3>
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

        {/* FAQ Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-primary-600" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Know
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get answers to common questions about IzubaSystem
            </p>
          </div>

          <div className="max-w-7xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                >
                  <span className="text-lg font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed text-base">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors duration-200">
              Contact Support
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative px-12 py-16 text-center">
            <h3 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Stock Management?
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Start your free trial today and experience the power of modern inventory management built for African businesses.
            </p>
            <button className="group px-10 py-5 bg-white hover:bg-gray-100 text-primary-600 font-bold rounded-xl transition-all flex items-center gap-3 mx-auto shadow-xl text-lg">
              Start Free Trial Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}