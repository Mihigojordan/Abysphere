import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  User,
  Phone,
  Mail,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/tran.png'

type NavLink = {
  name: string;
  path: string;
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleNavigate = (path?: string) => {
    setIsOpen(false);
    if (!path) return;
    navigate(path);
  };
  
  const links: NavLink[] = [
    { name: 'Home', path: "/" },
    { name: 'About', path: "/about" },
    { name: 'Services', path: "/solutions" },
    { name: 'Blogs', path: "/blogs" },
    { name: 'Jobs', path: "/jobs" },
    { name: 'Contact', path: "/contact" },
  ];

  // Handle navigation

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-900 text-white py-2 px-4 text-sm hidden lg:block">
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <span>+250 123 456 789</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={14} />
              <span>info@abyhr.com</span>
            </div>
          </div>
          <div>Streamlining HR Operations Across Rwanda</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav 
        className={`bg-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-xl bg-white/95 backdrop-blur-sm' : 'shadow-lg'
        }`}
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavigate('/')}>
              <div className="flex items-center space-x-3">
                <img src={logo} className='h-28 w-28 ' alt="" />
               
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                {links.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigate(item.path)}
                    className="relative px-4 py-2 text-gray-700 hover:text-primary-600 font-medium text-sm transition-all duration-300 rounded-lg group"
                  >
                    <span className="relative z-10">{item.name}</span>
                    <div className="absolute inset-0 bg-primary-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                onClick={() => handleNavigate('/contact')}
              >
                Get in Touch
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-white border-t border-gray-100`}>
          <div className="px-4 py-6 space-y-3">
            {links.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigate(item.path)}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all duration-300 transform hover:translate-x-2"
              >
                {item.name}
              </button>
            ))}
            
            {/* Mobile Action Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <button
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg font-medium"
                onClick={() => handleNavigate('/contact')}
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
