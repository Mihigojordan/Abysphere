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
      text: "Since switching to Mysystem, we've eliminated stockouts completely. The real-time alerts saved us from losing customers during peak season. Our inventory accuracy went from 85% to 99.5% in just two months!",
      rating: 5,
      author: "Marie Uwimana",
      role: "Retail Store Owner, Kigali",
      image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop"
    },
    {
      id: 2,
      text: "Managing food inventory across three restaurant locations used to be a nightmare. Now I can see everything in real-time and reduce food waste by 40%. The expiry tracking alone pays for the system!",
      rating: 5,
      author: "Jean Paul Nkusi",
      role: "Restaurant Manager",
      image: "https://images.unsplash.com/photo-1603415526960-f7e0328d2b5b?w=200&h=200&fit=crop"
    },
    {
      id: 3,
      text: "Batch tracking and expiry alerts are game-changers for our pharmacy. We've had zero expired medicine incidents since implementation. The compliance reports make audits so much easier!",
      rating: 5,
      author: "Dr. Grace Mukamana",
      role: "Pharmacy Owner",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop"
    },
    {
      id: 4,
      text: "The multi-branch feature transformed our operations. I can transfer stock between warehouses with a few clicks and track everything from my phone. Inventory management has never been this easy!",
      rating: 5,
      author: "Patrick Habimana",
      role: "Warehouse Manager",
      image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop"
    },
    {
      id: 5,
      text: "As a boutique owner, tracking sizes and colors was always chaotic. Mysystem's variant management is perfect! I know exactly what's selling and what to reorder. Sales are up 28% this quarter.",
      rating: 5,
      author: "Claudine Iradukunda",
      role: "Boutique Owner",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop"
    },
    {
      id: 6,
      text: "Medical supplies management is critical for patient care. The automated low-stock alerts ensure we never run out of essential items. The reporting helps us optimize our budget significantly.",
      rating: 5,
      author: "Dr. Eric Ndayishimiye",
      role: "Clinic Administrator",
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
            What Our Clients Say
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