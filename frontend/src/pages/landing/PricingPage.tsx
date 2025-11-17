import React, { useState } from "react";
import {
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

// Import HeaderBanner (adjust path as needed)
import HeaderBanner from "../../components/landing/HeaderBanner";
import img1 from "../../assets/hr_photo.jpg";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

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

  return (
    <div className="min-h-screen bg-white">
      {/* HeaderBanner */}
      <HeaderBanner
        title="Simple, Transparent Pricing"
        subtitle="Home / Pricing / Plans"
        backgroundStyle="image"
        icon={<Zap className="w-10 h-10" />}
      />

      {/* Pricing Content */}
      <div className="py-20 px-6">
        <div className=" mx-auto">
          {/* Intro Section */}
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
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-secondary-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
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

                  {/* Features List */}
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

                  {/* CTA Button */}
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

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Can I switch plans later?
                </h4>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  What payment methods do you accept?
                </h4>
                <p className="text-gray-600">
                  We accept all major credit cards, bank transfers, and mobile money payments for your convenience.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Is there a free trial?
                </h4>
                <p className="text-gray-600">
                  Yes! All plans come with a free trial period so you can test the features before committing.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Do you offer discounts for annual billing?
                </h4>
                <p className="text-gray-600">
                  Absolutely! Save 20% when you choose yearly billing on any plan. That's like getting 2 months free.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Need Help Card */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-800 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Need Help Choosing a Plan?
              </h3>
              <p className="text-white text-opacity-90 mb-6">
                Our team is here to help you find the perfect solution for your business needs.
              </p>
              <div className="space-y-4">
                <a
                  href="tel:+250788123456"
                  className="flex items-center gap-3 text-white font-semibold transition-all hover:gap-4"
                >
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span>+(250) 788-771-508</span>
                </a>
                <a
                  href="mailto:info@zubasystem.com"
                  className="flex items-center gap-3 text-white font-semibold transition-all hover:gap-4"
                >
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span>info@zubasystem.com</span>
                </a>
              </div>
            </div>

            {/* Enterprise Card */}
            <div className="relative bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-700 bg-opacity-20 rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Looking for Enterprise Solutions?
                </h3>
                <p className="text-gray-800 mb-6">
                  Get custom pricing, dedicated support, and tailored features for your organization.
                </p>
                <button className="bg-primary-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition-all flex items-center gap-2">
                  Contact Sales
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;