import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--aby-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(30,58,138,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(180,140,90,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Eyebrow */}
      <p
        className="font-worksans"
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--aby-accent)',
          marginBottom: '1.5rem',
        }}
      >
        Page Not Found
      </p>

      {/* Giant "404" */}
      <h1
        className="font-cormorant"
        style={{
          fontSize: 'clamp(6rem, 20vw, 14rem)',
          fontWeight: 300,
          lineHeight: 0.9,
          color: 'var(--aby-dark)',
          margin: '0 0 1.5rem',
          letterSpacing: '-0.02em',
          position: 'relative',
        }}
      >
        404
        {/* Subtle accent underline */}
        <span
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '2px',
            background: 'var(--aby-accent)',
          }}
        />
      </h1>

      {/* Sub-heading */}
      <h2
        className="font-cormorant"
        style={{
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 400,
          color: 'var(--aby-dark)',
          margin: '2rem 0 1rem',
          letterSpacing: '0.01em',
        }}
      >
        Oops — this page doesn't exist
      </h2>

      <p
        className="font-worksans"
        style={{
          fontSize: '0.95rem',
          color: 'var(--aby-muted)',
          maxWidth: '440px',
          lineHeight: 1.75,
          marginBottom: '3rem',
        }}
      >
        The page you're looking for may have been moved, deleted, or never existed.
        Let's get you back to something good.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/')}
          className="font-worksans"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'var(--aby-dark)',
            color: 'white',
            border: 'none',
            padding: '0.85rem 2rem',
            fontSize: '0.88rem',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'background 0.3s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-accent)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-dark)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          <Home size={16} />
          Back to Home
        </button>

        <button
          onClick={() => navigate('/shop')}
          className="font-worksans"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'transparent',
            color: 'var(--aby-dark)',
            border: '1px solid var(--aby-border)',
            padding: '0.85rem 2rem',
            fontSize: '0.88rem',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease, color 0.3s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-accent)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          <ShoppingBag size={16} />
          Browse Shop
        </button>

        <button
          onClick={() => navigate(-1)}
          className="font-worksans"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--aby-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            padding: '0.85rem 0.5rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-muted)')}
        >
          <ArrowLeft size={14} />
          Go back
        </button>
      </div>

      {/* Decorative ornament */}
      <div
        style={{
          marginTop: '4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--aby-border)',
        }}
      >
        <div style={{ width: '60px', height: '1px', background: 'var(--aby-border)' }} />
        <span className="font-cormorant" style={{ fontSize: '1.3rem', color: 'var(--aby-border)' }}>✦</span>
        <div style={{ width: '60px', height: '1px', background: 'var(--aby-border)' }} />
      </div>
    </div>
  );
};

export default NotFoundPage;
