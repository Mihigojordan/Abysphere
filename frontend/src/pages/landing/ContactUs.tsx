import React, { useState } from 'react';
import { 
  MapPin, 
  Headphones, 
  Clock, 
  Star, 
  MessageSquare, 
  Send, 
  Users, 
  Briefcase,
  FileText,
  Phone,
  Mail,
  PhoneCall,
  Package,
  BarChart3,
  Building2
} from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';
import img1 from "../../assets/contact.jpg"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Contact Form submitted:', formData);
    // Add form submission logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
    
      <HeaderBanner
        title="Get in Touch"
        subtitle="Home / Contact Us"
        backgroundStyle="image"
        icon={<PhoneCall className="w-10 h-10" />}
      />

      <div className="text-center mb-6 pt-5">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-primary-600 to-gray-800 bg-clip-text text-transparent mb-6">
          Have Questions? Need a Demo? We're Here to Help.
        </h1>
        <p className="text-md md:text-lg text-gray-600 mx-auto leading-relaxed mb-6 max-w-3xl">
          Connect with our expert team for inventory management solutions, product demos, and business consultations. Let us help transform your inventory operations.
        </p>
        
        {/* Quick contact badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="flex items-center bg-primary-50 text-primary-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Package size={16} className="mr-2" />
            <span className="font-medium">Inventory Solutions</span>
          </div>
          <div className="flex items-center bg-primary-50 text-primary-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Phone size={16} className="mr-2" />
            <span className="font-medium">250 788 771 508</span>
          </div>
          <div className="flex items-center bg-primary-50 text-primary-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Mail size={16} className="mr-2" />
            <span className="font-medium">support@izubagen.rw</span>
          </div>
          <div className="flex items-center bg-primary-50 text-primary-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Clock size={16} className="mr-2" />
            <span className="font-medium">Mon-Fri 8AM-6PM</span>
          </div>
          <div className="flex items-center bg-primary-50 text-primary-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Building2 size={16} className="mr-2" />
            <span className="font-medium">Norrsken House Kigali</span>
          </div>
        </div>
      </div>

      {/* Header Info Cards */}
      <div className="w-full mx-auto px-4 lg:px-16 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Office Location */}
          <div className="bg-primary-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-8 h-8" />
              <h3 className="text-xl font-bold">Our Office</h3>
            </div>
            <p className="text-primary-100">
              Norrsken House Kigali<br/>
              Kigali, Rwanda
            </p>
          </div>

          {/* Support */}
          <div className="bg-blue-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Headphones className="w-8 h-8 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-800">Support</h3>
            </div>
            <p className="text-gray-600">
              250 788 771 508<br/>
              support@izubagen.rw
            </p>
          </div>

          {/* Working Hours */}
          <div className="bg-white border-2 border-primary-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-8 h-8 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-800">Business Hours</h3>
            </div>
            <p className="text-gray-600">
              Mon - Fri: 8AM - 6PM<br/>
              Sat: 9AM - 2PM
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-8 h-8 text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-800">Send Us a Message</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Fill out the form below and our team will get back to you within 24 hours
            </p>
            
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                    placeholder="+250 788 XXX XXX"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-colors resize-none"
                  placeholder="Tell us about your inventory management needs or request a demo..."
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </div>
          </div>

          {/* Office Map Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Find Us - Norrsken House Kigali
            </h3>
            
            {/* Google Maps Embed for Norrsken House Kigali */}
            <div className="bg-gray-100 rounded-xl overflow-hidden h-96 relative mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5201744334447!2d30.060163!3d-1.9440727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425d7f48189%3A0x39e5e7a4b99c3e9b!2sNorrsken%20House%20Kigali!5e0!3m2!1sen!2srw!4v1690000000000!5m2!1sen!2srw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Norrsken House Kigali Location"
              />
            </div>
            
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="font-bold text-primary-800 mb-2">Office Location</h4>
              <p className="text-sm text-gray-600 mb-2">
                Norrsken House Kigali<br/>
                KN 78 St<br/>
                Kigali, Rwanda
              </p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-primary-600">4.9</span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary-400 text-secondary-400" />
                  ))}
                </div>
              </div>
              <div className="text-xs text-primary-600 mb-2">Client Satisfaction Rating</div>
              <a 
                href="https://www.google.com/maps/dir//Norrsken+House+Kigali" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Demo Request Widget */}
          <div className="bg-primary-600 text-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" />
              TRANSFORM YOUR INVENTORY MANAGEMENT!
            </h3>
            <p className="text-primary-100 mb-4">
              Schedule a free demo and see how our inventory management system can streamline your business operations
            </p>
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-green-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-purple-300 border-2 border-white"></div>
              </div>
              <span className="text-sm">Join 500+ businesses using our platform</span>
            </div>
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-secondary-400 text-secondary-400" />
              ))}
              <span className="ml-2 text-sm">Rated 4.9/5 by our clients</span>
            </div>
            <button className="w-full bg-secondary-400 hover:bg-secondary-500 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 uppercase cursor-pointer shadow-lg hover:shadow-xl">
              Request Demo
              <Package className="w-4 h-4" />
            </button>
          </div>

          {/* Team Image */}
          <div className="rounded-2xl overflow-hidden shadow-lg h-80 relative">
            <img
              src={img1}
              alt="Inventory Management Team"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">
                Our expert team ready to help transform your inventory operations
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Package className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Inventory Solutions</h4>
            <p className="text-gray-600">Complete stock management & control systems</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <BarChart3 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Analytics & Reports</h4>
            <p className="text-gray-600">Real-time insights & business intelligence</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Building2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Multi-Store Support</h4>
            <p className="text-gray-600">Manage unlimited branches seamlessly</p>
          </div>
        </div>
      </div>
    </div>
  );
}