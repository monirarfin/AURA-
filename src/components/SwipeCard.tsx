import React, { useState, useRef } from "react";
import { ClubProfile } from "../utils/mockClubData";
import { ShieldSVG } from "./SVGIcons";

interface SwipeCardProps {
  profile: ClubProfile;
  onSwipe: (direction: "like" | "super" | "reject", profile: ClubProfile) => void;
  isTop: boolean;
  isBangla: boolean;
}

export function SwipeCard({ profile, onSwipe, isTop, isBangla }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, rot: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const t = (en: string, bn: string) => {
    return isBangla ? bn : en;
  };

  const swipeOpacity = Math.min(Math.abs(pos.x) / 80, 1);
  const isRight = pos.x > 15;
  const isLeft = pos.x < -15;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTop) return;
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    setPos({ x: dx, y: dy * 0.32, rot: dx * 0.055 });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (cardRef.current) {
      cardRef.current.releasePointerCapture(e.pointerId);
    }

    if (pos.x > 90) {
      onSwipe("like", profile);
    } else if (pos.x < -90) {
      onSwipe("reject", profile);
    } else if (pos.y < -65) {
      onSwipe("super", profile);
    } else {
      setPos({ x: 0, y: 0, rot: 0 });
    }
    setStart(null);
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="absolute inset-0 select-none touch-none swipe-card overflow-hidden"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rot}deg)`,
        transition: dragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
        zIndex: isTop ? 10 : 1,
      }}
    >
      {/* Visual Canvas Gradient Backdrop */}
      <div
        className="absolute inset-0 rounded-[28px]"
        style={{ background: profile.gradient }}
      />

      {/* Decorative Aura Spot Radial Glow */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 rounded-[28px]"
        viewBox="0 0 340 580"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`rg-${profile.id}`} cx="50%" cy="30%" r="45%">
            <stop stopColor={profile.accent} stopOpacity="0.88" />
            <stop offset="65%" stopColor={profile.accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="170" cy="220" rx="120" ry="220" fill={`url(#rg-${profile.id})`} />
      </svg>

      {/* Elegant dark scrim elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent rounded-[28px] pointer-events-none" />

      {/* Swipe Real-time Stamp Badges */}
      {isRight && (
        <div
          className="absolute top-24 left-8 border-[3px] border-[#4ade80] rounded-xl px-4 py-1.5 rotate-[-12deg] z-20 pointer-events-none text-[#4ade80] font-bold font-serif text-[18px] tracking-widest shadow-md bg-black/45 backdrop-blur-sm"
          style={{ opacity: swipeOpacity }}
        >
          AURA ✓
        </div>
      )}
      {isLeft && (
        <div
          className="absolute top-24 right-8 border-[3px] border-[#f87171] rounded-xl px-4 py-1.5 rotate-[12deg] z-20 pointer-events-none text-[#f87171] font-bold font-serif text-[18px] tracking-widest shadow-md bg-black/45 backdrop-blur-sm"
          style={{ opacity: swipeOpacity }}
        >
          SKIP ✗
        </div>
      )}
      {pos.y < -25 && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-4xl"
          style={{ opacity: swipeOpacity }}
        >
          ⭐
        </div>
      )}

      {/* Top badges Row */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          {profile.elite && <span className="elite-badge">👑 ELITE</span>}
          {profile.stealth && <span className="stealth-badge">🛡️ STEALTH active</span>}
        </div>
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#C9A84C]/25 text-[10px] text-white/75 font-sans">
          📍 {t(profile.city, profile.city === "Dhaka" ? "ঢাকা" : profile.city === "Chittagong" ? "চট্টগ্রাম" : "সিলেট")}
        </div>
      </div>

      {/* Custom Compatibility Golden Ratio Banner */}
      <div className="absolute top-16 left-4 right-4 z-10 animate-[glowPulse_2.8s_infinite_ease-in-out]">
        <div className="bg-gradient-to-r from-[#201503]/95 to-[#0b0701]/95 border border-[#C9A84C]/50 rounded-xl p-2.5 backdrop-blur-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🧬</span>
            <div className="text-left">
              <span className="block font-serif text-[8.5px] text-[#C9A84C] tracking-widest uppercase font-bold">
                {t("GOLDEN PAIR MATRIX", "গোল্ডেন পেয়ার ইনডেক্স")}
              </span>
              <span className="block font-serif text-[12.5px] text-[#FFE066] font-bold mt-0.5">
                {profile.compatibility}% {t("Vibe Compatibility", "কগনিটিভ তরঙ্গ")}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="block font-sans text-[7.5px] text-white/40 tracking-wider">PAIR CODE</span>
            <span className="block font-serif text-xs text-[#FFE066] font-medium mt-0.5">{profile.vibeMatch}</span>
          </div>
        </div>
        {/* Underbar indicator */}
        <div className="mt-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8B6914] to-[#C9A84C]"
            style={{ width: `${profile.compatibility}%` }}
          />
        </div>
      </div>

      {/* Dynamic Profile credentials footer overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4.5 z-10 flex flex-col justify-end">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2 text-left">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="font-serif text-[23px] font-bold text-white tracking-wide">
                {profile.name}
              </h2>
              <span className="font-sans text-[18px] text-white/60 font-light">
                {profile.age}
              </span>
              {profile.elite && <span className="text-xs text-amber-400">💎</span>}
            </div>
            <div className="flex items-center gap-2 mt-1 font-mono text-[10px]/none text-white/50">
              <span className="text-[#C9A84C] font-bold font-sans">MBTI: {profile.mbti}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{t(profile.intent, profile.intent === "Long-term" ? "দীর্ঘমেয়াদী সম্পর্ক" : "ক্যাজুয়াল সম্পর্ক")}</span>
            </div>
          </div>

          {/* Level level status protection emblem badge */}
          <div className="flex flex-col items-center shrink-0">
            <ShieldSVG size={36} />
            <span className="font-serif text-[7px] text-[#C9A84C] font-bold uppercase tracking-wider mt-1 block">
              Level 4 Verified
            </span>
          </div>
        </div>

        {/* Bio description */}
        {expanded && (
          <p className="font-serif italic text-[12px] text-white/70 leading-relaxed mb-2.5 text-left animate-[fadeIn_0.25s_ease_both]">
            "{t(profile.bio, "কলোনিয়াল আর্কিটেকচার এর ছাত্রী। কফি কাপ হাতে বইয়ের জগতে হারিয়ে যাওয়া আমার দীর্ঘদিনের স্বভাব।")}"
          </p>
        )}

        {/* Tags with toggle button */}
        <div className="flex flex-wrap gap-1 mt-1">
          {profile.tags.map(tag => (
            <span key={tag} className="tag-pill text-[9.5px]">
              {tag}
            </span>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(prev => !prev);
            }}
            className="tag-pill border-[#C9A84C]/40 text-[#FFE066] font-mono text-[9px] cursor-pointer"
          >
            {expanded ? t("▲ LESS", "▲ কম") : t("▼ MORE", "▼ বেশি")}
          </button>
        </div>
      </div>
    </div>
  );
}
