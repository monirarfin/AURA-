export interface ClubProfile {
  id: number;
  name: string;
  age: number;
  city: string;
  gender: 'female' | 'male' | 'nonbinary';
  intent: 'Long-term' | 'Casual' | 'Intimate';
  mbti: string;
  elite: boolean;
  stealth: boolean;
  compatibility: number;
  vibeMatch: string;
  bio: string;
  tags: string[];
  gradient: string;
  accent: string;
}

export const CLUBLIST_PROFILES: ClubProfile[] = [
  {
    id: 1,
    name: "Nadia Rahman",
    age: 25,
    city: "Dhaka",
    gender: "female",
    intent: "Long-term",
    mbti: "ENFJ",
    elite: true,
    stealth: false,
    compatibility: 96,
    vibeMatch: "INTJ/ENFJ",
    bio: "Architecture student who paints at midnight and gets lost in old bookshops.",
    tags: ["🎨 Artist", "📚 Bookworm", "☕ Coffee", "🌿 Plant mom", "🎵 Jazz"],
    gradient: "linear-gradient(160deg, #3d0a0a 0%, #6b1a1a 40%, #1a0404 100%)",
    accent: "#c0392b",
  },
  {
    id: 2,
    name: "Tania Sultana",
    age: 27,
    city: "Chittagong",
    gender: "female",
    intent: "Casual",
    mbti: "INFP",
    elite: true,
    stealth: true,
    compatibility: 88,
    vibeMatch: "ENFP/INFP",
    bio: "Photographer chasing golden hour. Part-time poet, full-time dreamer.",
    tags: ["📸 Photographer", "✈️ Wanderlust", "🌙 Night owl", "🍜 Foodie", "🎬 Film"],
    gradient: "linear-gradient(160deg, #0a1a3d 0%, #1a3d6b 40%, #040818 100%)",
    accent: "#3498db",
  },
  {
    id: 3,
    name: "Ruma Akter",
    age: 24,
    city: "Sylhet",
    gender: "female",
    intent: "Intimate",
    mbti: "ENTJ",
    elite: false,
    stealth: false,
    compatibility: 91,
    vibeMatch: "INTJ/ENTJ",
    bio: "Startup founder by night, business strategist by day. Let's debate philosophy.",
    tags: ["💼 CEO", "💃 Dancer", "🍷 Culinary", "🧘 Mindful", "🐾 Dogs"],
    gradient: "linear-gradient(160deg, #0d1a00 0%, #1f3d00 40%, #060a00 100%)",
    accent: "#27ae60",
  },
  {
    id: 4,
    name: "Farida Hossain",
    age: 29,
    city: "Dhaka",
    gender: "female",
    intent: "Long-term",
    mbti: "ISFJ",
    elite: true,
    stealth: false,
    compatibility: 94,
    vibeMatch: "ESTJ/ISFJ",
    bio: "Clinical psychologist. I will absolutely psychoanalyse your preferred coffee order.",
    tags: ["🧠 Psychology", "☕ Coffee", "📖 Reader", "🎻 Violin", "🌺 Garden"],
    gradient: "linear-gradient(160deg, #1a0a3d 0%, #3d1a6b 40%, #0a0418 100%)",
    accent: "#9b59b6",
  },
  {
    id: 5,
    name: "Meher Afsana",
    age: 23,
    city: "Rajshahi",
    gender: "female",
    intent: "Casual",
    mbti: "ESFP",
    elite: false,
    stealth: false,
    compatibility: 82,
    vibeMatch: "INTP/ESFP",
    bio: "Medical student surviving on caffeine and beautiful chaos. Exploring the best biryanis.",
    tags: ["🩺 Medicine", "🍛 Cook", "🎤 Karaoke", "🏊 Swim", "😂 Humor"],
    gradient: "linear-gradient(160deg, #1a0f00 0%, #3d2200 40%, #0a0600 100%)",
    accent: "#e67e22",
  }
];

export interface QuestionType {
  qEn: string;
  qBn: string;
  aEn: string[];
  aBn: string[];
}

export const MBTI_QUESTIONS: QuestionType[] = [
  {
    qEn: "How do you restore your cognitive energy limits?",
    qBn: "আপনি কিভাবে আপনার কগনিティブ এনার্জি রিচার্জ করেন?",
    aEn: ["By socializing with vibrant networks (E)", "By diving into solitary intellectual realms (I)"],
    aBn: ["মানুষের সাথে প্রাণবন্ত আড্ডায় থেকে (E)", "শান্ত নিরিবিলি নিজে একা সময় কাটিয়ে (I)"]
  },
  {
    qEn: "How do you prefer to absorb new dynamic information?",
    qBn: "আপনি নতুন তথ্য কিভাবে গ্রহণ ও প্রসেস করতে পছন্দ করেন?",
    aEn: ["Analyzing facts, details and structures (S)", "Connecting abstractions and cosmic patterns (N)"],
    aBn: ["ফ্যাক্ট, বাস্তব ঘটনা এবং পুঙ্খানুপুঙ্খ বিবরণ দিয়ে (S)", "মৌলিক ধারণা, প্যাটার্ন এবং কল্পনাশক্তি দিয়ে (N)"]
  },
  {
    qEn: "How are your main decisions formulated?",
    qBn: "আপনার দৈনন্দিন জীবনের সিদ্ধান্তগুলো মূলত কিভাবে নেন?",
    aEn: ["Calculating logic and objective metrics (T)", "Sensing gut feedback and deep cultural harmony (F)"],
    aBn: ["লজিক, যুক্তি ও পরিস্থিতি বিশ্লেষণ করে (T)", "ব্যক্তিগত সহানুভূতি ও মানবিক মূল্যবোধ থেকে (F)"]
  },
  {
    qEn: "What is your typical lifestyle architecture?",
    qBn: "আপনার স্বাভাবিক জীবনযাত্রার ধরন কেমন?",
    aEn: ["Strictly planned, structured, and resolved (J)", "Flexible, spontaneous, and adaptive (P)"],
    aBn: ["সুপরিকল্পিত, সুসংগঠিত এবং নিয়মানুগ (J)", "নমনীয়, স্বতঃস্ফূর্ত এবং অবাধ স্বাধীন (P)"]
  }
];
