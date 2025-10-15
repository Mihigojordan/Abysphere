import React, { useState } from 'react';
import {
  Search,
  Calendar,
  User,
  Clock,
  Share2,
  ArrowRight,
  Eye,
  Heart,
  BookOpen
} from 'lucide-react';
import { blogs } from '../../../store/Blogs';
import { useNavigate } from 'react-router-dom';
import image2 from '../../../assets/image2.jpg'

// Type definitions
interface BlogPost {
  id: string | number;
  title: string;
  excerpt: string;
  category: string;
  featured: boolean;
  image: string;
  author: string;
  authorRole: string;
  publishDate: string;
  readTime: string;
  views: number;
  likes: number;
  tags: string[];
}

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 3;

  const categories: string[] = [
    'All',
    'HR Best Practices',
    'Employee Engagement',
    'Remote Work',
    'Leadership',
    'Analytics'
  ];

  const blogPosts: BlogPost[] = blogs;
  const navigate = useNavigate();

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const popularTags: string[] = [
    'HR Best Practices',
    'Employee Engagement',
    'Remote Work',
    'Leadership',
    'Payroll',
    'Compliance',
    'Analytics',
    'Culture',
    'Innovation',
    'Performance'
  ];

  const handleViewMore = (id: string | number) => {
    if (!id) return;
    navigate(`/blogs/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50  to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-56 h-56 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/2 w-24 h-24 bg-gradient-to-r from-secondary-400 to-primary-500 rounded-full opacity-25"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-gray-800">Insights & Knowledge</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-primary-600 to-secondary-500 bg-clip-text text-transparent mb-6">
              Latest Blog Posts
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover insights, best practices, and expert knowledge to help you succeed in the modern workplace.
            </p>
          </div>
        </div>
      </section>

      {/* Main Blog Grid */}
      <section className="relative py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Articles</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
              <span className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{currentPosts.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{filteredPosts.length}</span> articles
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map((post) => (
              <div key={post.id} className="group">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 cursor-pointer border border-white/20">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold line-clamp-1 text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-500">{post.authorRole}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1 hover:text-primary-600 transition-colors cursor-pointer">
                          <Eye className="w-3 h-3" />
                          {post.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 hover:text-secondary-500 transition-colors cursor-pointer">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleViewMore(post.id)}
                        className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Read <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
