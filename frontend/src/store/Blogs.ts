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

// --- Blog Categories ---
export const blogsCategories: string[] = [
  'All',
  'Talent Acquisition',
  'Employee Engagement',
  'Performance Management',
  'Workplace Culture',
  'HR Technology',
  'Learning & Development',
  'Compensation & Benefits',
  'HR Strategy'
];

// --- Blog Data ---
export const blogs: BlogPost[] = [
  {
    id: 1,
    title: "Building a Data-Driven Recruitment Strategy in 2025",
    excerpt: "Discover how modern HR teams leverage analytics and AI to streamline hiring processes, reduce time-to-hire, and improve candidate quality.",
    author: "Sarah Mitchell",
    authorRole: "Head of Talent Acquisition",
    publishDate: "2025-10-10",
    readTime: "8 min read",
    category: "Talent Acquisition",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    views: 3450,
    likes: 127,
    featured: true,
    tags: ["Recruitment", "HR Analytics", "AI in HR", "Talent Acquisition"]
  },
  {
    id: 2,
    title: "The Future of Employee Engagement: Beyond Annual Surveys",
    excerpt: "Learn how continuous feedback systems and pulse surveys are revolutionizing how organizations measure and improve employee satisfaction.",
    author: "Michael Chen",
    authorRole: "Employee Experience Manager",
    publishDate: "2025-10-08",
    readTime: "10 min read",
    category: "Employee Engagement",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    views: 2890,
    likes: 98,
    featured: true,
    tags: ["Employee Engagement", "Workplace Culture", "Feedback Systems", "HR Technology"]
  },
  {
    id: 3,
    title: "Implementing OKRs: A Complete Guide for HR Leaders",
    excerpt: "Explore how Objectives and Key Results transform performance management and align individual goals with organizational strategy.",
    author: "Jennifer Rodriguez",
    authorRole: "Performance Management Specialist",
    publishDate: "2025-10-05",
    readTime: "12 min read",
    category: "Performance Management",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    views: 4200,
    likes: 156,
    featured: true,
    tags: ["OKRs", "Performance Management", "Goal Setting", "HR Strategy"]
  },
  {
    id: 4,
    title: "Creating a Thriving Remote Work Culture",
    excerpt: "Practical strategies for building connection, collaboration, and company culture in hybrid and remote work environments.",
    author: "David Park",
    authorRole: "Workplace Culture Director",
    publishDate: "2025-10-02",
    readTime: "9 min read",
    category: "Workplace Culture",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop",
    views: 3150,
    likes: 142,
    featured: false,
    tags: ["Remote Work", "Hybrid Work", "Company Culture", "Team Collaboration"]
  },
  {
    id: 5,
    title: "HR Tech Stack Essentials: Tools Every Modern HR Team Needs",
    excerpt: "A comprehensive overview of must-have HR technologies, from HRIS platforms to employee engagement tools and AI-powered analytics.",
    author: "Amanda Foster",
    authorRole: "HR Technology Consultant",
    publishDate: "2025-09-28",
    readTime: "11 min read",
    category: "HR Technology",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    views: 2650,
    likes: 89,
    featured: false,
    tags: ["HR Technology", "HRIS", "HR Software", "Digital Transformation"]
  },
  {
    id: 6,
    title: "Upskilling Your Workforce: Building a Learning Culture",
    excerpt: "Discover how to create effective learning and development programs that prepare employees for the future of work.",
    author: "Robert Johnson",
    authorRole: "Learning & Development Lead",
    publishDate: "2025-09-25",
    readTime: "10 min read",
    category: "Learning & Development",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop",
    views: 3780,
    likes: 134,
    featured: true,
    tags: ["Learning & Development", "Upskilling", "Training Programs", "Career Development"]
  },
  {
    id: 7,
    title: "Designing Competitive Compensation Packages That Attract Top Talent",
    excerpt: "Explore modern compensation strategies including equity, flexible benefits, and total rewards approaches to win the talent war.",
    author: "Lisa Thompson",
    authorRole: "Compensation & Benefits Director",
    publishDate: "2025-09-20",
    readTime: "13 min read",
    category: "Compensation & Benefits",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    views: 4890,
    likes: 178,
    featured: false,
    tags: ["Compensation", "Benefits", "Total Rewards", "Talent Retention"]
  },
  {
    id: 8,
    title: "The HR Business Partner Model: Driving Strategic Value",
    excerpt: "Learn how HR can transition from administrative function to strategic business partner, influencing organizational success.",
    author: "Marcus Williams",
    authorRole: "Chief People Officer",
    publishDate: "2025-09-15",
    readTime: "14 min read",
    category: "HR Strategy",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
    views: 3920,
    likes: 165,
    featured: false,
    tags: ["HR Strategy", "Business Partnership", "Strategic HR", "Organizational Development"]
  },
  {
    id: 9,
    title: "Mastering the Art of Behavioral Interviewing",
    excerpt: "Expert techniques for conducting effective behavioral interviews that predict future performance and reduce hiring mistakes.",
    author: "Emily Watson",
    authorRole: "Senior Recruiter",
    publishDate: "2025-09-10",
    readTime: "7 min read",
    category: "Talent Acquisition",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop",
    views: 2340,
    likes: 87,
    featured: false,
    tags: ["Interviewing", "Recruitment", "Hiring Best Practices", "Talent Assessment"]
  },
  {
    id: 10,
    title: "Preventing Burnout: Wellness Programs That Actually Work",
    excerpt: "Evidence-based approaches to employee wellness that go beyond gym memberships to create genuinely supportive work environments.",
    author: "Dr. Patricia Kumar",
    authorRole: "Workplace Wellness Specialist",
    publishDate: "2025-09-05",
    readTime: "11 min read",
    category: "Employee Engagement",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=400&fit=crop",
    views: 5120,
    likes: 201,
    featured: true,
    tags: ["Employee Wellness", "Burnout Prevention", "Mental Health", "Work-Life Balance"]
  },
  {
    id: 11,
    title: "Succession Planning: Preparing Your Organization for the Future",
    excerpt: "Strategic frameworks for identifying and developing future leaders to ensure organizational continuity and growth.",
    author: "Thomas Anderson",
    authorRole: "Talent Development Manager",
    publishDate: "2025-08-30",
    readTime: "15 min read",
    category: "HR Strategy",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&h=400&fit=crop",
    views: 2780,
    likes: 112,
    featured: false,
    tags: ["Succession Planning", "Leadership Development", "Talent Pipeline", "Organizational Planning"]
  },
  {
    id: 12,
    title: "Diversity, Equity & Inclusion: From Policy to Practice",
    excerpt: "Actionable strategies for building truly inclusive workplaces where all employees can thrive and contribute their best work.",
    author: "Maya Patel",
    authorRole: "DEI Director",
    publishDate: "2025-08-25",
    readTime: "12 min read",
    category: "Workplace Culture",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=400&fit=crop",
    views: 4560,
    likes: 189,
    featured: true,
    tags: ["DEI", "Inclusion", "Diversity", "Workplace Culture"]
  }
];