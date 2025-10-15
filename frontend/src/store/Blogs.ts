// --- Type Definitions ---
import img1 from '../assets/images/fish1.jpg';
import img2 from '../assets/images/fish2.jpg';
import img3 from '../assets/images/fish3.jpg';
import img4 from '../assets/images/fish4.jpg';
import img5 from '../assets/images/fish5.jpg';
import img6 from '../assets/images/fish6.jpg';
import img7 from '../assets/images/fish7.jpg';
import img8 from '../assets/images/fish8.jpg';
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


// --- Blog Categories ---
export const blogsCategories: string[] = [
  'All',
  'Sustainable Farming',
  'Fingerling Production',
  'Community Empowerment',
  'Technical Support',
  'Environmental Sustainability',
  'Aquaculture Innovation',
  'Farmer Training'
];

// --- Blog Data ---
export const blogs: BlogPost[] = [
  {
    id: 1,
    title: "Sustainable Tilapia Farming on Lake Kivu",
    excerpt: "Discover how Fine Fish Ltd pioneers eco-friendly cage farming to produce premium tilapia while preserving Lake Kivu’s ecosystem.",
    author: "Themistocle Munyangeyo",
    authorRole: "Founder & CEO",
    publishDate: "2025-08-10",
    readTime: "8 min read",
    category: "Sustainable Farming",
    image: "https://images.unsplash.com/photo-1568727349458-1bb59fb3fb63?w=800&h=400&fit=crop",
    views: 2450,
    likes: 89,
    featured: true,
    tags: ["Tilapia Farming", "Lake Kivu", "Sustainability", "Cage Farming"]
  },
  {
    id: 2,
    title: "Scaling Fingerling Production at Rwamagana Hatchery",
    excerpt: "Learn how Fine Fish Ltd’s Rwamagana hatchery supplies millions of healthy fingerlings to farmers across Rwanda, boosting aquaculture growth.",
    author: "Jane Mukamana",
    authorRole: "Hatchery Manager",
    publishDate: "2025-08-08",
    readTime: "12 min read",
    category: "Fingerling Production",
    image: img5,
    views: 1890,
    likes: 67,
    featured: true,
    tags: ["Fingerlings", "Hatchery", "Aquaculture", "Rwamagana"]
  },
  {
    id: 3,
    title: "Partnering for Progress: Fine Fish Ltd and Rwanda Agriculture Board",
    excerpt: "Explore our collaboration with Rwanda Agriculture Board to advance sustainable aquaculture and support Rwanda’s Vision 2050.",
    author: "Grace Uwimana",
    authorRole: "Partnership Coordinator",
    publishDate: "2025-08-06",
    readTime: "15 min read",
    category: "Aquaculture Innovation",
    image: img4,
    views: 3200,
    likes: 124,
    featured: false,
    tags: ["Partnerships", "Rwanda Agriculture Board", "Vision 2050", "Innovation"]
  },
  {
    id: 4,
    title: "Empowering Youth Through Aquaculture Training",
    excerpt: "Our partnership with Karongi TVET equips young Rwandans with skills for sustainable tilapia farming, fostering community growth.",
    author: "David Nkurunziza",
    authorRole: "Training Coordinator",
    publishDate: "2025-08-04",
    readTime: "10 min read",
    category: "Farmer Training",
    image: img7,
    views: 1560,
    likes: 78,
    featured: false,
    tags: ["Farmer Training", "Youth Empowerment", "Karongi TVET", "Community"]
  },
  {
    id: 5,
    title: "Optimizing Cage Farming with Technical Support",
    excerpt: "Learn how Fine Fish Ltd provides expert technical support to farmers for efficient and sustainable tilapia production on Lake Kivu.",
    author: "Anne Ingabire",
    authorRole: "Technical Lead",
    publishDate: "2025-08-02",
    readTime: "7 min read",
    category: "Technical Support",
    image: "https://images.unsplash.com/photo-1628859742240-269783f56d17?w=800&h=400&fit=crop",
    views: 2100,
    likes: 95,
    featured: false,
    tags: ["Technical Support", "Cage Farming", "Tilapia Production", "Efficiency"]
  },
  {
    id: 6,
    title: "Protecting Lake Kivu: Our Commitment to Water Quality",
    excerpt: "Discover how Fine Fish Ltd monitors water quality to ensure sustainable aquaculture and preserve Rwanda’s lakes for future generations.",
    author: "Dr. James Tuyishime",
    authorRole: "Environmental Specialist",
    publishDate: "2025-07-30",
    readTime: "14 min read",
    category: "Environmental Sustainability",
    image: img8,
    views: 4200,
    likes: 156,
    featured: true,
    tags: ["Water Quality", "Sustainability", "Lake Kivu", "Environment"]
  },
  {
    id: 7,
    title: "Building Strong Farmer Cooperatives in Rwanda",
    excerpt: "Fine Fish Ltd supports farmer cooperatives to enhance community resilience and drive economic growth in aquaculture.",
    author: "Patricia Nyirahuku",
    authorRole: "Community Liaison",
    publishDate: "2025-07-28",
    readTime: "11 min read",
    category: "Community Empowerment",
    image: "https://images.unsplash.com/photo-1574491822372-ad5cef67a454?w=800&h=400&fit=crop",
    views: 1780,
    likes: 82,
    featured: false,
    tags: ["Farmer Cooperatives", "Community Empowerment", "Economic Growth", "Rwanda"]
  },
  {
    id: 8,
    title: "Innovations in Tilapia Feed for Sustainable Production",
    excerpt: "Explore how Fine Fish Ltd develops eco-friendly feed solutions to improve tilapia growth and reduce environmental impact.",
    author: "Emmanuel Nkurunziza",
    authorRole: "Feed Development Specialist",
    publishDate: "2025-07-26",
    readTime: "13 min read",
    category: "Aquaculture Innovation",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    views: 2890,
    likes: 134,
    featured: false,
    tags: ["Tilapia Feed", "Innovation", "Sustainability", "Aquaculture"]
  }
];