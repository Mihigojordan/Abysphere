import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import publicCategoryService from '../../../services/publicCategoryService';
import type { Category } from '../../../services/categoryService';
import publicStockService from '../../../services/publicStockService';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Categories = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
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
    Promise.all([
      publicCategoryService.getAllCategories(),
      publicStockService.getAllStocks(),
    ]).then(([cats, stockData]) => {
      setCategories(cats || []);
      // Build a count map: categoryId → number of stock items
      const arr = Array.isArray(stockData) ? stockData : [stockData];
      const map: Record<string, number> = {};
      for (const s of arr) {
        if (s.categoryId) {
          map[s.categoryId] = (map[s.categoryId] || 0) + 1;
        }
      }
      setCounts(map);
    }).catch(() => {
      // Silently fail — section just won't show categories
    }).finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (cat: Category) => {
    const id = cat.id || cat.name;
    navigate(`/shop?category=${encodeURIComponent(id)}`);
  };

  return (
    <section
      id="categories"
      ref={sectionRef}
      style={{
        padding: '6rem 2rem',
        background: 'var(--aby-surface)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h2
            className="font-cormorant"
            style={{
              fontSize: 'clamp(2rem, 3vw, 2.8rem)',
              fontWeight: 300,
              color: 'var(--aby-dark)',
              letterSpacing: '-0.01em',
            }}
          >
            Browse by Category
          </h2>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: 'linear-gradient(90deg,#e8eef8 25%,#d8e4f4 50%,#e8eef8 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    marginBottom: '1rem',
                    border: '1px solid var(--aby-border)',
                  }}
                />
                <div style={{ height: '14px', width: '60%', background: '#e8eef8', borderRadius: '2px', margin: '0 auto 0.4rem' }} />
                <div style={{ height: '10px', width: '40%', background: '#e8eef8', borderRadius: '2px', margin: '0 auto' }} />
              </div>
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
          </div>
        )}

        {/* Grid */}
        {!loading && categories.length > 0 && (
          <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id || cat.name}
                cat={cat}
                count={counts[cat.id || ''] ?? 0}
                onClick={() => handleCategoryClick(cat)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && categories.length === 0 && (
          <p className="font-worksans" style={{ color: 'var(--aby-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
            No categories available yet.
          </p>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .categories-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

const CategoryCard = ({
  cat,
  count,
  onClick,
}: {
  cat: Category;
  count: number;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const imgSrc = cat.image ? `${API_BASE}${cat.image}` : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Image / Icon */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          border: hovered ? '2px solid var(--aby-accent)' : '1px solid var(--aby-border)',
          marginBottom: '1rem',
          overflow: 'hidden',
          transition: 'border-color 0.3s ease, border-width 0.3s ease',
          position: 'relative',
          background: imgSrc ? undefined : 'var(--aby-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={cat.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              width: '35%',
              height: '35%',
              color: 'var(--aby-accent)',
              opacity: 0.55,
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {/* Hover overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(30,58,138,0.15)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />
        {/* "Shop now" label on hover */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--aby-accent)',
            color: 'white',
            textAlign: 'center',
            padding: '0.5rem',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            fontFamily: "'Work Sans', sans-serif",
            textTransform: 'uppercase',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          Shop Now
        </div>
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center' }}>
        <h3
          className="font-cormorant"
          style={{
            fontSize: '1.3rem',
            fontWeight: 400,
            color: 'var(--aby-dark)',
            marginBottom: '0.3rem',
          }}
        >
          {cat.name}
        </h3>
        <span
          className="font-worksans"
          style={{ fontSize: '0.82rem', color: 'var(--aby-muted)' }}
        >
          {count > 0 ? `${count} item${count !== 1 ? 's' : ''}` : 'View products'}
        </span>
      </div>
    </div>
  );
};

export default Categories;
