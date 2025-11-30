import React from 'react';
import { ChevronRight, Home } from "lucide-react";

// Define interfaces and types
interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

type BackgroundStyle = 'gradient' | 'image' | 'solid' | 'pattern';
type HeightOption = '20vh' | '30vh' | '40vh' | '50vh' | '60vh';
type TitleSize = 'small' | 'medium' | 'large' | 'xl';
type TextAlign = 'left' | 'center' | 'right';

interface HeaderBannerProps {
  title: string;
  subtitle?: string;
  backgroundStyle?: BackgroundStyle;
  backgroundImage?: string;
  icon?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  overlayOpacity?: number;
  height?: HeightOption;
  titleSize?: TitleSize;
  showParticles?: boolean;
  textAlign?: TextAlign;
}

const HeaderBanner = ({
  title,
  subtitle,
  backgroundStyle = 'image',
  backgroundImage = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&fit=crop',
  icon = null,
  breadcrumb = [],
  overlayOpacity = 0.7,
  height = '30vh',
  titleSize = 'large',
  showParticles = true,
  textAlign = 'center'
}) => {
  const getBackgroundClasses = () => {
    switch (backgroundStyle) {
      case 'image':
        return 'bg-cover bg-center bg-no-repeat';
      case 'solid':
        return 'bg-primary-900';
      case 'pattern':
        return 'bg-gradient-to-br from-primary-800 via-primary-900 to-gray-900';
      case 'gradient':
      default:
        return 'bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900';
    }
  };

  const getHeightClasses = () => {
    const heights = {
      '20vh': 'min-h-[20vh] py-12',
      '30vh': 'min-h-[35vh] py-16',
      '40vh': 'min-h-[40vh] py-20',
      '50vh': 'min-h-[50vh] py-24',
      '60vh': 'min-h-[60vh] py-28'
    };
    return heights[height] || heights['40vh'];
  };

  const getTitleSizeClasses = () => {
    const sizes = {
      'small': 'text-3xl md:text-4xl',
      'medium': 'text-4xl md:text-5xl',
      'large': 'text-5xl md:text-6xl',
      'xl': 'text-6xl md:text-7xl'
    };
    return sizes[titleSize] || sizes['large'];
  };

  const getTextAlignClasses = () => {
    const aligns = {
      'left': 'text-left items-start',
      'center': 'text-center items-center',
      'right': 'text-right items-end'
    };
    return aligns[textAlign] || aligns['center'];
  };

  return (
    <section 
      className={`relative overflow-hidden ${getHeightClasses()} ${getBackgroundClasses()}`}
      style={backgroundImage && backgroundStyle === 'image' ? { 
        backgroundImage: `linear-gradient(to right, rgba(0, 40, 60, ${overlayOpacity}), rgba(0, 60, 80, ${overlayOpacity - 0.1})), url(${backgroundImage})`,
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Decorative Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-300 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Abstract Lines */}
        <svg className="absolute bottom-0 left-0 w-full h-32 text-white opacity-5" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <path d="M0,0 C200,60 400,90 600,60 C800,30 1000,70 1200,50 L1200,120 L0,120 Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Animated Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary-400 opacity-40 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-24 w-3 h-3 bg-white opacity-30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-24 left-1/4 w-2 h-2 bg-primary-400 opacity-30 rounded-full animate-pulse" style={{animationDelay: '0.7s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white opacity-40 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 right-16 w-2 h-2 bg-primary-400 opacity-35 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
          <div className="absolute top-1/2 left-16 w-1 h-1 bg-white opacity-25 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-900/40"></div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col justify-center">
        
        {/* Breadcrumb Navigation */}
        {breadcrumb.length > 0 && (
          <nav className={`mb-8 ${textAlign === 'center' ? 'flex justify-center' : ''}`}>
            <ol className="flex items-center space-x-2 text-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <Home className="w-4 h-4 text-primary-400" />
              {breadcrumb.map((item, index) => (
                <li key={index} className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-2 text-white/50" />
                  {item.active ? (
                    <span className="text-primary-400 font-semibold">{item.label}</span>
                  ) : (
                    <a 
                      href={item.href || '#'}
                      className="text-white/90 hover:text-primary-400 transition-colors duration-200 font-medium"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={`text-white flex flex-col ${getTextAlignClasses()}`}>
          {/* Icon */}
          {icon && (
            <div className="mb-6">
              <div className="inline-flex bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl w-20 h-20 items-center justify-center shadow-2xl border-4 border-white/20 transform hover:scale-110 transition-transform duration-300">
                <div className="text-primary-900">
                  {icon}
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className={`${getTitleSizeClasses()} font-bold mb-6 leading-tight tracking-tight`}>
            <span className="relative inline-block">
              {title}
              {/* Underline decoration */}
              <span className="absolute -bottom-2 left-0 w-24 h-1.5 bg-primary-400 rounded-full"></span>
            </span>
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <div className="text-white/90 text-lg md:text-xl font-medium max-w-2xl">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                {subtitle.split('/').map((part, index, arr) => (
                  <React.Fragment key={index}>
                    <span className={index === arr.length - 1 ? 'text-primary-400' : ''}>
                      {part.trim()}
                    </span>
                    {index < arr.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-white/50" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Decorative Bottom Border */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent ${textAlign === 'center' ? '' : 'hidden'}`}></div>
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
    </section>
  );
};

export default HeaderBanner;