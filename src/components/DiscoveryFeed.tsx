import React, { useState } from 'react';
import { UserProfile, Conversation, UserTier } from '../types';
import { calculateMatchScore } from '../utils/mbtiMatcher';
import { Heart, X, Sparkles, MapPin, RefreshCw, Award, Shield, Zap, Info, ChevronRight, Activity, Cpu, MessageSquare, ShieldAlert, Star } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { audioEngine } from '../utils/audio';

interface DiscoveryFeedProps {
  currentUser: UserProfile;
  candidates: UserProfile[];
  onSwipeLiked: (candidate: UserProfile) => void;
  onSwipeSkipped: (candidate: UserProfile) => void;
  soundEnabled?: boolean;
  conversations?: Conversation[];
  onUpdateCurrentUser?: (updated: UserProfile) => void;
  onNavigateToBlindRoom?: () => void;
}

interface InteractiveCardProps {
  key?: string;
  candidate: UserProfile;
  currentUser: UserProfile;
  score: number;
  onSwipe: (liked: boolean) => void;
  isActive: boolean;
  onExpand: () => void;
  isBangla?: boolean;
}

/**
 * Helper to retrieve MBTI cognitive stacks
 */
function getCognitiveStack(mbti: string): string[] {
  const stacks: Record<string, string[]> = {
    'INTJ': ['Ni (Introverted Intuition)', 'Te (Extraverted Thinking)', 'Fi (Introverted Feeling)', 'Se (Extraverted Sensing)'],
    'INFJ': ['Ni (Introverted Intuition)', 'Fe (Extraverted Feeling)', 'Ti (Introverted Thinking)', 'Se (Extraverted Sensing)'],
    'INTP': ['Ti (Introverted Thinking)', 'Ne (Extraverted Intuition)', 'Si (Introverted Sensing)', 'Fe (Extraverted Feeling)'],
    'INFP': ['Fi (Introverted Feeling)', 'Ne (Extraverted Intuition)', 'Si (Introverted Sensing)', 'Te (Extraverted Thinking)'],
    'ENTJ': ['Te (Extraverted Thinking)', 'Ni (Introverted Intuition)', 'Se (Extraverted Sensing)', 'Fi (Introverted Feeling)'],
    'ENFJ': ['Fe (Extraverted Feeling)', 'Ni (Introverted Intuition)', 'Se (Extraverted Sensing)', 'Ti (Introverted Thinking)'],
    'ENTP': ['Ne (Extraverted Intuition)', 'Ti (Introverted Thinking)', 'Fe (Extraverted Feeling)', 'Si (Introverted Sensing)'],
    'ENFP': ['Ne (Extraverted Intuition)', 'Fi (Introverted Feeling)', 'Te (Extraverted Thinking)', 'Si (Introverted Sensing)'],
    'ISTJ': ['Si (Introverted Sensing)', 'Te (Extraverted Thinking)', 'Fi (Introverted Feeling)', 'Ne (Extraverted Intuition)'],
    'ISFJ': ['Si (Introverted Sensing)', 'Fe (Extraverted Feeling)', 'Ti (Introverted Thinking)', 'Ne (Extraverted Intuition)'],
    'ESTJ': ['Te (Extraverted Thinking)', 'Si (Introverted Sensing)', 'Ne (Extraverted Intuition)', 'Fi (Introverted Feeling)'],
    'ESFJ': ['Fe (Extraverted Feeling)', 'Si (Introverted Sensing)', 'Ne (Extraverted Intuition)', 'Ti (Introverted Thinking)'],
    'ISTP': ['Ti (Introverted Thinking)', 'Se (Extraverted Sensing)', 'Ni (Introverted Intuition)', 'Fe (Extraverted Feeling)'],
    'ISFP': ['Fi (Introverted Feeling)', 'Se (Extraverted Sensing)', 'Ni (Introverted Intuition)', 'Te (Extraverted Thinking)'],
    'ESTP': ['Se (Extraverted Sensing)', 'Ti (Introverted Thinking)', 'Fe (Extraverted Feeling)', 'Ni (Introverted Intuition)'],
    'ESFP': ['Se (Extraverted Sensing)', 'Fi (Introverted Feeling)', 'Te (Extraverted Thinking)', 'Ni (Introverted Intuition)'],
  };
  return stacks[mbti.toUpperCase()] || ['Dominant Function', 'Auxiliary Function', 'Tertiary Function', 'Inferior Function'];
}

/**
 * Helper to retrieve trait values for radar chart based on profile MBTI
 */
function getTraits(mbti: string): { name: string; value: number }[] {
  const m = mbti.toUpperCase().trim();
  return [
    { name: 'Extraversion', value: m[0] === 'E' ? 90 : 35 },
    { name: 'Intuition', value: m[1] === 'N' ? 90 : 40 },
    { name: 'Logic', value: m[2] === 'T' ? 95 : 35 },
    { name: 'Structure', value: m[3] === 'J' ? 85 : 45 },
    { name: 'Harmony', value: (m[2] === 'F' || m[1] === 'F') ? 90 : 50 },
  ];
}

/**
 * Visual localization component to represent geo proximity without external map modules
 */
const AuraSafeNodeMap = ({ location, candidateName, isBangla = false }: { location: string; candidateName: string; isBangla?: boolean }) => {
  // Generate deterministic coordinates based on candidate's variables
  const lat = (34.0522 + (candidateName.length % 5) * 0.014).toFixed(4);
  const lng = (-118.2437 - (candidateName.charCodeAt(0) % 5) * 0.019).toFixed(4);
  const distance = (0.8 + (candidateName.length % 7) * 0.9).toFixed(1);

  const tNode = (en: string, bn: string) => {
    return isBangla ? bn : en;
  };

  return (
    <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 space-y-3 relative overflow-hidden">
      <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#c5a059] animate-pulse" />
          <span>{tNode("AURA LOCATOR HYPER-NODE", "আউরা স্থান নির্ণায়ক রাডার")}</span>
        </span>
        <span className="text-[#c5a059]">{tNode("COORDS", "স্থানাঙ্ক")}: [{lat}, {lng}]</span>
      </div>

      {/* Styled Radar Screen */}
      <div className="h-36 bg-[#040406] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
        {/* Grid lines overlay */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-40">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/[0.04]" />
          ))}
        </div>

        {/* Radar grids */}
        <div className="absolute w-28 h-28 rounded-full border border-white/[0.03] animate-pulse" />
        <div className="absolute w-20 h-20 rounded-full border border-[#c5a059]/10" />
        <div className="absolute w-10 h-10 rounded-full border border-white/[0.05]" />

        {/* Reticles */}
        <div className="absolute h-full w-[1px] bg-white/[0.03]" />
        <div className="absolute w-full h-[1px] bg-white/[0.03]" />

        {/* Dynamic Target Point */}
        <div className="absolute top-[38%] left-[64%] flex items-center justify-center z-10">
          <span className="absolute inline-flex h-8 w-8 rounded-full bg-emerald-400/10 animate-ping" />
          <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-500/20" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-[#c5a059] shadow-[0_0_12px_#c5a059] border border-white/30" />
          
          <div className="absolute left-5 top-0 bg-black/95 px-2 py-0.5 rounded-md text-[9px] font-mono text-[#c5a059] border border-[#c5a059]/35 whitespace-nowrap shadow-md">
            {distance} {tNode("km away", "কিমি দূরে")}
          </div>
        </div>
        
        {/* Outer radial scan sweep animation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#c5a059]/3 to-transparent rotate-45 animate-[spin_8s_linear_infinite] pointer-events-none" />
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
        <span>{tNode("GRID RANGE", "আশেপাশে/অঞ্চল")}: <strong className="text-white">{location}</strong></span>
        <span>{tNode("NODE LINK", "সংযোগ")}: <strong className="text-emerald-400 font-bold">{tNode("STABLE SECURE", "সুরক্ষিত ও সক্রিয়")}</strong></span>
      </div>
    </div>
  );
};

const InteractiveCard = ({
  candidate,
  currentUser,
  score,
  onSwipe,
  isActive,
  onExpand,
  isBangla = false
}: InteractiveCardProps) => {
  const [isSwipingOut, setIsSwipingOut] = useState(false);
  const [swipeSide, setSwipeSide] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // High-fidelity dynamic rotation and fading physics
  const rotate = useTransform(x, [-250, 250], [-20, 20]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0.6, 0.9, 1, 0.9, 0.6]);

  // Swipe Stamp interactive indicator levels
  const vibeOpacity = useTransform(x, [0, 90], [0, 1]);
  const skipOpacity = useTransform(x, [-90, 0], [1, 0]);

  const handleDragEnd = (_event: any, info: any) => {
    if (!isActive || isSwipingOut) return;
    const threshold = 120; // responsive snappier swipe trigger for Gen-Z speed

    if (info.offset.x > threshold) {
      setIsSwipingOut(true);
      setSwipeSide('right');
      setTimeout(() => onSwipe(true), 150);
    } else if (info.offset.x < -threshold) {
      setIsSwipingOut(true);
      setSwipeSide('left');
      setTimeout(() => onSwipe(false), 150);
    }
  };

  const badgeTierStyle = (tier: string) => {
    switch (tier) {
      case 'Elite':
        return 'border-[#c5a059]/40 text-[#c5a059] font-bold bg-[#c5a059]/10 shadow-[0_0_12px_rgba(197,160,89,0.1)]';
      case 'Standard':
        return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
      case 'Basic':
        return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
      default:
        return 'border-white/10 text-white/50 bg-white/5';
    }
  };

  const tCard = (en: string, bn: string) => {
    return isBangla ? bn : en;
  };

  return (
    <motion.div
      style={isActive ? { x, y, rotate, opacity } : {}}
      drag={isActive && !isSwipingOut ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={
        isSwipingOut
          ? { x: swipeSide === 'right' ? 600 : -600, rotate: swipeSide === 'right' ? 30 : -30, opacity: 0 }
          : { x: 0, scale: isActive ? 1 : 0.94, y: isActive ? 0 : 14, opacity: isActive ? 1 : 0.5 }
      }
      transition={{ type: "spring", stiffness: 450, damping: 28 }}
      className={`absolute inset-0 bg-[#09090b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col select-none ${
        isActive ? 'z-10 cursor-grab active:cursor-grabbing' : 'z-0 pointer-events-none'
      }`}
    >
      {/* Background Image with modern filters */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
        <img
          src={candidate.avatar}
          alt={candidate.name}
          className="w-full h-full object-cover select-none pointer-events-none transition-all duration-700 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic shadows of background depth */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />
      </div>

      {/* Swipe Feedback Stamps (High contrast modern designs) */}
      {isActive && (
        <>
          <motion.div
            style={{ opacity: vibeOpacity }}
            className="absolute top-24 left-8 border-4 border-[#DEFF9A] text-[#DEFF9A] font-black tracking-widest uppercase rounded-2xl px-5 py-2 text-2xl font-mono rotate-[-12deg] z-20 shadow-[0_0_20px_rgba(222,255,154,0.35)] pointer-events-none"
          >
            {tCard("SYNC ✨", "সিঙ্ক ✨")}
          </motion.div>
          <motion.div
            style={{ opacity: skipOpacity }}
            className="absolute top-24 right-8 border-4 border-red-500 text-red-500 font-black tracking-widest uppercase rounded-2xl px-5 py-2 text-2xl font-mono rotate-[12deg] z-20 shadow-[0_0_20px_rgba(239,68,68,0.35)] pointer-events-none"
          >
            {tCard("SKIP ⚔️", "বাদ ⚔️")}
          </motion.div>
        </>
      )}

      {/* Top Left Badge: Member Tier */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <span className={`border px-3 py-1.5 rounded-full text-[8.5px] font-mono font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md shadow-md flex items-center gap-1 transition-all ${badgeTierStyle(candidate.tier)}`}>
          {candidate.tier === 'Elite' && <Award className="w-2.5 h-2.5 text-[#c5a059]" />}
          {candidate.tier === 'Standard' && <Shield className="w-2.5 h-2.5 text-blue-400" />}
          {candidate.tier === 'Basic' && <Zap className="w-2.5 h-2.5 text-amber-400" />}
          <span>{candidate.tier}</span>
        </span>
      </div>

      {/* Top Right: Glowing Premium AI Badge with exact #DEFF9A color specs */}
      <div className="absolute top-5 right-5 bg-[#DEFF9A] text-[#09090b] text-[9.5px] font-mono font-black py-1 px-3 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(222,255,154,0.55)] tracking-wider uppercase select-none z-20 pointer-events-none">
        <Sparkles className="w-2.5 h-2.5 text-black fill-current animate-pulse" />
        <span>{score}% {tCard("GOLDEN PAIR", "গোল্ডেন ম্যাচ")}</span>
      </div>

      {/* 2. Glassmorphism Info Overlay (Frosted-glass container locked at the bottom 25% of the card) */}
      <div className="absolute bottom-5 left-4 right-4 h-[25%] z-20 pointer-events-none">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="w-full h-full bg-[#0d0d11]/50 hover:bg-[#0d0d11]/65 backdrop-blur-xl border border-white/10 hover:border-[#DEFF9A]/30 rounded-[2rem] p-4 text-left pointer-events-auto shadow-[0_12px_36px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-200 group/drawer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-serif italic font-extrabold text-white flex items-baseline gap-1.5 transition-colors group-hover/drawer:text-[#DEFF9A]">
                {candidate.name}
                <span className="text-white/60 text-xs font-mono font-medium">({candidate.age})</span>
              </h3>
              
              <div className="flex items-center gap-1 text-[9px] text-white/40 font-mono shrink-0">
                <MapPin className="w-2.5 h-2.5 text-[#DEFF9A]" />
                <span className="truncate max-w-[85px]">{candidate.location}</span>
              </div>
            </div>

            <p className="text-white/70 text-[10.5px] leading-relaxed font-sans line-clamp-2 mt-1.5 font-light">
              {candidate.bio || tCard("Secure digital signal established. Tap to explore cognitive compatibility indices & MBTI parameters.", "নিরাপদ ব্যক্তিত্ব তরঙ্গ সিগন্যাল পাওয়া গেছে। ক্লিক করে কগনিটিভ প্যারামিটারগুলো পরীক্ষা করুন।")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-1 border-t border-white/5 pt-2 mt-auto">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#DEFF9A]/10 text-[#DEFF9A] text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border border-[#DEFF9A]/20 uppercase">
                {candidate.mbti}
              </span>
              <span className="text-[9px] text-white/40 font-mono truncate max-w-[120px]">
                {candidate.interests[0] ? `#${candidate.interests[0].toUpperCase()}` : ''}
              </span>
            </div>

            <span className="flex items-center gap-0.5 font-mono text-[9px] font-bold text-[#DEFF9A] tracking-wider group-hover/drawer:translate-x-0.5 transition-transform">
              <span>{tCard("EXPLORE", "এক্সপ্লোর")}</span>
              <ChevronRight className="w-3 h-3 text-[#DEFF9A]" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Helper to compute deterministic Dating Intents for mock profiles
 */
const getDatingIntent = (id: string): string => {
  const intents = ['Long-term', 'Hang out', 'Casual', 'Intimate without commitments'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return intents[Math.abs(hash) % intents.length];
};

/**
 * Quick 5-question high-fidelity MBTI & Preference questions (Bilingual support)
 */
const mbtiAssessmentQuestions = [
  {
    theme: { en: "AURA RADIATION FIELD", bn: "আউরা বিকিরণ ক্ষেত্র" },
    question: { 
      en: "At a busy neon rooftop exhibition or tech launch gathering, you find that you...", 
      bn: "একটি ব্যস্ত ছাদবাগানের নিয়ন আলোতে বা গেটটুগেদারে আপনার যেমন ফিল হয়..." 
    },
    options: [
      { 
        key: "A" as const, 
        text: { 
          en: "Gain massive fuel and drive by introducing yourself, chatting, and circulating with different cliques.", 
          bn: "সবার সাথে কথা বলে, নিজের পরিচয় দিয়ে এবং বিভিন্ন মানুষের সাথে মিশে চরম এনার্জি পাই।" 
        },
        code: "E" 
      },
      { 
        key: "B" as const, 
        text: { 
          en: "Preserve your energy reservoirs, enjoying deep, isolated 1-on-1 private vibe dialogues.", 
          bn: "নিজের এনার্জি বাঁচিয়ে রেখে একা কিংবা কোনো একজনের সাথে মন খুলে গভীর কোয়ালিটি টাইম শেয়ার করি।" 
        }, 
        code: "I" 
      }
    ]
  },
  {
    theme: { en: "CONSCIOUSNESS CORE BLUEPRINT", bn: "চেতনা ও চিন্তার ব্লুপ্রিন্ট" },
    question: { 
      en: "When exploring future abstract possibilities, art, projects, or cosmic theories...", 
      bn: "ভবিষ্যতের গভীর সম্ভাবনা, আর্ট, টেকনোলজি কিংবা কোনো মহাজাগতিক থিওরি নিয়ে ভাবার সময়..." 
    },
    options: [
      { 
        key: "A" as const, 
        text: { 
          en: "Gravitate immediately towards wild speculative predictions, complex metaphors, and future-forward systems.", 
          bn: "চমৎকার সব কল্পনা, ভবিষ্যৎ এবং কোনো থিওরির জটিল ডিজাইন বা সম্ভাবনা আমাকে টানে।" 
        }, 
        code: "N" 
      },
      { 
        key: "B" as const, 
        text: { 
          en: "Rely upon tangible sensory logic, practical present actions, historical precedents, and real details.", 
          bn: "বাস্তব অভিজ্ঞতা, বর্তমানের কাজ, ঐতিহাসিক প্রমাণ এবং নিখুঁত তথ্যের ওপর ভরসা করি।" 
        }, 
        code: "S" 
      }
    ]
  },
  {
    theme: { en: "DECISION-MAKING ARCHITECTURE", bn: "সিদ্ধান্ত গ্রহণের প্রক্রিয়া" },
    question: { 
      en: "When relationship coordination or lifestyle friction issues arise, you solve them using...", 
      bn: "সম্পর্কের মাঝে কোনো সমস্যা বা মতের অমিল দেখা দিলে আপনি যেভাবে সমাধান করতে পছন্দ করেন..." 
    },
    options: [
      { 
        key: "A" as const, 
        text: { 
          en: "Unbiased analytical logic, striving for absolute consistency, structural truth, and optimization.", 
          bn: "কোনো আবেগ ছাড়া एकदम নিরপেক্ষ লজিক দিয়ে, সত্যটা জেনে বিষয়গুলোর নিখুঁত সমাধান করি।" 
        }, 
        code: "T" 
      },
      { 
        key: "B" as const, 
        text: { 
          en: "Deep heart-centered empathy streams, personal values alignment, and restoring emotional harmony.", 
          bn: "আবেগ দিয়ে, অন্যের অনুভূতি বুঝে এবং সহানুভূতি দেখিয়ে মানসিক শান্তি বজায় রাখার চেষ্টা করি।" 
        }, 
        code: "F" 
      }
    ]
  },
  {
    theme: { en: "TEMPORAL TIMELINE SCHEDULING", bn: "সময় ও পরিকল্পনার ধরন" },
    question: { 
      en: "Preparing detail paths for trips, dinner bookings, and calendar interlock points...", 
      bn: "কোথাও ঘুরতে যাওয়া, রেস্টুরেন্ট বুকিং কিংবা আগামী সপ্তাহের সুন্দর কোনো প্ল্যান সাজানো..." 
    },
    options: [
      { 
        key: "A" as const, 
        text: { 
          en: "Feels best with a carefully calibrated, scheduled plan and pre-determined timeline parameters.", 
          bn: "আগে থেকেই একদম নিখুঁত প্ল্যান এবং শিডিউল ধরে রুটিন মাফিক চলতে সবচেয়ে বেশি ভালো লাগে।" 
        }, 
        code: "J" 
      },
      { 
        key: "B" as const, 
        text: { 
          en: "Is most satisfying when kept completely fluid, open-ended, and dynamically adaptive to current vibes.", 
          bn: "কোনো বাঁধাধরা প্ল্যান ছাড়া একদম স্বতঃস্ফূর্তভাবে তাৎক্ষণিক সিদ্ধান্ত নিয়ে চলতে বেশি পছন্দ করি।" 
        }, 
        code: "P" 
      }
    ]
  },
  {
    theme: { en: "SERENDIPITY VS MATRIX THEORY", bn: "ভাগ্য বনাম বৈজ্ঞানিক সমীকরণ" },
    question: { 
      en: "Which lifestyle alignment paradigm makes you feel most centered?", 
      bn: "কোন জীবনধারা বা ফিলসফি আপনাকে সবচেয়ে বেশি শান্তি দেয়?" 
    },
    options: [
      { 
        key: "A" as const, 
        text: { 
          en: "Empirical proof points, technological precision matching, and structured compatibility scores.", 
          bn: "বিজ্ঞানসম্মত লজিক, টেকনিক্যাল ম্যাচিং এবং নির্ভরযোগ্য ব্যক্তিত্বের স্কোর বিশ্লেষণ।" 
        }, 
        code: "T" 
      },
      { 
        key: "B" as const, 
        text: { 
          en: "Magnetic energy codes, intuitive chemistry, and serendipitous chaos of pure untamed connection.", 
          bn: "মনের টান, অদ্ভুত কেমিস্ট্রি, আকস্মিক আকর্ষণ এবং না বলা গভীর ভালোবাসার অনুভূতি।" 
        }, 
        code: "F" 
      }
    ]
  }
];

export default function DiscoveryFeed({
  currentUser,
  candidates,
  onSwipeLiked,
  onSwipeSkipped,
  soundEnabled = true,
  conversations = [],
  onUpdateCurrentUser,
  onNavigateToBlindRoom
}: DiscoveryFeedProps) {
  // Bilingual / Localization State
  const [isBangla, setIsBangla] = useState<boolean>(() => {
    return localStorage.getItem('aura_language') === 'bn';
  });

  const toggleLanguage = () => {
    const nextVal = !isBangla;
    setIsBangla(nextVal);
    localStorage.setItem('aura_language', nextVal ? 'bn' : 'en');
    window.dispatchEvent(new Event('storage'));
    if (soundEnabled) {
      audioEngine.playRequestPing();
    }
  };

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsBangla(localStorage.getItem('aura_language') === 'bn');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = (enStr: string, bnStr: string) => {
    return isBangla ? bnStr : enStr;
  };

  // Onboarding Wizard Progression State
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('aura_onboarding_completed') === 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(1); // 1 = Base info, 2 = Intent Matrix, 3 = MBTI Assessment, 4 = AI Aura Loading

  // Onboarding Form States
  const [onboardName, setOnboardName] = useState<string>(currentUser.name || 'Arfin Ahmed');
  const [onboardAge, setOnboardAge] = useState<number>(currentUser.age || 26);
  const [onboardGender, setOnboardGender] = useState<'Male' | 'Female' | 'Non-binary'>(currentUser.gender || 'Male');
  const [onboardPref, setOnboardPref] = useState<'Male' | 'Female' | 'Non-binary' | 'All'>('All');
  const [selectedIntent, setSelectedIntent] = useState<string>(() => {
    return localStorage.getItem('aura_dating_intent') || 'Long-term';
  });

  // MBTI quick assessment state matching
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [activeMbtiQuestionIndex, setActiveMbtiQuestionIndex] = useState<number>(0);

  // AI mapping logs timers
  const [aiLoadingLogIndex, setAiLoadingLogIndex] = useState<number>(0);
  const aiLoadingLogs = isBangla ? [
    "নিরাপদ কোয়ান্টাম-এনক্রিপ্টেড আউরা নোড তৈরি করা হচ্ছে...",
    "আপনার বায়ো-ভাইব্রেশনাল ফ্রিকোয়েন্সি এবং ব্রেইন ওয়েভ স্ক্যান করা হচ্ছে...",
    "নিউরো-এমবিটিআই ম্যাট্রিক্স এবং কগনিটিভ মিল বিশ্লেষণ করা হচ্ছে...",
    "মনোনীত ডেটিং উদ্দেশ্যসমূহ বাংলাদেশ লোকাল গ্রিড ডাটাবেজের সাথে সিনক্রোনাইজ করা হচ্ছে...",
    "রিয়েল-টাইম নিউরাল ওয়েবে আপনার স্পিরিচুয়াল ম্যাচিং কোড সিন্থেসাইজ করা হচ্ছে...",
    "ব্যক্তিগত চ্যাট ফিল্টারিং ও স্ক্রিনশট প্রটেকশন প্রোটোকল লক করা হচ্ছে...",
    "আপনার সোনালী অনুপাতের গোল্ডেন ম্যাচিং এআই পেয়ার তৈরি হয়েছে। এনক্রিপশন সফল!"
  ] : [
    "Establishing secure quantum-encrypted aura handshake node...",
    "Scanning bio-vibrational frequencies and cognitive waveforms...",
    "Extracting MBTI neurological metrics & alignment structures...",
    "Parsing selected intention matrices with Bangladesh local grid database...",
    "Synthesizing spiritual compatibility parameters on real-time neural web...",
    "Locking in decentralized private chat filtering protocols...",
    "Generating premium golden ratio compatibility pairs. Encryption sync'd!"
  ];

  const [index, setIndex] = useState(0);
  const [expandedCandidate, setExpandedCandidate] = useState<UserProfile | null>(null);

  // Stateful state of Premium / Limits warnings modal popups
  const [popupContent, setPopupContent] = useState<{
    title: string;
    message: string;
    actionText?: string;
    actionTier?: 'Basic' | 'Standard' | 'Elite';
    onAction?: () => void;
  } | null>(null);

  // Filter candidates based on preference (Step 1 preference filter)
  const preferenceFiltered = React.useMemo(() => {
    return candidates.filter((c) => {
      if (onboardPref === 'All') return true;
      return c.gender === onboardPref;
    });
  }, [candidates, onboardPref]);

  // Priority Filter Matching: candidate sorting by selected Dating Intent
  const sortedAndFilteredCandidates = React.useMemo(() => {
    const matching = preferenceFiltered.filter((c) => getDatingIntent(c.id) === selectedIntent);
    const nonMatching = preferenceFiltered.filter((c) => getDatingIntent(c.id) !== selectedIntent);
    return [...matching, ...nonMatching];
  }, [preferenceFiltered, selectedIntent]);

  const activeCandidate = sortedAndFilteredCandidates[index];

  // AI Loading Step Timer and Sync Update hook
  React.useEffect(() => {
    if (onboardingStep === 4) {
      const interval = setInterval(() => {
        setAiLoadingLogIndex((prev) => {
          if (prev < aiLoadingLogs.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              // Extract calculated MBTI from answers
              const letter1 = mbtiAnswers[0] === 'A' ? 'E' : 'I';
              const letter2 = mbtiAnswers[1] === 'A' ? 'N' : 'S';
              const letter3 = mbtiAnswers[2] === 'A' ? 'T' : 'F';
              const letter4 = mbtiAnswers[3] === 'A' ? 'J' : 'P';
              const calculatedMbti = `${letter1}${letter2}${letter3}${letter4}`;

              if (onUpdateCurrentUser) {
                onUpdateCurrentUser({
                  ...currentUser,
                  name: onboardName,
                  age: onboardAge,
                  gender: onboardGender,
                  mbti: calculatedMbti,
                  bio: `AURA mapped matching code: ${calculatedMbti}. Optimized dating intent: ${selectedIntent}. Location synchronized.`,
                });
              }

              localStorage.setItem('aura_dating_intent', selectedIntent);
              localStorage.setItem('aura_onboarding_completed', 'true');
              setIsOnboardingCompleted(true);
            }, 850);
            return prev;
          }
        });
      }, 550);

      return () => clearInterval(interval);
    }
  }, [onboardingStep]);

  const handleUpgradeTier = (tier: UserTier) => {
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        tier
      });
    }
    setPopupContent(null);
  };

  const handleMessageClick = (candidate: UserProfile) => {
    const tier = currentUser.tier;
    
    if (tier === 'Free') {
      setPopupContent({
        title: 'Upgrade to Basic to chat',
        message: `Your account is currently on the Free tier. Free tier members are restricted from initiating chats with dating candidates. Upgrade to Basic (100 BDT) or Standard (300 BDT) to unlock.`,
        actionText: 'UPGRADE TO BASIC',
        actionTier: 'Basic',
        onAction: () => handleUpgradeTier('Basic')
      });
      if (soundEnabled) {
        audioEngine.playRequestPing();
      }
      return;
    }

    if (tier === 'Basic') {
      // 1. Same-tier check: candidates must be Basic as well
      if (candidate.tier !== 'Basic') {
        setPopupContent({
          title: 'Same-Tier Chat Restriction',
          message: `As a Basic tier member, you can exclusively message other Basic tier members. ${candidate.name} holds a "${candidate.tier}" plan. Upgrade to Standard or Elite to unlock cross-tier communication.`,
          actionText: 'UPGRADE TO STANDARD',
          actionTier: 'Standard',
          onAction: () => handleUpgradeTier('Standard')
        });
        if (soundEnabled) {
          audioEngine.playRequestPing();
        }
        return;
      }

      // 2. Limit to 50 active chats check
      if (conversations.length >= 50) {
        setPopupContent({
          title: 'Chat Limit Reached (50/50)',
          message: `Your Basic tier limits you to a maximum of 50 active chats. Upgrade to Standard or Elite to unleash unlimited communication.`,
          actionText: 'UPGRADE TO STANDARD',
          actionTier: 'Standard',
          onAction: () => handleUpgradeTier('Standard')
        });
        if (soundEnabled) {
          audioEngine.playRequestPing();
        }
        return;
      }
    }

    // Elite & Standard: Unlock everything
    // Let's activate conversation/chat by swiping them liked directly so it sets up a chat or does a match sync!
    if (soundEnabled) {
       audioEngine.playMatchChime();
    }
    onSwipeLiked(candidate);
    
    setPopupContent({
      title: 'Decentralized Connection Active',
      message: `Successfully synchronized signals with ${candidate.name}! Open your Active Chats to begin secure, encrypted communications under the screenshot filter.`,
      actionText: 'ACKNOWLEDGE'
    });
  };

  const handleSwipe = (liked: boolean) => {
    if (!activeCandidate) return;

    if (liked) {
      if (soundEnabled) {
        audioEngine.playMatchChime();
      }
      onSwipeLiked(activeCandidate);
    } else {
      if (soundEnabled) {
        audioEngine.playRequestPing();
      }
      onSwipeSkipped(activeCandidate);
    }

    setIndex(prev => prev + 1);
    setExpandedCandidate(null); // Close dossier upon swipe
  };

  const handleReset = () => {
    if (soundEnabled) {
      audioEngine.playRequestPing();
    }
    setIndex(0);
    setExpandedCandidate(null);
  };

  const handleSwipeSpecificCard = (card: UserProfile, liked: boolean) => {
    if (liked) {
      if (soundEnabled) {
        audioEngine.playMatchChime();
      }
      onSwipeLiked(card);
    } else {
      if (soundEnabled) {
        audioEngine.playRequestPing();
      }
      onSwipeSkipped(card);
    }
    setIndex(prev => prev + 1);
    setExpandedCandidate(null);
  };

  if (!isOnboardingCompleted) {
    return (
      <div className="w-full min-h-[640px] flex items-center justify-center p-4 relative overflow-hidden bg-[#070709] select-none">
        {/* Glowing background ambience elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#DEFF9A]/5 blur-[130px] pointer-events-none" />

        {/* Absolute Language Switcher */}
        <button
          onClick={toggleLanguage}
          type="button"
          className="absolute top-4 right-4 z-[99] bg-[#0d0d11]/80 backdrop-blur-md border border-white/10 hover:border-[#DEFF9A]/50 text-white hover:text-[#DEFF9A] text-[10px] font-mono font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer uppercase"
          title={t("Switch Language / ভাষা পরিবর্তন করুন", "ভাষা পরিবর্তন করুন / Switch Language")}
        >
          <span className={isBangla ? 'text-white/40' : 'text-[#DEFF9A] font-extrabold'}>EN</span>
          <span className="text-white/20">|</span>
          <span className={isBangla ? 'text-[#DEFF9A] font-extrabold' : 'text-white/40'}>বাংলা</span>
        </button>

        <AnimatePresence mode="wait">
          {onboardingStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm bg-[#0d0d11]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative shadow-2xl text-center"
            >
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-mono tracking-widest text-[#DEFF9A] uppercase bg-[#DEFF9A]/10 px-3 py-1 rounded-full">
                  {t("Phase 01: Identity Core", "ধাপ ০১: মূল পরিচিতি")}
                </span>
                <h2 className="text-3xl font-serif italic text-white leading-tight font-extrabold">
                  {t("Introduce your", "প্রকাশ করুন")} <span className="text-[#DEFF9A]">{t("Aura", "Aura বা ব্যক্তিত্ব")}</span>
                </h2>
                <p className="text-white/40 text-[11px] font-sans">
                  {t("Set up your profile credentials for decentralized sync matching.", "নিরাপদ ব্যক্তিত্ব ম্যাচিংয়ের জন্য আপনার প্রোফাইল তৈরি করুন।")}
                </p>
              </div>

              <div className="space-y-4">
                {/* Name Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold">
                    {t("Your Custom Alias / Name", "আপনার নাম / ডাকনাম")}
                  </label>
                  <input
                    type="text"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#DEFF9A]/40 focus:outline-none transition-colors rounded-xl px-4 py-3 text-white text-xs font-medium font-mono animate-none"
                    placeholder="Arfin Ahmed"
                  />
                </div>

                {/* Age Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold flex justify-between">
                    <span>{t("Age", "বয়স")}</span>
                    <span className="text-[#DEFF9A] font-black">{onboardAge} {t("Years", "বছর")}</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={onboardAge}
                    onChange={(e) => setOnboardAge(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#DEFF9A]"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-white/30">
                    <span>{t("18 YEARS", "১৮ বছর")}</span>
                    <span>{t("65 YEARS", "৬৫ বছর")}</span>
                  </div>
                </div>

                {/* Gender Options */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold">
                    {t("My Binary/Quantum Field", "আপনার লিঙ্গ (Gender)")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Male', 'Female', 'Non-binary'] as const).map((genderOption) => {
                      const labelText = genderOption === 'Male' ? t("MALE", "পুরুষ") : genderOption === 'Female' ? t("FEMALE", "নারী") : t("NON-BINARY", "অন্যান্য");
                      return (
                        <button
                          key={genderOption}
                          type="button"
                          onClick={() => setOnboardGender(genderOption)}
                          className={`py-2.5 rounded-xl text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                            onboardGender === genderOption
                              ? 'bg-[#DEFF9A]/10 border-[#DEFF9A] text-[#DEFF9A] shadow-[0_0_12px_rgba(222,255,154,0.15)] bg-[#DEFF9A]/20'
                              : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                          }`}
                        >
                          {labelText}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Match Preference */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold">
                    {t("Interlock Preferences", "কাকে খুঁজছেন? (পছন্দ)")}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Male', 'Female', 'Non-binary', 'All'] as const).map((prefOption) => {
                      let btnText = '';
                      if (prefOption === 'Male') btnText = t("MALE", "পুরুষ");
                      else if (prefOption === 'Female') btnText = t("FEMALE", "নারী");
                      else if (prefOption === 'Non-binary') btnText = t("OTHER", "অন্যান্য");
                      else btnText = t("ALL FIELDS", "সবাইকে");

                      return (
                        <button
                          key={prefOption}
                          type="button"
                          onClick={() => setOnboardPref(prefOption)}
                          className={`py-2 rounded-lg text-[9px] font-bold font-mono border transition-all cursor-pointer truncate ${
                            onboardPref === prefOption
                              ? 'bg-[#DEFF9A]/10 border-[#DEFF9A] text-[#DEFF9A] shadow-[0_0_10px_rgba(222,255,154,0.12)] bg-[#DEFF9A]/15'
                              : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                          }`}
                        >
                          {btnText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) {
                    audioEngine.playRequestPing();
                  }
                  setOnboardingStep(2);
                }}
                className="w-full py-4 bg-gradient-to-r from-[#DEFF9A] to-[#c5a059] hover:from-[#eaffb5] hover:to-[#dfba70] text-black text-xs font-mono font-black rounded-2xl shadow-lg transition-all active:scale-95 duration-200 cursor-pointer uppercase tracking-wider mt-2 border border-black/10"
              >
                {t("Sync Next Interface →", "পরবর্তী ধাপে যান →")}
              </button>
            </motion.div>
          )}

          {onboardingStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm bg-[#0d0d11]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative shadow-2xl text-center"
            >
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-mono tracking-widest text-[#DEFF9A] uppercase bg-[#DEFF9A]/10 px-3 py-1 rounded-full">
                  {t("Phase 02: Dating Intent Matrix", "ধাপ ০২: ডেটিংয়ের উদ্দেশ্য")}
                </span>
                <h2 className="text-3xl font-serif italic text-white leading-tight font-extrabold">
                  {t("Define alignment", "ডেটিংয়ের আসল")} <span className="text-[#DEFF9A]">{t("intent", "উদ্দেশ্য")}</span>
                </h2>
                <p className="text-white/40 text-[11px] font-sans">
                  {t("Selected intents prioritize candidates instantly on your swipe stack.", "আপনার পছন্দের উদ্দেশ্যটির সাথে যাদের মিলবে, কার্ডে তাদের আগে দেখানো হবে।")}
                </p>
              </div>

              <div className="space-y-2.5 text-left">
                {[
                  { 
                    intent: 'Long-term', 
                    enTitle: 'LONG-TERM', 
                    enDesc: 'Secure long-term life matching nodes, shared futures',
                    bnTitle: 'দীর্ঘমেয়াদী সম্পর্ক (LONG-TERM)',
                    bnDesc: 'ভবিষ্যত এক সাথে কাটানো এবং দীর্ঘস্থায়ী জীবনসঙ্গী খোঁজা।'
                  },
                  { 
                    intent: 'Hang out', 
                    enTitle: 'HANG OUT', 
                    enDesc: 'Low friction social cafes, explorations, dynamic chat',
                    bnTitle: 'ঘুরে বেড়ানো ও আড্ডা (HANG OUT)',
                    bnDesc: 'কোনো কাজের চাপ ছাড়া গল্প করা, চা খাওয়া বা ঘুরে বেড়ানো।'
                  },
                  { 
                    intent: 'Casual', 
                    enTitle: 'CASUAL', 
                    enDesc: 'Fluid connections, spontaneous play, zero overheads',
                    bnTitle: 'ক্যাজুয়াল রিলেশন (CASUAL)',
                    bnDesc: 'সহজ ও জটিলতাহীন ফ্রেন্ডশিপ এবং সুন্দর সময় কাটানো।'
                  },
                  { 
                    intent: 'Intimate without commitments', 
                    enTitle: 'INTIMATE WITHOUT COMMITMENTS', 
                    enDesc: 'Pure physical synchronicities, deep discrete attraction',
                    bnTitle: 'কমিটমেন্ট ছাড়া ঘনিষ্ঠতা (NO STRINGS)',
                    bnDesc: 'শারীরিক এবং মানসিক নিখাদ আকর্ষণ, কোনো পিছুটান ছাড়া।'
                  }
                ].map((item) => (
                  <button
                    key={item.intent}
                    type="button"
                    onClick={() => {
                      if (soundEnabled) {
                        audioEngine.playRequestPing();
                      }
                      setSelectedIntent(item.intent);
                    }}
                    className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col space-y-1 items-stretch ${
                      selectedIntent === item.intent
                        ? 'bg-[#DEFF9A]/5 border-[#DEFF9A] text-white shadow-[0_0_15px_rgba(222,255,154,0.08)] bg-[#DEFF9A]/10'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/[0.07] hover:border-white/10'
                    }`}
                  >
                    <span className={`text-[11.5px] font-mono font-bold ${selectedIntent === item.intent ? 'text-[#DEFF9A]' : 'text-white'}`}>
                      {t(item.enTitle, item.bnTitle)}
                    </span>
                    <span className="text-[10px] text-white/40 font-light font-sans">{t(item.enDesc, item.bnDesc)}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (soundEnabled) {
                      audioEngine.playRequestPing();
                    }
                    setOnboardingStep(1);
                  }}
                  className="w-1/3 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-colors text-xs font-mono font-bold cursor-pointer uppercase"
                >
                  {t("Back", "পেছনে")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (soundEnabled) {
                      audioEngine.playRequestPing();
                    }
                    setOnboardingStep(3);
                  }}
                  className="w-2/3 py-3.5 bg-gradient-to-r from-[#DEFF9A] to-[#c5a059] hover:from-[#eaffb5] hover:to-[#dfba70] text-black text-xs font-mono font-black rounded-2xl shadow-lg transition-transform active:scale-95 duration-200 cursor-pointer uppercase tracking-wider"
                >
                  {t("Continue →", "সামনে যান →")}
                </button>
              </div>
            </motion.div>
          )}

          {onboardingStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm bg-[#0d0d11]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative shadow-2xl text-center"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-widest text-[#DEFF9A] uppercase bg-[#DEFF9A]/10 px-3 py-1 rounded-full">
                    {t(`Step ${activeMbtiQuestionIndex + 1} of 5`, `ধাপ ${activeMbtiQuestionIndex + 1}/৫`)}
                  </span>
                  <span className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-wider">
                    {t("MBTI METRICS", "ব্যক্তিত্ব পরীক্ষা")}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider pt-1">
                  {t(
                    mbtiAssessmentQuestions[activeMbtiQuestionIndex].theme.en,
                    mbtiAssessmentQuestions[activeMbtiQuestionIndex].theme.bn
                  )}
                </div>
                <h3 className="text-sm font-sans text-white/90 leading-relaxed font-semibold min-h-[52px] text-left pt-1 font-medium">
                  {t(
                    mbtiAssessmentQuestions[activeMbtiQuestionIndex].question.en,
                    mbtiAssessmentQuestions[activeMbtiQuestionIndex].question.bn
                  )}
                </h3>
              </div>

              <div className="space-y-3 text-left">
                {mbtiAssessmentQuestions[activeMbtiQuestionIndex].options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      if (soundEnabled) {
                        audioEngine.playRequestPing();
                      }
                      setMbtiAnswers(prev => ({ ...prev, [activeMbtiQuestionIndex]: option.key }));
                      if (activeMbtiQuestionIndex < mbtiAssessmentQuestions.length - 1) {
                        setActiveMbtiQuestionIndex(prev => prev + 1);
                      } else {
                        setOnboardingStep(4);
                      }
                    }}
                    className="w-full p-4 rounded-2xl text-left bg-[#0c0c10] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] text-white/70 hover:text-white text-[11px] font-sans transition-all cursor-pointer flex justify-between items-center group/opt gap-3"
                  >
                    <span className="leading-snug">{t(option.text.en, option.text.bn)}</span>
                    <span className="bg-white/5 border border-white/5 px-2 py-1 rounded text-[8px] font-mono text-white/40 group-hover/opt:text-[#DEFF9A] group-hover/opt:border-[#DEFF9A]/30 transition-colors shrink-0">
                      CODE: {option.code}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-white/40 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (activeMbtiQuestionIndex > 0) {
                      setActiveMbtiQuestionIndex(prev => prev - 1);
                    } else {
                      setOnboardingStep(2);
                    }
                  }}
                  className="hover:text-[#DEFF9A] duration-150 transition-colors font-bold uppercase tracking-wide cursor-pointer flex items-center gap-1 text-[9px]"
                >
                  &larr; {t("PREVIOUS PARAM", "আগের প্রশ্ন")}
                </button>
                <span className="font-bold">{Math.round(((activeMbtiQuestionIndex + 1) / 5) * 100)}% {t("DETECTED", "সম্পন্ন")}</span>
              </div>
            </motion.div>
          )}

          {onboardingStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-sm bg-[#08080c]/90 border border-[#c5a059]/30 rounded-[2.5rem] p-10 space-y-8 text-center relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#DEFF9A] to-transparent animate-pulse" />

              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-[#DEFF9A]/20 flex items-center justify-center relative shadow-[0_0_30px_rgba(222,255,154,0.15)] bg-black/60">
                  <div className="absolute inset-2 rounded-full border border-[#c5a059]/40 border-dashed animate-spin duration-10000" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#DEFF9A] border-r-transparent border-b-[#c5a059] border-l-transparent animate-spin duration-1000" />
                  <Sparkles className="w-8 h-8 text-[#DEFF9A] animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-serif italic font-extrabold text-white">
                  {t("AI Mapping Current Aura", "এআই আপনার ব্যক্তিত্ব ম্যাপ করছে")}
                </h3>
                <p className="text-xs text-[#DEFF9A] font-mono tracking-widest uppercase animate-pulse">
                  {t("Syncing Cognitive Core...", "ব্যক্তিত্ব ম্যাচিং কোড সিঙ্ক হচ্ছে...")}
                </p>
              </div>

              <div className="bg-[#040406] border border-white/5 rounded-xl p-4 min-h-[85px] text-left flex flex-col justify-center">
                <p className="text-[10px] font-mono text-[#DEFF9A] font-semibold leading-relaxed animate-fade-in text-center flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DEFF9A] rounded-full animate-ping shrink-0" />
                  <span>{aiLoadingLogs[aiLoadingLogIndex]}</span>
                </p>
                <div className="mt-2.5 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#DEFF9A] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${((aiLoadingLogIndex + 1) / aiLoadingLogs.length) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-[9px] text-white/30 font-mono italic">
                {t("Aura mapping complies with decentralized privacy layers.", "আউরা ম্যাপিং সম্পূর্ণ গোপনীয়তা নিশ্চিত করে ডিজাইন করা হয়েছে।")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center py-4 relative min-h-[600px] overflow-hidden select-none">
      {/* Absolute Language Switcher for Swiping Flow */}
      <button
        onClick={toggleLanguage}
        type="button"
        className="absolute top-4 right-4 z-[40] bg-[#0d0d11]/80 backdrop-blur-md border border-white/10 hover:border-[#DEFF9A]/50 text-white hover:text-[#DEFF9A] text-[10px] font-mono font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer uppercase"
        title={t("Switch Language / ভাষা পরিবর্তন করুন", "ভাষা পরিবর্তন করুন / Switch Language")}
      >
        <span className={isBangla ? 'text-white/40' : 'text-[#DEFF9A] font-extrabold'}>EN</span>
        <span className="text-white/20">|</span>
        <span className={isBangla ? 'text-[#DEFF9A] font-extrabold' : 'text-white/40'}>বাংলা</span>
      </button>

      {/* Background Profile Take-over (Blurred edge-to-edge profile avatar as requested) */}
      <div className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0">
        <img
          src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
          className="w-full h-full object-cover filter blur-[120px] opacity-20 select-none pointer-events-none scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/90 via-[#070709]/95 to-[#09090b]" />
      </div>
      {/* Main Stack Container */}
      <div className="relative w-full h-[520px] max-w-sm mx-auto flex items-center justify-center select-none overflow-visible">
        <AnimatePresence mode="popLayout">
          {activeCandidate && index + 1 < candidates.length && (
            <InteractiveCard
              key={candidates[index + 1].id + "_next"}
              candidate={candidates[index + 1]}
              currentUser={currentUser}
              score={calculateMatchScore(currentUser, candidates[index + 1])}
              onSwipe={() => {}}
              isActive={false}
              onExpand={() => {}}
              isBangla={isBangla}
            />
          )}

          {activeCandidate && (
            <InteractiveCard
              key={activeCandidate.id}
              candidate={activeCandidate}
              currentUser={currentUser}
              score={calculateMatchScore(currentUser, activeCandidate)}
              onSwipe={handleSwipe}
              isActive={true}
              onExpand={() => {
                if (soundEnabled) {
                  audioEngine.playRequestPing();
                }
                setExpandedCandidate(activeCandidate);
              }}
              isBangla={isBangla}
            />
          )}

          {!activeCandidate && (
            <motion.div
              key="exhausted"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0e0e11] border border-white/10 rounded-3xl p-8 text-center text-white/50 font-mono text-xs space-y-4 shadow-2xl flex flex-col items-center justify-center h-full max-w-sm w-full"
            >
              <div className="w-16 h-16 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center mx-auto mb-2 text-[#c5a059]">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-[#c5a059] font-serif italic text-base">{t("Stack Exhausted", "আজকের প্রোফাইল শেষ")}</h4>
              <p className="max-w-[240px] text-[11px] text-[#a0afca]">
                {t("You have analyzed all active MBTI profiles. Reset the discovery queue to sync signals again.", "আপনি ক্যাটাগরির সকল প্রোফাইল দেখে ফেলেছেন। নতুন করে প্রোফাইল দেখতে বোতামটি চাপুন।")}
              </p>
              <button
                onClick={handleReset}
                className="bg-[#c5a059] hover:bg-[#d4b57a] text-black font-semibold py-2.5 px-6 rounded-xl transition-all cursor-pointer font-mono text-xs shadow-lg shadow-[#c5a059]/10 active:scale-95"
              >
                {t("Reset Discovery Queue", "রিসেট করুন ও নতুন করে খুঁজুন")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Floating Action Row (Under the card stack: X, Star/Up, Heart) */}
      {activeCandidate && !expandedCandidate && (
        <div className="flex items-center justify-center gap-7 mt-8 z-30">
          {/* 'X' Reject Button */}
          <button
            onClick={() => handleSwipe(false)}
            className="w-14 h-14 bg-[#0d0d11]/45 backdrop-blur-xl hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-full flex items-center justify-center text-red-400 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-90 cursor-pointer group"
            title={t("Reject Vibe (Skip)", "বাতিল করুন / এড়িয়ে যান")}
          >
            <X className="w-6 h-6 transition-transform group-hover:rotate-[-12deg] group-hover:scale-110 duration-200" />
          </button>

          {/* 'Star/Up' Blind Room-Date Invite Button (for Elite only) */}
          <button
            onClick={() => {
              if (currentUser.tier === 'Elite') {
                if (onNavigateToBlindRoom) {
                  onNavigateToBlindRoom();
                }
              } else {
                setPopupContent({
                  title: t('Elite Feature Required', 'এলিট মেম্বার হওয়া প্রয়োজন'),
                  message: t(
                    'Blind Room-Date invites are exclusive to Elite custom-encrypted tier members. Upgrade now to invite matches into our real-time private Blind Room Date component.',
                    'ব্লাইন্ড ডেট কেবল এলিট মেম্বারদের জন্য প্রযোজ্য। রিয়েল-টাইম ব্লাইন্ড রুমে ইনভাইট করতে এলিট মেম্বারশিপে আপগ্রেড করুন।'
                  ),
                  actionText: t('UPGRADE TO ELITE', 'এলিট মেম্বার হোন'),
                  actionTier: 'Elite',
                  onAction: () => handleUpgradeTier('Elite')
                });
                if (soundEnabled) {
                  audioEngine.playRequestPing();
                }
              }
            }}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-90 cursor-pointer group ${
              currentUser.tier === 'Elite'
                ? 'bg-gradient-to-tr from-[#c5a059]/20 to-purple-900/30 backdrop-blur-xl border-[#c5a059]/50 text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:scale-110'
                : 'bg-[#0d0d11]/30 backdrop-blur-xl border-white/5 text-white/30 hover:text-white/60 hover:border-white/10 hover:scale-105'
            }`}
            title={t("Direct Blind Date Invite (Elite member benefit)", "ব্লাইন্ড ডেট ইনভাইট (এলিট মেম্বার)")}
          >
            <Star className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-[72deg] ${currentUser.tier === 'Elite' ? 'fill-current text-[#c5a059]' : ''}`} />
          </button>

          {/* 'Heart' Like Button with Glowing Accent */}
          <button
            onClick={() => handleSwipe(true)}
            className="w-14 h-14 bg-[#0d0d11]/45 backdrop-blur-xl hover:bg-[#DEFF9A]/10 border border-white/10 hover:border-[#DEFF9A]/40 rounded-full flex items-center justify-center text-[#DEFF9A] transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_18px_rgba(222,255,154,0.35)] active:scale-90 cursor-pointer group"
            title={t("Like Vibe Check (Sync)", "পছন্দ করুন (সুপার সিঙ্ক)")}
          >
            <Heart className="w-6 h-6 fill-current transition-transform group-hover:scale-120 duration-200" />
          </button>
        </div>
      )}

      {/* DETAILED MBTI COMPATIBILITY DOSSIER MODAL (Frosted Glass Overlay Interface) */}
      <AnimatePresence>
        {expandedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#070709]/95 backdrop-blur-xl rounded-[2.2rem] border border-white/10 p-5 overflow-y-auto flex flex-col space-y-6 scrollbar-thin scrollbar-trigger [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/25 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {/* Ambient blurred backdrop avatar */}
            <div className="absolute top-0 left-0 right-0 h-44 pointer-events-none overflow-hidden rounded-t-[2.2rem]">
              <div 
                className="w-full h-full bg-cover bg-center filter blur-xl opacity-20 scale-125"
                style={{ backgroundImage: `url(${expandedCandidate.avatar})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#070709]" />
            </div>

            {/* Dossier Header Area */}
            <div className="relative flex justify-between items-start pt-2">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20 uppercase">{t("AURA SECURITY FILE", "আউরা ব্যক্তিত্ব ফাইল")}</span>
                <h2 className="text-2xl font-serif italic font-black text-white flex items-baseline gap-2">
                  {expandedCandidate.name}
                  <span className="text-white/40 font-sans font-light text-base font-mono">({expandedCandidate.age})</span>
                </h2>
              </div>
              
              <button
                onClick={() => {
                  if (soundEnabled) {
                    audioEngine.playRequestPing();
                  }
                  setExpandedCandidate(null);
                }}
                className="w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Match Synergy Status Row */}
            <div className="bg-[#0b0b0e] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/35 flex items-center justify-center text-[#c5a059] shrink-0">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-mono text-[#c5a059] uppercase tracking-wider">{t("Synergy Code Index", "সিনার্জি কোড ইনডেক্স")}</h4>
                  <p className="text-[10px] text-white/50 font-sans">{t("Calculated via cognitive-pair metrics", "কগনিটিভ ম্যাচ মেক ট্র্যাকার")}</p>
                </div>
              </div>

              {(() => {
                const score = calculateMatchScore(currentUser, expandedCandidate);
                const traitsUser = getTraits(currentUser.mbti);
                const traitsCandidate = getTraits(expandedCandidate.mbti);

                const getRadarPoints = (traits: { value: number }[], cx: number, cy: number, maxR: number) => {
                  return traits.map((t, i) => {
                    const angle = -Math.PI / 2 + i * (2 * Math.PI / 5);
                    const r = (t.value / 100) * maxR;
                    const x = cx + r * Math.cos(angle);
                    const y = cy + r * Math.sin(angle);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ');
                };

                const radialLinesPoints = Array.from({ length: 5 }).map((_, i) => {
                  const angle = -Math.PI / 2 + i * (2 * Math.PI / 5);
                  const x = 45 + 25 * Math.cos(angle);
                  const y = 45 + 25 * Math.sin(angle);
                  return { x, y };
                });

                const cx = 45;
                const cy = 45;

                return (
                  <div id="dossier-match-score" className="flex items-center gap-3 shrink-0">
                    {/* Tiny Custom Radar Chart */}
                    <div className="relative group/radar">
                      <svg width="90" height="90" viewBox="0 0 90 90" className="drop-shadow-md">
                        {/* Radar grid level 3 (Outer pentagon) */}
                        <polygon
                          points={getRadarPoints([ {value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100} ], cx, cy, 25)}
                          fill="none"
                          stroke="rgba(197, 160, 89, 0.15)"
                          strokeWidth="1"
                        />
                        {/* Radar grid level 2 */}
                        <polygon
                          points={getRadarPoints([ {value: 66}, {value: 66}, {value: 66}, {value: 66}, {value: 66} ], cx, cy, 25)}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="0.8"
                        />
                        {/* Radar grid level 1 */}
                        <polygon
                          points={getRadarPoints([ {value: 33}, {value: 33}, {value: 33}, {value: 33}, {value: 33} ], cx, cy, 25)}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="0.8"
                        />
                        {/* Radial Axis lines */}
                        {radialLinesPoints.map((pt, idx) => (
                          <line
                            key={idx}
                            x1={cx}
                            y1={cy}
                            x2={pt.x}
                            y2={pt.y}
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeWidth="0.8"
                          />
                        ))}
                        {/* User polygon (dash blue) */}
                        <polygon
                          points={getRadarPoints(traitsUser, cx, cy, 25)}
                          fill="rgba(59, 130, 246, 0.12)"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                        {/* Candidate polygon (glowing gold) */}
                        <polygon
                          points={getRadarPoints(traitsCandidate, cx, cy, 25)}
                          fill="rgba(197, 160, 89, 0.25)"
                          stroke="#c5a059"
                          strokeWidth="1.5"
                        />
                        
                        {/* Labels (E, N, L, S, H) */}
                        {[
                          { text: 'E', x: 45, y: 11, anchor: 'middle' },
                          { text: 'N', x: 78, y: 37, anchor: 'start' },
                          { text: 'L', x: 67, y: 75, anchor: 'start' },
                          { text: 'S', x: 23, y: 75, anchor: 'end' },
                          { text: 'H', x: 12, y: 37, anchor: 'end' }
                        ].map((lbl, idx) => (
                          <text
                            key={idx}
                            x={lbl.x}
                            y={lbl.y}
                            textAnchor={lbl.anchor}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="rgba(255, 255, 255, 0.4)"
                            className="select-none"
                          >
                            {lbl.text}
                          </text>
                        ))}
                      </svg>
                      {/* Interactive subtle tooltip/legend of metrics on hover */}
                      <div className="absolute right-0 top-full mt-1 hidden group-hover/radar:block bg-[#0e0e11] border border-white/10 p-2 rounded-lg text-[8px] font-mono text-white/70 space-y-0.5 whitespace-nowrap shadow-xl z-30">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                          <span>{t("Blue: You", "নীল: আপনি")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                          <span>{t("Gold: Candidate", "সোনালী: ম্যাচ")}</span>
                        </div>
                        <div className="text-[7.5px] border-t border-white/5 pt-1 mt-1 font-sans text-white/50">
                          {t("E: Extraversion • N: Intuitive • L: Logic", "E: বহির্মুখীতা • N: অন্তর্দৃষ্টি • L: যুক্তি")}<br />{t("S: Structure • H: Harmony", "S: কাঠামো • H: সম্প্রীতি")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-mono font-black text-white tracking-tight">
                        {score}%
                      </span>
                      <div className="text-[8px] font-mono bg-[#c5a059] text-black px-1.5 rounded uppercase font-bold mt-0.5">
                        {score >= 95 
                          ? t("Golden Pair Link", "সুপার গোল্ডেন ম্যাচ") 
                          : score >= 85 
                            ? t("High Interlock", "উচ্চ কগনিটিভ মিলন") 
                            : t("Compatible", "উত্তম মিল")
                        }
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Interactive Dossier Tabs/Information Blocks */}
            <div className="space-y-4">
              {/* Bio Block */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                   <Info className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>{t("Cognitive Bio Blueprint", "কগনিটিভ পরিচিতি বিবরণী")}</span>
                </h4>
                <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-[#c1cadb] font-sans">
                  {expandedCandidate.bio || t("This system operator is currently navigating secure interlock nodes. Initiate a mutual lifestyle quiz overlay to unlock additional synchronized cognitive patterns and personalized custom communication templates.", "কমিউনিকেশন চ্যানেল সুরক্ষিত করা হয়েছে। কগনিটিভ প্রোফাইল ও সিগন্যাল সংযোগ করতে সরাসরি ম্যাচকে মেসেজ পাঠান বা স্বয়ংক্রিয় সিঙ্ক শুরু করুন।")}
                </div>
              </div>

              {/* MBTI Diagnostic Stack details */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>{t("MBTI Cognitive Stack", "এমবিটিআই কগনিটিভ প্যারামিটার")} ({expandedCandidate.mbti})</span>
                </h4>
                <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-2 text-left">
                  {getCognitiveStack(expandedCandidate.mbti).map((func, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                      <div className="text-[9px] font-mono text-[#c5a059]">{t(`FUNCTION ${i + 1}`, `ফাংশন স্তর ${i + 1}`)}</div>
                      <div className="text-[10px] text-white/80 font-sans mt-0.5 truncate">{func}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Interests/Vibes tags list */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{t("Synergic Interest Flags", "সিনার্জিক পছন্দসমূহ")}</h4>
                <div className="flex flex-wrap gap-1.5 p-1">
                  {expandedCandidate.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="bg-white/5 hover:bg-[#c5a059]/10 border border-white/10 hover:border-[#c5a059]/40 px-3 py-1 rounded-lg text-[10px] text-white/70 font-mono transition-colors"
                    >
                      #{interest.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Aura Safe Node Proximity Radar */}
              <AuraSafeNodeMap 
                location={expandedCandidate.location || t('Local Grid', 'নিকটবর্তী বৃত্ত')} 
                candidateName={expandedCandidate.name} 
                isBangla={isBangla}
              />
            </div>

            {/* Direct Dossier SWIPE Action Overlays */}
            <div className="pt-4 mt-auto">
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                <button
                  onClick={() => handleSwipeSpecificCard(expandedCandidate, false)}
                  className="bg-white/5 hover:bg-red-950/20 active:scale-95 text-red-400 hover:text-red-500 border border-white/10 hover:border-red-500/25 py-3 px-2 rounded-xl font-mono text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>{t("SKIP METRIC", "বাতিল করুন")}</span>
                </button>

                <button
                  onClick={() => handleMessageClick(expandedCandidate)}
                  className="bg-blue-950/30 hover:bg-blue-900/40 active:scale-95 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/45 py-3 px-2 rounded-xl font-mono text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t("MESSAGE", "মেসেজ পাঠান")}</span>
                </button>

                <button
                  onClick={() => handleSwipeSpecificCard(expandedCandidate, true)}
                  className="bg-gradient-to-r from-[#c5a059] to-amber-600 hover:from-[#d4b57a] hover:to-amber-500 active:scale-95 text-black py-3 px-2 rounded-xl font-mono text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#c5a059]/10"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{t("INIT SYNC", "সিঙ্ক করুন")}</span>
                </button>
              </div>

              {/* Unique Blind Date option for Elite users */}
              {currentUser.tier === 'Elite' && (
                <button
                  onClick={() => {
                    if (onNavigateToBlindRoom) {
                      onNavigateToBlindRoom();
                    }
                  }}
                  className="w-full mt-3 bg-gradient-to-r from-[#c5a059]/15 via-purple-950/50 to-[#c5a059]/15 hover:from-[#c5a059]/35 hover:via-purple-900/50 hover:to-[#c5a059]/35 border border-[#c5a059]/40 hover:border-[#c5a059]/80 rounded-xl py-3 text-[#c5a059] font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(197,160,89,0.1)]"
                >
                  <Sparkles className="w-4 h-4 text-[#c5a059] animate-pulse" />
                  <span>{t("LAUNCH SECURE BLIND DATE", "ব্লাইন্ড ডেট শুরু করুন")}</span>
                </button>
              )}

              <p className="text-[9px] text-center text-white/30 font-mono italic mt-3">
                {t("Decisively interlocks signals and closes security file.", "ব্যক্তিত্ব ম্যাচিং সম্পন্ন করে ফাইল বন্ধ করা হচ্ছে।")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Popups for Premium/Same-Tier Restrictions */}
      {popupContent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm bg-[#0d0d0f] border border-[#c5a059]/30 rounded-3xl p-6 space-y-5 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Top gold visual border decoration */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#c5a059]/10 via-[#c5a059]/70 to-[#c5a059]/10" />
            
            <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center mx-auto text-[#c5a059]">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[#c5a059] font-serif italic text-base font-bold">
                {popupContent.title}
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                {popupContent.message}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {popupContent.actionText && (
                <button
                  type="button"
                  onClick={() => {
                    if (popupContent.onAction) {
                      popupContent.onAction();
                    } else {
                      setPopupContent(null);
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#c5a059] to-amber-600 hover:from-[#d4b57a] hover:to-amber-500 text-black text-xs font-mono font-black rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                >
                  {popupContent.actionText}
                </button>
              )}

              <button
                type="button"
                onClick={() => setPopupContent(null)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[11px] font-mono rounded-xl border border-white/5 transition-colors cursor-pointer"
              >
                {t("DISMISS SYSTEM NODE", "প্যানেল বন্ধ করুন")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
