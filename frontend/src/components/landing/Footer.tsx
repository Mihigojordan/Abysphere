import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin,
  Send
} from 'lucide-react';
import tranLogo from '../../assets/tran.png';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { label: 'Home page', path: "/" },
    { label: 'About page', path: "/about" },
    { label: 'Services page', path: "/solutions" },

    { label: 'Jobs page', path: "/jobs" },
    { label: 'Blogs page', path: "/blogs" },
    { label: 'Contact page ', path: "/contact" },
  ];
  const navigate  = useNavigate();
  const handleNavigate = (path:string) => {
    if(!path) return;
  navigate(path)
  }

  const services = [
    { label: 'Workforce Planning & Strategy', path: '/services/workforce-planning' },
    { label: 'Design & Optimization', path: '/services/design-optimization' },
    { label: 'Workplace Safety', path: '/services/workplace-safety' },
    { label: 'Retention Strategies', path: '/services/retention' },
    { label: 'Executive Search', path: '/services/executive-search' },
    { label: 'Leadership Development', path: '/services/leadership' }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/abysphere', name: 'Facebook' },
    { icon: Twitter, href: 'https://www.twitter.com/abysphere', name: 'Twitter' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/abysphere', name: 'LinkedIn' }
  ];

  return (
    <footer className="relative bg-gray-900 text-white w-full overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/100 via-gray-800/100 to-gray-900/100 px-4">
        <div 
          className="absolute inset-0 opacity-5 h-[10px] border-2"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-6 sm:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Company Info - Takes more space */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavigate('/')}>
<img src={tranLogo} className='w-32 h-32  scale-150' alt="" />
            </div>
              </div>
              
              <p className="text-gray-300 mb-8 leading-relaxed max-w-md">
                At the heart of our philosophy lies the belief that a thriving workplace is rooted in trust, respect, commitment to continuous growth.
              </p>
              
              {/* Newsletter */}
              <div className="max-w-md">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-600 hover:bg-primary-500 px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quicklinks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-start gap-2 mb-6">
              <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2"></div>
              <h3 className="text-lg font-semibold">Quicklinks</h3>
            </div>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="text-primary-400 group-hover:translate-x-1 transition-transform">↗</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Our Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-start gap-2 mb-6">
              <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2"></div>
              <h3 className="text-lg font-semibold">Our Services</h3>
            </div>
            <ul className="space-y-3">
              {services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="text-primary-400 group-hover:translate-x-1 transition-transform">↗</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="flex items-start gap-2 mb-6">
              <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2"></div>
              <h3 className="text-lg font-semibold">Contact Info</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-secondary-400 text-sm mb-2">Inquiry</p>
                <a href="tel:+250788123456" className="text-white text-lg font-semibold hover:text-primary-400 transition-colors">
                  +(250) 788-123-456
                </a>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <p className="text-secondary-400 text-sm mb-2">Email</p>
                <a href="mailto:info@abysphere.com" className="text-white hover:text-primary-400 transition-colors">
                  info@abysphere.com
                </a>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <p className="text-secondary-400 text-sm mb-2">Location</p>
                <p className="text-white">
                  Kigali, Rwanda
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-gray-800">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm"
            >
              © Copyright 2025. All rights reserved. <span className="text-primary-400">Abysphere</span>. Designed by <span className="text-gray-300">Abytech hub team</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
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