import { useEffect, useRef, useState } from 'react';
import { X, ShoppingBag, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const { items, isOpen, closeCart, removeFromCart, updateQty, subtotal, totalItems } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key closes cart
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCart]);

  const handleRemove = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 280);
  };

  const handleContinue = () => {
    closeCart();
    navigate('/shop');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 1998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '450px',
          height: '100%',
          background: 'var(--aby-surface)',
          zIndex: 1999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            borderBottom: '1px solid var(--aby-border)',
            padding: '2rem',
            background: 'var(--aby-surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <h2
              className="font-cormorant"
              style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--aby-dark)', margin: 0 }}
            >
              Your Cart
            </h2>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--aby-muted)',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.3s ease, transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-muted)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(0deg)';
              }}
            >
              <X size={24} />
            </button>
          </div>
          <p className="font-worksans" style={{ fontSize: '0.9rem', color: 'var(--aby-muted)', margin: 0 }}>
            <span style={{ color: 'var(--aby-accent)', fontWeight: 600 }}>{totalItems}</span> {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* ── Items ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: items.length === 0 ? 0 : '1.5rem 2rem',
          }}
        >
          {items.length === 0 ? (
            /* Empty state */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'var(--aby-muted)',
              }}
            >
              <ShoppingBag size={72} strokeWidth={1} color="var(--aby-border)" style={{ marginBottom: '1.5rem' }} />
              <p className="font-cormorant" style={{ fontSize: '1.4rem', color: 'var(--aby-dark)', marginBottom: '0.5rem' }}>
                Your cart is empty
              </p>
              <p className="font-worksans" style={{ fontSize: '0.9rem', color: 'var(--aby-muted)' }}>
                Add items to get started
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    padding: '1.5rem 0',
                    borderBottom: '1px solid var(--aby-border)',
                    opacity: removingId === item.id ? 0 : 1,
                    transform: removingId === item.id ? 'translateX(60px)' : 'translateX(0)',
                    transition: 'opacity 0.28s ease, transform 0.28s ease',
                    animation: 'cartItemIn 0.3s ease',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      background: 'linear-gradient(135deg, #f5e6d3 0%, #e0c9a8 100%)',
                      flexShrink: 0,
                      border: '1px solid var(--aby-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Package size={28} color="rgba(139,111,71,0.35)" />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
                    {item.categoryName && (
                      <p
                        className="font-worksans"
                        style={{ fontSize: '0.68rem', color: 'var(--aby-accent)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}
                      >
                        {item.categoryName}
                      </p>
                    )}
                    <h4
                      className="font-cormorant"
                      style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--aby-dark)', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {item.name}
                    </h4>
                    <p
                      className="font-worksans"
                      style={{ fontSize: '0.95rem', color: 'var(--aby-accent)', fontWeight: 500, margin: 0 }}
                    >
                      RWF {Number(item.price).toLocaleString()}
                      <span style={{ fontSize: '0.72rem', color: 'var(--aby-muted)', fontWeight: 400, marginLeft: '0.25rem' }}>
                        / {item.unitOfMeasure}
                      </span>
                    </p>

                    {/* Qty + remove */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      {/* Quantity controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          border: '1px solid var(--aby-border)',
                          padding: '0.2rem 0.4rem',
                        }}
                      >
                        <QtyBtn
                          icon={<Minus size={13} />}
                          onClick={() => item.quantity === 1 ? handleRemove(item.id) : updateQty(item.id, item.quantity - 1)}
                          aria="Decrease quantity"
                        />
                        <span
                          className="font-worksans"
                          style={{ fontSize: '0.9rem', fontWeight: 500, minWidth: '24px', textAlign: 'center', color: 'var(--aby-dark)' }}
                        >
                          {item.quantity}
                        </span>
                        <QtyBtn
                          icon={<Plus size={13} />}
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          aria="Increase quantity"
                        />
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="font-worksans"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          color: 'var(--aby-muted)',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          padding: 0,
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-muted)')}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            borderTop: '1px solid var(--aby-border)',
            padding: '2rem',
            background: 'var(--aby-surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span className="font-worksans" style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--aby-dark)' }}>
              Subtotal
            </span>
            <span
              className="font-cormorant"
              style={{ fontSize: '1.6rem', fontWeight: 500, color: 'var(--aby-accent)' }}
            >
              RWF {Number(subtotal).toLocaleString()}
            </span>
          </div>
          <p className="font-worksans" style={{ fontSize: '0.82rem', color: 'var(--aby-muted)', marginBottom: '1.5rem' }}>
            Shipping &amp; taxes calculated at checkout
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              disabled={items.length === 0}
              onClick={() => {
                if (items.length === 0) return;
                const lines = items.map(
                  (item, i) =>
                    `${i + 1}. ${item.name} (x${item.quantity}) — RWF ${Number(item.price * item.quantity).toLocaleString()}`
                );
                const total = `\nTotal: RWF ${Number(subtotal).toLocaleString()}`;
                const message =
                  `Hello! I'd like to order the following:\n\n` +
                  lines.join('\n') +
                  total +
                  `\n\nPlease confirm availability and delivery details. Thank you!`;
                const waUrl = `https://wa.me/250723683518?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank', 'noopener,noreferrer');
              }}
              className="font-worksans"
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: items.length === 0 ? 'var(--aby-border)' : 'var(--aby-dark)',
                color: 'white',
                border: 'none',
                cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (items.length > 0) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-accent)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--aby-shadow-md)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = items.length === 0 ? 'var(--aby-border)' : 'var(--aby-dark)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleContinue}
              className="font-worksans"
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'transparent',
                color: 'var(--aby-dark)',
                border: '1px solid var(--aby-border)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 400,
                transition: 'border-color 0.3s ease, color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-accent)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)';
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cartItemIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 480px) {
          /* panel takes full width on small screens */
        }
      `}</style>
    </>
  );
};

const QtyBtn = ({
  icon,
  onClick,
  disabled,
  aria,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  aria: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={aria}
    style={{
      background: 'none',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: disabled ? 'var(--aby-border)' : 'var(--aby-dark)',
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '2px',
      transition: 'background 0.2s, color 0.2s',
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-bg)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)';
      }
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = 'none';
      (e.currentTarget as HTMLButtonElement).style.color = disabled ? 'var(--aby-border)' : 'var(--aby-dark)';
    }}
  >
    {icon}
  </button>
);

export default CartSidebar;
