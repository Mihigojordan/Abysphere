import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users, Fish, Globe, Handshake, ArrowUp, Award, Target, Leaf, Droplets } from 'lucide-react';
import Testimonials from '../../components/landing/home/Testimonials';
import HeaderBanner from '../../components/landing/HeaderBanner';
import img1 from '../../assets/images/fish1.jpg'
import img2 from '../../assets/images/fish2.jpg'
import img3 from '../../assets/images/fish3.jpg'
import img4 from '../../assets/images/fish4.jpg'
import img5 from '../../assets/images/fish5.jpg'
import img6 from '../../assets/images/fish6.jpg'

import farm from '../../assets/farm.jpg'

interface Partner {
  name: string;
  logo: string;
}

interface Stat {
  number: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

interface Feature {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}

interface Value {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  image: string;
}

const AboutPage: React.FC = () => {
  const [currentClientsSlide, setCurrentClientsSlide] = useState<number>(0);

  // Partner organizations
  const partners: Partner[] = [
    { name: "Rwanda Agriculture Board", logo: "https://placehold.co/150x50?text=RAB&bg=1e3a8a&fg=ffffff" },
    { name: "Karongi TVET", logo: "https://placehold.co/150x50?text=Karongi+TVET&bg=1e3a8a&fg=ffffff" },
    { name: "Ministry of Agriculture", logo: "https://placehold.co/150x50?text=MinAgri&bg=1e3a8a&fg=ffffff" },
    { name: "Lake Kivu Fisheries", logo: "https://placehold.co/150x50?text=Kivu+Fisheries&bg=1e3a8a&fg=ffffff" },
    { name: "Rwamagana Cooperatives", logo: "https://placehold.co/150x50?text=Rwamagana+Coop&bg=1e3a8a&fg=ffffff" },
    { name: "Great Lakes Africa", logo: "https://placehold.co/150x50?text=Great+Lakes&bg=1e3a8a&fg=ffffff" },
  ];

  // Statistics data
  const stats: Stat[] = [
    { number: "90T+", label: "Tilapia/Month", icon: Fish },
    { number: "2M+", label: "Fingerlings/Year", icon: Droplets },
    { number: "200+", label: "Cages on Kivu", icon: Globe },
    { number: "100+", label: "Jobs Created", icon: Users },
  ];

  // Features data
  const features: Feature[] = [
    {
      icon: Leaf,
      title: "Eco-Friendly Farming",
      description: "Sustainable cage farming preserves Lake Kivu’s ecosystem while delivering premium tilapia.",
    },
    {
      icon: Fish,
      title: "Certified Hatchery",
      description: "Our Rwamagana hatchery supplies millions of healthy fingerlings to farmers nationwide.",
    },
    {
      icon: Target,
      title: "Community Training",
      description: "Partnering with Karongi TVET to empower youth with aquaculture skills.",
    },
    {
      icon: Award,
      title: "Industry Leader",
      description: "Driving Rwanda’s secondary economy with innovative, sustainable practices.",
    },
  ];

  // Core values
  const values: Value[] = [
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Protecting Lake Kivu through eco-friendly farming and responsible resource use.",
      image: img6,
    },
    {
      icon: Fish,
      title: "Quality Excellence",
      description: "Producing premium tilapia and fingerlings meeting global standards.",
      image: img3,
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Creating jobs and training opportunities to uplift Karongi and beyond.",
      image: img4,
    },
  ];

  // Clients slideshow functions
  const nextClientsSlide = () => {
    setCurrentClientsSlide((prev) => (prev + 1) % Math.ceil(partners.length / 3));
  };

  const prevClientsSlide = () => {
    setCurrentClientsSlide((prev) => (prev - 1 + Math.ceil(partners.length / 3)) % Math.ceil(partners.length / 3));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Animation variants
  const sectionVariants:any = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
    <HeaderBanner 
    title='About Fine Fish Ltd'
    subtitle='Home / About'
    backgroundStyle='image'
    />

      {/* Main About Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-10 bg-gradient-to-br from-primary-50 via-white to-secondary-50"
      >
        <div className="w-12/12 px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-12">
            <div>
              <div className="text-primary-600 text-sm font-semibold tracking-wide uppercase mb-4">
                OUR COMPANY
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Leading Rwanda’s
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> secondary Economy</span>
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Fine Fish Ltd, based in Karongi on Lake Kivu, is Rwanda’s premier aquaculture company. Founded by Themistocle Munyangeyo, we produce premium Nile tilapia and high-quality fingerlings, driving food security and sustainability.
                </p>
                <p>
                  With 200+ floating cages and a certified hatchery in Rwamagana, we deliver 90+ tonnes of tilapia monthly and supply millions of fingerlings yearly, empowering farmers and strengthening Rwanda’s aquaculture sector.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="space-y-6"
              >
                <img
                  src="https://images.unsplash.com/photo-1568727349458-1bb59fb3fb63?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZmlzaCUyMGZhcm1pbmd8ZW58MHx8MHx8fDA%3D"
                  alt="Fish farming cages on Lake Kivu"
                  className="rounded-2xl shadow-lg w-full h-72 object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="space-y-6 pt-12"
              >
                <img
                  src={img1}
                  alt="Premium tilapia production"
                  className="rounded-2xl shadow-lg w-full h-72 object-cover"
                />
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 border border-primary-100 hover:border-primary-600 transition-all duration-300 shadow-md hover:shadow-xl group"
              >
                <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4 group-hover:bg-primary-600 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary-600 group-hover:text-white" />
                </div>
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mission & Vision Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-10 bg-white"
      >
        <div className="w-12/12 mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Mission & Vision</span>
            </h2>
            <p className="text-lg text-gray-600  mx-auto">
              Advancing sustainable aquaculture for Rwanda’s future.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-3xl shadow-lg border-l-4 border-primary-600 hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 text-base leading-relaxed">
                To lead Rwanda’s aquaculture sector by producing sustainable, high-quality tilapia and fingerlings, empowering local farmers, and reducing fish imports.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-secondary-50 to-primary-50 p-8 rounded-3xl shadow-lg border-l-4 border-primary-600 hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-secondary-600 to-primary-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6">
                <Fish className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 text-base leading-relaxed">
                To be East Africa’s benchmark for sustainable aquaculture, supporting Rwanda’s Vision 2050 through innovative fish production and community empowerment.
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group bg-white p-6 rounded-lg border border-primary-100 hover:border-primary-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Core Values Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-10 bg-gradient-to-br from-primary-50 to-white"
      >
        <div className="w-12/12 mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Core Values</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden border border-primary-100 shadow-md hover:shadow-xl hover:border-primary-600 transition-all duration-300 group"
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <img
                    src={value.image}
                    alt={value.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-600 transition-colors">
                      <value.icon className="w-6 h-6 text-primary-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Story Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-10 bg-white"
      >
        <div className="w-12/12 mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div whileHover={{ scale: 1.03 }} className="order-2 lg:order-1">
              <img
                src={img5}
                alt="Fish farming community in Karongi"
                className="rounded-3xl shadow-xl w-full h-96 object-cover hover:shadow-2xl transition-shadow duration-300"
              />
            </motion.div>
            <div className="order-1 lg:order-2">
              <div className="text-primary-600 text-sm font-semibold tracking-wide uppercase mb-4">
                OUR STORY
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                From Vision to <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Aquaculture Excellence</span>
              </h2>
              <div className="space-y-4 text-base text-gray-700">
                <p>
                  Founded by Themistocle Munyangeyo, Fine Fish Ltd began with a bold vision to revolutionize Rwanda’s fish production. Starting with a small hatchery in Rwamagana, we’ve grown into a leader in sustainable aquaculture.
                </p>
                <p>
                  Our 200+ cages on Lake Kivu and Muhazi produce over 90 tonnes of tilapia monthly, while our hatchery supplies millions of fingerlings to farmers. We’ve created over 100 jobs and partnered with Karongi TVET to train the next generation.
                </p>
                <p>
                  Today, we’re proud to drive Rwanda’s secondary economy, aligning with Vision 2050 to deliver sustainable, high-quality fish while protecting our lakes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Leadership Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-10 bg-gradient-to-br from-primary-50 to-white"
      >
        <div className="w-12/12 mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Leadership</span>
            </h2>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-3xl p-8 border border-primary-100 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg">
                  <Users className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Themistocle Munyangeyo</h3>
                <p className="text-primary-600 font-semibold text-lg mb-4">Founder & CEO</p>
                <p className="text-gray-700 text-base leading-relaxed">
                  Themistocle Munyangeyo’s vision has transformed Fine Fish Ltd into Rwanda’s leading aquaculture company. His commitment to sustainability and community empowerment drives our mission to deliver high-quality tilapia while supporting Rwanda’s Vision 2050.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Partners Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="py-10 bg-white"
      >
        <div className="w-12/12 mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Partners</span>
            </h2>
            <p className="text-lg text-gray-600">
              Collaborating to advance Rwanda’s aquaculture industry.
            </p>
          </div>

          <div className="relative bg-gradient-to-r from-primary-50 to-white p-8 rounded-3xl border border-primary-100">
            <AnimatePresence>
              <motion.div
                key={currentClientsSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4"
              >
                {partners.slice(currentClientsSlide * 3, (currentClientsSlide + 1) * 3).map((partner, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-center bg-white p-4 rounded-xl border border-primary-100 hover:border-primary-600 transition-all duration-300"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-16 object-contain"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {Math.ceil(partners.length / 3) > 1 && (
              <>
                <button
                  onClick={prevClientsSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextClientsSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Impact Section */}
     <Testimonials />
      {/* Floating Action Button */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default AboutPage;