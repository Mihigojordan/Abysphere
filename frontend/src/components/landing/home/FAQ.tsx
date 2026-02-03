import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is IzubaSystem?",
      answer: "IzubaSystem is a comprehensive cloud-based stock management system designed specifically for all types of businesses, from small retail shops to large enterprises. Our platform offers real-time inventory tracking, automated stock alerts, detailed reporting and analytics, multi-location management capabilities, and seamless integration with various payment systems. Whether you're managing a single store or multiple warehouses across different locations, IzubaSystem provides you with the tools you need to streamline your operations, reduce costs, minimize stock losses, and maximize profitability. The system is built with modern technology to ensure fast performance, high security, and user-friendly interfaces that require minimal training."
    },
    {
      question: "Can I manage multiple branches?",
      answer: "Yes, absolutely! IzubaSystem is specifically designed to handle multi-branch operations with ease. You can add unlimited branches to your account and manage them all from one centralized dashboard. Each branch can have its own inventory, staff members, sales reports, and pricing structures, while still maintaining visibility across all locations. You can transfer stock between branches, compare performance metrics, consolidate reports, and make informed decisions based on comprehensive data from all your locations. The system allows you to set different user permissions for each branch, ensuring that branch managers only see relevant information while head office administrators have full access to everything. This makes it perfect for growing businesses with multiple retail outlets, warehouses, or distribution centers."
    },
    {
      question: "Can I use it without the internet?",
      answer: "Yes, IzubaSystem comes with a powerful offline mode that ensures your business never stops running, even when internet connectivity is unstable or unavailable. When you're offline, you can continue to process sales, add new products, update inventory levels, manage customers, and perform all essential daily operations without any interruption. The system stores all your data locally on your device, ensuring that everything runs smoothly. Once you regain internet access, the system automatically synchronizes all the changes you made while offline with the cloud servers, ensuring that your data is always up-to-date and backed up. This feature is particularly valuable for businesses in areas with unreliable internet connections or for mobile sales operations. You'll never lose a sale or miss recording important transactions due to connectivity issues."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a generous free trial period so you can thoroughly explore IzubaSystem before making any financial commitment. During the trial, you'll have full access to all premium features including inventory management, sales tracking, reporting tools, multi-branch capabilities, offline mode, and customer support. This gives you ample time to test the system with your actual business data, train your staff, and ensure that IzubaSystem meets all your specific requirements. There's no credit card required to start the trial, and you won't be automatically charged when the trial ends. We believe in letting our product speak for itself, and we're confident that once you experience the efficiency and power of IzubaSystem, you'll want to continue using it to grow your business. Our support team is also available during your trial to help you get set up and answer any questions."
    },
    {
      question: "What devices can I use?",
      answer: "IzubaSystem is built to be fully accessible across all your devices, providing you with maximum flexibility in how you run your business. You can use the system on desktop computers (Windows, Mac, or Linux), laptops, tablets (iPad, Android tablets, or Windows tablets), and smartphones (iPhone or Android). The interface automatically adapts to your screen size, providing an optimized experience whether you're working on a large desktop monitor or a small mobile phone screen. This means you can check inventory levels while on the sales floor using your phone, process sales on a tablet at a pop-up location, or generate detailed reports on your office computer. All your data syncs automatically across all devices, so you can start a task on one device and finish it on another. This cross-platform compatibility ensures that you and your team can manage your business from anywhere, at any time."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className=" bg-neutral-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-600">Everything you need to know about IzubaSystem</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
              >
                <span className="text-lg font-semibold text-gray-800 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 leading-relaxed text-base">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}