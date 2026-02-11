import { useState, useEffect } from 'react';
import {
  Menu,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    if (!path) return;

    // Check if it's a hash link (section on home page)
    if (path.startsWith('#')) {
      // If not on home page, navigate to home first
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          const element = document.querySelector(path);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // Already on home page, just scroll
        const element = document.querySelector(path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      // Regular navigation for other pages
      navigate(path);
    }
  };

  const links = [
    { name: 'Home', path: "#home" },
    { name: 'About', path: "#about" },
    { name: 'Features', path: "#features" },
    { name: 'Pricing', path: "#pricing" },
    { name: 'Blogs', path: "/blogs" },
    { name: 'Contact', path: "#contact" },
  ];

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
      {/* Top bar removed - contact info now in footer */}

      {/* Main Navigation */}
      <nav
        className={`bg-white sticky top-0 z-50 overflow-hidden transition-all duration-300 ${scrolled ? 'shadow-xl bg-white/98 backdrop-blur-sm' : 'shadow-md'
          }`}
      >
        <div className="w-full mx-auto px-1 sm:px-10 lg:px-4">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavigate('#home')}>
              <img src="/logo.jpg" className='w-20 h-20  object-contain ' alt="ZubaSystem Logo" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                {links.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigate(item.path)}
                    className="relative px-4 py-2 text-gray-700 hover:text-primary-600 font-bold text-lg transition-all duration-300 rounded-lg group"
                  >
                    <span className="relative z-10">{item.name}</span>
                    <div className="absolute inset-0 bg-primary-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary-600 group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                onClick={() => handleNavigate('/demo-request')}
              >
                Request Demo
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
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
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden bg-white border-t border-gray-100`}>
          <div className="px-4 py-6 space-y-3">
            {links.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigate(item.path)}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-bold text-lg transition-all duration-300 transform hover:translate-x-2"
              >
                {item.name}
              </button>
            ))}

            {/* Mobile Action Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg font-semibold"
                onClick={() => handleNavigate('/demo-request')}
              >
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;