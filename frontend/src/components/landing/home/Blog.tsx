import React from 'react';
import { User } from 'lucide-react';
import { blogs } from '../../../store/Blogs';
import { useNavigate } from 'react-router-dom';

// Import your blog data


export default function FeaturedNewsSection() {
  const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase();
  };

  // Get 1 featured post + 3 other posts (prioritize featured ones)
  const featuredPost = blogs.find(post => post.featured);
  const otherFeaturedPosts = blogs
    .filter(post => post.featured && post.id !== featuredPost?.id)
    .slice(0, 2);
  const nonFeaturedPosts = blogs
    .filter(post => !post.featured)
    .slice(0, 1);
  
  const otherPosts = [...otherFeaturedPosts, ...nonFeaturedPosts].slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 lg:px-16">
      <div className=" mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-teal-700 text-sm font-semibold mb-4">
            <span className="text-teal-600">✓</span>
            <span>NEWS & UPDATES</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Featured News and Insights
          </h2>
          <p className="text-gray-600 text-lg">
            Empower your employees to achieve more—today and tomorrow
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Post - Left Large Card */}
          {featuredPost && (
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {featuredPost.author}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(featuredPost.publishDate)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  {featuredPost.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <button 
                onClick={()=> navigate(`/blogs/${featuredPost.id}`)}
                className="text-teal-600 font-semibold text-sm hover:text-teal-700 border-b-2 border-teal-600 hover:border-teal-700 transition-colors">
                  READ MORE
                </button>
              </div>
            </div>
          )}

          {/* Right Column - Three Smaller Cards */}
          <div className="space-y-8">
            {otherPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex gap-6 p-6"
              >
                <div className="w-48 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {post.author}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(post.publishDate)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <button 
                  onClick={()=> navigate(`/blogs/${post.id}`)}
                  className="text-teal-600 font-semibold text-xs hover:text-teal-700 border-b-2 border-teal-600 hover:border-teal-700 transition-colors self-start">
                    READ MORE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}