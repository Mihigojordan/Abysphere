import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Star, ChevronLeft, ChevronRight, User } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function TestimonialSection() {
  const testimonials = [
  {
    id: 1,
    text: "After adopting these HR tools, our onboarding process became much smoother. New hires adapt 40% faster, and our engagement scores skyrocketed. It’s been a game-changer for our HR team.",
    rating: 5,
    author: "Aline Uwase",
    role: "Head of Human Resources",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop"
  },
  {
    id: 2,
    text: "The leadership insights strengthened team communication and trust. Our productivity grew by 28% within three months, and employees now feel more confident in their roles.",
    rating: 5,
    author: "Eric Ndayishimiye",
    role: "Operations Manager",
    image: "https://images.unsplash.com/photo-1603415526960-f7e0328d2b5b?w=200&h=200&fit=crop"
  },
  {
    id: 3,
    text: "Our learning culture improved dramatically. With the new training roadmap, 90% of staff completed skill goals ahead of schedule. Employee innovation and confidence are at an all-time high.",
    rating: 5,
    author: "Sandrine Mukamana",
    role: "Learning & Development Lead",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop"
  },
  {
    id: 4,
    text: "Recruitment has become faster and smarter since we implemented data-driven approaches. We cut our hiring cycle in half and attracted top candidates who fit our culture perfectly.",
    rating: 5,
    author: "Jean Claude Habimana",
    role: "Talent Acquisition Manager",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop"
  },
  {
    id: 5,
    text: "Our remote-first culture is thriving. The collaboration strategies helped our teams stay connected and motivated — even when working from different locations.",
    rating: 5,
    author: "Beata Iradukunda",
    role: "Employee Experience Specialist",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop"
  },
  {
    id: 6,
    text: "The automation solutions saved us countless hours. Reporting, payroll, and feedback tracking are now streamlined, letting our HR team focus on strategic initiatives.",
    rating: 5,
    author: "Patrick Habiyaremye",
    role: "HR Systems Analyst",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop"
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
                    {/* <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    /> */}
                    <User className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md text-gray-400 p-3 bg-gray-100" />
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