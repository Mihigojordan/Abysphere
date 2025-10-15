import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  User,
  Clock,
  Tag,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  ChevronRight,
  Star
} from 'lucide-react';

import { blogs } from '../../store/Blogs';
import HeaderBanner from './HeaderBanner';


// Define interfaces
interface Blog {
  id: number;
  title: string;
  image: string;
  category: string;
  author: string;
  authorRole: string;
  publishDate: string; // ISO date string or similar
  readTime: string;
  views: number;
  likes: number;
  excerpt: string;
  tags: string[];
}

interface HeaderBannerProps {
  title: string;
  subtitle: string;
  backgroundStyle: 'image' | string; // Adjust based on actual HeaderBanner props
  icon: React.ReactNode;
}

const BlogViewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);

  useEffect(() => {
    // Find the current blog
    const currentBlog = blogs.find((b:Blog) => b.id === parseInt(id || '0'));
    setBlog(currentBlog ?? null);
    
    if (currentBlog) {
      setLikes(currentBlog.likes);
      
      // Get latest blogs excluding the current one
      const filteredBlogs = blogs
        .filter((b:Blog) => b.id !== parseInt(id || '0'))
        .sort((a:Blog, b:Blog) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        .slice(0, 5);
      
      setLatestBlogs(filteredBlogs);
    }
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'copy') => {
    const url = window.location.href;
    const title = blog?.title || '';
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    } else {
      window.open(shareUrls[platform], '_blank');
    }
  };

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
          <Link 
            to="/blogs" 
            className="text-primary-600 hover:text-primary-700 font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
      </div>

      <HeaderBanner
        title="Blog Details"
        subtitle="Home / Blogs / Article"
        backgroundStyle="image"
        icon={<MessageSquare className="w-10 h-10" />}
      />

      <div className="py-12 relative">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Back Button */}
              <Link 
                to="/blogs"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blogs
              </Link>

              {/* Main Article */}
              <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Hero Image */}
                <div className="relative">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {blog.category}
                    </span>
                  </div>
                </div>

                {/* Article Header */}
                <div className="p-8">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {blog.title}
                  </h1>

                  {/* Author Info */}
                  <div className="flex flex-wrap items-center justify-between mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{blog.author}</p>
                        <p className="text-sm text-gray-600">{blog.authorRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.publishDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {blog.readTime}
                      </span>
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {blog.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="prose prose-lg max-w-none mb-8">
                    <div className="text-xl text-gray-700 font-medium mb-6 leading-relaxed">
                      {blog.excerpt}
                    </div>
                    
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                      <p>
                        In today's rapidly evolving workplace, organizations are constantly seeking innovative approaches to enhance productivity, employee satisfaction, and overall business performance. This comprehensive guide explores cutting-edge strategies and proven methodologies that can transform your HR practices.
                      </p>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Implementation Strategies</h2>
                      
                      <p>
                        The foundation of successful HR transformation lies in understanding both the current landscape and future trends. By implementing data-driven approaches and focusing on employee-centric solutions, organizations can create sustainable competitive advantages.
                      </p>
                      
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Develop comprehensive onboarding programs that engage employees from day one</li>
                        <li>Implement performance management systems that focus on growth and development</li>
                        <li>Create flexible work arrangements that accommodate diverse employee needs</li>
                        <li>Establish clear communication channels that promote transparency and collaboration</li>
                      </ul>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Measuring Success</h2>
                      
                      <p>
                        Effective measurement is crucial for understanding the impact of your HR initiatives. Key performance indicators should align with both organizational goals and employee satisfaction metrics.
                      </p>
                      
                      <blockquote className="border-l-4 border-primary-600 pl-6 italic text-lg text-gray-800 my-8">
                        "The best HR strategies are those that create value for both the organization and its employees, fostering an environment where everyone can thrive and contribute to shared success."
                      </blockquote>
                      
                      <p>
                        As we move forward, the integration of technology and human-centered approaches will continue to shape the future of HR. Organizations that embrace these changes while maintaining focus on their core values will be best positioned for long-term success.
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm cursor-pointer hover:bg-primary-200 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Actions */}
                  <div className="flex flex-wrap items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          isLiked 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        {likes}
                      </button>

                      <button
                        onClick={handleBookmark}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          isBookmarked 
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        {isBookmarked ? 'Saved' : 'Save'}
                      </button>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-700 mr-2">Share:</span>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Latest Blogs */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Latest Articles</h3>
                  <div className="space-y-4">
                    {latestBlogs.map((latestBlog) => (
                      <Link
                        key={latestBlog.id}
                        to={`/blogs/${latestBlog.id}`}
                        className="block group hover:bg-gray-50 p-4 rounded-lg transition-colors"
                      >
                        <div className="flex space-x-4">
                          <img
                            src={latestBlog.image}
                            alt={latestBlog.title}
                            className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {latestBlog.title}
                            </h4>
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(latestBlog.publishDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {latestBlog.readTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link
                    to="/blogs"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mt-4 text-sm"
                  >
                    View All Articles
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Popular Tags */}
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {["HR Best Practices", "Employee Engagement", "Remote Work", "Leadership", "Payroll", "Compliance"].map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm cursor-pointer hover:bg-primary-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
                  <p className="text-primary-100 text-sm mb-4">Get the latest HR insights delivered to your inbox weekly.</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-300"
                    />
                    <button className="w-full bg-white text-primary-600 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogViewPage;