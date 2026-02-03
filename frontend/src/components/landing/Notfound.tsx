import { 
  Home, 
  ArrowLeft, 
  Search, 
  Phone, 
  Mail,
  AlertTriangle,
  Wrench,
  ShoppingCart,
  HelpCircle
} from "lucide-react";

export default function NotFoundPage() {
  const quickLinks = [
    {
      icon: <Home className="w-6 h-6" />,
      title: "Homepage",
      description: "Return to our main page",
      link: "/"
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Products",
      description: "Browse our latest technology",
      link: "/products"
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "Services",
      description: "Explore our repair services",
      link: "/services"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Contact Us",
      description: "Get in touch with our team",
      link: "/contact"
    }
  ];

  const helpfulTips = [
    "Check the URL for any typos or spelling errors",
    "Use the search function to find what you're looking for",
    "Browse our main navigation menu",
    "Contact our support team for assistance"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Main Error Display */}
        <div className="mb-12">
          {/* Large 404 Number */}
          <div className="relative mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="w-24 h-24 text-primary-600 animate-pulse" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              The page you're looking for seems to have wandered off into the digital void. 
              Don't worry, even the best technology sometimes takes unexpected detours!
            </p>
            <p className="text-gray-500">
              Error Code: 404 | Page could not be located
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2 text-lg shadow-lg hover:shadow-xl">
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            <button className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors flex items-center space-x-2">
              <Home className="w-5 h-5" />
              <span>Home Page</span>
            </button>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Where would you like to go?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <div className="text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {link.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{link.title}</h4>
                <p className="text-gray-600 text-sm">{link.description}</p>
              </div>
            ))}
          </div>
        </div>


        {/* Helpful Tips */}
        <div className="bg-primary-50 rounded-2xl p-8 mb-16">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="w-8 h-8 text-primary-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Helpful Tips</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {helpfulTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you find exactly what you need. 
            Don't hesitate to reach out!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Call Support</span>
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-700 transition-colors flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Email Us</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Kalinga Technology. All rights reserved. | 
            <span className="text-primary-600 hover:underline cursor-pointer"> Report this issue</span>
          </p>
        </div>

      </div>
    </div>
  );
}