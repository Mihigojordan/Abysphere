import { useNavigate } from 'react-router-dom';
import pmsLogo from '../../assets/pms_logo.png';

// ─── Link definitions ──────────────────────────────────────────────────────────
type NavLink = { label: string; path: string; external?: boolean };

const shopLinks: NavLink[] = [
  { label: 'All Products', path: '/shop' },
  { label: 'New Arrivals', path: '/shop' },
  { label: 'Best Sellers', path: '/shop' },
  { label: 'Gift Sets', path: '/shop' },
];

const companyLinks: NavLink[] = [
  { label: 'About Us', path: '/#about' },
  { label: 'Contact', path: '/contact' },
];

const supportLinks: NavLink[] = [
  { label: 'FAQ', path: '/faq' },
];

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  const navigate = useNavigate();

  const handleLink = (link: NavLink) => {
    if (link.external) {
      window.open(link.path, '_blank', 'noopener,noreferrer');
      return;
    }
    if (link.path.startsWith('/#')) {
      // Hash anchor on home page
      const hash = link.path.slice(1); // e.g. '#about'
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(link.path);
    }
  };

  return (
    <footer style={{ background: 'var(--aby-dark)', color: 'white' }}>
      {/* Main footer content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '4rem 2rem 3rem',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: '3rem',
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <img
            src={pmsLogo}
            alt="PMS Logo"
            className='scale-125'
            style={{ height: '52px', width: 'auto', display: 'block', marginBottom: '1rem' }}
          />
          <p
            className="font-worksans"
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.75,
              opacity: 0.8,
              color: 'white',
              maxWidth: '260px',
            }}
          >
            Connecting you with authentic, curated stationery and office supplies.
            Quality craftsmanship, every piece.
          </p>
        </div>

        {/* Shop */}
        <FooterColumn title="Shop" links={shopLinks} onNavigate={handleLink} />

        {/* Company */}
        <FooterColumn title="Company" links={companyLinks} onNavigate={handleLink} />

        {/* Support */}
        <FooterColumn title="Support" links={supportLinks} onNavigate={handleLink} />
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        className="footer-bottom"
      >
        <p
          className="font-worksans"
          style={{ fontSize: '0.82rem', opacity: 0.6, color: 'white' }}
        >
          © {new Date().getFullYear()} Papeterie Messanger Supplier Ltd. All rights reserved.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {(['IG', 'FB', 'TW'] as const).map((social) => (
            <a
              key={social}
              href="#"
              className="font-worksans"
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.82rem',
                opacity: 0.6,
                transition: 'opacity 0.3s ease, color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--aby-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6';
                (e.currentTarget as HTMLAnchorElement).style.color = 'white';
              }}
            >
              {social}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>
    </footer>
  );
};

// ─── Footer Column ─────────────────────────────────────────────────────────────
const FooterColumn = ({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: NavLink[];
  onNavigate: (link: NavLink) => void;
}) => (
  <div>
    <h4
      className="font-worksans"
      style={{
        fontSize: '0.82rem',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        opacity: 0.6,
        marginBottom: '1.5rem',
        color: 'white',
      }}
    >
      {title}
    </h4>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {links.map((link) => (
        <li key={link.label}>
          <button
            onClick={() => onNavigate(link)}
            className="font-worksans"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              opacity: 0.8,
              padding: 0,
              textAlign: 'left',
              transition: 'color 0.3s ease, opacity 0.3s ease',
              fontFamily: "'Work Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)';
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
            }}
          >
            {link.label}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
