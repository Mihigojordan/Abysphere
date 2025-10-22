import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Users, Handshake, TrendingUp } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const HRServicesSection = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const services = [
    {
      icon: Users,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2088",
      tag: "Find Top Talent",
      title: "Smart Talent Sourcing: Find the Right Fit",
      description: "Leverage data-driven recruitment strategies to identify and attract top-tier candidates who align with your company culture and drive organizational success.",
    },
    {
      icon: Handshake,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2087",
      tag: "Hiring Made Easy",
      title: "Executive Search & Leadership Hiring",
      description: "Strategic executive recruitment services that connect you with visionary leaders who can transform your organization and navigate complex business challenges.",
    },
    {
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069",
      tag: "Leadership Growth",
      title: "Leadership Development & Coaching",
      description: "Cultivate exceptional leaders through personalized coaching programs that enhance decision-making, emotional intelligence, and strategic thinking capabilities.",
    },
    {
      icon: Users,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070",
      tag: "Employee Engagement",
      title: "Performance Management Systems",
      description: "Implement comprehensive performance frameworks that align individual goals with business objectives, driving productivity and employee satisfaction.",
    },
    {
      icon: Handshake,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070",
      tag: "Compensation Strategy",
      title: "Compensation & Benefits Planning",
      description: "Design competitive compensation packages that attract and retain top talent while maintaining fiscal responsibility and market competitiveness.",
    },
    {
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070",
      tag: "Learning Programs",
      title: "Training & Development Solutions",
      description: "Create impactful learning experiences that upskill your workforce, enhance capabilities, and prepare your team for future challenges.",
    },
    {
      icon: Users,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2070",
      tag: "HR Analytics",
      title: "Workforce Analytics & Planning",
      description: "Utilize advanced analytics to make data-driven decisions about workforce planning, talent management, and organizational effectiveness.",
    },
    {
      icon: Handshake,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070",
      tag: "Culture Building",
      title: "Organizational Culture Development",
      description: "Build a thriving workplace culture that drives engagement, retention, and business performance through strategic culture initiatives.",
    },
    {
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070",
      tag: "Change Management",
      title: "Change Management Consulting",
      description: "Navigate organizational transformation smoothly with expert change management strategies that ensure successful adoption and minimal disruption.",
    },
  ];

  return (
    <div className="bg-slate-50 py-10 px-8 md:px-16">
      <div className=" mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
            </div>
            <span className="text-sm tracking-widest uppercase font-semibold">Our Services</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Human Resources Services
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transforming workplaces through innovative HR solutions
          </p>
        </div>

        {/* Services Swiper */}
        <div className="mb-12">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            slidesPerGroup={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            onSlideChange={() => {
              // Keep the middle dot always active
              setActiveIndex(1);
            }}
            onInit={() => {
              setActiveIndex(1);
            }}
            onSwiper={(swiper) => setSwiperInstance(swiper)}
            breakpoints={{
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
              },
            }}
          >
            {services.map((service, index) => (
              <SwiperSlide key={index}>
                <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Image Container with Icon Badge */}
                  <div className="relative p-6 h-80 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 rounded-lg transition-transform duration-500"
                    />
                    {/* Icon Badge */}
                    <div className="absolute z-10 bottom-2 right-0 w-20 h-20 p-1.5 bg-white rounded-full flex justify-center shadow-xl">
                      <div className="w-full h-full bg-primary-700 flex items-center justify-center rounded-full group-hover:bg-primary-600 transition-colors">
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Tag */}
                    <div className="text-primary-600 text-sm font-semibold mb-3">
                      {service.tag}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-primary-700 transition-colors">
                      {service.title}
                    </h3>

                    {/* Divider */}
                    <div className="w-16 h-0.5 bg-slate-300 mb-4 group-hover:bg-primary-600 group-hover:w-24 transition-all duration-300"></div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Custom Pagination Dots - Middle dot always active */}
        <div className="flex justify-center items-center gap-3">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => {
                if (swiperInstance) {
                  if (index === 0) {
                    swiperInstance.slidePrev();
                  } else if (index === 2) {
                    swiperInstance.slideNext();
                  }
                }
              }}
              className={`rounded-full transition-all duration-300 ${
                activeIndex === index ? 'bg-primary-600 w-8 h-3' : 'bg-slate-300 w-3 h-3'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRServicesSection;