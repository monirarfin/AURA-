import React, { useState } from 'react';
import { UserProfile } from '../types';
import { calculateMatchScore } from '../utils/mbtiMatcher';
import { Heart, X, Sparkles, MapPin, RefreshCw, Award, Shield, Zap, Info, ChevronRight, Activity, Cpu } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { audioEngine } from '../utils/audio';

interface DiscoveryFeedProps {
  currentUser: UserProfile;
  candidates: UserProfile[];
  onSwipeLiked: (candidate: UserProfile) => void;
  onSwipeSkipped: (candidate: UserProfile) => void;
  soundEnabled?: boolean;
}

interface InteractiveCardProps {
  key?: string;
  candidate: UserProfile;
  currentUser: UserProfile;
  score: number;
  onSwipe: (liked: boolean) => void;
  isActive: boolean;
  onExpand: () => void;
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
const AuraSafeNodeMap = ({ location, candidateName }: { location: string; candidateName: string }) => {
  // Generate deterministic coordinates based on candidate's variables
  const lat = (34.0522 + (candidateName.length % 5) * 0.014).toFixed(4);
  const lng = (-118.2437 - (candidateName.charCodeAt(0) % 5) * 0.019).toFixed(4);
  const distance = (0.8 + (candidateName.length % 7) * 0.9).toFixed(1);

  return (
    <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 space-y-3 relative overflow-hidden">
      <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#c5a059] animate-pulse" />
          <span>AURA LOCATOR HYPER-NODE</span>
        </span>
        <span className="text-[#c5a059]">COORDS: [{lat}, {lng}]</span>
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
            {distance} km away
          </div>
        </div>
        
        {/* Outer radial scan sweep animation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#c5a059]/3 to-transparent rotate-45 animate-[spin_8s_linear_infinite] pointer-events-none" />
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
        <span>GRID RANGE: <strong className="text-white">{location}</strong></span>
        <span>NODE LINK: <strong className="text-emerald-400 font-bold">STABLE SECURE</strong></span>
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
  onExpand
}: InteractiveCardProps) => {
  const [isSwipingOut, setIsSwipingOut] = useState(false);
  const [swipeSide, setSwipeSide] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Derive tilt and opacity from horizontal drag distance
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 0.9, 1, 0.9, 0.5]);

  // VIBE & SKIP stamp opacity
  const vibeOpacity = useTransform(x, [0, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, 0], [1, 0]);

  const handleDragEnd = (_event: any, info: any) => {
    if (!isActive || isSwipingOut) return;
    const threshold = 140;

    if (info.offset.x > threshold) {
      setIsSwipingOut(true);
      setSwipeSide('right');
      setTimeout(() => onSwipe(true), 200);
    } else if (info.offset.x < -threshold) {
      setIsSwipingOut(true);
      setSwipeSide('left');
      setTimeout(() => onSwipe(false), 200);
    }
  };

  const badgeTierStyle = (tier: string) => {
    switch (tier) {
      case 'Elite':
        return 'bg-[#c5a059] text-black border-[#c5a059]/50 font-bold';
      case 'Standard':
        return 'bg-[#1a1a1e] text-[#c5a059] border-[#c5a059]/35';
      case 'Basic':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-900/60 text-slate-300 border-white/5';
    }
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
          : { x: 0, scale: isActive ? 1 : 0.94, y: isActive ? 0 : 12, opacity: isActive ? 1 : 0.6 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`absolute inset-0 bg-[#0c0c0e] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col ${
        isActive ? 'z-10 cursor-grab active:cursor-grabbing' : 'z-0 pointer-events-none'
      }`}
    >
      {/* Background Image of candidate */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
        <img
          src={candidate.avatar}
          alt={candidate.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Subtle gradients to enrich content layering */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Swipe Feedback Stamps (Only on active top card) */}
      {isActive && (
        <>
          <motion.div
            style={{ opacity: vibeOpacity }}
            className="absolute top-28 left-8 border-4 border-[#c5a059] text-[#c5a059] font-black tracking-widest uppercase rounded-xl px-4 py-1.5 text-2xl font-mono rotate-[-12deg] z-20 shadow-lg pointer-events-none"
          >
            VIBE ✨
          </motion.div>
          <motion.div
            style={{ opacity: skipOpacity }}
            className="absolute top-28 right-8 border-4 border-red-500 text-red-400 font-black tracking-widest uppercase rounded-xl px-4 py-1.5 text-2xl font-mono rotate-[12deg] z-20 shadow-lg pointer-events-none"
          >
            SKIP ⚔️
          </motion.div>
        </>
      )}

      {/* Top Header Information Overlay */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10 pointer-events-none">
        <span className={`border px-3 py-1.5 rounded-full text-[9px] font-black font-mono uppercase tracking-widest shadow-md flex items-center gap-1 bg-[#121215]/90 backdrop-blur-md ${badgeTierStyle(candidate.tier)}`}>
          {candidate.tier === 'Elite' && <Award className="w-3 h-3 text-black" />}
          {candidate.tier === 'Standard' && <Shield className="w-3 h-3 text-[#c5a059]" />}
          {candidate.tier === 'Basic' && <Zap className="w-3 h-3 text-blue-400" />}
          {candidate.tier} Member
        </span>

        <div className="flex flex-col items-end gap-1.5">
          <span className="bg-black/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-[#c5a059] font-mono border border-[#c5a059]/30 shadow-md">
            {candidate.mbti}
          </span>
          {score >= 95 ? (
            <span className="bg-gradient-to-r from-yellow-500 via-[#c5a059] to-amber-600 text-black px-2.5 py-1 rounded-lg text-[9px] font-black font-mono tracking-wider shadow-lg flex items-center gap-1 border border-yellow-400/50 animate-pulse">
              ✨ {score}% GOLDEN PAIR
            </span>
          ) : score >= 85 ? (
            <span className="bg-emerald-500 text-black px-2.5 py-1 rounded-lg text-[9px] font-black font-mono tracking-wider shadow-md flex items-center gap-0.5 border border-emerald-400/40">
              ⚡ {score}% SYNC RATE
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-sm text-[#a0afca] px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider border border-white/5 shadow-md">
              {score}% MATCH
            </span>
          )}
        </div>
      </div>

      {/* Frosted Glass Overlay/Drawer at the bottom for Name and Age - Made highly clickable to expand */}
      <div className="mt-auto p-5 z-10 pointer-events-none">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/5 hover:border-[#c5a059]/40 rounded-2xl p-4 text-left pointer-events-auto shadow-[0_12px_24px_rgba(0,0,0,0.6)] cursor-pointer transition-all group/drawer active:scale-[0.99] duration-200"
        >
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-serif italic font-extrabold text-[#c5a059] flex items-baseline gap-1.5 group-hover/drawer:text-white transition-colors">
              {candidate.name}
              <span className="text-white/60 text-sm font-sans font-normal font-mono">({candidate.age})</span>
            </h3>
            
            <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
              <MapPin className="w-3 h-3 text-[#c5a059]" />
              <span>{candidate.location}</span>
            </div>
          </div>

          <p className="text-[#c1cadb] text-xs leading-relaxed font-sans line-clamp-2 mt-2">
            {candidate.bio || "Secure digital avatar calibrated. Let's explore lifestyle sync and core personality alignments inside secure nodes."}
          </p>

          <div className="flex items-center justify-between gap-2 mt-3.5 border-t border-white/5 pt-3">
            <div className="flex flex-wrap gap-1">
              {candidate.interests.slice(0, 2).map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[9px] text-white/50 font-mono"
                >
                  #{interest.toUpperCase()}
                </span>
              ))}
              {candidate.interests.length > 2 && (
                <span className="text-[9px] text-white/30 font-mono px-1 py-0.5">
                  +{candidate.interests.length - 2}
                </span>
              )}
            </div>

            <span className="flex items-center gap-1 font-mono text-[9px] tracking-wider text-[#c5a059]/80 group-hover/drawer:text-[#c5a059] bg-[#c5a059]/10 rounded-md px-2 py-1 border border-[#c5a059]/15">
              <span>EXPLORE DOSSIER</span>
              <ChevronRight className="w-3 h-3 group-hover/drawer:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function DiscoveryFeed({
  currentUser,
  candidates,
  onSwipeLiked,
  onSwipeSkipped,
  soundEnabled = true
}: DiscoveryFeedProps) {
  const [index, setIndex] = useState(0);
  const [expandedCandidate, setExpandedCandidate] = useState<UserProfile | null>(null);

  const activeCandidate = candidates[index];

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

  return (
    <div className="w-full flex flex-col items-center py-4 relative">
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
              <h4 className="text-[#c5a059] font-serif italic text-base">Stack Exhausted</h4>
              <p className="max-w-[240px] text-[11px] text-[#a0afca]">
                You have analyzed all active MBTI profiles. Reset the discovery queue to sync signals again.
              </p>
              <button
                onClick={handleReset}
                className="bg-[#c5a059] hover:bg-[#d4b57a] text-black font-semibold py-2.5 px-6 rounded-xl transition-all cursor-pointer font-mono text-xs shadow-lg shadow-[#c5a059]/10 active:scale-95"
              >
                Reset Discovery Queue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons for Tinder Swiping */}
      {activeCandidate && !expandedCandidate && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => handleSwipe(false)}
            className="w-14 h-14 bg-[#141417] hover:bg-red-950/20 border border-white/5 hover:border-red-500/40 rounded-full flex items-center justify-center text-red-400 hover:text-red-500 transition-all shadow-xl active:scale-90 cursor-pointer group"
            title="Skip Candidate"
          >
            <X className="w-6 h-6 transition-transform group-hover:scale-110" />
          </button>

          <button
            onClick={handleReset}
            className="w-10 h-10 bg-[#141417]/80 hover:bg-[#141417] text-white/40 hover:text-[#c5a059] border border-white/5 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            title="Rewind / Restart Stack"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSwipe(true)}
            className="w-14 h-14 bg-gradient-to-tr from-[#c5a059]/20 to-yellow-500/10 hover:from-[#c5a059] hover:to-[#dfba70] border border-[#c5a059]/30 rounded-full flex items-center justify-center text-[#c5a059] hover:text-black transition-all shadow-xl shadow-yellow-500/5 active:scale-90 cursor-pointer group"
            title="Like / Trigger Sync"
          >
            <Heart className="w-6 h-6 fill-current transition-transform group-hover:scale-110" />
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
                <span className="text-[9px] font-mono tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20 uppercase">AURA SECURITY FILE</span>
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
                  <h4 className="text-xs font-mono text-[#c5a059] uppercase tracking-wider">Synergy Code Index</h4>
                  <p className="text-[10px] text-white/50 font-sans">Calculated via cognitive-pair metrics</p>
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
                          <span>Blue: You</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                          <span>Gold: Candidate</span>
                        </div>
                        <div className="text-[7.5px] border-t border-white/5 pt-1 mt-1 font-sans text-white/50">
                          E: Extraversion • N: Intuitive • L: Logic<br />S: Structure • H: Harmony
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-mono font-black text-white tracking-tight">
                        {score}%
                      </span>
                      <div className="text-[8px] font-mono bg-[#c5a059] text-black px-1.5 rounded uppercase font-bold mt-0.5">
                        {score >= 95 ? 'Golden Pair Link' : score >= 85 ? 'High Interlock' : 'Compatible'}
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
                  <span>Cognitive Bio Blueprint</span>
                </h4>
                <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-[#c1cadb] font-sans">
                  {expandedCandidate.bio || "This system operator is currently navigating secure interlock nodes. Initiate a mutual lifestyle quiz overlay to unlock additional synchronized cognitive patterns and personalized custom communication templates."}
                </div>
              </div>

              {/* MBTI Diagnostic Stack details */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>MBTI Cognitive Stack ({expandedCandidate.mbti})</span>
                </h4>
                <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-2 text-left">
                  {getCognitiveStack(expandedCandidate.mbti).map((func, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                      <div className="text-[9px] font-mono text-[#c5a059]">FUNCTION {i + 1}</div>
                      <div className="text-[10px] text-white/80 font-sans mt-0.5 truncate">{func}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Interests/Vibes tags list */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Synergic Interest Flags</h4>
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
                location={expandedCandidate.location || 'Local Grid'} 
                candidateName={expandedCandidate.name} 
              />
            </div>

            {/* Direct Dossier SWIPE Action Overlays */}
            <div className="pt-4 mt-auto">
              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                <button
                  onClick={() => handleSwipeSpecificCard(expandedCandidate, false)}
                  className="bg-white/5 hover:bg-red-950/20 active:scale-95 text-red-400 hover:text-red-500 border border-white/10 hover:border-red-500/25 py-3.5 px-4 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>SKIP METRIC</span>
                </button>

                <button
                  onClick={() => handleSwipeSpecificCard(expandedCandidate, true)}
                  className="bg-gradient-to-r from-[#c5a059] to-amber-600 hover:from-[#d4b57a] hover:to-amber-500 active:scale-95 text-black py-3.5 px-4 rounded-2xl font-mono text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/10"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>INIT SYNC</span>
                </button>
              </div>
              <p className="text-[9px] text-center text-white/30 font-mono italic mt-3">
                Decisively interlocks signals and closes security file.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
