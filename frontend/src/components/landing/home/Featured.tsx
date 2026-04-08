import { useEffect, useRef, useState } from 'react';
import { Heart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveImgUrl } from '../../../utils/imageUtils';
import publicStockService, { type Stock } from '../../../services/publicStockService';
import { useCart } from '../../../context/CartContext';

const CARD_GRADIENTS = [
  'linear-gradient(145deg, #f0e8dd, #e2d3be)',
  'linear-gradient(145deg, #e8ddd4, #d6c8b0)',
  'linear-gradient(145deg, #ede6dc, #dccfb8)',
  'linear-gradient(145deg, #f2ebe1, #e5d6c0)',
  'linear-gradient(145deg, #ede0d0, #d6bfa0)',
  'linear-gradient(145deg, #f0e4d4, #dcc4a0)',
  'linear-gradient(145deg, #e5d8c8, #c8a878)',
  'linear-gradient(145deg, #f5e6d3, #e0c9a8)',
];

interface FeaturedProps {
  onAddToCart?: () => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div>
    <div
      style={{
        width: '100%',
        aspectRatio: '3/4',
        background: 'linear-gradient(90deg, #f0ede8 25%, #e8e3dc 50%, #f0ede8 75%)',
        backgroundSize: '200% 100%',
        border: '1px solid var(--aby-border)',
        marginBottom: '1rem',
        animation: 'shimmer 1.5s infinite',
      }}
    />
    <div style={{ padding: '0 0.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ height: '16px', width: '70%', background: '#f0ede8', borderRadius: '2px', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ height: '12px', width: '45%', background: '#f0ede8', borderRadius: '2px', animation: 'shimmer 1.5s infinite' }} />
    </div>
    <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({
  stock,
  gradientIndex,
  onAddToCart,
}: {
  stock: Stock;
  gradientIndex: number;
  onAddToCart?: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const bg = CARD_GRADIENTS[gradientIndex % CARD_GRADIENTS.length];
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart({
      id: stock.id,
      sku: stock.sku,
      name: stock.itemName,
      price: stock.unitCost,
      unitOfMeasure: stock.unitOfMeasure,
      categoryName: stock.categoryName,
      supplier: stock.supplier,
      maxQuantity: stock.receivedQuantity,
    });
    setAdded(true);
    onAddToCart?.();
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${stock.id}`)}
      style={{ transform: hovered ? 'translateY(-4px)' : 'translateY(0)', transition: 'transform 0.3s ease', cursor: 'pointer' }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3/4',
          background: bg,
          border: '1px solid var(--aby-border)',
          marginBottom: '1rem',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {resolveImgUrl(stock.stockImg) ? (
          <img
            src={resolveImgUrl(stock.stockImg)!}
            alt={stock.itemName}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Package size={32} color="rgba(139,111,71,0.25)" />
        )}

        {/* Low stock / out of stock badge */}
        {stock.receivedQuantity === 0 ? (
          <span
            className="font-worksans"
            style={{
              position: 'absolute', top: '10px', left: '10px',
              background: '#dc2626', color: 'white',
              fontSize: '0.62rem', fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '0.18rem 0.5rem',
            }}
          >
            Out of Stock
          </span>
        ) : stock.receivedQuantity <= stock.reorderLevel ? (
          <span
            className="font-worksans"
            style={{
              position: 'absolute', top: '10px', left: '10px',
              background: '#d97706', color: 'white',
              fontSize: '0.62rem', fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '0.18rem 0.5rem',
            }}
          >
            Low Stock
          </span>
        ) : null}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          aria-label="Toggle wishlist"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: wishlisted ? 'var(--aby-accent)' : 'white',
            border: 'none',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--aby-shadow-sm)',
            color: wishlisted ? 'white' : 'var(--aby-dark)',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.3s ease, transform 0.2s ease, background 0.2s ease',
          } as React.CSSProperties}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '0 0.25rem' }}>
        {stock.categoryName && (
          <p
            className="font-worksans"
            style={{ fontSize: '0.7rem', color: 'var(--aby-accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}
          >
            {stock.categoryName}
          </p>
        )}
        <h3
          className="font-cormorant"
          style={{ fontSize: '1.15rem', fontWeight: 400, color: 'var(--aby-dark)', marginBottom: '0.2rem' }}
        >
          {stock.itemName}
        </h3>
        {stock.supplier && (
          <p className="font-worksans" style={{ fontSize: '0.82rem', color: 'var(--aby-muted)', marginBottom: '0.9rem' }}>
            by {stock.supplier}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-worksans" style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--aby-accent)' }}>
            RWF {Number(stock.unitCost).toLocaleString()}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            disabled={stock.receivedQuantity === 0}
            className="font-worksans"
            style={{
              background: added ? 'var(--aby-accent)' : 'none',
              border: '1px solid',
              borderColor: stock.receivedQuantity === 0 ? 'var(--aby-border)' : added ? 'var(--aby-accent)' : 'var(--aby-border)',
              color: stock.receivedQuantity === 0 ? 'var(--aby-muted)' : added ? 'white' : 'var(--aby-dark)',
              padding: '0.45rem 0.9rem',
              fontSize: '0.8rem',
              cursor: stock.receivedQuantity === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.02em',
              opacity: stock.receivedQuantity === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!added && stock.receivedQuantity > 0) {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'var(--aby-dark)';
                btn.style.color = 'white';
                btn.style.borderColor = 'var(--aby-dark)';
              }
            }}
            onMouseLeave={(e) => {
              if (!added && stock.receivedQuantity > 0) {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'none';
                btn.style.color = 'var(--aby-dark)';
                btn.style.borderColor = 'var(--aby-border)';
              }
            }}
          >
            {added ? 'Added!' : stock.receivedQuantity === 0 ? 'Unavailable' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Featured ─────────────────────────────────────────────────────────────────

const Featured = ({ onAddToCart }: FeaturedProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    publicStockService.getAllStocks().then((data) => {
      const arr = Array.isArray(data) ? data : [data];
      // Show up to 8 items; prioritise in-stock items
      const inStock = arr.filter((s) => s.receivedQuantity > 0);
      const rest = arr.filter((s) => s.receivedQuantity === 0);
      setStocks([...inStock, ...rest].slice(0, 8));
    }).catch(() => {
      // Silently fail on home page — just show nothing
    }).finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="shop"
      ref={sectionRef}
      style={{
        padding: '5rem 2rem 7rem',
        background: 'var(--aby-bg)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
          }}
        >
          <h2
            className="font-cormorant"
            style={{
              fontSize: 'clamp(2rem, 3vw, 2.8rem)',
              fontWeight: 300,
              color: 'var(--aby-dark)',
              letterSpacing: '-0.01em',
            }}
          >
            Featured Items
          </h2>
          <button
            onClick={() => navigate('/shop')}
            className="font-worksans"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              color: 'var(--aby-muted)',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-muted)')}
          >
            View All →
          </button>
        </div>

        {/* Grid */}
        <div
          className="products-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem' }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stocks.length === 0
            ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--aby-muted)' }}>
                <Package size={40} color="var(--aby-border)" style={{ marginBottom: '1rem' }} />
                <p className="font-worksans" style={{ fontSize: '0.9rem' }}>No products available right now.</p>
              </div>
            )
            : stocks.map((stock, i) => (
              <ProductCard key={stock.id} stock={stock} gradientIndex={i} onAddToCart={onAddToCart} />
            ))
          }
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .products-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default Featured;
