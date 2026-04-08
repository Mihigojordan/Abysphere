import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import publicStockService, { type Stock } from '../../services/publicStockService';
import { useCart } from '../../context/CartContext';
import { resolveImgUrl } from '../../utils/imageUtils';

const CARD_GRADIENTS = [
  'linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)',
  'linear-gradient(135deg,#e0e7ff 0%,#c7d2fe 100%)',
  'linear-gradient(135deg,#ede9fe 0%,#ddd6fe 100%)',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => Number(n).toLocaleString();

const fmtDate = (val: string | Date | undefined) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
    <div style={{ height: '14px', width: '220px', background: '#e8eef8', borderRadius: '2px', marginBottom: '2.5rem' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }} className="product-detail-grid">
      <div style={{ aspectRatio: '4/5', background: 'linear-gradient(90deg,#e8eef8 25%,#d8e4f4 50%,#e8eef8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
        <div style={{ height: '12px', width: '80px', background: '#e8eef8', borderRadius: '2px' }} />
        <div style={{ height: '28px', width: '75%', background: '#e8eef8', borderRadius: '2px' }} />
        <div style={{ height: '28px', width: '55%', background: '#e8eef8', borderRadius: '2px' }} />
        <div style={{ height: '1px', background: '#e8eef8', margin: '0.5rem 0' }} />
        <div style={{ height: '10px', width: '60%', background: '#e8eef8', borderRadius: '2px' }} />
        <div style={{ height: '10px', width: '80%', background: '#e8eef8', borderRadius: '2px' }} />
        <div style={{ height: '10px', width: '50%', background: '#e8eef8', borderRadius: '2px' }} />
        <div style={{ height: '44px', width: '100%', background: '#e8eef8', marginTop: '1rem', borderRadius: '2px' }} />
      </div>
    </div>
    <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
  </div>
);

// ─── Product Detail Page ───────────────────────────────────────────────────────

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState<Stock[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setRelated([]);
    publicStockService
      .getStockById(id)
      .then((data) => {
        setProduct(data);
        setQty(1);
        // Fetch related: same category, excluding self
        publicStockService.getAllStocks().then((all) => {
          const arr = Array.isArray(all) ? all : [all];
          const pool = arr.filter(
            (s) => s.id !== data.id &&
              s.receivedQuantity > 0 &&
              (s.categoryId === data.categoryId || s.categoryName === data.categoryName)
          );
          // fallback: if less than 3 in same category, pad from other in-stock items
          if (pool.length < 3) {
            const others = arr.filter(
              (s) => s.id !== data.id && s.receivedQuantity > 0 && !pool.find((p) => p.id === s.id)
            );
            pool.push(...others);
          }
          setRelated(pool.slice(0, 3));
        }).catch(() => {});
      })
      .catch(() => setError('Product not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isOutOfStock = product ? product.receivedQuantity === 0 : false;
  const isLowStock = product
    ? product.receivedQuantity > 0 && product.receivedQuantity <= product.reorderLevel
    : false;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addToCart({
      id: product.id,
      sku: product.sku,
      name: product.itemName,
      price: product.unitCost,
      unitOfMeasure: product.unitOfMeasure,
      categoryName: product.categoryName,
      supplier: product.supplier,
      maxQuantity: product.receivedQuantity,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ background: 'var(--aby-bg)', minHeight: '100vh' }}>
      {/* Breadcrumb bar */}
      <div style={{ background: 'var(--aby-surface)', borderBottom: '1px solid var(--aby-border)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/"
            className="font-worksans"
            style={{ fontSize: '0.8rem', color: 'var(--aby-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--aby-accent)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--aby-muted)')}
          >
            Home
          </Link>
          <span style={{ color: 'var(--aby-border)', fontSize: '0.8rem' }}>/</span>
          <Link
            to="/shop"
            className="font-worksans"
            style={{ fontSize: '0.8rem', color: 'var(--aby-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--aby-accent)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--aby-muted)')}
          >
            Shop
          </Link>
          {product && (
            <>
              <span style={{ color: 'var(--aby-border)', fontSize: '0.8rem' }}>/</span>
              <span
                className="font-worksans"
                style={{ fontSize: '0.8rem', color: 'var(--aby-dark)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {product.itemName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Back button */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        <button
          onClick={() => navigate(-1)}
          className="font-worksans"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--aby-muted)',
            padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-muted)')}
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : error || !product ? (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
          <Package size={56} color="var(--aby-border)" style={{ marginBottom: '1.5rem' }} />
          <h2 className="font-cormorant" style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--aby-dark)', marginBottom: '0.75rem' }}>
            Product Not Found
          </h2>
          <p className="font-worksans" style={{ color: 'var(--aby-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {error || 'This product is no longer available.'}
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="font-worksans"
            style={{
              background: 'var(--aby-dark)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 2rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
            }}
          >
            Back to Shop
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
          {/* Two-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              alignItems: 'start',
            }}
            className="product-detail-grid"
          >
            {/* Left: Image */}
            <div>
              <div
                style={{
                  aspectRatio: '4/5',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid var(--aby-border)',
                }}
              >
                {resolveImgUrl(product.stockImg) ? (
                  <img
                    src={resolveImgUrl(product.stockImg)!}
                    alt={product.itemName}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Package size={80} color="rgba(30,58,138,0.18)" />
                )}

                {/* Status badge */}
                {isOutOfStock ? (
                  <div
                    className="font-worksans"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: '#dc2626',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.3rem 0.7rem',
                    }}
                  >
                    Out of Stock
                  </div>
                ) : isLowStock ? (
                  <div
                    className="font-worksans"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: '#d97706',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.3rem 0.7rem',
                    }}
                  >
                    Low Stock
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right: Details */}
            <div style={{ paddingTop: '0.5rem' }}>
              {/* Category */}
              {product.categoryName && (
                <p
                  className="font-worksans"
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--aby-accent)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    margin: '0 0 0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {product.categoryName}
                </p>
              )}

              {/* Name */}
              <h1
                className="font-cormorant"
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 400,
                  color: 'var(--aby-dark)',
                  lineHeight: 1.15,
                  margin: '0 0 0.5rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {product.itemName}
              </h1>

              {/* Supplier */}
              {product.supplier && (
                <p
                  className="font-worksans"
                  style={{ fontSize: '0.9rem', color: 'var(--aby-muted)', margin: '0 0 1.5rem' }}
                >
                  by {product.supplier}
                </p>
              )}

              {/* Price */}
              <div style={{ margin: '0 0 1.5rem' }}>
                <span
                  className="font-cormorant"
                  style={{ fontSize: '2rem', fontWeight: 500, color: 'var(--aby-dark)' }}
                >
                  RWF {fmt(product.unitCost)}
                </span>
                <span
                  className="font-worksans"
                  style={{ fontSize: '0.85rem', color: 'var(--aby-muted)', marginLeft: '0.4rem' }}
                >
                  / {product.unitOfMeasure}
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--aby-border)', margin: '0 0 1.5rem' }} />

              {/* Availability */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {isOutOfStock ? (
                  <>
                    <XCircle size={16} color="#dc2626" />
                    <span className="font-worksans" style={{ fontSize: '0.85rem', color: '#dc2626' }}>
                      Currently unavailable
                    </span>
                  </>
                ) : isLowStock ? (
                  <>
                    <AlertTriangle size={16} color="#d97706" />
                    <span className="font-worksans" style={{ fontSize: '0.85rem', color: '#d97706' }}>
                      Only {product.receivedQuantity} {product.unitOfMeasure} left
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} color="#16a34a" />
                    <span className="font-worksans" style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                      In Stock
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p
                  className="font-worksans"
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--aby-muted)',
                    lineHeight: 1.75,
                    margin: '0 0 2rem',
                  }}
                >
                  {product.description}
                </p>
              )}

              {/* Expiry date — visible to customer if set */}
              {fmtDate(product.expiryDate) && (
                <div
                  className="font-worksans"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--aby-muted)',
                    marginBottom: '1.5rem',
                    padding: '0.6rem 0.9rem',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    display: 'inline-block',
                  }}
                >
                  Best before: <strong>{fmtDate(product.expiryDate)}</strong>
                </div>
              )}

              {/* Qty + Add to Cart */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  {/* Qty stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--aby-border)',
                      background: 'var(--aby-surface)',
                    }}
                  >
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      style={{
                        width: '40px',
                        height: '44px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        color: 'var(--aby-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-bg)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                    >
                      −
                    </button>
                    <span
                      className="font-worksans"
                      style={{
                        minWidth: '36px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        color: 'var(--aby-dark)',
                        fontWeight: 500,
                        borderLeft: '1px solid var(--aby-border)',
                        borderRight: '1px solid var(--aby-border)',
                        height: '44px',
                        lineHeight: '44px',
                      }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.receivedQuantity, q + 1))}
                      style={{
                        width: '40px',
                        height: '44px',
                        background: 'none',
                        border: 'none',
                        cursor: qty >= product.receivedQuantity ? 'not-allowed' : 'pointer',
                        fontSize: '1.1rem',
                        color: qty >= product.receivedQuantity ? 'var(--aby-border)' : 'var(--aby-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (qty < product.receivedQuantity)
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-bg)';
                      }}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="font-worksans"
                    style={{
                      flex: 1,
                      minWidth: '160px',
                      height: '44px',
                      background: added ? 'var(--aby-accent)' : 'var(--aby-dark)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.3s ease, transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!added)
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-accent)';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      if (!added)
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-dark)';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <ShoppingCart size={16} />
                    {added ? 'Added to Cart!' : 'Add to Cart'}
                  </button>
                </div>
              )}

              {isOutOfStock && (
                <button
                  disabled
                  className="font-worksans"
                  style={{
                    width: '100%',
                    height: '44px',
                    background: 'none',
                    color: 'var(--aby-muted)',
                    border: '1px solid var(--aby-border)',
                    cursor: 'not-allowed',
                    fontSize: '0.9rem',
                    letterSpacing: '0.04em',
                    opacity: 0.6,
                  }}
                >
                  Currently Unavailable
                </button>
              )}

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--aby-border)', margin: '1.75rem 0' }} />

              {/* Product meta — client-safe details only */}
              <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0, padding: 0 }}>
                {product.categoryName && (
                  <MetaRow label="Category" value={product.categoryName} />
                )}
                {product.supplier && (
                  <MetaRow label="Maker / Supplier" value={product.supplier} />
                )}
                <MetaRow label="Unit" value={product.unitOfMeasure} />
              </dl>
            </div>
          </div>
          {/* ── Related Products ──────────────────────────────────────── */}
          {related.length > 0 && (
            <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--aby-border)' }}>
              <h2
                className="font-cormorant"
                style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 300, color: 'var(--aby-dark)', marginBottom: '2rem', letterSpacing: '-0.01em' }}
              >
                You May Also Like
              </h2>
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem' }}
                className="related-grid"
              >
                {related.map((s, i) => (
                  <RelatedCard key={s.id} stock={s} gradientIndex={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .related-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .related-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const RelatedCard = ({ stock, gradientIndex }: { stock: Stock; gradientIndex: number }) => {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const bg = CARD_GRADIENTS[gradientIndex % CARD_GRADIENTS.length];
  const imgSrc = resolveImgUrl(stock.stockImg);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: stock.id, sku: stock.sku, name: stock.itemName,
      price: stock.unitCost, unitOfMeasure: stock.unitOfMeasure,
      categoryName: stock.categoryName, supplier: stock.supplier,
      maxQuantity: stock.receivedQuantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => navigate(`/product/${stock.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        background: 'var(--aby-surface)',
        border: '1px solid',
        borderColor: hovered ? 'var(--aby-accent)' : 'var(--aby-border)',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? 'var(--aby-shadow-md)' : 'var(--aby-shadow-sm)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: '4/3', background: bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={stock.itemName} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
        ) : (
          <Package size={32} color="rgba(30,58,138,0.18)" />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {stock.categoryName && (
          <p className="font-worksans" style={{ fontSize: '0.7rem', color: 'var(--aby-accent)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            {stock.categoryName}
          </p>
        )}
        <h3 className="font-cormorant" style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--aby-dark)', margin: 0, lineHeight: 1.3 }}>
          {stock.itemName}
        </h3>
        {stock.supplier && (
          <p className="font-worksans" style={{ fontSize: '0.78rem', color: 'var(--aby-muted)', margin: 0 }}>
            {stock.supplier}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.75rem 1.1rem', borderTop: '1px solid var(--aby-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <span className="font-cormorant" style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--aby-dark)' }}>
          RWF {Number(stock.unitCost).toLocaleString()}
        </span>
        <button
          onClick={handleAdd}
          disabled={stock.receivedQuantity === 0}
          className="font-worksans"
          style={{
            background: added ? 'var(--aby-accent)' : 'none',
            border: '1px solid',
            borderColor: stock.receivedQuantity === 0 ? 'var(--aby-border)' : added ? 'var(--aby-accent)' : 'var(--aby-border)',
            color: stock.receivedQuantity === 0 ? 'var(--aby-muted)' : added ? 'white' : 'var(--aby-dark)',
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            cursor: stock.receivedQuantity === 0 ? 'not-allowed' : 'pointer',
            opacity: stock.receivedQuantity === 0 ? 0.5 : 1,
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (stock.receivedQuantity > 0 && !added) {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-dark)';
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-dark)';
            }
          }}
          onMouseLeave={(e) => {
            if (!added) {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = stock.receivedQuantity === 0 ? 'var(--aby-muted)' : 'var(--aby-dark)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-border)';
            }
          }}
        >
          {added ? 'Added!' : stock.receivedQuantity === 0 ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
    <dt
      className="font-worksans"
      style={{
        fontSize: '0.78rem',
        color: 'var(--aby-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        minWidth: '140px',
        flexShrink: 0,
        fontWeight: 500,
      }}
    >
      {label}
    </dt>
    <dd
      className="font-worksans"
      style={{ fontSize: '0.88rem', color: 'var(--aby-dark)', margin: 0, fontWeight: 400 }}
    >
      {value}
    </dd>
  </div>
);

export default ProductPage;
