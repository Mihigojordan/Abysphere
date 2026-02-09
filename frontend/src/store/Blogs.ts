// --- Type Definitions ---
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishDate: string; // ISO string
  readTime: string;
  category: string;
  image: string;
  views: number;
  likes: number;
  featured: boolean;
  tags: string[];
}

// --- Blog Categories (updated to match Mysystem content) ---
export const blogsCategories: string[] = [
  'All',
  'Stock Management',
  'Inventory Software',
  'Business Growth',
  'Retail & Pharmacy',
  'Restaurant & Bar',
  'Digital Transformation',
  'Multi-Branch Operations'
];

// --- Blog Data (7 new posts for Mysystem - completely replaced) ---
export const blogs: BlogPost[] = [
  {
    id: 1,
    title: "Why Your Business Should Stop Using Excel for Stock Management in 2025",
    excerpt: "Excel is useful, but not for modern inventory management. Discover why Rwandan businesses are losing money and time and how a real stock system solves the problem.",
    author: "Jean Paul Mugisha",
    authorRole: "Founder & CEO, Mysystem",
    publishDate: "2025-11-15",
    readTime: "7 min read",
    category: "Stock Management",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    views: 1850,
    likes: 94,
    featured: true,
    tags: ["stock management Rwanda", "Excel alternatives Rwanda", "business tools Rwanda", "inventory software Kigali"]
  },
  {
    id: 2,
    title: "Top 10 Signs Your Business Needs a Stock Management System Today",
    excerpt: "Learn the warning signs that your shop, supermarket, pharmacy, or restaurant is suffering from stock mismanagement.",
    author: "Claire Uwase",
    authorRole: "Customer Success Lead, Mysystem",
    publishDate: "2025-11-10",
    readTime: "6 min read",
    category: "Inventory Software",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=400&fit=crop",
    views: 2230,
    likes: 112,
    featured: true,
    tags: ["inventory problems Rwanda", "signs stock system", "retail management Rwanda"]
  },
  {
    id: 3,
    title: "How Mysystem Helps Rwandan Businesses Reduce Losses and Increase Profit",
    excerpt: "An article explaining how technology directly increases revenue for SMEs.",
    author: "Emmanuel Nkurunziza",
    authorRole: "Business Development Manager, Mysystem",
    publishDate: "2025-11-05",
    readTime: "8 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
    views: 1970,
    likes: 103,
    featured: true,
    tags: ["SME tools Rwanda", "stock losses Rwanda", "business profitability software Rwanda"]
  },
  {
    id: 4,
    title: "Stock Management for Restaurants & Bars: Why It Matters (and How to Do It Right)",
    excerpt: "A practical guide for restaurants, bars, and cafés who struggle with missing drinks, wasted ingredients, or unbalanced reports.",
    author: "Grace Mukamana",
    authorRole: "Hospitality Solutions Expert, Mysystem",
    publishDate: "2025-10-30",
    readTime: "9 min read",
    category: "Restaurant & Bar",
    image: "https://images.unsplash.com/photo-1517248135467-2c7ed3da9bd9?w=800&h=400&fit=crop",
    views: 2680,
    likes: 138,
    featured: false,
    tags: ["restaurant stock Rwanda", "bar inventory Rwanda", "food cost control Rwanda"]
  },
  {
    id: 5,
    title: "A Complete Guide to Stock Management for Pharmacies in Rwanda",
    excerpt: "Pharmacies require tighter controls, expiry management, and compliance. Here's a full guide.",
    author: "Dr. Olivier Tuyisenge",
    authorRole: "Pharmacy Operations Consultant, Mysystem",
    publishDate: "2025-10-25",
    readTime: "10 min read",
    category: "Retail & Pharmacy",
    image: "https://images.unsplash.com/photo-1551601651-bc50fbb26f49?w=800&h=400&fit=crop",
    views: 3120,
    likes: 156,
    featured: true,
    tags: ["pharmacy stock Rwanda", "medicine expiry tracking", "pharmacy software Rwanda"]
  },
  {
    id: 6,
    title: "Why Multi-Branch Businesses Need a Unified Stock System",
    excerpt: "This article explains why supermarkets, wholesalers, clinics, and retail chains struggle without a centralized system.",
    author: "Patrick Habimana",
    authorRole: "Technical Director, Mysystem",
    publishDate: "2025-10-20",
    readTime: "8 min read",
    category: "Multi-Branch Operations",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
    views: 2490,
    likes: 119,
    featured: false,
    tags: ["multi-branch system Rwanda", "supermarket system Rwanda", "centralized inventory Rwanda"]
  },
  {
    id: 7,
    title: "Digital Transformation for SMEs: Why Inventory Automation Is the First Step",
    excerpt: "Educating business owners about digital growth and the importance of automating operations.",
    author: "Sandrine Iradukunda",
    authorRole: "Digital Transformation Specialist, Mysystem",
    publishDate: "2025-10-15",
    readTime: "9 min read",
    category: "Digital Transformation",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
    views: 2910,
    likes: 142,
    featured: true,
    tags: ["digital transformation Rwanda", "SME software Rwanda", "business automation tool"]
  }
];