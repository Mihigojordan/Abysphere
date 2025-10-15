import React from 'react';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';

const PrivacyPolicy: React.FC = () => {
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
        title="Privacy Policy"
        subtitle="Home / Privacy Policy"
        backgroundStyle="image"
        icon={<Fish className="w-10 h-10" />}
      />

      {/* Privacy Policy Content */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 ">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Privacy Policy for Fine Fish Ltd</h1>
            <p className="text-gray-600 mb-8">Last Updated: October 9, 2025</p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              At Fine Fish Ltd, based in Rwamagana, Rwanda, with operations on Lake Kivu and Lake Muhazi, we are committed to protecting your privacy. This policy explains how we collect, use, store, share, and protect your personal information, in line with Rwanda’s Data Protection Law (Law No. 058/2021).
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              We collect only the information needed for our aquaculture services, such as:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-8 space-y-2">
              <li>Name, email, phone number, and address (e.g., for ordering fingerlings).</li>
              <li>Organization or cooperative name and farmer IDs.</li>
              <li>Inquiries submitted via forms, WhatsApp, or support channels.</li>
              <li>Anonymized website usage data (e.g., IP addresses, browser type) via cookies.</li>
              <li>Order or partnership details (e.g., fingerling or feed purchases).</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Collect Information</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We collect data when you:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Contact us via our website, phone (+250 788 123 456), or WhatsApp.</li>
                <li>Order products, join training, or form partnerships.</li>
                <li>Use our website, where cookies may track anonymized data.</li>
                <li>Share data through partners like Rwanda Agriculture and Animal Resources Development Board (RAB), with your consent.</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your information helps us:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Process orders for fingerlings or fish feed.</li>
                <li>Respond to inquiries and provide support or training.</li>
                <li>Manage partnerships with farmers and cooperatives.</li>
                <li>Improve our website and services.</li>
                <li>Share updates on training or sustainability initiatives.</li>
                <li>Meet legal requirements (e.g., tax or environmental reporting).</li>
              </ul>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We may share data with:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Trusted service providers (e.g., logistics or payment processors) under confidentiality agreements.</li>
                <li>Regulatory bodies like RAB, as required by law.</li>
                <li>Partners like Karongi TVET, with your consent, for training programs.</li>
              </ul>
              We do not sell or rent your data for marketing purposes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Storage and Security</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We store data securely in Rwanda or on compliant cloud servers, using encryption, access controls, and regular audits. Data is kept only as long as needed or required by law (e.g., 5 years for tax records).
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Under Rwanda’s Data Protection Law, you can:
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Access, correct, or delete your data.</li>
                <li>Object to or restrict certain data uses.</li>
                <li>Request data portability or withdraw consent.</li>
              </ul>
              Contact us at info@finefish.rw or +250 788 123 456 to exercise these rights.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We use essential and analytics cookies to improve our website. Manage preferences via your browser settings, noting that disabling cookies may affect functionality.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Our website may link to external sites (e.g., RAB). We are not responsible for their privacy practices.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Most data is processed in Rwanda. International transfers, if any, comply with local regulations and use secure providers.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Updates to This Policy</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We may update this policy, with changes posted here and significant updates communicated via email or our website.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              For questions or to exercise your data rights, contact:
              <br />
              <strong>Fine Fish Ltd</strong><br />
              Industrial Area, Rwamagana District, Eastern Province, Rwanda<br />
              Phone: +250 788 123 456<br />
              Email: <a href="mailto:info@finefish.rw" className="text-primary-600 hover:underline">info@finefish.rw</a><br />
              WhatsApp: +250 788 123 456<br />
              Hours: Monday–Friday, 8:00 AM–6:00 PM<br />
              <br />
              For complaints, contact Rwanda’s National Data Protection Authority.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;