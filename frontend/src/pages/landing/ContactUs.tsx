import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { MapPin, Clock, Phone, Mail, Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

// ─── EmailJS credentials (replace with your real ones) ────────────────────────
const EMAILJS_SERVICE_ID = 'service_XXXXXXXX';
const EMAILJS_TEMPLATE_ID = 'template_XXXXXXXX';
const EMAILJS_PUBLIC_KEY = 'XXXXXXXXXXXXXXXXX';

// ─── Status type ───────────────────────────────────────────────────────────────
type Status = 'idle' | 'sending' | 'success' | 'error';

const ContactPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus('sending');
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY,
      );
      setStatus('success');
      formRef.current.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ background: 'var(--aby-bg)', minHeight: '100vh' }}>

      {/* ── Header Banner ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #1d4ed8 100%)',
          padding: '5rem 2rem 3.5rem',
          textAlign: 'center',
        }}
      >
        <p
          className="font-worksans"
          style={{
            color: 'rgba(180,200,255,0.8)',
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          We'd love to hear from you
        </p>
        <h1
          className="font-cormorant"
          style={{
            color: 'white',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 400,
            margin: '0 0 0.75rem',
          }}
        >
          Get in Touch
        </h1>
        <p className="font-worksans" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          Reach out for orders, quotes, or any questions
        </p>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem 6rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: '3rem',
          alignItems: 'start',
        }}
        className="contact-grid"
      >

        {/* ── Left column: info cards ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <p
              className="font-worksans"
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--aby-accent)',
                marginBottom: '0.5rem',
              }}
            >
              Contact Information
            </p>
            <h2
              className="font-cormorant"
              style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--aby-dark)', margin: '0 0 0.75rem' }}
            >
              Let's Talk
            </h2>
            <p
              className="font-worksans"
              style={{ fontSize: '0.9rem', color: 'var(--aby-muted)', lineHeight: 1.75 }}
            >
              Whether you need a quote, want to place a bulk order, or just have a question — our team is ready to help.
            </p>
          </div>

          {/* Info cards */}
          {[
            {
              icon: <Phone size={20} />,
              label: 'Phone',
              value: '+250 723 683 518',
              link: 'tel:+250723683518',
            },
            {
              icon: <Mail size={20} />,
              label: 'Email',
              value: 'info@papeterie.rw',
              link: 'mailto:info@papeterie.rw',
            },
            {
              icon: <MapPin size={20} />,
              label: 'Location',
              value: 'Kigali, Rwanda',
              link: null,
            },
            {
              icon: <Clock size={20} />,
              label: 'Business Hours',
              value: 'Mon – Fri: 8AM – 6PM\nSat: 9AM – 2PM',
              link: null,
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: 'var(--aby-surface)',
                border: '1px solid var(--aby-border)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: 'var(--aby-accent)', marginTop: '1px', flexShrink: 0 }}>
                {card.icon}
              </span>
              <div>
                <p
                  className="font-worksans"
                  style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--aby-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.25rem' }}
                >
                  {card.label}
                </p>
                {card.link ? (
                  <a
                    href={card.link}
                    className="font-worksans"
                    style={{ fontSize: '0.92rem', color: 'var(--aby-dark)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--aby-accent)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--aby-dark)')}
                  >
                    {card.value}
                  </a>
                ) : (
                  <p
                    className="font-worksans"
                    style={{ fontSize: '0.92rem', color: 'var(--aby-dark)', margin: 0, whiteSpace: 'pre-line' }}
                  >
                    {card.value}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* WhatsApp quick CTA */}
          <a
            href="https://wa.me/250723683518"
            target="_blank"
            rel="noopener noreferrer"
            className="font-worksans"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              background: '#25D366',
              color: 'white',
              padding: '0.9rem 1.5rem',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
          >
            {/* WhatsApp icon SVG inline */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.254-.038 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>

        {/* ── Right column: Contact Form ──────────────────────────────────── */}
        <div
          style={{
            background: 'var(--aby-surface)',
            border: '1px solid var(--aby-border)',
            padding: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <MessageSquare size={20} color="var(--aby-accent)" />
            <h2
              className="font-cormorant"
              style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--aby-dark)', margin: 0 }}
            >
              Send Us a Message
            </h2>
          </div>
          <p
            className="font-worksans"
            style={{ fontSize: '0.88rem', color: 'var(--aby-muted)', marginBottom: '2rem', lineHeight: 1.6 }}
          >
            Fill in the form and we'll get back to you within 24 hours.
          </p>

          {/* Success / Error alerts */}
          {status === 'success' && (
            <div
              className="font-worksans"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#15803d',
                padding: '1rem 1.25rem',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle size={18} />
              Message sent! We'll be in touch soon.
            </div>
          )}
          {status === 'error' && (
            <div
              className="font-worksans"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: '1rem 1.25rem',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={18} />
              Something went wrong. Please try again or contact us directly.
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row: Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row">
              <Field label="Full Name *" name="from_name" type="text" placeholder="Jane Doe" required />
              <Field label="Email *" name="reply_to" type="email" placeholder="jane@example.com" required />
            </div>

            {/* Phone */}
            <Field label="Phone" name="phone" type="tel" placeholder="+250 7XX XXX XXX" />

            {/* Message */}
            <div>
              <label
                className="font-worksans"
                style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--aby-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}
              >
                Message *
              </label>
              <textarea
                name="message"
                required
                rows={6}
                placeholder="Tell us about your needs, ask for a quote, or just say hello…"
                className="font-worksans"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--aby-border)',
                  background: 'var(--aby-bg)',
                  color: 'var(--aby-dark)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '140px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Work Sans', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--aby-accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--aby-border)')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="font-worksans"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                background: status === 'sending' ? 'var(--aby-border)' : 'var(--aby-dark)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (status !== 'sending') {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-accent)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = status === 'sending' ? 'var(--aby-border)' : 'var(--aby-dark)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {status === 'sending' ? (
                <>Sending…</>
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

// ─── Reusable field ────────────────────────────────────────────────────────────
const Field = ({
  label,
  name,
  type,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) => (
  <div>
    <label
      className="font-worksans"
      style={{
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 500,
        color: 'var(--aby-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
      }}
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      placeholder={placeholder}
      className="font-worksans"
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid var(--aby-border)',
        background: 'var(--aby-bg)',
        color: 'var(--aby-dark)',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
        fontFamily: "'Work Sans', sans-serif",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--aby-accent)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--aby-border)')}
    />
  </div>
);

export default ContactPage;