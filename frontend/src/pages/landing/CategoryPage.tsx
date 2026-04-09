import { useState } from "react";

const categories = [
  {
    id: 1,
    name: "Notebooks",
    fr: "Carnets",
    count: 84,
    description: "Lined, dotted, blank — your thoughts deserve the perfect page.",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80",
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Pens & Inks",
    fr: "Stylos & Encres",
    count: 132,
    description: "Fountain, gel, ballpoint — every line a small pleasure.",
    image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80",
    tag: "New",
  },
  {
    id: 3,
    name: "Paper & Cards",
    fr: "Papier & Cartes",
    count: 210,
    description: "Correspondence paper, postcards, envelopes & fine stationery sets.",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80",
    tag: null,
  },
  {
    id: 4,
    name: "Pencils & Art",
    fr: "Crayons & Art",
    count: 97,
    description: "Drawing pencils, watercolors, sketchbooks for creatives.",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80",
    tag: null,
  },
  {
    id: 5,
    name: "Desk Accessories",
    fr: "Accessoires Bureau",
    count: 68,
    description: "Organizers, tape, scissors and all the little essentials.",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80",
    tag: null,
  },
  {
    id: 6,
    name: "Planners",
    fr: "Agendas",
    count: 55,
    description: "Weekly, monthly, yearly — plan your days beautifully.",
    image: "https://images.unsplash.com/photo-1506784365847-bbad939e9501?w=600&q=80",
    tag: "New",
  },
];

const featured = [
  {
    title: "Back to School",
    sub: "Fresh sets for a fresh start — up to 30% off",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=900&q=80",
    cta: "Shop the Collection",
  },
  {
    title: "Gift Sets",
    sub: "Beautifully wrapped, ready to give",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80",
    cta: "Discover Gifts",
  },
];

export default function PaperieCategories() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="min-h-screen bg-blue-50" style={{ fontFamily: "'IM Fell English', Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Lato:wght@300;400;700&display=swap');`}</style>

      {/* ── Hero ── */}
      <div className="relative bg-blue-950 overflow-hidden text-center px-6 py-20">
        {/* bg texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1400&q=60')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        {/* radial vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(10,18,52,0.9) 80%)" }} />
        {/* blue glow blobs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-600 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 opacity-15 rounded-full blur-3xl" />

        <div className="relative z-10">
          <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-5" style={{ fontFamily: "Lato, sans-serif" }}>
            La Papeterie Élégante
          </p>
          <h1 className="text-6xl md:text-7xl text-white leading-tight mb-4" style={{ fontStyle: "italic" }}>
            Shop by <span className="text-blue-300 not-italic">Category</span>
          </h1>
          <p className="text-blue-200 text-base font-light max-w-md mx-auto leading-relaxed" style={{ fontFamily: "Lato, sans-serif" }}>
            Thoughtfully curated paper goods, writing instruments & desk essentials for those who love beautiful things.
          </p>
          <div className="flex items-center justify-center gap-3 mt-7">
            <div className="w-14 h-px bg-blue-400 opacity-50" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
            <div className="w-14 h-px bg-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* ── Featured Banners ── */}
      <div className="max-w-8xl mx-auto px-6 mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featured.map((f, i) => (
          <div key={i} className="relative rounded-lg overflow-hidden h-56 cursor-pointer group border border-blue-100">
            <img
              src={f.image}
              alt={f.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: "brightness(0.5) saturate(0.65)" }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,25,80,0.88) 0%, rgba(15,40,100,0.2) 60%, transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 p-7">
              <h3 className="text-white text-2xl mb-1" style={{ fontStyle: "italic" }}>{f.title}</h3>
              <p className="text-blue-200 text-xs mb-3 font-light" style={{ fontFamily: "Lato, sans-serif" }}>{f.sub}</p>
              <button
                className="text-blue-300 text-xs font-bold tracking-widest uppercase flex items-center gap-2 group-hover:gap-3 transition-all duration-200"
                style={{ fontFamily: "Lato, sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {f.cta} →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category Grid ── */}
      <div className="max-w-8xl mx-auto px-6 mt-16">
        {/* section header */}
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-3xl text-blue-950" style={{ fontStyle: "italic" }}>All Categories</h2>
          <span className="text-xs tracking-widest uppercase text-blue-400 font-bold" style={{ fontFamily: "Lato, sans-serif" }}>
            {categories.length} collections
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg overflow-hidden border border-blue-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100"
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* image */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{ filter: "brightness(0.82) saturate(0.7)" }}
                />
                {cat.tag && (
                  <span
                    className="absolute top-3 left-3 bg-blue-950 text-blue-300 text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded"
                    style={{ fontFamily: "Lato, sans-serif" }}
                  >
                    {cat.tag}
                  </span>
                )}
              </div>

              {/* accent bar */}
              <div
                className="h-0.5 w-full bg-blue-500 transition-opacity duration-300"
                style={{ opacity: hovered === cat.id ? 1 : 0.3 }}
              />

              {/* body */}
              <div className="p-5">
                <div className="flex items-baseline justify-between mb-1.5">
                  <h3 className="text-xl text-blue-950" style={{ fontStyle: "italic" }}>{cat.name}</h3>
                  <span className="text-xs tracking-widest uppercase text-blue-300 font-bold" style={{ fontFamily: "Lato, sans-serif" }}>
                    {cat.fr}
                  </span>
                </div>
                <p className="text-sm text-blue-400 font-light leading-relaxed mb-4" style={{ fontFamily: "Lato, sans-serif" }}>
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-300 font-bold tracking-widest uppercase" style={{ fontFamily: "Lato, sans-serif" }}>
                    {cat.count} items
                  </span>
                  <button
                    className="text-xs text-blue-800 font-bold tracking-widest uppercase flex items-center gap-1.5 transition-all duration-200 hover:text-blue-500 hover:gap-2.5"
                    style={{ fontFamily: "Lato, sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Browse →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="relative rounded-lg overflow-hidden mb-20 text-center px-8 py-16 bg-blue-950">
          {/* decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-700 opacity-20 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500 opacity-10 rounded-full" />

          <div className="relative z-10">
            <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-4" style={{ fontFamily: "Lato, sans-serif" }}>
              Need Assistance?
            </p>
            <h2 className="text-4xl md:text-5xl text-white mb-3" style={{ fontStyle: "italic" }}>
              Can't find what you're<br />looking for?
            </h2>
            <p className="text-blue-300 text-sm font-light max-w-sm mx-auto mb-8 leading-relaxed" style={{ fontFamily: "Lato, sans-serif" }}>
              Our team is passionate about paper. Let us help you find the perfect piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                className="bg-white text-blue-950 text-xs font-bold tracking-widest uppercase px-7 py-3.5 rounded transition-colors duration-200 hover:bg-blue-50 cursor-pointer"
                style={{ fontFamily: "Lato, sans-serif", border: "none" }}
              >
                View All Products
              </button>
              <button
                className="text-blue-300 text-xs font-bold tracking-widest uppercase px-7 py-3.5 rounded border border-blue-400 border-opacity-40 bg-transparent transition-all duration-200 hover:border-blue-300 hover:text-white cursor-pointer"
                style={{ fontFamily: "Lato, sans-serif" }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}