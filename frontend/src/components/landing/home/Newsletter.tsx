import { useEffect, useRef, useState } from 'react';

const Newsletter = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--aby-accent)',
        color: 'white',
        padding: '5rem 2rem',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2
          className="font-cormorant"
          style={{
            fontSize: 'clamp(2rem, 3vw, 2.8rem)',
            fontWeight: 300,
            marginBottom: '1rem',
            color: 'white',
          }}
        >
          Stay Connected
        </h2>

        <p
          className="font-worksans"
          style={{
            fontSize: '1rem',
            marginBottom: '2.5rem',
            opacity: 0.93,
            lineHeight: 1.6,
            color: 'white',
          }}
        >
          Get updates on new stock arrivals, bulk order discounts, and seasonal
          stationery promotions from Papeterie Messanger Supplier Ltd.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0.75rem',
            maxWidth: '480px',
            margin: '0 auto',
          }}
          className="newsletter-form"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="font-worksans"
            style={{
              flex: 1,
              padding: '0.95rem 1.4rem',
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: "'Work Sans', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            }}
          />

          <button
            type="submit"
            className="font-worksans"
            style={{
              background: subscribed ? 'var(--aby-dark)' : 'white',
              color: subscribed ? 'white' : 'var(--aby-accent)',
              border: 'none',
              padding: '0.95rem 1.8rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              if (!subscribed) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-dark)';
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!subscribed) {
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)';
              }
            }}
          >
            {subscribed ? 'Subscribed ✓' : 'Subscribe'}
          </button>
        </form>
      </div>

      <style>{`
        .newsletter-form { flex-wrap: nowrap; }
        @media (max-width: 480px) {
          .newsletter-form { flex-direction: column !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.65); }
      `}</style>
    </section>
  );
};

export default Newsletter;
