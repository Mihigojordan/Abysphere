import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      text: "Our HR team transformed completely after implementing these strategies. Employee engagement scores increased by 45% in just six months. The data-driven approach made all the difference in our recruitment process.",
      rating: 5,
      author: "Sarah Mitchell",
      role: "HR Director",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
    },
    {
      id: 2,
      text: "The performance management framework helped us align our team goals with business objectives seamlessly. We've seen a 30% improvement in employee productivity and satisfaction. Highly recommend these insights!",
      rating: 5,
      author: "Michael Chen",
      role: "Chief People Officer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
    },
    {
      id: 3,
      text: "Implementing the learning and development programs outlined here revolutionized our upskilling initiatives. Our retention rate improved by 35%, and employees feel more valued than ever before.",
      rating: 5,
      author: "Jennifer Rodriguez",
      role: "L&D Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
    },
    {
      id: 4,
      text: "The compensation and benefits strategies helped us become more competitive in the talent market. We reduced time-to-hire by 50% and significantly improved our offer acceptance rate. Game-changer for our recruitment!",
      rating: 5,
      author: "David Park",
      role: "Talent Acquisition Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
    },
    {
      id: 5,
      text: "The workplace culture insights transformed our remote work experience. Employee satisfaction scores reached an all-time high, and our team collaboration improved dramatically despite being distributed globally.",
      rating: 5,
      author: "Emily Watson",
      role: "Culture & Engagement Manager",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
    },
    {
      id: 6,
      text: "The HR technology recommendations streamlined our entire HR operations. We automated 60% of administrative tasks, allowing our team to focus on strategic initiatives that truly move the needle.",
      rating: 5,
      author: "Robert Johnson",
      role: "HRIS Manager",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"
    }
  ];

  return (
    <div className="bg-gray-50 py-10 px-8 md:px-16 relative overflow-hidden">
      {/* Large decorative quote marks in background */}
      <div className="absolute top-0 right-32 text-primary-600/10 text-[300px] font-serif leading-none pointer-events-none select-none">
        "
      </div>
      <div className="absolute top-0 right-0 text-primary-600/10 text-[300px] font-serif leading-none pointer-events-none select-none">
        "
      </div>
      
      <div className=" mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-primary-700 text-sm font-semibold mb-3">
            <span className="text-primary-600">✓</span>
            <span>TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Human Resources Services
          </h2>
        </div>

        {/* Swiper Slider */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
            }}
            className="pb-4"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="space-y-4 h-full">
                  {/* Rating Badge */}
                  <div className="inline-flex items-center gap-1 bg-secondary-300 rounded-full px-4 py-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-gray-800 fill-gray-800"
                      />
                    ))}
                  </div>
                  
                  {/* Testimonial Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[180px]">
                    <p className="text-gray-600 leading-relaxed">
                      {testimonial.text}
                    </p>
                  </div>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-4 pl-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-primary-700">
                        {testimonial.author}
                      </h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              className="swiper-button-prev-custom w-12 h-12 rounded-full bg-primary-700 hover:bg-primary-800 text-white flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              className="swiper-button-next-custom w-12 h-12 rounded-full bg-primary-700 hover:bg-primary-800 text-white flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.swiper-button-prev-custom:disabled),
        :global(.swiper-button-next-custom:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}