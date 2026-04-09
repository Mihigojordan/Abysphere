import React from 'react';
import {
  ShoppingBag, Star, Filter, Search, Heart, Eye,
  ChevronRight, Tag, Truck, Shield, RotateCcw,
} from 'lucide-react';

const categories = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];

const products = [
  { id: 1, name: 'Premium Wireless Headphones', price: 129.99, originalPrice: 179.99, rating: 4.8, reviews: 324, category: 'Electronics', badge: 'Sale', color: 'from-violet-500 to-purple-600' },
  { id: 2, name: 'Ergonomic Office Chair', price: 349.00, originalPrice: 499.00, rating: 4.6, reviews: 187, category: 'Home & Garden', badge: 'Hot', color: 'from-orange-400 to-red-500' },
  { id: 3, name: 'Running Shoes Pro', price: 89.99, originalPrice: 120.00, rating: 4.7, reviews: 512, category: 'Sports', badge: 'New', color: 'from-emerald-400 to-teal-600' },
  { id: 4, name: 'Smart Watch Series X', price: 299.00, originalPrice: 399.00, rating: 4.9, reviews: 891, category: 'Electronics', badge: 'Sale', color: 'from-blue-500 to-indigo-600' },
  { id: 5, name: 'Linen Summer Dress', price: 59.99, originalPrice: 85.00, rating: 4.5, reviews: 260, category: 'Clothing', badge: '', color: 'from-pink-400 to-rose-500' },
  { id: 6, name: 'The Art of UX Design', price: 24.99, originalPrice: 34.99, rating: 4.8, reviews: 145, category: 'Books', badge: 'New', color: 'from-amber-400 to-yellow-500' },
];

const ProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [wishlist, setWishlist] = React.useState<number[]>([]);

  const filtered = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const toggleWishlist = (id: number) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Tag size={14} /> Up to 40% off selected items
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Our Products</h1>
          <p className="text-primary-100 text-lg max-w-xl mx-auto">
            Discover our curated collection of premium products, handpicked for quality and style.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white shadow-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
          {[
            { icon: <Truck size={16} />, text: 'Free Shipping over $50' },
            { icon: <Shield size={16} />, text: 'Secure Payments' },
            { icon: <RotateCcw size={16} />, text: '30-Day Returns' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 font-medium">
              <span className="text-primary-600">{b.icon}</span> {b.text}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-gray-500" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400 hover:text-primary-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">{filtered.length} products found</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(product => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            const inWishlist = wishlist.includes(product.id);
            return (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">

                {/* Image placeholder */}
                <div className={`relative h-52 bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                  <ShoppingBag size={52} className="text-white/70" />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-white text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    -{discount}%
                  </span>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-2.5 rounded-full shadow-lg transition-all duration-200 ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'}`}
                    >
                      <Heart size={16} />
                    </button>
                    <button className="p-2.5 bg-white text-gray-700 rounded-full shadow-lg hover:bg-primary-600 hover:text-white transition-all duration-200">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wide">{product.category}</p>
                  <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-1">{product.name}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{product.rating} ({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-gray-800">${product.price.toFixed(2)}</span>
                      <span className="ml-2 text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    </div>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-95 transition-all duration-200 flex items-center gap-1">
                      Add <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
