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
    title: "Modern Recruitment in Rwanda: Data-Driven Hiring for 2025",
    excerpt: "How Rwandan companies are using analytics, psychometric assessments, and digital platforms to attract the right talent faster and smarter.",
    author: "Innocent Uwase",
    authorRole: "Head of Talent & Strategy, Abyshere",
    publishDate: "2025-10-10",
    readTime: "8 min read",
    category: "Talent Acquisition",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    views: 3420,
    likes: 122,
    featured: true,
    tags: ["Recruitment", "HR Analytics", "Digital HR", "Talent Acquisition"]
  },
  {
    id: 2,
    title: "Employee Engagement in Africa’s Growing Workplaces",
    excerpt: "Why employee voice, well-being, and purpose are reshaping how Rwandan organizations engage their people beyond traditional surveys.",
    author: "Diane Umutoni",
    authorRole: "Employee Experience Consultant, Abyshere",
    publishDate: "2025-10-08",
    readTime: "9 min read",
    category: "Employee Engagement",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    views: 2895,
    likes: 104,
    featured: true,
    tags: ["Employee Engagement", "Culture", "People Analytics", "Feedback Systems"]
  },
  {
    id: 3,
    title: "Aligning People with Goals: OKRs for African HR Leaders",
    excerpt: "Discover how Abyshere helps Rwandan organizations use OKRs to connect employee performance with strategic growth outcomes.",
    author: "Eric Ndayishimiye",
    authorRole: "Performance Management Specialist, Abyshere",
    publishDate: "2025-10-05",
    readTime: "11 min read",
    category: "Performance Management",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    views: 4020,
    likes: 151,
    featured: true,
    tags: ["OKRs", "Performance", "Goal Setting", "HR Strategy"]
  },
  {
    id: 4,
    title: "Building a Connected Remote Culture in Rwanda",
    excerpt: "As hybrid work grows, here’s how organizations can sustain collaboration, culture, and accountability across teams in Rwanda.",
    author: "Alice Uwimana",
    authorRole: "Workplace Culture Director, Abyshere",
    publishDate: "2025-10-02",
    readTime: "8 min read",
    category: "Workplace Culture",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop",
    views: 3100,
    likes: 138,
    featured: false,
    tags: ["Remote Work", "Culture", "Hybrid Work", "Collaboration"]
  },
  {
    id: 5,
    title: "Top HR Tech Tools Transforming Rwandan Workplaces",
    excerpt: "From payroll automation to e-learning systems — a look at the digital tools redefining HR efficiency in Rwanda’s modern businesses.",
    author: "Jean-Claude Mugisha",
    authorRole: "HR Technology Consultant, Abyshere",
    publishDate: "2025-09-28",
    readTime: "10 min read",
    category: "HR Technology",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    views: 2620,
    likes: 92,
    featured: false,
    tags: ["HR Tech", "Automation", "Digital Transformation", "HRIS"]
  },
  {
    id: 6,
    title: "Upskilling Rwanda’s Workforce for the Future",
    excerpt: "Practical strategies to build a continuous learning culture that keeps employees adaptable, innovative, and future-ready.",
    author: "Sandrine Mukamana",
    authorRole: "Learning & Development Lead, Abyshere",
    publishDate: "2025-09-25",
    readTime: "10 min read",
    category: "Learning & Development",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop",
    views: 3795,
    likes: 130,
    featured: true,
    tags: ["Learning", "Upskilling", "Career Growth", "Development"]
  },
  {
    id: 7,
    title: "Designing Fair Compensation Packages in Rwanda",
    excerpt: "How transparent pay structures and total rewards programs help organizations attract, retain, and motivate their people.",
    author: "Ange Tuyishime",
    authorRole: "Compensation & Benefits Consultant, Abyshere",
    publishDate: "2025-09-20",
    readTime: "12 min read",
    category: "Compensation & Benefits",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    views: 4800,
    likes: 171,
    featured: false,
    tags: ["Compensation", "Benefits", "Pay Equity", "Retention"]
  },
  {
    id: 8,
    title: "Strategic HR in Rwanda: The Business Partner Model Explained",
    excerpt: "Learn how HR leaders are evolving from administrators to strategic business partners driving organizational transformation.",
    author: "Jean Pierre Nkurunziza",
    authorRole: "Chief People Officer, Abyshere",
    publishDate: "2025-09-15",
    readTime: "13 min read",
    category: "HR Strategy",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
    views: 3850,
    likes: 159,
    featured: false,
    tags: ["HR Strategy", "Leadership", "Business Partnership", "Transformation"]
  },
  {
    id: 9,
    title: "Mastering Behavioral Interviews in the East African Context",
    excerpt: "Abyshere’s best practices for conducting interviews that reveal true candidate potential and cultural alignment.",
    author: "Claudine Habimana",
    authorRole: "Senior Recruiter, Abyshere",
    publishDate: "2025-09-10",
    readTime: "7 min read",
    category: "Talent Acquisition",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop",
    views: 2390,
    likes: 91,
    featured: false,
    tags: ["Recruitment", "Interviewing", "Assessment", "Talent"]
  },
  {
    id: 10,
    title: "Employee Wellness That Works: Combating Burnout in Kigali",
    excerpt: "Practical wellness initiatives that go beyond gym memberships — focusing on mental health, flexibility, and workplace balance.",
    author: "Dr. Grace Niyonsenga",
    authorRole: "Workplace Wellness Specialist, Abyshere",
    publishDate: "2025-09-05",
    readTime: "10 min read",
    category: "Employee Engagement",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=400&fit=crop",
    views: 5180,
    likes: 208,
    featured: true,
    tags: ["Wellness", "Burnout", "Mental Health", "Work-Life Balance"]
  },
  {
    id: 11,
    title: "Succession Planning for Rwandan Organizations",
    excerpt: "Why preparing future leaders today is key to long-term sustainability and growth in the Rwandan business ecosystem.",
    author: "Patrick Habiyaremye",
    authorRole: "Talent Development Manager, Abyshere",
    publishDate: "2025-08-30",
    readTime: "14 min read",
    category: "HR Strategy",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&h=400&fit=crop",
    views: 2810,
    likes: 117,
    featured: false,
    tags: ["Succession", "Leadership", "Talent Pipeline", "Future Planning"]
  },
  {
    id: 12,
    title: "Diversity & Inclusion in the Modern Rwandan Workplace",
    excerpt: "How to move beyond compliance and foster a culture of respect, equality, and collaboration across diverse teams.",
    author: "Belinda Iradukunda",
    authorRole: "DEI Specialist, Abyshere",
    publishDate: "2025-08-25",
    readTime: "11 min read",
    category: "Workplace Culture",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=400&fit=crop",
    views: 4490,
    likes: 182,
    featured: true,
    tags: ["DEI", "Inclusion", "Diversity", "Culture"]
  }
];
