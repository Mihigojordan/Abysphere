import React from 'react';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';

const EnvironmentalCompliance: React.FC = () => {
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
        title="Environmental Compliance"
        subtitle="Home / Environmental Compliance"
        backgroundStyle="image"
        icon={<Fish className="w-10 h-10" />}
      />

      {/* Environmental Compliance Content */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 max-screen-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Environmental Compliance at Fine Fish Ltd</h1>
            <p className="text-gray-600 mb-8">Last Updated: October 9, 2025</p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Fine Fish Ltd, based in Rwamagana, Rwanda, with operations on Lake Kivu and Lake Muhazi, is committed to sustainable aquaculture practices that protect Rwanda’s ecosystems. This Environmental Compliance statement outlines our adherence to environmental regulations and our efforts to minimize ecological impact.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Commitment to Sustainability</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We prioritize environmentally responsible practices in our tilapia farming, fingerling production, and fish feed manufacturing, including:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Using sustainable fish feed to reduce water pollution.</li>
                <li>Implementing cage farming techniques that minimize impact on Lake Kivu and Lake Muhazi ecosystems.</li>
                <li>Partnering with local communities and cooperatives to promote eco-friendly aquaculture.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Regulatory Compliance</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We comply with Rwanda’s environmental laws, including:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Law No. 48/2018 on Environment, ensuring minimal ecological disruption.</li>
                <li>Regulations from the Rwanda Environment Management Authority (REMA) for water quality and waste management.</li>
                <li>Guidelines from the Rwanda Agriculture and Animal Resources Development Board (RAB) for sustainable aquaculture.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Environmental Practices</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Our operations include:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Regular water quality monitoring at our Lake Kivu and Lake Muhazi cage farms.</li>
                <li>Waste reduction strategies at our Rwamagana hatchery and feed plant.</li>
                <li>Training programs for farmers on sustainable aquaculture practices, in collaboration with Karongi TVET.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Community and Ecosystem Protection</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We work with local communities and partners to:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Protect Lake Kivu and Lake Muhazi biodiversity.</li>
                <li>Support reforestation and anti-erosion initiatives near our operational areas.</li>
                <li>Educate stakeholders on environmentally friendly farming techniques.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Reporting and Accountability</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We maintain transparency by:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Submitting regular environmental reports to REMA and RAB.</li>
                <li>Addressing stakeholder concerns about environmental impact promptly.</li>
                <li>Conducting internal audits to ensure compliance with sustainability goals.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              For questions about our environmental practices, contact:
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

export default EnvironmentalCompliance;