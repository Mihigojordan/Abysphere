import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onExplore?: () => void;
}

const HeroSection = ({ onExplore }: HeroSectionProps) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        background: 'var(--aby-bg)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(30,58,138,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '6rem 2rem 4rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
          width: '100%',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
        className="hero-grid"
      >
        {/* Text Content */}
        <div>
          <div
            className="font-worksans"
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--aby-accent)',
              fontWeight: 600,
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span style={{ display: 'inline-block', width: '32px', height: '1px', background: 'var(--aby-accent)' }} />
            Premium Stationery &amp; Office Supplies
          </div>

          <h1
            className="font-cormorant"
            style={{
              fontSize: 'clamp(2.8rem, 5vw, 5rem)',
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--aby-dark)',
              marginBottom: '1.75rem',
            }}
          >
            Your Trusted
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--aby-accent)' }}>Stationery</em>
            <br />
            Partner
          </h1>

          <p
            className="font-worksans"
            style={{
              fontSize: '1.05rem',
              color: 'var(--aby-muted)',
              lineHeight: 1.85,
              marginBottom: '2.5rem',
              maxWidth: '460px',
            }}
          >
            From premium notebooks and writing instruments to office essentials
            and custom packaging — Papeterie Messanger Supplier Ltd. delivers
            quality stationery solutions for businesses and individuals across Rwanda.
          </p>

          {/* Trust badges */}
          <div
            className="font-worksans"
            style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            {['Fast Delivery', 'Bulk Orders Welcome', 'Quality Guaranteed'].map((badge) => (
              <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--aby-accent)', fontSize: '1rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--aby-muted)', fontWeight: 500 }}>{badge}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onExplore}
              className="font-worksans"
              style={{
                background: 'var(--aby-dark)',
                color: 'white',
                border: 'none',
                padding: '1rem 2.2rem',
                fontSize: '0.88rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'var(--aby-accent)';
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 8px 24px rgba(30,58,138,0.2)';
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'var(--aby-dark)';
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
              }}
            >
              Shop Now
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="font-worksans"
              style={{
                background: 'transparent',
                color: 'var(--aby-dark)',
                border: '1px solid var(--aby-border)',
                padding: '1rem 2.2rem',
                fontSize: '0.88rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = 'var(--aby-accent)';
                btn.style.color = 'var(--aby-accent)';
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = 'var(--aby-border)';
                btn.style.color = 'var(--aby-dark)';
              }}
            >
              Request a Quote
            </button>
          </div>
        </div>

        {/* Visual */}
        <div style={{ position: 'relative' }}>
          {/* Main image */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4/5',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--aby-border)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=900&h=1125&fit=crop&q=80"
              alt="Premium stationery and office supplies by Papeterie Messanger"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.7s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(30,58,138,0.18) 0%, transparent 55%)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Floating stat card */}
          <div
            style={{
              position: 'absolute',
              bottom: '-24px',
              left: '-24px',
              background: 'white',
              border: '1px solid var(--aby-border)',
              boxShadow: '0 12px 40px rgba(30,58,138,0.12)',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
            }}
          >
            <span className="font-cormorant" style={{ fontSize: '2.2rem', fontWeight: 400, lineHeight: 1, color: 'var(--aby-accent)' }}>500+</span>
            <span className="font-worksans" style={{ fontSize: '0.78rem', color: 'var(--aby-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Products in Stock</span>
          </div>

          {/* Floating badge */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              right: '-16px',
              background: 'var(--aby-accent)',
              color: 'white',
              padding: '0.85rem 1.25rem',
              boxShadow: '0 8px 24px rgba(30,58,138,0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.1rem',
            }}
          >
            <span className="font-cormorant" style={{ fontSize: '1.4rem', lineHeight: 1 }}>Since</span>
            <span className="font-worksans" style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}>2015</span>
          </div>

          {/* Dot grid decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '90px',
              height: '90px',
              backgroundImage: 'radial-gradient(circle, var(--aby-accent) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              opacity: 0.25,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            padding: 5rem 1.5rem 3rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
