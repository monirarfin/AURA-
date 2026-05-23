import React, { useState } from 'react';
import { UserProfile, Conversation, UserTier } from '../types';
import { calculateMatchScore } from '../utils/mbtiMatcher';
import DiscoveryFeed from './DiscoveryFeed';
import { Heart, X, MessageSquare, Sparkles, Send, ShieldAlert, BadgeInfo, Check, RefreshCw, SlidersHorizontal, Award, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

interface AURAAppProps {
  currentUser: UserProfile;
  candidates: UserProfile[];
  conversations: Conversation[];
  onUpdateCurrentUser: (updated: UserProfile) => void;
  onSendMessage: (matchId: string, text: string) => void;
  onTriggerMatch: (matchId: string, customIcebreaker?: string) => void;
  onNavigateToBlindRoom?: () => void;
}

interface SwipeCardProps {
  key?: string;
  candidate: UserProfile;
  currentUser: UserProfile;
  getMbtiCompatibility: (m1: string, m2: string, partnerId?: string) => { tier: number; score: number; label: string };
  onSwipe: (liked: boolean) => void;
  isActive: boolean;
}

function SwipeCard({
  candidate,
  currentUser,
  getMbtiCompatibility,
  onSwipe,
  isActive
}: SwipeCardProps) {
  const [isSwipingOut, setIsSwipingOut] = useState(false);
  const [swipeSide, setSwipeSide] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Derive rotation and opacity during drag
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 0.9, 1, 0.9, 0.5]);

  // Floating stamps opacity
  const vibeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_event: any, info: any) => {
    if (!isActive || isSwipingOut) return;
    const threshold = 130;
    if (info.offset.x > threshold) {
      setIsSwipingOut(true);
      setSwipeSide('right');
      setTimeout(() => {
        onSwipe(true);
      }, 200);
    } else if (info.offset.x < -threshold) {
      setIsSwipingOut(true);
      setSwipeSide('left');
      setTimeout(() => {
        onSwipe(false);
      }, 200);
    }
  };

  const triggerSwipe = (liked: boolean) => {
    if (isSwipingOut) return;
    setIsSwipingOut(true);
    setSwipeSide(liked ? 'right' : 'left');
    setTimeout(() => {
      onSwipe(liked);
    }, 200);
  };

  const comp = getMbtiCompatibility(currentUser.mbti, candidate.mbti, candidate.id);

  return (
    <motion.div
      style={isActive ? { x, y, rotate, opacity } : {}}
      drag={isActive && !isSwipingOut ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={
        isSwipingOut
          ? { x: swipeSide === 'right' ? 550 : -550, rotate: swipeSide === 'right' ? 25 : -25, opacity: 0 }
          : { x: 0, y: 0, scale: isActive ? 1 : 0.95, opacity: isActive ? 1 : 0.75 }
      }
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className={`absolute inset-0 bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
        isActive ? 'z-10 cursor-grab active:cursor-grabbing' : 'z-0 pointer-events-none'
      }`}
    >
      {/* Full-screen Profile Image */}
      <div className="absolute inset-0 w-full h-full select-none">
        <img
          src={candidate.avatar}
          alt={candidate.name}
          className="w-full h-full object-cover select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Shrunk top scrim */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        {/* Rich bottom details scrim */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      </div>

      {/* Real-time drag stamps */}
      {isActive && (
        <>
          <motion.div
            style={{ opacity: vibeOpacity }}
            className="absolute top-24 left-8 border-4 border-[#c5a059] text-[#c5a059] font-black tracking-widest uppercase rounded-xl px-4 py-1.5 text-2xl font-mono rotate-[-12deg] z-20 shadow-lg shadow-black/40 pointer-events-none"
          >
            VIBE ✨
          </motion.div>
          <motion.div
            style={{ opacity: skipOpacity }}
            className="absolute top-24 right-8 border-4 border-red-500/80 text-red-400 font-black tracking-widest uppercase rounded-xl px-4 py-1.5 text-2xl font-mono rotate-[12deg] z-20 shadow-lg shadow-black/40 pointer-events-none"
          >
            SKIP ⚔️
          </motion.div>
        </>
      )}

      {/* Tier Stamps & Premium AI Compatibility Badges in Top Control Layer */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
        <span className={`border px-3 py-1.5 rounded-full text-[9px] font-black font-mono uppercase tracking-widest shadow-md ${
          candidate.tier === 'Elite' ? 'bg-[#c5a059] text-black border-[#c5a059]' :
          candidate.tier === 'Standard' ? 'bg-[#1a1a1e] text-[#c5a059] border-[#c5a059]/40' :
          'bg-[#1a1a1e]/80 text-[#e0e0e0]/40 border-white/5 shadow-md'
        }`}>
          {candidate.tier} Plan
        </span>

        <div className="flex flex-col items-end gap-1.5">
          <span className="bg-black/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-[#c5a059] font-mono border border-[#c5a059]/30 shadow-md">
            {candidate.mbti}
          </span>
          {comp.label === 'Vibe Checked Refined' ? (
            <span className="bg-gradient-to-r from-emerald-500 to-[#c5a059] text-black px-2.5 py-1 rounded-lg text-[9px] font-black font-mono tracking-wider shadow-lg shadow-[#c5a059]/20 flex items-center gap-1 border border-emerald-400/50 animate-pulse">
              ✨ {comp.score}% COGNITIVE SYNC
            </span>
          ) : comp.tier === 1 ? (
            <span className="bg-gradient-to-r from-[#c5a059] to-[#dfba70] text-black px-2.5 py-1 rounded-lg text-[9px] font-black font-mono tracking-wider shadow-lg shadow-black/80 flex items-center gap-1 border border-[#c5a059]/60">
              ✨ 98% GOLDEN PAIR
            </span>
          ) : comp.tier === 2 ? (
            <span className="bg-white/10 backdrop-blur-sm text-white/95 px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono tracking-wider border border-white/10 shadow-md">
              85% COMPATIBLE
            </span>
          ) : (
            <span className="bg-black/40 backdrop-blur-sm text-white/50 px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider border border-white/5 shadow-md">
              65% MATCH
            </span>
          )}
        </div>
      </div>

      {/* Quick Info details overlay (Name, Age, Bios) */}
      <div className="mt-auto p-6 z-10 relative text-left pointer-events-none">
        <h3 className="text-2xl font-serif italic font-bold flex items-baseline gap-2 text-[#c5a059]">
          {candidate.name}
          <span className="text-sm font-normal text-white/60 font-mono italic">{candidate.age} y/o</span>
        </h3>
        <p className="text-[10px] text-[#848fa5] font-mono tracking-wider">{candidate.location}</p>
        <p className="text-xs text-white/85 leading-relaxed font-sans mt-3 line-clamp-3 bg-black/40 backdrop-blur-xs p-3 rounded-2xl border border-white/5 shadow-inner">
          {candidate.bio}
        </p>
      </div>

      {/* Actions (Floating Buttons) Layer inside/overlapping bottom */}
      {isActive && (
        <div className="px-6 pb-6 pt-2 z-20 flex items-center justify-center gap-14 pointer-events-auto shrink-0 mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe(false);
            }}
            title="Reject partner"
            className="p-4 rounded-full bg-black/70 hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer shadow-xl transform active:scale-95"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe(true);
            }}
            title="Vibe & Like partner"
            className="p-4 rounded-full bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 hover:border-[#c5a059] shadow-xl hover:shadow-[#c5a059]/15 transition-all cursor-pointer transform active:scale-95"
          >
            <Heart className="w-7 h-7 fill-[#c5a059]/10 hover:fill-[#c5a059]" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

const VIBE_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Ideal Date Night vibe?",
    options: [
      { key: "A", text: "High-end Banani rooftop dining with candlelight & city lights", trait: "elegant" },
      { key: "B", text: "Quiet late-night walk by Gulshan Lake Park with deep conversations", trait: "intimate" },
      { key: "C", text: "Cozy movie-marathon at home under heavy blankets", trait: "cozy" },
      { key: "D", text: "High-adrenaline Escape Room adventure decoding complex puzzles", trait: "intellectual" }
    ]
  },
  {
    id: 2,
    question: "How do you handle social battery drainage?",
    options: [
      { key: "A", text: "Immediate Irish exit without explanations", trait: "individual" },
      { key: "B", text: "Find a quiet private corner together with my partner to talk", trait: "intimate" },
      { key: "C", text: "Power through the social exhaust with caffeine", trait: "outgoing" },
      { key: "D", text: "Recharge alone entirely before scheduling the next sync", trait: "independent" }
    ]
  },
  {
    id: 3,
    question: "Your primary digital texting style is...",
    options: [
      { key: "A", text: "Multi-paragraph structural thoughts & theories", trait: "intellectual" },
      { key: "B", text: "Minimalist, quick check-ins paired with absurd memes", trait: "playful" },
      { key: "C", text: "Voice notes clarifying exact vocal nuances", trait: "expressive" },
      { key: "D", text: "Only text to schedule physical face-to-face meetups", trait: "practical" }
    ]
  },
  {
    id: 4,
    question: "When resolving relationship tension, you rely on...",
    options: [
      { key: "A", text: "Strict objective logical analysis of facts", trait: "rational" },
      { key: "B", text: "Soft, deep empathetic validation of feelings first", trait: "empathetic" },
      { key: "C", text: "Giving each other silent space and sleeping on it", trait: "reflective" },
      { key: "D", text: "Immediate, raw, and intense face-to-face resolution", trait: "direct" }
    ]
  },
  {
    id: 5,
    question: "If trapped in a museum overnight, we are...",
    options: [
      { key: "A", text: "Sneaking into locked restricted vaults to explore", trait: "adventurous" },
      { key: "B", text: "Sitting silently in front of a single classic masterpiece", trait: "contemplative" },
      { key: "C", text: "Silly-posing to recreate ancient historical portraits", trait: "playful" },
      { key: "D", text: "Meticulously planning our escape routes with a mapped path", trait: "analytical" }
    ]
  },
  {
    id: 6,
    question: "What's your stance on spontaneous plan changes?",
    options: [
      { key: "A", text: "Love it! Keeps life sparkling and unpredictable", trait: "flexible" },
      { key: "B", text: "Tolerable, as long as the backup option is clearly better", trait: "logical" },
      { key: "C", text: "Highly stressful; I prefer strict established itineraries", trait: "structured" },
      { key: "D", text: "Indifferent; I naturally go with whatever flow occurs", trait: "adaptable" }
    ]
  },
  {
    id: 7,
    question: "Your absolute principal love language is...",
    options: [
      { key: "A", text: "Late-night unplugged deep intellectual conversations", trait: "intellectual" },
      { key: "B", text: "Acts of service & quiet practical protection", trait: "protective" },
      { key: "C", text: "Intimate quiet quality time in each other's spaces", trait: "intimate" },
      { key: "D", text: "Gifts chosen with high precise historical meaning", trait: "meaningful" }
    ]
  },
  {
    id: 8,
    question: "A partner's most attractive mental feature is...",
    options: [
      { key: "A", text: "Sharp-witted, lightning-fast banter & debate capability", trait: "witty" },
      { key: "B", text: "Quiet emotional wisdom and depth", trait: "wise" },
      { key: "C", text: "Wild, unapologetic creative and artistic chaos", trait: "creative" },
      { key: "D", text: "Grounded responsibility and structured execution", trait: "grounded" }
    ]
  },
  {
    id: 9,
    question: "Your comfort background noise level is...",
    options: [
      { key: "A", text: "Absolute absolute silence—not even a fan hum", trait: "silent" },
      { key: "B", text: "Lo-Fi hip hop or soft rain tapping on the window sill", trait: "lofi" },
      { key: "C", text: "Bustling hum of a crowded cosmopolitan coffee bar", trait: "bustling" },
      { key: "D", text: "Distant wind rustling in trees or ocean waves cracking", trait: "nature" }
    ]
  },
  {
    id: 10,
    question: "The perfect weekend getaway destination is...",
    options: [
      { key: "A", text: "Secluded cabin in the Sreemangal tea estates", trait: "calm" },
      { key: "B", text: "Vibrant exploration of Cox's Bazar or Chittagong hills", trait: "adventurous" },
      { key: "C", text: "Luxurious staycation in Gulshan with zero chores", trait: "indulgent" },
      { key: "D", text: "Backpacking across rural districts with zero pre-bookings", trait: "rugged" }
    ]
  },
  {
    id: 11,
    question: "In standard conversations, you prefer...",
    options: [
      { key: "A", text: "Dwelling on futuristic abstract theories and what-ifs", trait: "abstract" },
      { key: "B", text: "Exchanging realistic current events and concrete facts", trait: "concrete" },
      { key: "C", text: "Emotional venting, deep feelings, and personal growth paths", trait: "emotional" },
      { key: "D", text: "Playing absolute devil's advocate for mental sparring", trait: "playful" }
    ]
  },
  {
    id: 12,
    question: "When expressing appreciation, you lean towards...",
    options: [
      { key: "A", text: "Custom handmade art or a handwritten multi-page letter", trait: "creative" },
      { key: "B", text: "High-end durable physical goods that are premium quality", trait: "premium" },
      { key: "C", text: "Shared memory-based experiences (concert tickets, etc.)", trait: "experiential" },
      { key: "D", text: "Helpful, ultra-practical life hack gadgets", trait: "utilitarian" }
    ]
  },
  {
    id: 13,
    question: "Your standard vacation preparation mode is...",
    options: [
      { key: "A", text: "Meticulously spreadsheeted and checked down to the minute", trait: "structured" },
      { key: "B", text: "Completely open-ended, wandering wherever local roads lead", trait: "free" },
      { key: "C", text: "A couple of anchor restaurants, the rest is loose", trait: "balanced" },
      { key: "D", text: "Packed schedule meeting local friends and connections", trait: "social" }
    ]
  },
  {
    id: 14,
    question: "To you, 'mental chemistry' feels mostly like...",
    options: [
      { key: "A", text: "Exchanging books, concepts, and hyper-niche academic papers", trait: "scholarly" },
      { key: "B", text: "Playful teasing and light-hearted daily banter", trait: "witty" },
      { key: "C", text: "Co-existing in comfortable silence on separate tasks", trait: "calm" },
      { key: "D", text: "Strategizing and drafting plans for a brand new project", trait: "ambitious" }
    ]
  },
  {
    id: 15,
    question: "Your absolute dream lifestyle aesthetic together is...",
    options: [
      { key: "A", text: "Sleek, high-contrast golden minimalism", trait: "sleek" },
      { key: "B", text: "Sunlit cozy greenhouse filled with books and foliage", trait: "cozy" },
      { key: "C", text: "Sharp, high-tech neon cybernetic setup", trait: "modern" },
      { key: "D", text: "Classic, warm sepia analog film look", trait: "retro" }
    ]
  }
];

export default function AURAApp({
  currentUser,
  candidates,
  conversations,
  onUpdateCurrentUser,
  onSendMessage,
  onTriggerMatch,
  onNavigateToBlindRoom
}: AURAAppProps) {
  // Vibe Quiz Calibration States
  const [quizRefinedScores, setQuizRefinedScores] = useState<Record<string, number>>({});
  const [quizRefinedIcebreakers, setQuizRefinedIcebreakers] = useState<Record<string, string>>({});
  const [currentQuizCandidate, setCurrentQuizCandidate] = useState<UserProfile | null>(null);
  const [quizStep, setQuizStep] = useState<'quiz' | 'calculating' | 'result' | null>(null);
  const [activeQuizQuestionIndex, setActiveQuizQuestionIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [calculatingLogText, setCalculatingLogText] = useState("Initializing AURA Neural engine...");

  // Compatibility score finder - upgraded with standard standalone matching rules from mbtiMatcher.ts
  const getMbtiCompatibility = (m1: string, m2: string, partnerId?: string): { tier: number; score: number; label: string } => {
    // Leverage the new standalone calculateMatchScore function
    const rawScore = calculateMatchScore({ mbti: m1 } as UserProfile, { mbti: m2 } as UserProfile);
    const finalScore = partnerId && quizRefinedScores[partnerId] ? quizRefinedScores[partnerId] : rawScore;
    
    let tier = 3;
    let label = 'Neutral Compatibility';
    
    if (rawScore === 98) {
      tier = 1;
      label = 'Golden Pair';
    } else if (rawScore >= 80) {
      tier = 2;
      label = 'High Compatibility';
    }
    
    if (partnerId && quizRefinedScores[partnerId]) {
      label = 'Vibe Checked Refined';
    }

    return {
      tier,
      score: finalScore,
      label
    };
  };

  // Dynamically sort candidates such that Tier 1 Golden Pairs are ranked at the top,
  // then Tier 2 High matches, followed by Tier 3 Neutral ones.
  const sortedCandidates = [...candidates].sort((a, b) => {
    const compA = getMbtiCompatibility(currentUser.mbti, a.mbti).tier;
    const compB = getMbtiCompatibility(currentUser.mbti, b.mbti).tier;
    return compA - compB;
  });

  // Swipe controls
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTierFilter, setSelectedTierFilter] = useState<'All' | 'Elite' | 'Standard' | 'Basic' | 'Free'>('All');
  const [activeTab, setActiveTab] = useState<'swipe' | 'chats' | 'ai-match'>('swipe');
  const [feedMode, setFeedMode] = useState<'classic' | 'premium'>('premium');
  
  // Chat selections
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');

  // Filtering based on User Tier selection
  const filteredCandidates = sortedCandidates.filter(candidate => {
    if (selectedTierFilter === 'All') return true;
    return candidate.tier === selectedTierFilter;
  });

  // AI Matches state
  const [selectedAiMatchId, setSelectedAiMatchId] = useState(candidates[1]?.id || 'p2');
  const [aiReport, setAiReport] = useState<{
    score: number;
    strengths: string[];
    challenges: string[];
    chemistryAnalysis: string;
    icebreaker: string;
    isRealAI?: boolean;
    errorFeedback?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Upgrade Plan warning modal trigger
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [blockedMessageFeedback, setBlockedMessageFeedback] = useState('');

  // Swipe logic
  const activeCandidate = filteredCandidates.length > 0 ? filteredCandidates[currentIndex % filteredCandidates.length] : null;

  const handleSelectQuizOption = (optionKey: string, questionIndex: number) => {
    const updatedAnswers = [...quizAnswers];
    updatedAnswers[questionIndex] = optionKey;
    setQuizAnswers(updatedAnswers);

    if (questionIndex < 14) {
      setActiveQuizQuestionIndex(questionIndex + 1);
    } else {
      setQuizStep('calculating');
      runQuizAnalysis(currentQuizCandidate, updatedAnswers);
    }
  };

  const runQuizAnalysis = (candidate: UserProfile | null, answers: string[]) => {
    if (!candidate) return;
    setCalculatingLogText("Connecting to AURA Cognitive synchronization matrix...");
    
    setTimeout(() => {
      setCalculatingLogText("Evaluating 15 lifestyle sync clusters...");
    }, 600);

    setTimeout(() => {
      setCalculatingLogText("Cross-matching MBTI cognitive functions (Fe vs Te)...");
    }, 1200);

    setTimeout(() => {
      setCalculatingLogText("Formulating bespoke Gemini-3.5-flash tailored icebreaker...");
    }, 1800);

    setTimeout(() => {
      const base = getMbtiCompatibility(currentUser.mbti, candidate.mbti, candidate.id);
      
      let matches = 0;
      for (let i = 0; i < answers.length; i++) {
        const partnerPref = ["A", "B", "C", "D"][(candidate.name.charCodeAt(i % candidate.name.length) + i) % 4];
        if (answers[i] === partnerPref) {
          matches += 1;
        }
      }

      let bonusIndex = Math.round((matches - 3) * 1.8);
      if (bonusIndex < -3) bonusIndex = -3;
      if (bonusIndex > 10) bonusIndex = 10;

      let refinedValue = base.score + bonusIndex;
      if (refinedValue > 99) refinedValue = 99;
      if (refinedValue < 50) refinedValue = 50;

      const nightChoice = answers[0] || 'B';
      const textChoice = answers[2] || 'A';
      const dreamChoice = answers[14] || 'B';

      let iceTemplate = "";
      if (nightChoice === 'B') {
        iceTemplate = `Hey ${candidate.name}! 🌅 Our AURA Vibe Check synchronized at ${refinedValue}%! Since we both love quiet late-night strolls by Gulshan Lake Park and deep conversations over loud rooftops, let's skip the standard noise. What is your go-to late-night thought?`;
      } else if (nightChoice === 'A') {
        iceTemplate = `Hi ${candidate.name}! ✨ An exceptional ${refinedValue}% AURA Vibe synchronization! We both appreciate a beautifully lit candlelight dinner on a high-end Banani rooftop. Let's arrange a time to discuss our grandest philosophical theories over capital city lights.`;
      } else if (nightChoice === 'C') {
        iceTemplate = `Hey ${candidate.name}! ☕ A cozy ${refinedValue}% vibe sync! Our answers show we'd both prefer a relaxed, warm living space and movie-marathons over high-energy clubs. What's the last film or documentary that deeply altered your cognitive focus?`;
      } else {
        iceTemplate = `Hey ${candidate.name}! 🧩 Decisive logic detected! We synced at ${refinedValue}%. Since we both enjoy solving adrenaline-pumping Escape Room puzzles, how about we teammate up and decode the ultimate personality match together?`;
      }

      if (dreamChoice === 'B') {
        iceTemplate += " Also, an indoor botanical greenhouse filled with trailing books sounds like the dream setup.";
      } else if (dreamChoice === 'C') {
        iceTemplate += " Also, that neon cyberpunk setup is absolutely stellar.";
      }

      setQuizRefinedScores(prev => ({
        ...prev,
        [candidate.id]: refinedValue
      }));

      setQuizRefinedIcebreakers(prev => ({
        ...prev,
        [candidate.id]: iceTemplate
      }));

      setQuizStep('result');
    }, 2400);
  };

  const handleSwipe = (liked: boolean) => {
    if (liked) {
      if (activeCandidate) {
        setCurrentQuizCandidate(activeCandidate);
        setQuizStep('quiz');
        setActiveQuizQuestionIndex(0);
        setQuizAnswers([]);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Check pricing constraints on chat initiation
  const checkChatInitiationRights = (sender: UserProfile, recipient: UserProfile): { allowed: boolean; reason: string } => {
    // Elite can text ANYONE
    if (sender.tier === 'Elite') {
      return { allowed: true, reason: '' };
    }

    // Free tier can browse only
    if (sender.tier === 'Free') {
      return { 
        allowed: false, 
        reason: "You are currently on the 'Free' tier (Browse-Only). All chatting capabilities require a premium socioeconomic tier." 
      };
    }

    // High tier lowers/same-tier override: Elite -> all allowed; Standard -> Basic, Free allowed; Basic -> Basic allowed.
    // If recipient has HIGHER tier than sender: (e.g. sender is Basic, recipient is Standard/Elite) -> Denied.
    const tierRanking: Record<UserTier, number> = {
      'Free': 0,
      'Basic': 1,
      'Standard': 2,
      'Elite': 3
    };

    const senderRank = tierRanking[sender.tier];
    const recipientRank = tierRanking[recipient.tier];

    if (senderRank < recipientRank) {
      return {
        allowed: false,
        reason: `Cross-Tier Restriction: As a ${sender.tier} tier member, you cannot initiate messages to a higher ${recipient.tier} list member. Upgrade your tier to enable outbound delivery.`
      };
    }

    // Basic limits: max 50 chats, can message Basic only
    if (sender.tier === 'Basic') {
      if (recipient.tier !== 'Basic') {
        return {
          allowed: false,
          reason: "Basic Plan (100 BDT) allows chatting exclusively with other 'Basic' tier members. Upgrade to message higher or lower members."
        };
      }
      return { allowed: true, reason: '' };
    }

    // Standard limits: max 100 chats, can message Standard & Basic
    if (sender.tier === 'Standard') {
      if (recipient.tier === 'Elite') {
        return {
          allowed: false,
          reason: "Standard Plan (300 BDT) allows messaging Standard and Basic/Free members only. Upgrade to Elite to text Elite members."
        };
      }
      return { allowed: true, reason: '' };
    }

    return { allowed: true, reason: '' };
  };

  // Attempt chat initiation or message sending
  const handleAttemptSend = (recipientId: string, text: string) => {
    if (!text.trim()) return;

    const recipient = candidates.find(c => c.id === recipientId);
    if (!recipient) return;

    const check = checkChatInitiationRights(currentUser, recipient);
    if (!check.allowed) {
      setBlockedMessageFeedback(check.reason);
      setShowUpgradeModal(true);
      return;
    }

    onSendMessage(recipientId, text);
    setTypedMessage('');
  };

  // Upgrade pricing trigger
  const handleUpgradeTier = (tier: UserTier) => {
    onUpdateCurrentUser({
      ...currentUser,
      tier
    });
    setShowUpgradeModal(false);
  };

  // Trigger Gemini MBTI Match API call
  const triggerAiMatchAnalysis = async () => {
    const partner = candidates.find(c => c.id === selectedAiMatchId);
    if (!partner) return;

    setAiLoading(true);
    setAiReport(null);

    try {
      const response = await fetch('/api/mbti-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMBTI: currentUser.mbti,
          partnerMBTI: partner.mbti,
          interests: currentUser.interests
        })
      });

      const data = await response.json();
      setAiReport(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setAiReport({
        score: 82,
        strengths: ["Highly structured thinking patterns complement emotional empathy", "Intuitive connection promotes deep nightly chats"],
        challenges: ["Difference in social energy schedules", "Conflict style approaches"],
        chemistryAnalysis: "An intriguing chemistry where INTJ cognitive logic pairs with complementary types.",
        icebreaker: "Hey! What's your theory on spontaneous adventures?",
        errorFeedback: "AURA cloud API offline. Fallback active."
      });
    } finally {
      setAiLoading(false);
    }
  };

  const selectedConversation = conversations.find(c => c.participantId === selectedChatId);
  const selectedPartner = candidates.find(c => c.id === selectedChatId);

  return (
    <div className="space-y-6">
      
      {/* Top Controller: Customize Your Persona / Tier */}
      <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <span className="text-xs text-white/50 font-mono block mb-1">Your MBTI Personality Type</span>
          <select
            value={currentUser.mbti}
            onChange={(e) => onUpdateCurrentUser({ ...currentUser, mbti: e.target.value })}
            className="bg-[#141417] text-xs text-[#e0e0e0] p-2.5 rounded-lg border border-white/10 w-full focus:outline-none focus:border-[#c5a059] font-mono"
          >
            {['INTJ', 'ENFP', 'INFJ', 'ESTP', 'INTP', 'ENTJ', 'ESFJ', 'ISTJ', 'ISFP', 'ENFJ'].map(m => (
              <option key={m} value={m}>{m} Personality</option>
            ))}
          </select>
        </div>

        <div>
          <span className="text-xs text-white/50 font-mono block mb-1">Active Socio-Economic Tier Plan</span>
          <div className="flex gap-1.5">
            <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono border ${
              currentUser.tier === 'Elite' ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/30' :
              currentUser.tier === 'Standard' ? 'bg-white/10 text-[#c5a059]/80 border-white/10' :
              currentUser.tier === 'Basic' ? 'bg-white/5 text-white/60 border-white/5' :
              'bg-[#1a1a1c]/40 text-white/40 border-white/5'
            }`}>
              {currentUser.tier} Tier
            </span>
            <button
              onClick={() => {
                setBlockedMessageFeedback("Explore the structured socio-economic capabilities of AURA Dating app:");
                setShowUpgradeModal(true);
              }}
              className="bg-[#1a1a1c] hover:bg-[#232327] text-[#c5a059] text-[11px] font-mono px-3.5 rounded-lg border border-[#c5a059]/30 transition-colors"
            >
              Configure Tier
            </button>
          </div>
        </div>

        <div className="text-xs text-[#848fa5] font-mono md:text-right">
          <p>Logged in: <span className="text-white font-serif italic text-sm">{currentUser.name}</span></p>
          <p className="text-[10px] text-[#c5a059]">ID: AURA-{currentUser.mbti}-GULSHAN</p>
        </div>
      </div>

      {/* Navigation Inside dating */}
      <div className="flex bg-[#0d0d0f] border border-white/5 p-1 rounded-xl text-xs font-mono">
        <button
          onClick={() => setActiveTab('swipe')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'swipe' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          Browse & Swipe
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer relative ${
            activeTab === 'chats' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          Active Chats ({conversations.length})
          {conversations.some(c => c.unreadCount > 0) && (
            <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-[#c5a059]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ai-match')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'ai-match' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#848fa5] hover:text-white'
          }`}
        >
          AURA AI MBTI Analyzer 🔮
        </button>
      </div>

      {/* Primary Layout Tabs */}
      <div className="min-h-[450px]">
        {/* TAB 1: SWIPER */}
        {activeTab === 'swipe' && (
          <div className="max-w-amber mx-auto relative px-4">
            
            {/* Discovery Mode Selection Toggle */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 bg-[#0d0d10] border border-white/5 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">DISCOVERY ENGINE:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedMode('classic')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    feedMode === 'classic'
                      ? 'bg-white/10 text-white font-bold border-white/20'
                      : 'text-white/40 hover:text-white border-transparent'
                  }`}
                >
                  CLASSIC CARDS
                </button>
                <button
                  onClick={() => setFeedMode('premium')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border flex items-center gap-1 ${
                    feedMode === 'premium'
                      ? 'bg-[#c5a059]/20 text-[#c5a059] font-bold border-[#c5a059]/40 shadow-[0_0_8px_rgba(197,160,89,0.15)]'
                      : 'text-white/40 hover:text-white border-transparent'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  PREMIUM 3D STACK ✨
                </button>
              </div>
            </div>

            {feedMode === 'premium' ? (
              <DiscoveryFeed
                currentUser={currentUser}
                candidates={filteredCandidates}
                conversations={conversations}
                onUpdateCurrentUser={onUpdateCurrentUser}
                onNavigateToBlindRoom={onNavigateToBlindRoom}
                onSwipeLiked={(candidate) => {
                  setCurrentQuizCandidate(candidate);
                  setQuizStep('quiz');
                  setActiveQuizQuestionIndex(0);
                  setQuizAnswers([]);
                }}
                onSwipeSkipped={() => {
                  // Standard index progression handles itself inside DiscoveryFeed
                }}
              />
            ) : (
              <>
                {/* Filter Component */}
                <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-4 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <SlidersHorizontal className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-[#c5a059] font-bold tracking-widest uppercase">FILTER DIRECTORY BY TIER_</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {(['All', 'Elite', 'Standard', 'Basic', 'Free'] as const).map(tier => {
                      const count = tier === 'All' ? candidates.length : candidates.filter(c => c.tier === tier).length;
                      const isActive = selectedTierFilter === tier;
                      
                      // Style colors based on premium values
                      let badgeColor = "border-white/5 text-white/50 bg-[#121215] hover:bg-white/5 hover:text-white";
                      if (isActive) {
                        if (tier === 'Elite') badgeColor = "border-[#c5a059] text-black bg-[#c5a059] font-bold shadow-[0_0_12px_rgba(197,160,89,0.3)]";
                        else if (tier === 'Standard') badgeColor = "border-purple-500 text-purple-200 bg-purple-950 font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]";
                        else if (tier === 'Basic') badgeColor = "border-blue-500 text-blue-200 bg-blue-950 font-bold shadow-[0_0_12px_rgba(59,130,246,0.3)]";
                        else if (tier === 'Free') badgeColor = "border-slate-500 text-slate-200 bg-slate-800 font-bold";
                        else badgeColor = "border-[#c5a059] text-[#c5a059] bg-[#c5a059]/15 font-bold shadow-[0_0_12px_rgba(197,160,89,0.15)]";
                      }
                      
                      return (
                        <button
                          key={tier}
                          onClick={() => {
                            setSelectedTierFilter(tier);
                            setCurrentIndex(0); // Reset swipe index to beginning of filtered list
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${badgeColor}`}
                        >
                          {tier === 'Elite' && <Award className="w-3.5 h-3.5 shrink-0" />}
                          {tier === 'Standard' && <Shield className="w-3.5 h-3.5 shrink-0" />}
                          {tier === 'Basic' && <Zap className="w-3.5 h-3.5 shrink-0" />}
                          <span>{tier.toUpperCase()}</span>
                          <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-black/25 text-current' : 'bg-white/5 text-white/30'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeCandidate ? (
                  <div className="relative w-full h-[510px] max-w-sm mx-auto flex items-center justify-center select-none overflow-visible">
                    <AnimatePresence mode="popLayout">
                      {/* Underneath Card (Preview of the next candidate) */}
                      {(() => {
                        if (filteredCandidates.length <= 1) return null;
                        const nextIndex = (currentIndex + 1) % filteredCandidates.length;
                        const nextCandidate = filteredCandidates[nextIndex];
                        if (nextCandidate && nextCandidate.id !== activeCandidate.id) {
                          return (
                            <SwipeCard
                              key={nextCandidate.id + "_next"}
                              candidate={nextCandidate}
                              currentUser={currentUser}
                              getMbtiCompatibility={getMbtiCompatibility}
                              onSwipe={() => {}}
                              isActive={false}
                            />
                          );
                        }
                        return null;
                      })()}

                      {/* Active Top Card (Fully Draggable) */}
                      <SwipeCard
                        key={activeCandidate.id}
                        candidate={activeCandidate}
                        currentUser={currentUser}
                        getMbtiCompatibility={getMbtiCompatibility}
                        onSwipe={handleSwipe}
                        isActive={true}
                      />
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-10 text-center text-white/50 font-mono text-xs space-y-3">
                    <p>No candidates available matching the selected tier filter.</p>
                    <button
                      onClick={() => {
                        setSelectedTierFilter('All');
                        setCurrentIndex(0);
                      }}
                      className="bg-[#c5a059] hover:bg-[#d4b57a] text-black font-semibold py-2.5 px-5 rounded-xl transition-all cursor-pointer font-mono text-xs"
                    >
                      Reset Filter & View All
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE CHATS */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-white/10 rounded-2xl overflow-hidden bg-[#0a0a0c]">
            
            {/* Sidebar list */}
            <div className="border-r border-white/10 bg-[#0c0c0e] h-[450px] overflow-y-auto">
              <div className="p-3 border-b border-white/5 text-[10px] font-mono text-[#c5a059] bg-[#0d0d0f]">
                Dating Match Pool
              </div>

              {conversations.map((chat) => {
                const partner = candidates.find(c => c.id === chat.participantId);
                if (!partner) return null;

                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.participantId)}
                    className={`w-full p-4 flex items-center gap-3 border-b border-white/5 text-left transition-all ${
                      selectedChatId === chat.participantId ? 'bg-[#c5a059]/10 border-l-4 border-[#c5a059]' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="relative">
                      <img src={partner.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black" />
                    </div>
                    
                    <div className="flex-1 min-w-0 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-[#e0e0e0] font-serif italic text-xs truncate">{partner.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 px-1.5 rounded font-mono uppercase">{partner.mbti}</span>
                          {(() => {
                            const comp = getMbtiCompatibility(currentUser.mbti, partner.mbti, partner.id);
                            return (
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-black ${
                                comp.label === 'Vibe Checked Refined' ? 'bg-emerald-500 text-black' : 'bg-[#c5a059] text-black'
                              }`}>
                                {comp.score}% VIBE
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      <p className="text-[11px] text-white/50 truncate font-sans mt-0.5">
                        {chat.messages[chat.messages.length - 1]?.text || "No texts exchanged."}
                      </p>
                    </div>
                  </button>
                );
              })}

              {conversations.length === 0 && (
                <div className="text-center py-10 text-white/40 font-mono text-xs p-4">
                  No active matches. Swipe "Like" on cards to establish conversations.
                </div>
              )}
            </div>

            {/* Chat Pane */}
            <div className="md:col-span-2 h-[450px] flex flex-col justify-between bg-[#0d0d0f]">
              {selectedPartner && selectedConversation ? (
                <>
                  {/* Top Bar */}
                  <div className="bg-[#141417] p-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={selectedPartner.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <h4 className="text-white font-serif italic text-xs leading-none">{selectedPartner.name}</h4>
                        <p className="text-[9px] text-white/40 font-mono mt-0.5">Tier: {selectedPartner.tier} • MBTI: {selectedPartner.mbti}</p>
                      </div>
                    </div>

                    <div className="text-[9px] font-mono text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-2 py-0.5 rounded-full">
                      Protected Connection
                    </div>
                  </div>

                  {/* Vibe Check Quiz invitation / status banner */}
                  {(() => {
                    const comp = getMbtiCompatibility(currentUser.mbti, selectedPartner.mbti, selectedPartner.id);
                    const isQuizCompleted = !!quizRefinedScores[selectedPartner.id];
                    return isQuizCompleted ? (
                      <div className="bg-emerald-500/5 border-b border-emerald-500/10 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                        <span className="flex items-center gap-1.5 font-sans">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Vibe Check Certified: Aligned Vibe index at <strong className="text-white">{comp.score}%</strong></span>
                        </span>
                        <button
                          onClick={() => {
                            setCurrentQuizCandidate(selectedPartner);
                            setQuizStep('quiz');
                            setActiveQuizQuestionIndex(0);
                            setQuizAnswers([]);
                          }}
                          className="text-[#c5a059] hover:underline font-bold transition-all text-[10px]"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#c5a059]/5 border-b border-[#c5a059]/10 px-4 py-2 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#c5a059]/90 flex items-center gap-1.5 font-sans">
                          <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-pulse shrink-0" />
                          <span>Refine your AI compatibility and unlock icebreakers for this connection.</span>
                        </span>
                        <button
                          onClick={() => {
                            setCurrentQuizCandidate(selectedPartner);
                            setQuizStep('quiz');
                            setActiveQuizQuestionIndex(0);
                            setQuizAnswers([]);
                          }}
                          className="bg-[#c5a059] hover:bg-[#d4b57a] text-black text-[10.5px] px-3 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ml-2"
                        >
                          Start Vibe Quiz
                        </button>
                      </div>
                    );
                  })()}

                  {/* Messages Flow */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    {selectedConversation.messages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <motion.div 
                          key={msg.id} 
                          initial={{ opacity: 0, scale: 0.93, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 26 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs rounded-2xl p-3 text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-[#c5a059] text-black font-semibold rounded-tr-none' 
                              : 'bg-[#232327] text-white rounded-tl-none border border-white/5'
                          }`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Form */}
                  <div className="p-3 bg-[#0a0a0c] border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAttemptSend(selectedPartner.id, typedMessage)}
                      placeholder={`Send safe message as ${currentUser.tier} plan...`}
                      className="flex-1 bg-[#141417] border border-white/15 text-xs text-white p-2.5 rounded-xl focus:border-[#c5a059]/60 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAttemptSend(selectedPartner.id, typedMessage)}
                      className="bg-[#c5a059] hover:bg-[#d4b57a] text-black p-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs font-mono p-6 text-center space-y-2">
                  <MessageSquare className="w-10 h-10 text-[#232327]" />
                  <p>Select an established chat partner to engage.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: AI MBTI COMPATIBILITY */}
        {activeTab === 'ai-match' && (
          <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div>
                <h3 className="text-[#c5a059] font-serif italic text-base flex items-center gap-2">
                  <Sparkles className="text-[#c5a059] w-4 h-4" />
                  Gemini AI Match Intelligence Analyser 
                </h3>
                <p className="text-white/50 text-xs mt-1">
                  Evaluate mental fit profile stats with server-side <code className="text-[#c5a059]">gemini-3.5-flash</code> analysis.
                </p>
              </div>

              <div className="flex gap-2 text-xs font-mono items-center">
                <span className="text-white/40">Compare against:</span>
                <select
                  value={selectedAiMatchId}
                  onChange={(e) => setSelectedAiMatchId(e.target.value)}
                  className="bg-[#141417] text-white p-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#c5a059]"
                >
                  {sortedCandidates.map(candidate => {
                    const comp = getMbtiCompatibility(currentUser.mbti, candidate.mbti, candidate.id);
                    return (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.mbti}) - {comp.score}% match {comp.label === 'Vibe Checked Refined' ? "✨ Vibe Checked" : (comp.tier === 1 ? "✨ Golden Pair" : "")}
                      </option>
                    );
                  })}
                </select>

                <button
                  onClick={triggerAiMatchAnalysis}
                  disabled={aiLoading}
                  className="bg-[#c5a059] hover:bg-[#d4b57a] disabled:opacity-50 text-black font-semibold py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {aiLoading ? 'Analyzing...' : 'Unlock compatibility'}
                </button>
              </div>
            </div>

            {/* Results Output */}
            {aiReport ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score circle */}
                  <div className="bg-[#08080a] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-white/50 font-mono mb-3">Compatibility Score</span>
                    
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="46" className="stroke-white/5 fill-none" strokeWidth="8" />
                        <circle cx="56" cy="56" r="46" className="stroke-[#c5a059] fill-none transition-all duration-1000" strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 - (289 * aiReport.score) / 100} />
                      </svg>
                      <span className="absolute text-2xl font-black text-white font-mono">{aiReport.score}%</span>
                    </div>

                    <p className="text-[10px] text-[#c5a059] font-mono mt-4 flex items-center gap-1">
                      <BadgeInfo className="w-3.5 h-3.5" />
                      MBTI Cognitive compatibility active
                    </p>
                  </div>

                  {/* Chemistry overview */}
                  <div className="md:col-span-2 bg-[#08080a] border border-white/5 p-6 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/50 font-mono">AURA match chemistry analysis</span>
                      
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                        aiReport.isRealAI 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/25'
                      }`}>
                        {aiReport.isRealAI ? '♦ GEMINI LIVE AI' : '♦ HEURISTIC FALLBACK MODEL'}
                      </span>
                    </div>

                    <p className="text-white text-xs leading-relaxed font-sans mt-2">
                      {aiReport.chemistryAnalysis}
                    </p>

                    <div>
                      <p className="text-[#c5a059] text-[10px] uppercase font-bold tracking-wider font-mono mb-1">Recommended custom Icebreaker:</p>
                      <div className="bg-[#141417] border border-white/10 p-3 rounded-lg text-xs italic text-slate-200 text-left font-sans select-all cursor-pointer hover:bg-black/40 transition-all">
                        "{aiReport.icebreaker}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths and Challenges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <h5 className="text-[#c5a059] font-serif italic text-xs uppercase mb-3">Coupling Strengths</h5>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {aiReport.strengths.map((str, i) => (
                        <li key={i} className="flex gap-2 items-start leading-relaxed font-sans">
                          <Check className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <h5 className="text-red-400 font-serif italic text-xs uppercase mb-3">Coupling Challenges</h5>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {aiReport.challenges.map((chal, i) => (
                        <li key={i} className="flex gap-2 items-start leading-relaxed font-sans">
                          <span className="text-red-400 font-extrabold shrink-0 mt-0.5">!!</span>
                          <span>{chal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-white/40 font-mono text-xs">
                Select a candidate and click "Unlock compatibility" to parse personality dynamics with the Gemini AI.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Upgrade pricing plan warning modal overlay */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-[#c5a059]/30 p-6 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl relative animate-scaleIn">
            
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-[#c5a059]/10 rounded-full flex items-center justify-center text-[#c5a059] border border-[#c5a059]/20 font-sans">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-[#c5a059] font-serif italic text-lg font-bold">AURA Elite Membership Tiers</h3>
              <p className="text-xs text-white/60 font-mono px-3">
                {blockedMessageFeedback}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Basic Tier */}
              <div className="bg-[#1c1c21] border border-white/10 p-4 rounded-2xl space-y-2 relative">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-xs font-mono">Basic Tier</span>
                  <span className="text-xs text-[#c5a059] font-bold font-mono">100 BDT</span>
                </div>
                <p className="text-[10.5px] text-white/50 leading-relaxed font-mono">
                  Enunciates access to 50 active chats. Restricted exclusively to other Basic Tier members.
                </p>
                <button
                  onClick={() => handleUpgradeTier('Basic')}
                  className="w-full bg-[#2a2a30] hover:bg-[#34343a] text-[#c5a059] font-medium text-[11px] py-1.5 rounded-lg border border-[#c5a059]/20 transition-all cursor-pointer"
                >
                  Activate Basic (100 bdt)
                </button>
              </div>

              {/* Standard Tier */}
              <div className="bg-[#1c1c21] border border-[#c5a059]/30 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-xs font-mono">Standard Tier</span>
                  <span className="text-xs text-[#c5a059] font-bold font-mono">300 BDT</span>
                </div>
                <p className="text-[10.5px] text-white/50 leading-relaxed font-mono">
                  Access 100 active chats. Direct messaging enabled down to Basic/Free members.
                </p>
                <button
                  onClick={() => handleUpgradeTier('Standard')}
                  className="w-full bg-[#c5a059] hover:bg-[#d4b57a] text-black font-semibold text-[11px] py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Activate Standard (300 bdt)
                </button>
              </div>

              {/* Elite Tier */}
              <div className="sm:col-span-2 bg-[#2a2315]/50 border border-[#c5a059]/50 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-black/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-black text-xs font-mono">Elite AURA Tier</span>
                    <span className="bg-[#c5a059]/20 text-[#c5a059] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#c5a059]/30 uppercase">Ultimate</span>
                  </div>
                  <p className="text-[10px] text-white/60 font-mono leading-relaxed max-w-sm">
                    Unlimited structural chat access to all candidates across Elite, Standard, Basic, and Free.
                  </p>
                </div>

                <div className="text-right flex flex-col gap-1.5">
                  <span className="text-white font-bold text-xs font-mono">1,000 BDT / month</span>
                  <button
                    onClick={() => handleUpgradeTier('Elite')}
                    className="bg-[#c5a059] hover:bg-[#d4b57a] text-black font-bold text-[10.5px] px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-black/40"
                  >
                    Activate Elite (1,000 bdt)
                  </button>
                </div>
              </div>

            </div>

            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-medium py-2 rounded-xl text-xs font-mono border border-white/10 transition-all cursor-pointer"
            >
              Continue testing on Free Tier (Read Only)
            </button>
          </div>
        </div>
      )}

      {/* Vibe Check Calibration Modal Overlay */}
      {quizStep && currentQuizCandidate && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f0f12] border border-[#c5a059]/35 p-6 rounded-3xl max-w-2xl w-full min-h-[460px] flex flex-col justify-between shadow-2xl relative">
            
            {/* Header progress info */}
            <div className="border-b border-white/5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse" />
                <h3 className="text-[#c5a059] font-serif italic text-sm font-bold uppercase tracking-widest">
                  AURA VIBE CHANNEL CALIBRATION
                </h3>
              </div>
              <span className="text-[10px] font-mono text-white/40">
                Partner: <span className="text-white italic">{currentQuizCandidate.name} ({currentQuizCandidate.mbti})</span>
              </span>
            </div>

            {/* STAGE 1: QUIZ STEP */}
            {quizStep === 'quiz' && (
              <div className="my-auto py-4 space-y-6">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                    <span>NEURAL ALIGNMENT PROGRESS</span>
                    <span className="text-[#c5a059] font-bold font-mono">QUESTION {activeQuizQuestionIndex + 1} OF 15</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#c5a059] to-[#dfba70] transition-all duration-300"
                      style={{ width: `${((activeQuizQuestionIndex + 1) / 15) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="space-y-4">
                  <p className="text-[#848fa5] font-mono text-[10px] uppercase tracking-wider">
                    Query Block #{activeQuizQuestionIndex + 1}
                  </p>
                  <h4 className="text-[#e2e8f0] font-serif italic text-lg font-bold leading-relaxed">
                    {VIBE_QUIZ_QUESTIONS[activeQuizQuestionIndex].question}
                  </h4>
                </div>

                {/* Choices Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {VIBE_QUIZ_QUESTIONS[activeQuizQuestionIndex].options.map((opt) => {
                    const isSelected = quizAnswers[activeQuizQuestionIndex] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectQuizOption(opt.key, activeQuizQuestionIndex)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer transform active:scale-[0.99] flex gap-3 items-center ${
                          isSelected
                            ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#c5a059]'
                            : 'bg-[#141417]/80 hover:bg-[#1a1a20] border-white/5 hover:border-white/10 text-white/80'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#c5a059] text-black border-[#c5a059]'
                            : 'bg-black/40 text-white/40 border-white/10'
                        }`}>
                          {opt.key}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Back */}
                <div className="flex justify-between items-center pt-2">
                  {activeQuizQuestionIndex > 0 ? (
                    <button
                      onClick={() => setActiveQuizQuestionIndex(i => i - 1)}
                      className="text-[10px] font-mono text-white/40 hover:text-[#c5a059] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      ← BACK TO PREVIOUS COGNITIVE QUERY
                    </button>
                  ) : <div />}
                  <button
                    onClick={() => {
                      setQuizStep(null);
                      setCurrentQuizCandidate(null);
                    }}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-all cursor-pointer"
                  >
                    ABORT CALIBRATION
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: CALCULATING PROGRESS */}
            {quizStep === 'calculating' && (
              <div className="my-auto py-8 flex flex-col items-center justify-center space-y-6 text-center select-none">
                <RefreshCw className="w-12 h-12 text-[#c5a059] animate-spin mb-2" />
                
                <div className="space-y-2">
                  <h4 className="text-white font-serif italic text-base">
                    Calibrating compatibility wave dynamics...
                  </h4>
                  <div className="bg-black/50 border border-white/5 font-mono text-[10px] text-[#c5a059] py-2 px-6 rounded-xl animate-pulse min-w-[280px]">
                    {calculatingLogText}
                  </div>
                </div>

                <p className="text-[10px] text-white/30 font-mono italic max-w-xs">
                  Calculating perfect icebreaker triggers using real AURA matching indices.
                </p>
              </div>
            )}

            {/* STAGE 3: RESULTS AND CERTIFICATE */}
            {quizStep === 'result' && (
              <div className="my-auto py-2 space-y-6 select-text text-left">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                  
                  {/* Score side */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-4 bg-[#08080a] border border-white/5 rounded-2xl w-full">
                    <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                      REFINED VIBE COMPATIBILITY
                    </span>
                    
                    <div className="relative w-24 h-24 flex items-center justify-center mt-3 scale-110">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" className="stroke-white/5 fill-none" strokeWidth="6" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          className="stroke-emerald-500 fill-none transition-all duration-1000" 
                          strokeWidth="6" 
                          strokeDasharray="251" 
                          strokeDashoffset={251 - (251 * (quizRefinedScores[currentQuizCandidate.id] || 90)) / 100} 
                        />
                      </svg>
                      <span className="absolute text-xl font-black text-white font-mono">
                        {quizRefinedScores[currentQuizCandidate.id] || 90}%
                      </span>
                    </div>

                    <div className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono px-2 py-0.5 mt-4 rounded-md border border-emerald-500/20 font-bold uppercase tracking-wider">
                      VIBE SIGNATURE CERTIFIED
                    </div>
                  </div>

                  {/* Refined analysis text side */}
                  <div className="md:col-span-3 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#c5a059]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">NEURAL COUPLING SUCCESS_</span>
                    </div>
                    
                    <h4 className="text-white font-serif italic text-lg leading-snug">
                      Sync refined with {currentQuizCandidate.name}!
                    </h4>
                    
                    <p className="text-xs text-[#a0afca]/95 leading-relaxed font-sans">
                      AURA personality index analysis identifies strong alignment in dates, communication rhythms, and core relation ideals. Your compatibility profile has been upgraded to <strong className="text-emerald-400">{quizRefinedScores[currentQuizCandidate.id] || 90}% match</strong>!
                    </p>

                    <div className="bg-[#141417] border border-white/10 rounded-xl p-3 space-y-1.5 shadow-inner">
                      <p className="text-[9px] font-mono text-[#c5a059] uppercase tracking-wider font-bold">
                        Tailored Gemini-3.5 AI Icebreaker:
                      </p>
                      <blockquote className="text-xs italic text-slate-100 font-sans leading-relaxed select-all">
                        "{quizRefinedIcebreakers[currentQuizCandidate.id] || ''}"
                      </blockquote>
                    </div>
                  </div>

                </div>

                {/* Action button bar */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      // Trigger matched conversation!
                      const customGreet = quizRefinedIcebreakers[currentQuizCandidate.id];
                      onTriggerMatch(currentQuizCandidate.id, customGreet);
                      
                      // Switch tab to chats & select this profile
                      setSelectedChatId(currentQuizCandidate.id);
                      setActiveTab('chats');
                      
                      // Advance outer swiper index if the user was actively swiping
                      if (activeTab === 'swipe') {
                        setCurrentIndex(prev => prev + 1);
                      }
                      
                      // Close modal
                      setQuizStep(null);
                      setCurrentQuizCandidate(null);
                    }}
                    className="flex-1 bg-[#c5a059] hover:bg-[#d4b57a] text-black font-semibold py-2.5 px-5 rounded-xl transition-all font-mono text-xs text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10"
                  >
                    <MessageSquare className="w-4 h-4" />
                    🚀 Initialize Encrypted Chat
                  </button>

                  <button
                    onClick={() => {
                      // Trigger matched conversation!
                      const customGreet = quizRefinedIcebreakers[currentQuizCandidate.id];
                      onTriggerMatch(currentQuizCandidate.id, customGreet);

                      if (activeTab === 'swipe') {
                        setCurrentIndex(prev => prev + 1);
                      }

                      // Close modal (stay here / allow continuing swipes)
                      setQuizStep(null);
                      setCurrentQuizCandidate(null);
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white/70 py-2.5 px-4 rounded-xl border border-white/10 transition-all font-mono text-xs cursor-pointer"
                  >
                    Keep Browsing
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
