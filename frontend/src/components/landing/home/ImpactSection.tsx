import { useEffect, useRef, useState } from 'react';

const stats: { value: number; suffix: string; label: string; display?: string }[] = [
  { value: 500, suffix: '+', label: 'Products in Stock' },
  { value: 200, suffix: '+', label: 'Clients Served' },
  { value: 98, suffix: '%', label: 'Delivery Satisfaction' },
  { value: 10, suffix: '+', label: 'Years in Business' },
];

function useCounter(target: number, suffix: string, triggered: boolean, display?: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    if (display) { setCount(target); return; }

    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [triggered, target, display]);

  if (display) return display;
  return count + suffix;
}

const StatItem = ({ stat, triggered }: { stat: typeof stats[0]; triggered: boolean }) => {
  const display = useCounter(stat.value, stat.suffix, triggered, stat.display);

  return (
    <div
      style={{
        borderLeft: '2px solid var(--aby-accent)',
        paddingLeft: '2rem',
      }}
    >
      <div
        className="font-cormorant"
        style={{
          fontSize: 'clamp(2.5rem, 4vw, 4rem)',
          lineHeight: 1,
          marginBottom: '0.5rem',
          color: 'var(--aby-accent)',
        }}
      >
        {display}
      </div>
      <div
        className="font-worksans"
        style={{ fontSize: '0.9rem', opacity: 0.85, letterSpacing: '0.05em', color: 'white' }}
      >
        {stat.label}
      </div>
    </div>
  );
};

const ImpactSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        background: 'var(--aby-dark)',
        color: 'white',
        padding: '7rem 2rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '6rem',
          alignItems: 'center',
        }}
        className="impact-grid"
      >
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {stats.map((stat, i) => (
            <StatItem key={i} stat={stat} triggered={visible} />
          ))}
        </div>

        {/* Text */}
        <div>
          <h2
            className="font-cormorant"
            style={{
              fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
              fontWeight: 300,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              color: 'white',
            }}
          >
            Quality You Can
            <br />
            Trust &amp; Rely On
          </h2>

          <p
            className="font-worksans"
            style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              opacity: 0.85,
              marginBottom: '2rem',
              color: 'white',
            }}
          >
            Whether you're stocking an office, running a school supply store, or looking
            for premium stationery gifts — Papeterie Messanger Supplier Ltd. has you covered.
            We source quality products, offer competitive bulk pricing, and deliver reliably
            across Rwanda and the region.
          </p>

          <button
            className="font-worksans"
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '0.9rem 1.8rem',
              fontSize: '0.9rem',
              fontWeight: 400,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = 'white';
              btn.style.color = 'var(--aby-dark)';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = 'transparent';
              btn.style.color = 'white';
            }}
          >
            Contact Us
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .impact-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ImpactSection;
