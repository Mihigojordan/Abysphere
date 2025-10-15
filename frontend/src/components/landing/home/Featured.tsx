import React from 'react';
import { motion } from 'framer-motion';
import { Fish, Sprout, Waves, BookOpen } from 'lucide-react';


const Services: React.FC = () => {
  const services = [
    {
      icon: <Fish className="w-12 h-12 text-primary-600" />,
      title: "Fingerling Supply",
      description: "High-quality tilapia fingerlings from our Rwamagana hatchery, ensuring healthy stock for farmers and cooperatives.",
      details: [
        "Genetically selected for growth and resilience",
        "Available for delivery across Rwanda",
        "Trusted by local aquaculture communities"
      ]
    },
    {
      icon: <Sprout className="w-12 h-12 text-primary-600" />,
      title: "Fish Feed Production",
      description: "Nutritious, sustainable fish feed produced in Rwamagana to support optimal tilapia growth and eco-friendly farming.",
      details: [
        "Formulated for maximum nutrition",
        "Reduces water pollution",
        "Available for bulk orders"
      ]
    },
    {
      icon: <Waves className="w-12 h-12 text-primary-600" />,
      title: "Cage Farming Support",
      description: "Expert support for cage farming on Lake Kivu and Lake Muhazi, including setup, maintenance, and technical guidance.",
      details: [
        "Sustainable cage designs",
        "Water quality monitoring",
        "On-site technical assistance"
      ]
    },
    {
      icon: <BookOpen className="w-12 h-12 text-primary-600" />,
      title: "Aquaculture Training",
      description: "Training programs in partnership with Karongi TVET to empower farmers with skills for sustainable aquaculture.",
      details: [
        "Hands-on workshops",
        "Focus on modern techniques",
        "Open to farmers and cooperatives"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary-300 rounded-full opacity-15"></div>
      </div>

      {/* Header Banner */}
    

      {/* Services Section */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Aquaculture Solutions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover how Fine Fish Ltd supports Rwanda’s aquaculture industry with high-quality fingerlings, sustainable feed, cage farming expertise, and comprehensive training.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-primary-100 hover:border-primary-300 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                  {service.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;