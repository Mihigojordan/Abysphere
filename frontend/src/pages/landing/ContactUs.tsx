import { useState, type ChangeEvent, type FormEvent, type JSX } from "react";
import { 
  Phone, Mail, MapPin, Clock, Send, MessageCircle, Fish, HelpCircle, User, ArrowRight
} from "lucide-react";
import HeaderBanner from "../../components/landing/HeaderBanner";

// --- Types ---
interface FormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  inquiryType: string;
  farmerId: string;
  message: string;
}

interface ContactMethod {
  icon: JSX.Element;
  title: string;
  description: string;
  info: string[];
  action: string;
  availability: string;
}

interface OfficeLocation {
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  services: string[];
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    inquiryType: '',
    farmerId: '',
    message: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    setFormSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        inquiryType: '',
        farmerId: '',
        message: ''
      });
    }, 3000);
  };

  const contactMethods: ContactMethod[] = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Aquaculture Support Line",
      description: "Speak directly with our aquaculture specialists",
      info: ["+250 788 123 456", "+250 788 654 321"],
      action: "Call Support",
      availability: "Mon-Fri: 8 AM - 6 PM"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Support",
      description: "Send us your aquaculture queries anytime",
      info: ["info@finefish.rw", "support@finefish.rw"],
      action: "Send Email",
      availability: "Response within 24 hours"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "WhatsApp Support",
      description: "Get instant help via WhatsApp",
      info: ["WhatsApp: +250 788 123 456"],
      action: "Start Chat",
      availability: "8 AM - 5 PM"
    }
  ];

  const officeLocations: OfficeLocation[] = [
    {
      name: "Rwamagana Hatchery & Feed Plant",
      address: "Industrial Area, Rwamagana District",
      city: "Eastern Province, Rwanda",
      phone: "+250 788 123 456",
      hours: "Mon - Fri: 8:00 AM - 5:00 PM",
      services: ["Fingerling Production", "Fish Feed Supply", "Aquaculture Training"]
    },
    {
      name: "Lake Kivu Operations",
      address: "Lake Shores, Rubavu District",
      city: "Northern Province, Rwanda",
      phone: "+250 788 654 321",
      hours: "Mon - Fri: 8:00 AM - 6:00 PM",
      services: ["Cage Fish Farming", "Technical Consulting", "Partnership Inquiries"]
    }
  ];

  const inquiryTypes = [
    "Fingerling Order",
    "Fish Feed Inquiry",
    "Aquaculture Training",
    "Partnership Request",
    "Technical Support",
    "Market Access",
    "Sustainability Consulting",
    "General Inquiry",
    "Complaint",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary-300 rounded-full opacity-15"></div>
      </div>
      
      <HeaderBanner
        title="Contact Us"
        subtitle="Home / Contact Us"
        backgroundStyle="image"
        icon={<Fish className="w-10 h-10" />}
      />

      <div className="w-12/12 mx-auto px-4 sm:px-6 lg:px-8 relative py-5">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-primary-500 to-gray-800 bg-clip-text text-transparent mb-6">
            Connect with Fine Fish Ltd
          </h1>
          <p className="text-md md:text-lg text-gray-600 mx-auto leading-relaxed mb-6">
            Have questions about tilapia farming, fingerling supply, or partnerships? Our team is here to support farmers, cooperatives, and stakeholders with expert aquaculture solutions in Rwamagana, Rubavu, and beyond.
          </p>
          
          {/* Quick contact badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center bg-primary-50 text-primary-700 px-4  rounded-full shadow-sm hover:shadow-md transition-all duration-300">
              <Phone size={16} className="mr-2" />
              <span className="font-medium">+250 788 123 456</span>
            </div>
            <div className="flex items-center bg-primary-50 text-primary-700 px-4  rounded-full shadow-sm hover:shadow-md transition-all duration-300">
              <Mail size={16} className="mr-2" />
              <span className="font-medium">info@finefish.rw</span>
            </div>
            <div className="flex items-center bg-primary-50 text-primary-700 px-4  rounded-full shadow-sm hover:shadow-md transition-all duration-300">
              <Clock size={16} className="mr-2" />
              <span className="font-medium">Mon-Fri 8AM-6PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <section className="py-4">
        <div className="w-12/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Preferred Way</h3>
            <p className="text-xl text-gray-600  mx-auto">
              Multiple ways to reach our aquaculture team - pick what works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="group bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary-100 hover:border-primary-300 hover:-translate-y-2">
                <div className="text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {method.icon}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{method.title}</h4>
                <p className="text-gray-600 mb-6">{method.description}</p>
                <div className="space-y-2 mb-6">
                  {method.info.map((info, idx) => (
                    <p key={idx} className="text-gray-700 font-medium">{info}</p>
                  ))}
                </div>
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                    <Clock className="w-4 h-4 mr-2" />
                    {method.availability}
                  </span>
                </div>
                <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 group-hover:bg-primary-700">
                  <span>{method.action}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Offices Section */}
      <section className="py-10">
        <div className="w-12/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h3>
              <p className="text-gray-600 mb-8">Fill out the form and we'll get back to you within 24 hours</p>

              {formSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                  <p className="text-gray-600">Thank you for contacting Fine Fish Ltd. We'll respond soon.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="your@email.rw"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="+250 788 123 456"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        <Fish className="w-4 h-4 inline mr-2" />
                        Organization/Cooperative
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Your organization or cooperative"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                      placeholder="Tell us about your aquaculture inquiry or concern..."
                    ></textarea>
                  </div>

                  <div
                    onClick={handleSubmit}
                    className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 text-lg shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </div>
                </div>
              )}
            </div>

            {/* Office Locations */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-8">Visit Our Facilities</h3>
                {officeLocations.map((office, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
                    <h4 className="text-xl font-bold text-primary-700 mb-3">{office.name}</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-primary-500 mt-1" />
                        <div>
                          <p className="text-gray-700 font-medium">{office.address}</p>
                          <p className="text-gray-600">{office.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-primary-500" />
                        <p className="text-gray-700">{office.phone}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <p className="text-gray-700">{office.hours}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Services Available:</p>
                      <div className="flex flex-wrap gap-2">
                        {office.services.map((service, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}