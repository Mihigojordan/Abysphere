import React from 'react';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';

const DataProtection: React.FC = () => {
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
        title="Data Protection"
        subtitle="Home / Data Protection"
        backgroundStyle="image"
        icon={<Fish className="w-10 h-10" />}
      />

      {/* Data Protection Content */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 max-screen-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Data Protection at Fine Fish Ltd</h1>
            <p className="text-gray-600 mb-8">Last Updated: October 9, 2025</p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Fine Fish Ltd, based in Rwamagana, Rwanda, with operations on Lake Kivu and Lake Muhazi, is committed to safeguarding your personal data under Rwanda’s Data Protection Law (Law No. 058/2021). This page outlines how we protect your information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Data We Collect</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We collect only necessary data for our aquaculture services:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Name, email, phone, and address for orders or inquiries.</li>
                <li>Organization/cooperative names and farmer IDs.</li>
                <li>Inquiry details from forms, WhatsApp, or support channels.</li>
                <li>Anonymized website data (e.g., IP addresses) via cookies.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Data Security Measures</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We protect your data by:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Encrypting data during transmission and storage.</li>
                <li>Limiting access to authorized personnel only.</li>
                <li>Conducting regular security audits.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Sharing</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We share data only with:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Trusted service providers (e.g., logistics) under confidentiality agreements.</li>
                <li>Regulatory bodies like RAB, as required by law.</li>
                <li>Partners (e.g., Karongi TVET) with your consent.</li>
              </ul>
              We do not sell or rent your data.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Your Data Rights</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You have the right to:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Access, correct, or delete your data.</li>
                <li>Object to or restrict data use.</li>
                <li>Request data portability or withdraw consent.</li>
              </ul>
              Contact us at info@finefish.rw to exercise these rights.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We retain data only as long as needed for our services or as required by law (e.g., 5 years for tax records).
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              For data protection inquiries, contact:
              <br />
              <strong>Fine Fish Ltd</strong><br />
              Industrial Area, Rwamagana District, Eastern Province, Rwanda<br />
              Phone: +250 788 123 456<br />
              Email: <a href="mailto:info@finefish.rw" className="text-primary-600 hover:underline">info@finefish.rw</a><br />
              WhatsApp: +250 788 123 456<br />
              Hours: Monday–Friday, 8:00 AM–6:00 PM<br />
              <br />
              Complaints can be directed to Rwanda’s National Data Protection Authority.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DataProtection;