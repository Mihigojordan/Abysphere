import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  ArrowRight,
  Fish
} from 'lucide-react';
import logo from '../../assets/tran.png'

const Footer: React.FC = () => {
  const footerLinks = {
    solutions: [
      { label: 'Cage Fish Farming', path: '/services/cage-farming' },
      { label: 'Fingerling Supply', path: '/services/fingerlings' },
      { label: 'Fish Feed Production', path: '/services/fish-feed' },
      { label: 'Aquaculture Training', path: '/services/training' },
      { label: 'Sustainability Consulting', path: '/services/sustainability' },
      { label: 'Hatchery Services', path: '/services/hatchery' },
      { label: 'Market Access Support', path: '/services/market-access' }
    ],
    company: [
      { label: 'Home', path: '/' },
      { label: 'About Fine Fish', path: '/about' },
      { label: 'Our Mission', path: '/about' },
      { label: 'Careers', path: '/jobs' },
      { label: 'Services', path: '/solutions' },
      { label: 'Blog', path: '/blog' },
      { label: 'Contact Us', path: '/contact' }
    ],
    support: [
      { label: 'Farmer Support', path: '/support/farmers' },
      { label: 'Technical Assistance', path: '/support/technical' },
      { label: 'Training Resources', path: '/support/training' },
      { label: 'Aquaculture Guides', path: '/support/guides' },
      { label: 'Partnership Inquiries', path: '/support/partnerships' },
      { label: 'Customer Service', path: '/support/customer-service' }
    ],
    legal: [
      { label: 'Privacy Policy', path: '/legal/privacy-policy' },
      { label: 'Terms of Service', path: '/legal/terms' },
      { label: 'Environmental Compliance', path: '/legal/environmental' },
      { label: 'Data Protection', path: '/legal/data-protection' },
      { label: 'Service Agreement', path: '/legal/service-agreement' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/finefishrw', name: 'Facebook' },
    { icon: Twitter, href: 'https://www.twitter.com/finefishrw', name: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/finefishrw', name: 'Instagram' }
  ];

  return (
    <footer className="bg-gray-900 text-white w-full">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary-600 w-full to-primary-700">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Stay Connected with Fine Fish</h3>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Get updates on sustainable aquaculture, tilapia farming tips, and exclusive insights from Fine Fish Ltd.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
              >
                Subscribe <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-4">
   <img src={logo} className='h-20 scale-125 ' alt="" />
               
                <h2 className="text-2xl font-bold text-primary-400">Fine Fish Ltd</h2>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Leading Rwanda’s sustainable aquaculture with premium Nile tilapia and fingerlings from Lake Kivu and Lake Muhazi.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-primary-400" />
                  <span className="text-gray-300">info@finefish.rw</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-primary-400" />
                  <span className="text-gray-300">+250 788 123 456</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-primary-400" />
                  <span className="text-gray-300">Industrial Area, Rwamagana District, Eastern Province, Rwanda</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Aquaculture Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Aquaculture Solutions</h3>
            <ul className="space-y-2">
              {footerLinks.solutions.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm"
            >
              © 2025 Fine Fish Ltd. All rights reserved.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.2, color: '#60a5fa' }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;