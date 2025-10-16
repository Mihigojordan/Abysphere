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
  PhoneCall
} from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';
import img1 from "../../assets/contact.jpg"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('HR Form submitted:', formData);
    // Add form submission logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
    
      <HeaderBanner
        title="Contact Us"
        subtitle="Home / Contact Us"
        backgroundStyle="image"
        icon={<PhoneCall className="w-10 h-10" />}
      />

      <div className="text-center mb-6 pt-5">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-teal-600 to-gray-800 bg-clip-text text-transparent mb-6">
          HR Consulting & Talent Solutions
        </h1>
        <p className="text-md md:text-lg text-gray-600 mx-auto leading-relaxed mb-6 max-w-3xl">
          Partner with Rwanda's leading HR consultancy in Kigali! Connect with our expert team for strategic HR solutions, executive search, talent management, and organizational development at Abysphere.
        </p>
        
        {/* Quick HR contact badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Users size={16} className="mr-2" />
            <span className="font-medium">HR Consulting</span>
          </div>
          <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Phone size={16} className="mr-2" />
            <span className="font-medium">+250 788 123 456</span>
          </div>
          <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Mail size={16} className="mr-2" />
            <span className="font-medium">info@abysphere.com</span>
          </div>
          <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Clock size={16} className="mr-2" />
            <span className="font-medium">Mon-Fri 8AM-6PM</span>
          </div>
          <div className="flex items-center bg-teal-50 text-teal-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <Briefcase size={16} className="mr-2" />
            <span className="font-medium">Kigali Office</span>
          </div>
        </div>
      </div>

      {/* Header Info Cards */}
      <div className="w-full mx-auto px-4 lg:px-16 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* HR Office Located */}
          <div className="bg-teal-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-8 h-8" />
              <h3 className="text-xl font-bold">Consulting Headquarters</h3>
            </div>
            <p className="text-teal-100">
              Kigali Innovation City<br/>
              Nyarugenge District, Kigali, Rwanda
            </p>
          </div>

          {/* HR Support */}
          <div className="bg-blue-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Headphones className="w-8 h-8 text-teal-600" />
              <h3 className="text-xl font-bold text-gray-800">Consulting Support</h3>
            </div>
            <p className="text-gray-600">
              +250 788 123 456<br/>
              info@abysphere.com
            </p>
          </div>

          {/* Working Hours */}
          <div className="bg-white border-2 border-teal-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-8 h-8 text-teal-600" />
              <h3 className="text-xl font-bold text-gray-800">Consulting Hours</h3>
            </div>
            <p className="text-gray-600">
              Mon - Fri: 8AM - 6PM<br/>
              Sat: 9AM - 2PM
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* HR Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-teal-600" />
              <h2 className="text-3xl font-bold text-gray-800">HR Consulting Inquiry</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Connect with our expert consultants for strategic HR solutions, executive search, or organizational development
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Headphones className="w-4 h-4" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                    placeholder="+250 788 XXX XXX"
                  />
                </div>
              </div>

              <div className="gap-4 mb-4">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors"
                  placeholder="HR consulting needs, executive search, etc."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none transition-colors resize-none"
                  placeholder="Describe your HR consulting needs or organizational challenge..."
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                Submit Inquiry
              </button>
            </div>
          </div>

          {/* HR Office Map Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Abysphere HQ - Kigali Innovation City
            </h3>
            
            {/* Google Maps Embed for Kigali Innovation City */}
            <div className="bg-gray-100 rounded-xl overflow-hidden h-96 relative mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.074614!2d30.1275!3d-1.9494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca3f4b7d5e6f7%3A0x1234567890abcdef!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1690000000000!5m2!1sen!2srw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Abysphere HR Consulting - Kigali Location"
              />
            </div>
            
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="font-bold text-teal-800 mb-2">HR Consulting Headquarters</h4>
              <p className="text-sm text-gray-600 mb-2">
                Kigali Innovation City<br/>
                Nyarugenge District<br/>
                Kigali, Rwanda
              </p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-teal-600">4.9</span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary-400 text-secondary-400" />
                  ))}
                </div>
              </div>
              <div className="text-xs text-teal-600 mb-2">Client Satisfaction Rating</div>
              <a href="#map" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom HR CTA Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* HR Chat Widget */}
          <div className="bg-teal-600 text-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              TRANSFORM YOUR ORGANIZATION!
            </h3>
            <p className="text-teal-100 mb-4">
              Partner with Rwanda's premier HR consultancy for strategic talent solutions and organizational excellence
            </p>
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-green-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-purple-300 border-2 border-white"></div>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-secondary-400 text-secondary-400" />
              ))}
            </div>
            <button className="w-full bg-secondary-400 hover:bg-secondary-500 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 uppercase cursor-pointer shadow-lg hover:shadow-xl">
              Book Consultation
              <Briefcase className="w-4 h-4" />
            </button>
          </div>

          {/* HR Team Image */}
          <div className="rounded-2xl overflow-hidden shadow-lg h-80 relative">
            <img
              src={img1}
              alt="Abysphere HR Consulting Team Kigali"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">
                Our expert consultants driving HR excellence across Rwanda
              </p>
            </div>
          </div>
        </div>

        {/* HR Services Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Users className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Talent Strategy</h4>
            <p className="text-gray-600">Workforce planning & executive search solutions</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <FileText className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Consulting Services</h4>
            <p className="text-gray-600">Organizational design & process optimization</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Briefcase className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Leadership Solutions</h4>
            <p className="text-gray-600">Development programs & retention strategies</p>
          </div>
        </div>
      </div>
    </div>
  );
}