import React from 'react';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';

const ServiceAgreement: React.FC = () => {
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
        title="Service Agreement"
        subtitle="Home / Service Agreement"
        backgroundStyle="image"
        icon={<Fish className="w-10 h-10" />}
      />

      {/* Service Agreement Content */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 max-screen-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Service Agreement for Fine Fish Ltd</h1>
            <p className="text-gray-600 mb-8">Last Updated: October 9, 2025</p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              This Service Agreement outlines the terms under which Fine Fish Ltd, based in Rwamagana, Rwanda, provides aquaculture services, including fingerling supply, fish feed, and training, to farmers, cooperatives, and partners.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Services Provided</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Fine Fish Ltd offers:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Tilapia fingerlings and fish feed from our Rwamagana hatchery.</li>
                <li>Cage farming support on Lake Kivu and Lake Muhazi.</li>
                <li>Training and consulting for sustainable aquaculture practices.</li>
              </ul>
              Services are subject to availability and written confirmation.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Ordering and Delivery</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Orders are governed by:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Confirmation of availability by Fine Fish Ltd.</li>
                <li>Payment via bank transfer or mobile money, due as agreed.</li>
                <li>Delivery timelines and costs specified at order confirmation.</li>
                <li>No refunds for perishable goods unless defective.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Client Responsibilities</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Clients agree to:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Provide accurate order and contact information.</li>
                <li>Comply with Rwandan laws and regulations.</li>
                <li>Use products (e.g., fingerlings, feed) as intended.</li>
                <li>Make timely payments as per agreement.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Termination of Services</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We may terminate services if clients:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Fail to make payments.</li>
                <li>Violate agreement terms or engage in unlawful activities.</li>
                <li>Misuse products or services.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Dispute Resolution</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Disputes will be resolved through negotiation or, if necessary, in the courts of Kigali, Rwanda, under Rwandan law.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              For questions about this agreement, contact:
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

export default ServiceAgreement;