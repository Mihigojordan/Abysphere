import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What products does Papeterie Messanger Supplier Ltd. offer?',
    answer:
      'We offer a wide range of office and stationery supplies including paper products, writing instruments, filing solutions, packaging materials, and more. Browse our full catalogue on the Shop page.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Simply browse our Shop, add items to your cart, then click "Proceed to Checkout." You will be redirected to WhatsApp where you can confirm your order with one of our team members who will guide you through the process.',
  },
  {
    question: 'What are your payment options?',
    answer:
      'We accept Mobile Money (MTN & Airtel), bank transfers, and cash on delivery for orders within Kigali. Our team will confirm the payment method during checkout via WhatsApp.',
  },
  {
    question: 'Do you offer bulk or wholesale pricing?',
    answer:
      'Yes! We offer competitive wholesale pricing for bulk orders. Contact us through the Contact page or send us a WhatsApp message to discuss custom pricing for your business.',
  },
  {
    question: 'What is your delivery area and timeframe?',
    answer:
      'We deliver across Kigali City and surrounding areas. Standard delivery takes 1–2 business days. Bulk orders may require additional lead time. Delivery details will be confirmed at checkout.',
  },
  {
    question: 'Can I pick up my order in person?',
    answer:
      'Yes, you are welcome to pick up your order from our office. Please contact us in advance to ensure your order is ready when you arrive.',
  },
  {
    question: 'What if a product I ordered is out of stock?',
    answer:
      'Our team will notify you immediately via WhatsApp if any item in your order is unavailable and will suggest alternatives or a restock timeline.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'After placing your order via WhatsApp, our team will provide updates on dispatch and delivery. You can also reach out to us directly at any time for a status update.',
  },
  {
    question: 'Do you accept returns or exchanges?',
    answer:
      'We accept returns on damaged or incorrectly supplied goods within 3 business days of delivery. Please contact us with photos of the issue and we will arrange a replacement or refund.',
  },
  {
    question: 'How do I contact your support team?',
    answer:
      'You can reach us via the Contact page, by calling +250 723 683 518, or by sending us a WhatsApp message. We are available Monday to Friday, 8AM–6PM, and Saturday 9AM–2PM.',
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <div style={{ background: 'var(--aby-bg)', minHeight: '100vh' }}>
      {/* ── Header Banner ──────────────────────────────────────────── */}
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
          Help Centre
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
          Frequently Asked Questions
        </h1>
        <p className="font-worksans" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          Everything you need to know about ordering from us
        </p>
      </div>

      {/* ── FAQ Accordion ──────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '4rem 2rem 6rem',
        }}
      >
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{
                borderBottom: '1px solid var(--aby-border)',
                marginBottom: '0',
              }}
            >
              <button
                onClick={() => toggle(i)}
                className="font-worksans"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '1rem',
                  color: isOpen ? 'var(--aby-accent)' : 'var(--aby-dark)',
                  transition: 'color 0.2s',
                }}
                aria-expanded={isOpen}
              >
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {faq.question}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    color: isOpen ? 'var(--aby-accent)' : 'var(--aby-muted)',
                    transition: 'color 0.2s',
                  }}
                >
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>

              {/* Answer panel */}
              <div
                style={{
                  maxHeight: isOpen ? '600px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <p
                  className="font-worksans"
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--aby-muted)',
                    lineHeight: 1.8,
                    paddingBottom: '1.5rem',
                    margin: 0,
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}

        {/* Still have questions? */}
        <div
          style={{
            marginTop: '4rem',
            padding: '2.5rem',
            background: 'var(--aby-surface)',
            border: '1px solid var(--aby-border)',
            textAlign: 'center',
          }}
        >
          <p
            className="font-cormorant"
            style={{ fontSize: '1.6rem', fontWeight: 400, color: 'var(--aby-dark)', margin: '0 0 0.5rem' }}
          >
            Still have questions?
          </p>
          <p
            className="font-worksans"
            style={{ fontSize: '0.9rem', color: 'var(--aby-muted)', marginBottom: '1.5rem' }}
          >
            Our team is happy to help — reach out anytime.
          </p>
          <a
            href="/contact"
            className="font-worksans"
            style={{
              display: 'inline-block',
              background: 'var(--aby-dark)',
              color: 'white',
              padding: '0.8rem 2rem',
              fontSize: '0.88rem',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--aby-accent)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--aby-dark)')}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
