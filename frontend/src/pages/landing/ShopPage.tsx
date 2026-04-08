import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { resolveImgUrl } from '../../utils/imageUtils';

import publicStockService, { type Stock } from '../../services/publicStockService';

import publicCategoryService from '../../services/publicCategoryService';
import type { Category } from '../../services/categoryService';
import { useCart } from '../../context/CartContext';

const ITEMS_PER_PAGE = 8;

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #f5e6d3 0%, #e0c9a8 100%)',
  'linear-gradient(135deg, #e8d5c0 0%, #d4b896 100%)',
  'linear-gradient(135deg, #d4c5b0 0%, #c4a882 100%)',
  'linear-gradient(135deg, #ede0d0 0%, #d6bfa0 100%)',
  'linear-gradient(135deg, #f0e4d4 0%, #dcc4a0 100%)',
  'linear-gradient(135deg, #e5d8c8 0%, #c8a878 100%)',
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  categories: Category[];
  onUpdate: (key: string, value: string) => void;
  onClear: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const FilterSidebar = ({
  search, category, minPrice, maxPrice, sort,
  categories, onUpdate, onClear,
  mobileOpen, onMobileClose,
}: SidebarProps) => {
  const hasFilters = search || category || minPrice || maxPrice || sort !== 'default';

  const content = (
    <div
      style={{
        background: 'var(--aby-surface)',
        border: '1px solid var(--aby-border)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3
          className="font-worksans"
          style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--aby-dark)', margin: 0 }}
        >
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="font-worksans"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--aby-accent)', padding: 0 }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="font-worksans" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--aby-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Search
        </label>
        <input
          type="text"
          placeholder="Product name…"
          value={search}
          onChange={(e) => onUpdate('search', e.target.value)}
          className="font-worksans"
          style={{
            width: '100%',
            padding: '0.6rem 0.8rem',
            border: '1px solid var(--aby-border)',
            outline: 'none',
            fontSize: '0.88rem',
            color: 'var(--aby-dark)',
            background: 'var(--aby-bg)',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--aby-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--aby-border)')}
        />
      </div>

      {/* Category */}
      <div>
        <label className="font-worksans" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--aby-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Category
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={() => onUpdate('category', '')}
            className="font-worksans"
            style={{
              background: !category ? 'var(--aby-dark)' : 'none',
              color: !category ? 'white' : 'var(--aby-dark)',
              border: '1px solid',
              borderColor: !category ? 'var(--aby-dark)' : 'var(--aby-border)',
              padding: '0.45rem 0.8rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onUpdate('category', cat.id || cat.name)}
              className="font-worksans"
              style={{
                background: category === (cat.id || cat.name) ? 'var(--aby-dark)' : 'none',
                color: category === (cat.id || cat.name) ? 'white' : 'var(--aby-dark)',
                border: '1px solid',
                borderColor: category === (cat.id || cat.name) ? 'var(--aby-dark)' : 'var(--aby-border)',
                padding: '0.45rem 0.8rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="font-worksans" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--aby-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Price Range
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            min={0}
            onChange={(e) => onUpdate('minPrice', e.target.value)}
            className="font-worksans"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.6rem 0.6rem',
              border: '1px solid var(--aby-border)',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--aby-dark)',
              background: 'var(--aby-bg)',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--aby-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--aby-border)')}
          />
          <span className="font-worksans" style={{ color: 'var(--aby-muted)', fontSize: '0.8rem' }}>–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            min={0}
            onChange={(e) => onUpdate('maxPrice', e.target.value)}
            className="font-worksans"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.6rem 0.6rem',
              border: '1px solid var(--aby-border)',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--aby-dark)',
              background: 'var(--aby-bg)',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--aby-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--aby-border)')}
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="font-worksans" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--aby-muted)', marginBottom: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => onUpdate('sort', e.target.value)}
          className="font-worksans"
          style={{
            width: '100%',
            padding: '0.6rem 0.8rem',
            border: '1px solid var(--aby-border)',
            outline: 'none',
            fontSize: '0.85rem',
            color: 'var(--aby-dark)',
            background: 'var(--aby-bg)',
            cursor: 'pointer',
            appearance: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
          <option value="name-desc">Name: Z–A</option>
        </select>
      </div>
    </div>
  );

  // Mobile overlay
  if (mobileOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'flex-start',
        }}
        onClick={onMobileClose}
      >
        <div
          style={{ width: '300px', maxHeight: '100vh', overflowY: 'auto', background: 'var(--aby-surface)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.25rem 0' }}>
            <button
              onClick={onMobileClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--aby-dark)' }}
            >
              <X size={20} />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({ stock, index }: { stock: Stock; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isLowStock = stock.receivedQuantity <= stock.reorderLevel;
  const isOutOfStock = stock.receivedQuantity === 0;

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
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${stock.id}`)}
      style={{
        background: 'var(--aby-surface)',
        border: '1px solid',
        borderColor: hovered ? 'var(--aby-accent)' : 'var(--aby-border)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? 'var(--aby-shadow-md)' : 'var(--aby-shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div
        style={{
          aspectRatio: '4/3',
          background: gradient,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {resolveImgUrl(stock.stockImg) ? (
          <img
            src={resolveImgUrl(stock.stockImg)!}
            alt={stock.itemName}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Package size={36} color="rgba(139,111,71,0.35)" />
        )}
        {/* Stock badge */}
        {isOutOfStock ? (
          <span
            className="font-worksans"
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              background: '#dc2626',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.2rem 0.55rem',
            }}
          >
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span
            className="font-worksans"
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              background: '#d97706',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.2rem 0.55rem',
            }}
          >
            Low Stock
          </span>
        ) : null}

        {/* Qty chip */}
        <span
          className="font-worksans"
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            background: 'rgba(255,255,255,0.9)',
            color: 'var(--aby-muted)',
            fontSize: '0.72rem',
            padding: '0.2rem 0.5rem',
            border: '1px solid var(--aby-border)',
          }}
        >
          {stock.receivedQuantity} {stock.unitOfMeasure}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {stock.categoryName && (
          <p
            className="font-worksans"
            style={{ fontSize: '0.72rem', color: 'var(--aby-accent)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}
          >
            {stock.categoryName}
          </p>
        )}
        <h3
          className="font-cormorant"
          style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--aby-dark)', margin: 0, lineHeight: 1.3 }}
        >
          {stock.itemName}
        </h3>
        {stock.supplier && (
          <p
            className="font-worksans"
            style={{ fontSize: '0.8rem', color: 'var(--aby-muted)', margin: 0 }}
          >
            {stock.supplier}
          </p>
        )}
        {stock.description && (
          <p
            className="font-worksans"
            style={{ fontSize: '0.8rem', color: 'var(--aby-muted)', margin: '0.1rem 0 0', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}
          >
            {stock.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.85rem 1.1rem',
          borderTop: '1px solid var(--aby-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span
          className="font-cormorant"
          style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--aby-dark)', flexShrink: 0 }}
        >
          RWF {Number(stock.unitCost).toLocaleString()}
          <span className="font-worksans" style={{ fontSize: '0.72rem', color: 'var(--aby-muted)', fontWeight: 400, marginLeft: '0.2rem' }}>
            / {stock.unitOfMeasure}
          </span>
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
          disabled={isOutOfStock}
          className="font-worksans"
          style={{
            background: added ? 'var(--aby-accent)' : isOutOfStock ? 'none' : 'none',
            border: '1px solid',
            borderColor: isOutOfStock ? 'var(--aby-border)' : added ? 'var(--aby-accent)' : 'var(--aby-border)',
            color: isOutOfStock ? 'var(--aby-muted)' : added ? 'white' : 'var(--aby-dark)',
            padding: '0.4rem 0.85rem',
            fontSize: '0.78rem',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em',
            opacity: isOutOfStock ? 0.5 : 1,
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!isOutOfStock && !added) {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-dark)';
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-dark)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOutOfStock && !added) {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-border)';
            }
          }}
        >
          {isOutOfStock ? 'Unavailable' : added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) => {
  const getPages = () => {
    const pages: (number | '…')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('…');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  const btnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '38px',
    height: '38px',
    padding: '0 0.5rem',
    border: '1px solid',
    borderColor: active ? 'var(--aby-dark)' : 'var(--aby-border)',
    background: active ? 'var(--aby-dark)' : 'var(--aby-surface)',
    color: active ? 'white' : disabled ? 'var(--aby-border)' : 'var(--aby-dark)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Work Sans', sans-serif",
    transition: 'all 0.2s',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginTop: '3rem' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        style={btnStyle(false, page === 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: 'var(--aby-muted)', fontSize: '0.85rem' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            style={btnStyle(p === page)}
            onMouseEnter={(e) => { if (p !== page) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-accent)'; }}
            onMouseLeave={(e) => { if (p !== page) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-border)'; }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        style={btnStyle(false, page === totalPages)}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const LoadingGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="shop-grid">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} style={{ background: 'var(--aby-surface)', border: '1px solid var(--aby-border)', overflow: 'hidden' }}>
        <div style={{ aspectRatio: '4/3', background: 'linear-gradient(90deg, #f0ede8 25%, #e8e3dc 50%, #f0ede8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ height: '10px', width: '40%', background: '#f0ede8', borderRadius: '2px' }} />
          <div style={{ height: '14px', width: '75%', background: '#f0ede8', borderRadius: '2px' }} />
          <div style={{ height: '10px', width: '55%', background: '#f0ede8', borderRadius: '2px' }} />
        </div>
      </div>
    ))}
    <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
    <Package size={48} color="var(--aby-border)" style={{ margin: '0 auto 1.5rem' }} />
    <h3 className="font-cormorant" style={{ fontSize: '1.6rem', fontWeight: 400, color: 'var(--aby-dark)', marginBottom: '0.5rem' }}>
      No products found
    </h3>
    <p className="font-worksans" style={{ color: 'var(--aby-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
      Try adjusting your filters or clearing your search.
    </p>
    <button
      onClick={onClear}
      className="font-worksans"
      style={{
        background: 'var(--aby-dark)',
        color: 'white',
        border: 'none',
        padding: '0.7rem 1.8rem',
        fontSize: '0.85rem',
        letterSpacing: '0.04em',
        cursor: 'pointer',
      }}
    >
      Clear Filters
    </button>
  </div>
);

// ─── ShopPage ─────────────────────────────────────────────────────────────────

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(true);

  // Read filters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'default';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Debounce search so we don't hit the API on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch from backend whenever any filter/page changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await publicStockService.searchStocks({
          search: debouncedSearch || undefined,
          category: category || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort,
          page,
          limit: ITEMS_PER_PAGE,
        });
        setStocks(result.data);
        setTotal(result.total);
      } catch {
        setError('Failed to load products. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearch, category, minPrice, maxPrice, sort, page]);

  // Fetch categories once
  useEffect(() => {
    publicCategoryService.getAllCategories().then((cats) => setCategories(cats || [])).catch(() => {});
  }, []);

  const updateParam = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== 'page') next.set('page', '1');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const hasFilters = search || category || minPrice || maxPrice || sort !== 'default';

  return (
    <div style={{ background: 'var(--aby-bg)', minHeight: '100vh' }}>
      {/* Page header */}
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
            color: 'var(--aby-accent)',
            fontSize: '0.72rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Our Collection
        </p>
        <h1
          className="font-cormorant"
          style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, margin: '0 0 0.75rem' }}
        >
          Shop All Products
        </h1>
        <p
          className="font-worksans"
          style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}
        >
          {loading ? 'Loading\u2026' : `${total} product${total !== 1 ? 's' : ''}`}
          {hasFilters && !loading && (
            <button
              onClick={clearFilters}
              className="font-worksans"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--aby-accent)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginLeft: '0.75rem',
                textDecoration: 'underline',
              }}
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {/* Layout */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2.5rem 2rem 4rem',
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
        }}
      >
        {/* Desktop sidebar — toggleable */}
        {desktopFilterOpen && (
          <aside className="shop-sidebar-desktop" style={{ width: '250px', flexShrink: 0, position: 'sticky', top: '90px' }}>
            <FilterSidebar
              search={search}
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              sort={sort}
              categories={categories}
              onUpdate={updateParam}
              onClear={clearFilters}
              mobileOpen={false}
              onMobileClose={() => {}}
            />
          </aside>
        )}

        {/* Mobile filter overlay */}
        {mobileFilterOpen && (
          <FilterSidebar
            search={search}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            categories={categories}
            onUpdate={updateParam}
            onClear={clearFilters}
            mobileOpen={true}
            onMobileClose={() => setMobileFilterOpen(false)}
          />
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Desktop filter toggle + result count */}
          <div
            className="shop-desktop-bar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <button
              onClick={() => setDesktopFilterOpen((v) => !v)}
              className="font-worksans shop-desktop-filter-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: desktopFilterOpen ? 'var(--aby-dark)' : 'none',
                color: desktopFilterOpen ? 'white' : 'var(--aby-dark)',
                border: '1px solid',
                borderColor: desktopFilterOpen ? 'var(--aby-dark)' : 'var(--aby-border)',
                padding: '0.55rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!desktopFilterOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)'; } }}
              onMouseLeave={(e) => { if (!desktopFilterOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--aby-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)'; } }}
            >
              <SlidersHorizontal size={15} />
              {desktopFilterOpen ? 'Hide Filters' : 'Show Filters'}
              {hasFilters && (
                <span style={{ background: 'var(--aby-accent)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  •
                </span>
              )}
            </button>
            <span className="font-worksans" style={{ fontSize: '0.85rem', color: 'var(--aby-muted)' }}>
              {loading ? '' : `${total} product${total !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Mobile toolbar */}
          <div
            className="shop-mobile-bar"
            style={{
              display: 'none',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="font-worksans"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: '1px solid var(--aby-border)',
                padding: '0.55rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--aby-dark)',
              }}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasFilters && (
                <span
                  style={{
                    background: 'var(--aby-accent)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  •
                </span>
              )}
            </button>
            <span className="font-worksans" style={{ fontSize: '0.85rem', color: 'var(--aby-muted)' }}>
              {total} products
            </span>
          </div>

          {/* Grid or states */}
          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <p className="font-worksans" style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="font-worksans"
                style={{ background: 'var(--aby-dark)', color: 'white', border: 'none', padding: '0.7rem 1.8rem', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Retry
              </button>
            </div>
          ) : stocks.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                }}
                className="shop-grid"
              >
                {stocks.map((stock: Stock, i: number) => (
                  <ProductCard key={stock.id} stock={stock} index={(safePage - 1) * ITEMS_PER_PAGE + i} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    updateParam('page', String(p));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .shop-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .shop-sidebar-desktop { display: none !important; }
          .shop-mobile-bar { display: flex !important; }
          .shop-desktop-bar { display: none !important; }
        }
        @media (max-width: 480px) {
          .shop-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ShopPage;
