import { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    rating: 5,
    text: '"The quality of notebooks and pens from Papeterie Messanger is unmatched. Our office has been ordering from them for 3 years and the consistency is remarkable."',
    author: 'Emmanuel N.',
    location: 'Kigali, Rwanda',
  },
  {
    rating: 5,
    text: '"Best supplier for bulk stationery orders in the region. Fast delivery, excellent packaging, and the prices are very competitive. Highly recommended for businesses."',
    author: 'Amina K.',
    location: 'Kampala, Uganda',
  },
  {
    rating: 5,
    text: '"We ordered custom branded notebooks for our company event and they exceeded all expectations. Professional quality and on-time delivery. Will definitely order again."',
    author: 'Patrick M.',
    location: 'Nairobi, Kenya',
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="stories"
      ref={sectionRef}
      style={{
        padding: '6rem 2rem',
        background: 'var(--aby-surface)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h2
            className="font-cormorant"
            style={{
              fontSize: 'clamp(2rem, 3vw, 2.8rem)',
              fontWeight: 300,
              color: 'var(--aby-dark)',
              letterSpacing: '-0.01em',
            }}
          >
            What Our Customers Say
          </h2>
        </div>

        {/* Cards */}
        <div
          className="testimonials-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} delay={i * 0.1} visible={visible} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

const TestimonialCard = ({
  testimonial,
  delay,
  visible,
}: {
  testimonial: typeof testimonials[0];
  delay: number;
  visible: boolean;
}) => (
  <div
    style={{
      background: 'var(--aby-surface)',
      border: '1px solid var(--aby-border)',
      padding: '2.5rem',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
    }}
  >
    {/* Stars */}
    <div
      style={{
        color: 'var(--aby-accent)',
        fontSize: '1.1rem',
        letterSpacing: '0.2em',
        marginBottom: '1.5rem',
      }}
    >
      {'★'.repeat(testimonial.rating)}
    </div>

    {/* Quote */}
    <p
      className="font-worksans"
      style={{
        fontSize: '0.97rem',
        lineHeight: 1.75,
        color: 'var(--aby-muted)',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
      }}
    >
      {testimonial.text}
    </p>

    {/* Author */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <strong
        className="font-worksans"
        style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--aby-dark)' }}
      >
        {testimonial.author}
      </strong>
      <span
        className="font-worksans"
        style={{ fontSize: '0.82rem', color: 'var(--aby-muted)' }}
      >
        {testimonial.location}
      </span>
    </div>
  </div>
);

export default Testimonials;
