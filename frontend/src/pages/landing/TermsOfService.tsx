import React from 'react';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary-300 rounded-full opacity-15"></div>
      </div>

      {/* Header Banner */}
      <HeaderBanner
        title="Terms of Service"
        subtitle="Home / Terms of Service"
        backgroundStyle="image"
        icon={<Fish className="w-10 h-10" />}
      />

      {/* Terms of Service Content */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 max-screen-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Terms of Service for Fine Fish Ltd</h1>
            <p className="text-gray-600 mb-8">Last Updated: October 9, 2025</p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Welcome to Fine Fish Ltd, a leading aquaculture company based in Rwamagana, Rwanda, with operations on Lake Kivu and Lake Muhazi. These Terms of Service govern your use of our website and services, including fingerling supply, fish feed production, aquaculture training, and related support. By using our services, you agree to these terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              By accessing our website or purchasing our services (e.g., fingerlings, fish feed, or training), you agree to these Terms of Service and our <a href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</a>. If you do not agree, please do not use our services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Our Services</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Fine Fish Ltd provides:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>High-quality tilapia fingerlings and fish feed from our Rwamagana hatchery.</li>
                <li>Cage farming support and technical consulting on Lake Kivu and Lake Muhazi.</li>
                <li>Aquaculture training and partnership programs for farmers and cooperatives.</li>
                <li>Customer support via phone, WhatsApp, and email.</li>
              </ul>
              Services are subject to availability and may require prior agreements or payment.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              When using our services, you agree to:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Provide accurate information (e.g., name, contact details, farmer ID) when ordering or submitting inquiries.</li>
                <li>Use our services for lawful purposes only, in compliance with Rwandan laws.</li>
                <li>Not misuse our website or services (e.g., unauthorized access or distribution of malicious content).</li>
                <li>Pay for services as agreed, following our payment terms.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Orders and Payments</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Orders for fingerlings, fish feed, or other services are subject to:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Availability and confirmation by Fine Fish Ltd.</li>
                <li>Payment via approved methods (e.g., bank transfer, mobile money).</li>
                <li>No refunds for perishable goods (e.g., fingerlings) unless defective or non-compliant with order specifications.</li>
                <li>Delivery timelines and costs as agreed at the time of order.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              All content on our website (e.g., text, images, logos) is owned by Fine Fish Ltd or our partners. You may not copy, distribute, or use our content without permission, except for personal, non-commercial use.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Fine Fish Ltd is not liable for:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Losses due to improper use of our products (e.g., fingerlings or feed).</li>
                <li>Delays or failures caused by factors beyond our control (e.g., weather, logistics issues).</li>
                <li>Indirect damages, such as loss of profits, arising from our services.</li>
              </ul>
              Our liability is limited to the amount paid for the service or product.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Termination</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We may suspend or terminate your access to our services if you:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Violate these Terms of Service.</li>
                <li>Engage in fraudulent or unlawful activities.</li>
                <li>Fail to make agreed payments.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Governing Law</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              These Terms are governed by the laws of Rwanda. Any disputes will be resolved in the courts of Kigali, Rwanda.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to These Terms</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We may update these Terms to reflect changes in our services or legal requirements. Updates will be posted on our website with the “Last Updated” date. Continued use of our services constitutes acceptance of the revised terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              For questions about these Terms, contact:
              <br />
              <strong>Fine Fish Ltd</strong><br />
              Industrial Area, Rwamagana District, Eastern Province, Rwanda<br />
              Phone: +250 788 123 456<br />
              Email: <a href="mailto:info@finefish.rw" className="text-primary-600 hover:underline">info@finefish.rw</a><br />
              WhatsApp: +250 788 123 456<br />
              Hours: Monday–Friday, 8:00 AM–6:00 PM
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;