import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, X, Menu, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import publicStockService, { type Stock } from '../../services/publicStockService';

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
  const { totalItems, openCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Stock[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '#categories' },
    { name: 'About', path: '#about' },
    { name: 'Stories', path: '#stories' },
  ];

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    if (!path) return;
    if (path.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(path);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        const el = document.querySelector(path);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search panel opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  // Debounced backend suggestions while user types
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    setSuggestionsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await publicStockService.searchStocks({
          search: query.trim(),
          limit: 6,
          page: 1,
        });
        setSuggestions(result.data);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (q = query) => {
    if (!q.trim()) return;
    setSearchOpen(false);
    setQuery('');
    setSuggestions([]);
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
  };

  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    if (searchOpen) { setQuery(''); setSuggestions([]); }
  };


  // Close search on ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); setSuggestions([]); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: (scrolled || searchOpen) ? '1px solid var(--aby-border)' : '1px solid transparent',
        backgroundColor: (scrolled || searchOpen) ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: (scrolled || searchOpen) ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Main bar */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="font-cormorant"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', fontWeight: 500, letterSpacing: '0.04em', color: 'var(--aby-dark)' }}
        >
          Papeterie Messanger Supplier Ltd.
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex" style={{ gap: '2.5rem' }}>
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavigate(link.path)}
              className="font-worksans"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--aby-dark)', padding: '0.25rem 0', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)')}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex" style={{ gap: '1.25rem', alignItems: 'center' }}>
          {/* Search icon */}
          <button
            onClick={toggleSearch}
            aria-label="Search"
            style={{
              background: searchOpen ? 'var(--aby-bg)' : 'none',
              border: searchOpen ? '1px solid var(--aby-border)' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: searchOpen ? 'var(--aby-accent)' : 'var(--aby-dark)',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { if (!searchOpen) (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)'; }}
            onMouseLeave={(e) => { if (!searchOpen) (e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)'; }}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Cart */}
          <button
            onClick={openCart}
            aria-label="Cart"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--aby-dark)', position: 'relative', padding: '0.25rem', transition: 'color 0.3s ease' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-accent)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--aby-dark)')}
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--aby-accent)', color: 'white', fontSize: '0.65rem', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontFamily: "'Work Sans', sans-serif" }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Login */}
          <button
            onClick={() => navigate('/login')}
            className="font-worksans"
            style={{ background: 'var(--aby-dark)', color: 'white', border: 'none', padding: '0.6rem 1.4rem', fontSize: '0.85rem', fontWeight: 400, letterSpacing: '0.04em', cursor: 'pointer', transition: 'background 0.3s ease' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-accent)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-dark)')}
          >
            Sign In
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="flex md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--aby-dark)' }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Search Drop-down ────────────────────────────────────────────────── */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: searchOpen ? '400px' : '0',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
          borderTop: searchOpen ? '1px solid var(--aby-border)' : 'none',
        }}
      >
        <div style={{ padding: '1.25rem 2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Input row */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="var(--aby-muted)" style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search products, categories, suppliers…"
              className="font-worksans"
              style={{
                width: '100%',
                padding: '0.85rem 3rem 0.85rem 2.75rem',
                border: '1px solid var(--aby-border)',
                background: 'var(--aby-bg)',
                fontSize: '0.95rem',
                color: 'var(--aby-dark)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--aby-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--aby-border)')}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSuggestions([]); searchInputRef.current?.focus(); }}
                style={{ position: 'absolute', right: '3.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--aby-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              className="font-worksans"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                background: 'var(--aby-dark)',
                color: 'white',
                border: 'none',
                padding: '0 1.25rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-accent)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-dark)')}
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ marginTop: '0.5rem', border: '1px solid var(--aby-border)', background: 'var(--aby-surface)' }}>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { navigate(`/product/${s.id}`); setSearchOpen(false); setQuery(''); setSuggestions([]); }}
                  className="font-worksans"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.7rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--aby-border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-bg)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                >
                  <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--aby-dark)', fontWeight: 500, display: 'block' }}>{s.itemName}</span>
                    {s.categoryName && <span style={{ fontSize: '0.75rem', color: 'var(--aby-muted)' }}>{s.categoryName}</span>}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--aby-accent)', fontWeight: 500, flexShrink: 0, marginLeft: '1rem' }}>
                    RWF {Number(s.unitCost).toLocaleString()}
                  </span>
                </button>
              ))}
              <button
                onClick={() => handleSearch()}
                className="font-worksans"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.7rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--aby-accent)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--aby-bg)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
              >
                <Search size={13} />
                See all results for "{query}"
              </button>
            </div>
          )}

          {query.trim() && suggestions.length === 0 && !suggestionsLoading && (
            <p className="font-worksans" style={{ fontSize: '0.85rem', color: 'var(--aby-muted)', padding: '0.75rem 0' }}>
              No products found for "{query}" — <button onClick={() => handleSearch()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--aby-accent)', fontSize: '0.85rem' }}>search in shop</button>
            </p>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ background: 'var(--aby-surface)', borderTop: '1px solid var(--aby-border)', padding: '1.5rem 2rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Mobile search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--aby-border)', padding: '0.6rem 0.75rem', background: 'var(--aby-bg)' }}>
              <Search size={16} color="var(--aby-muted)" />
              <input
                type="text"
                placeholder="Search products…"
                className="font-worksans"
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--aby-dark)' }}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch((e.target as HTMLInputElement).value); setIsOpen(false); } }}
              />
            </div>
            {links.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigate(link.path)}
                className="font-worksans"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 400, color: 'var(--aby-dark)', textAlign: 'left', letterSpacing: '0.02em', padding: '0.25rem 0' }}
              >
                {link.name}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--aby-border)', paddingTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={openCart}
                aria-label="Cart"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--aby-dark)', position: 'relative' }}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--aby-accent)', color: 'white', fontSize: '0.65rem', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="font-worksans"
                style={{ background: 'var(--aby-dark)', color: 'white', border: 'none', padding: '0.5rem 1.2rem', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
