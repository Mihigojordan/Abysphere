import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Settings,
  ArrowRight,
  Phone,
  Mail,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Bell,
  BarChart3,
  Building2,
  Shield,
  Scan
} from "lucide-react";

// Import HeaderBanner (adjust path as needed)
import HeaderBanner from "../../components/landing/HeaderBanner";
import img1 from "../../assets/hr_photo.jpg"

const FeaturesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const featureCategories = [
    { title: "Product & Item Management", active: true, icon: Package },
    { title: "Stock Operations", active: false, icon: ArrowLeftRight },
    { title: "Supplier & Purchase Management", active: false, icon: Users },
    { title: "Alerts & Notifications", active: false, icon: Bell },
    { title: "Reporting & Analytics", active: false, icon: BarChart3 },
    { title: "Multi-Store Support", active: false, icon: Building2 },
    { title: "Roles & Permissions", active: false, icon: Shield },
    { title: "Barcode Support", active: false, icon: Scan },
  ];

  const featureContent = {
    0: {
      title: "Product & Item Management",
      description:
        "Comprehensive product management system that allows you to organize, track, and manage your entire inventory with ease. From adding new products to tracking variations, our system provides everything you need for efficient product control.",
      image:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Add Products with Categories",
          description:
            "Organize your inventory by creating custom categories, units, and barcodes for each product. Streamline product entry with batch upload capabilities.",
          icon: Package
        },
        {
          title: "Track Purchase & Selling Prices",
          description:
            "Monitor cost and profit margins in real-time. Set dynamic pricing rules and track price history for better financial planning.",
          icon: TrendingUp
        },
        {
          title: "Manage Product Variations",
          description:
            "Handle different sizes, colors, and specifications effortlessly. Create unlimited variations while maintaining centralized product data.",
          icon: Settings
        },
        {
          title: "Set Minimum Stock Levels",
          description:
            "Automate reordering with intelligent stock level alerts. Never run out of critical inventory with customizable threshold settings.",
          icon: Bell
        },
        {
          title: "Add Images and Descriptions",
          description:
            "Enhance product visibility with multiple high-quality images and detailed descriptions. Improve sales with rich product information.",
          icon: Package
        },
      ],
    },
    1: {
      title: "Stock Operations",
      description:
        "Powerful stock management tools that give you complete control over inventory movements. Track every item from receiving to dispatch with precision and efficiency.",
      image:
        "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Stock In Operations",
          description:
            "Efficiently receive and record incoming inventory. Automated documentation and instant stock updates ensure accuracy across your system.",
          icon: TrendingUp
        },
        {
          title: "Stock Out Management",
          description:
            "Track all outgoing inventory with detailed transaction records. Maintain accurate stock levels with automated deduction processes.",
          icon: TrendingDown
        },
        {
          title: "Branch Transfers",
          description:
            "Seamlessly transfer inventory between multiple locations. Real-time tracking ensures transparency and prevents discrepancies.",
          icon: ArrowLeftRight
        },
        {
          title: "Stock Adjustments",
          description:
            "Make corrections and adjustments with full audit trails. Document reasons for changes and maintain data integrity.",
          icon: Settings
        },
        {
          title: "Returns Management",
          description:
            "Handle customer and supplier returns efficiently. Automated restocking and refund processes save time and reduce errors.",
          icon: ArrowRight
        },
      ],
    },
    2: {
      title: "Supplier & Purchase Management",
      description:
        "Build strong supplier relationships with comprehensive vendor management tools. From purchase orders to payment tracking, manage your entire supply chain efficiently.",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Add & Manage Suppliers",
          description:
            "Maintain detailed supplier profiles with contact information, payment terms, and performance metrics. Build a reliable supplier network.",
          icon: Users
        },
        {
          title: "Create Purchase Orders",
          description:
            "Generate professional purchase orders instantly. Track order status from creation to delivery with automated workflows.",
          icon: Package
        },
        {
          title: "Track Payments",
          description:
            "Monitor all supplier payments and outstanding balances. Generate payment schedules and maintain healthy cash flow.",
          icon: TrendingUp
        },
        {
          title: "Supplier History",
          description:
            "Access complete transaction history for each supplier. Analyze performance, pricing trends, and delivery reliability.",
          icon: BarChart3
        },
        {
          title: "Reorder Reminders",
          description:
            "Automated alerts for reordering based on stock levels and lead times. Never miss a critical purchase opportunity.",
          icon: Bell
        },
      ],
    },
    3: {
      title: "Alerts & Notifications",
      description:
        "Stay informed with intelligent alert systems that keep you updated on critical inventory events. Proactive notifications help you make timely decisions and prevent stockouts.",
      image:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Low Stock Alerts",
          description:
            "Receive instant notifications when inventory reaches minimum levels. Customize alert thresholds for different product categories.",
          icon: Bell
        },
        {
          title: "Upcoming Expiry Alerts",
          description:
            "Get advance warnings for products approaching expiration dates. Reduce waste and optimize inventory rotation.",
          icon: Bell
        },
        {
          title: "Out-of-Stock Warnings",
          description:
            "Immediate alerts when items run out. Prioritize restocking efforts and prevent lost sales opportunities.",
          icon: Bell
        },
        {
          title: "Custom Alert Settings",
          description:
            "Configure personalized notification preferences. Choose alert frequency, channels, and recipients based on your needs.",
          icon: Settings
        },
        {
          title: "Multi-Channel Notifications",
          description:
            "Receive alerts via email, SMS, and in-app notifications. Stay informed regardless of where you are.",
          icon: Bell
        },
      ],
    },
    4: {
      title: "Reporting & Analytics",
      description:
        "Make data-driven decisions with comprehensive reporting and analytics tools. Transform raw data into actionable insights that drive business growth and operational efficiency.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Inventory Summary Reports",
          description:
            "Get a complete overview of your inventory status at a glance. Track stock values, turnover rates, and product performance.",
          icon: BarChart3
        },
        {
          title: "Low Stock Reports",
          description:
            "Identify products requiring immediate attention. Optimize reordering strategies with detailed stock level analysis.",
          icon: TrendingDown
        },
        {
          title: "Expiry Reports",
          description:
            "Monitor products approaching expiration with detailed reports. Minimize waste and maximize profit margins.",
          icon: Bell
        },
        {
          title: "Sales vs Stock Analysis",
          description:
            "Compare sales performance against inventory levels. Optimize stock holding and reduce carrying costs.",
          icon: BarChart3
        },
        {
          title: "Purchase History & Movement Logs",
          description:
            "Access detailed transaction histories and movement logs. Analyze trends, identify patterns, and forecast future needs.",
          icon: BarChart3
        },
      ],
    },
    5: {
      title: "Multi-Store Support",
      description:
        "Manage multiple locations from a single platform. Gain complete visibility across all branches while maintaining location-specific control and reporting capabilities.",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Manage Multiple Locations",
          description:
            "Centralized control over all your branches and warehouses. View consolidated inventory or drill down to specific locations.",
          icon: Building2
        },
        {
          title: "Branch-Specific Reports",
          description:
            "Generate detailed reports for individual locations. Compare performance across branches and identify top performers.",
          icon: BarChart3
        },
        {
          title: "Branch-to-Branch Transfers",
          description:
            "Transfer inventory between locations seamlessly. Real-time tracking ensures accurate stock levels across all branches.",
          icon: ArrowLeftRight
        },
        {
          title: "Location-Based Access Control",
          description:
            "Assign users to specific locations with tailored permissions. Maintain security while enabling operational flexibility.",
          icon: Shield
        },
        {
          title: "Consolidated Dashboard",
          description:
            "View all locations from a single dashboard. Monitor performance, stock levels, and transactions across your entire network.",
          icon: BarChart3
        },
      ],
    },
    6: {
      title: "Roles & Permissions",
      description:
        "Secure your system with granular access controls. Assign roles and permissions that align with your organizational structure while protecting sensitive data.",
      image:
        "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Admin Access",
          description:
            "Full system control with unrestricted access to all features. Manage users, configure settings, and oversee all operations.",
          icon: Shield
        },
        {
          title: "Stock Manager Role",
          description:
            "Comprehensive inventory management capabilities. Handle stock operations, transfers, and supplier management efficiently.",
          icon: Users
        },
        {
          title: "Cashier (View Only)",
          description:
            "Limited access focused on sales and product lookup. Process transactions while maintaining data security.",
          icon: Users
        },
        {
          title: "Accountant (Report Access)",
          description:
            "Financial reporting and analytics access. Generate reports and analyze data without modifying inventory.",
          icon: Users
        },
        {
          title: "Custom Role Creation",
          description:
            "Design custom roles tailored to your organization. Mix and match permissions to create the perfect access level.",
          icon: Settings
        },
      ],
    },
    7: {
      title: "Barcode Support",
      description:
        "Accelerate operations with integrated barcode technology. From scanning to printing, streamline your inventory processes and eliminate manual data entry errors.",
      image:
        "https://images.unsplash.com/photo-1601598851547-4302969d0614?w=1200&h=600&fit=crop",
      benefits: [
        {
          title: "Scan Items",
          description:
            "Fast and accurate item lookup using barcode scanners. Speed up receiving, sales, and stocktaking processes significantly.",
          icon: Scan
        },
        {
          title: "Generate Barcodes",
          description:
            "Automatically create unique barcodes for all products. Support for multiple barcode formats including EAN, UPC, and Code128.",
          icon: Scan
        },
        {
          title: "Print Labels",
          description:
            "Print professional barcode labels on demand. Customize label designs with product names, prices, and company branding.",
          icon: Scan
        },
        {
          title: "Bulk Barcode Operations",
          description:
            "Generate and print barcodes for multiple products simultaneously. Save time with batch processing capabilities.",
          icon: Package
        },
        {
          title: "Mobile Scanning",
          description:
            "Use smartphones and tablets as barcode scanners. Enable inventory operations anywhere, anytime with mobile devices.",
          icon: Scan
        },
      ],
    },
  };

  // Get active feature from URL or default to first active one
  const getActiveFeatureIndex = () => {
    const featureParam = searchParams.get("feature");
    const index = featureCategories.findIndex(cat => cat.title === featureParam);
    return index !== -1 ? index : featureCategories.findIndex(cat => cat.active);
  };

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(getActiveFeatureIndex());

  // Sync with URL on mount
  useEffect(() => {
    const index = getActiveFeatureIndex();
    setActiveFeatureIndex(index);
  }, [searchParams]);

  const currentFeature = featureContent[activeFeatureIndex];
  const benefits = currentFeature ? currentFeature.benefits : [];

  // Handle feature navigation
  const handleFeatureClick = (index) => {
    setActiveFeatureIndex(index);
    const featureTitle = featureCategories[index].title;
    setSearchParams({ feature: featureTitle });
  };

  // DYNAMIC PREVIOUS/NEXT NAVIGATION
  const prevFeatureIndex = activeFeatureIndex > 0 ? activeFeatureIndex - 1 : null;
  const nextFeatureIndex = activeFeatureIndex < featureCategories.length - 1 ? activeFeatureIndex + 1 : null;

  useEffect(() => {
    document.body.scrollIntoView({behavior:"smooth", block:"start"});
  }, [prevFeatureIndex, nextFeatureIndex]);

  const handleNavClick = (index) => {
    handleFeatureClick(index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* DYNAMIC HeaderBanner */}
      <HeaderBanner
        title={currentFeature?.title || "System Features"}
        subtitle="Home / Features / Inventory Management"
        backgroundStyle="image"
        icon={<Package className="w-10 h-10" />}
      />

      {/* Main Content Section with Sidebar */}
      <div className="py-20 px-6">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Features List */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-teal-700" />
                  System Features
                </h3>
                <div className="space-y-3">
                  {featureCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleFeatureClick(index)}
                        className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between group ${
                          activeFeatureIndex === index
                            ? "bg-secondary-400 text-gray-900 shadow-lg"
                            : "bg-teal-700 text-white hover:bg-teal-600"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          {category.title}
                        </span>
                        <ArrowRight className={`w-5 h-5 transition-transform ${
                          activeFeatureIndex === index ? "translate-x-1" : "group-hover:translate-x-1"
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact CTA Card */}
              <div className="relative bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-teal-700 bg-opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-700 bg-opacity-20 rounded-full translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Transform Your Business?
                  </h4>
                  <p className="text-gray-800 mb-6">
                    Get Started With Our Powerful Inventory Management System.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <a href="tel:+250788123456" className="flex items-center gap-3 text-gray-900 font-semibold transition-all hover:gap-4">
                      <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <span>+(250) 792-888-980</span>
                    </a>
                    <a href="mailto:info@zubasystem.com" className="flex items-center gap-3 text-gray-900 font-semibold transition-all hover:gap-4">
                      <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <span>info@zubasystem.com</span>
                    </a>
                  </div>

                  {/* <img
                    src={img1}
                    alt="System Demo"
                    className="rounded-2xl shadow-xl w-full h-64 object-cover"
                  /> */}
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8">
              <div className="mb-12">
                <img
                  src={currentFeature?.image}
                  alt={currentFeature?.title}
                  className="w-full h-96 object-cover rounded-3xl shadow-2xl"
                />
              </div>

              <div className="mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  {currentFeature?.title || "System Features"}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {currentFeature?.description}
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Our comprehensive feature set ensures your organization achieves maximum efficiency through intuitive design and powerful functionality tailored to your unique business needs.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-3xl p-12 mb-16">
                <h3 className="text-3xl font-bold text-white mb-8">Key Benefits & Details</h3>
                <div className="grid md:grid-cols-1 gap-6">
                  {benefits.map((benefit, index) => {
                    const BenefitIcon = benefit.icon;
                    return (
                      <div
                        key={index}
                        className="bg-teal-800 bg-opacity-50 rounded-2xl p-6 border-2 border-teal-700 border-opacity-50 hover:border-secondary-400 hover:border-opacity-50 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-secondary-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BenefitIcon className="w-6 h-6 text-gray-900" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-3">
                              {benefit.title}
                            </h3>
                            <p className="text-white text-opacity-80 leading-relaxed">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Section */}
              <div className="bg-white p-8 rounded-3xl">
                {/* DYNAMIC PREVIOUS/NEXT NAVIGATION */}
                <div className="mt-3 flex gap-4">
                  {prevFeatureIndex !== null && (
                    <button
                      onClick={() => handleNavClick(prevFeatureIndex)}
                      className="flex items-center gap-2 bg-secondary-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-secondary-300 transition"
                    >
                      ← {featureCategories[prevFeatureIndex].title}
                    </button>
                  )}
                  {nextFeatureIndex !== null && (
                    <button
                      onClick={() => handleNavClick(nextFeatureIndex)}
                      className="flex items-center gap-2 bg-secondary-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-secondary-300 transition ml-auto"
                    >
                      {featureCategories[nextFeatureIndex].title} →
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

export default FeaturesPage;