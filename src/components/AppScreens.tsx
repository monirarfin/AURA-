import { useState } from "react";
import { ClubProfile, CLUBLIST_PROFILES } from "../utils/mockClubData";
import { AuraLogo, ShieldSVG, CoffeeKeySVG } from "./SVGIcons";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export function BottomNav({ activeTab, onTabChange, unreadCount = 2 }: BottomNavProps) {
  const TABS = [
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "search", icon: "🔍", label: "Discover" },
    { id: "swipe", isMain: true },
    { id: "matches", icon: "💫", label: "Matches" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-[#060401]/95 text-white flex items-center justify-around py-3 px-1.5 border-t border-[#C9A84C]/15 z-20"
      style={{
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        paddingBottom: "calc(16px + env(safe-area-inset-bottom, 12px))",
      }}
    >
      {TABS.map(tab =>
        tab.isMain ? (
          <button
            key="swipe"
            onClick={() => onTabChange("swipe")}
            className={`tab-btn flex flex-col items-center gap-1 shrink-0 ${activeTab === "swipe" ? "active" : ""}`}
            style={{ opacity: 1 }}
          >
            <div
              className="w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300"
              style={{
                background: activeTab === "swipe"
                  ? "linear-gradient(135deg, #8B6914, #D4AF37, #8B6914)"
                  : "linear-gradient(135deg, #181002, #2d1e04)",
                borderColor: "rgba(201, 168, 76, 0.65)",
                boxShadow: activeTab === "swipe"
                  ? "0 0 20px 6px rgba(201, 168, 76, 0.5)"
                  : "0 0 8px 1px rgba(201, 168, 76, 0.15)",
              }}
            >
              <span className="font-serif text-[8.5px] text-[#FFE066] font-bold tracking-widest leading-none">
                AURA
              </span>
            </div>
            <span
              className="font-serif text-[7px] tracking-wider block mt-0.5"
              style={{ color: activeTab === "swipe" ? "#C9A84C" : "rgba(201, 168, 76, 0.35)" }}
            >
              SWIPE
            </span>
          </button>
        ) : (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-btn relative ${activeTab === tab.id ? "active" : ""}`}
          >
            <span
              className="text-[20px] block transition-transform"
              style={{
                filter: activeTab === tab.id
                  ? "brightness(1.5) drop-shadow(0 0 4px rgba(201, 168, 76, 0.5))"
                  : "brightness(0.48)",
              }}
            >
              {tab.icon}
            </span>
            <span
              className="font-sans text-[9px] block mt-1 tracking-wide"
              style={{ color: activeTab === tab.id ? "rgba(201, 168, 76, 0.95)" : "rgba(255, 255, 255, 0.28)" }}
            >
              {tab.label}
            </span>

            {/* Simulated Unread Badge on Matches tab */}
            {tab.id === "matches" && unreadCount > 0 && (
              <span className="absolute top-0 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        )
      )}
    </div>
  );
}

// ─── CHAT CONVERSATION SCREEN ────────────────────────────────────────────────
interface ChatMessage {
  id: number;
  sender: "me" | "match";
  text: string;
  time: string;
}

interface ChatScreenProps {
  match: ClubProfile;
  onBack: () => void;
  isBangla: boolean;
}

export function ChatScreen({ match, onBack, isBangla }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "match",
      text: isBangla
        ? `হাই! কগনিটিভ পেয়ার মিল দেখে আনন্দিত হলাম। আমি একজন ${match.mbti}। আপনার কফি টেস্ট কেমন?`
        : `Greetings. Glad our cognitive waves matched! I'm an ${match.mbti}. What do you value most in coffee sessions?`,
      time: "10:14 AM",
    }
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const t = (en: string, bn: string) => (isBangla ? bn : en);

  const handleSend = () => {
    if (!text.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "me",
      text: text.trim(),
      time: "Just Now"
    };

    setMessages(prev => [...prev, userMessage]);
    const inputCopy = text;
    setText("");
    setTyping(true);

    // Dynamic MBTI Personality Auto responses
    setTimeout(() => {
      setTyping(false);
      const responses = [
        t(
          `Fascinating deduction! As an ${match.mbti}, I value deep logical reasoning combined with structural alignment. Let's send a request and book a vetted coffee suite.`,
          `দারুণ ধারণা! আমি একজন ${match.mbti} হিসেবে যৌক্তিক গঠন এবং পারস্পরিক বিশ্বস্ততা পছন্দ করি। চলুন আউরা বুকিং দিয়ে নিরাপদ রুমে দেখা করি।`
        ),
        t(
          `That makes perfect sense under our screenshot protected shield. Would you prefer Gulshan or Banani coordinates for the VIP blind coffee lounge?`,
          `স্ক্রিনশট শিল্ড প্রোটেকশনের নিচে এই যুক্তি একদম খাঁটি! আমাদের কফি সেশনের জন্য আপনি গুলশান নাকি বনানী জোনের সুইট বেছে নেবেন?`
        ),
        t(
          `Intriguing perspective. I usually paint or write philosophy when reading such dynamic thought patterns. Direct invitations are masked on AURA until acceptance!`,
          `খুব চমৎকার মানসিক মিল। আপনার মত মানুষের সাথে দর্শন বা সাহিত্য নিয়ে চায়ের টেবিলে দীর্ঘ আড্ডা জমানো যাবে। কফি ইনভাইট পাঠিয়ে দিন!`
        )
      ];
      const botResponse: ChatMessage = {
        id: Date.now() + 1,
        sender: "match",
        text: responses[Math.floor(Math.random() * responses.length)],
        time: "Just Now",
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1200);
  };

  return (
    <div className="absolute inset-0 bg-[#080501] flex flex-col z-30 animate-[fadeIn_0.3s_ease]">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#110d05] border-b border-[#C9A84C]/20 shrink-0">
        <button onClick={onBack} className="text-[#C9A84C] text-[13px] font-mono hover:underline">
          ← {t("BACK", "ফেরত")}
        </button>
        <div className="text-center">
          <span className="block font-serif text-[14px] text-[#FFE066] font-bold">{match.name}</span>
          <span className="block text-[8.5px] font-mono text-[#C9A84C]/60 uppercase tracking-widest">
            {match.mbti} • SECURE NODE CHANNEL
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B6914] to-[#C9A84C] border border-[#FFE066]/30 flex items-center justify-center font-serif text-xs font-bold text-black select-none">
          {match.name.charAt(0)}
        </div>
      </div>

      {/* Screen Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-hide">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[82%] ${msg.sender === "me" ? "ml-auto text-right items-end" : "mr-auto text-left items-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-xs leading-relaxed font-sans ${msg.sender === "me" ? "bg-gradient-to-r from-[#8B6914] to-[#D4AF37] text-white rounded-br-none" : "bg-[#181206] text-[#e8dfcf] border border-[#C9A84C]/15 rounded-bl-none"}`}
            >
              {msg.text}
            </div>
            <span className="text-[7.5px] font-mono text-white/20 mt-1 block px-1">{msg.time}</span>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-1.5 py-1 px-3 bg-[#181206]/50 rounded-xl max-w-[85px] border border-[#C9A84C]/10 animate-[fadeIn_0.2s_ease]">
            <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" />
          </div>
        )}
      </div>

      {/* Input Tray */}
      <div className="p-3 bg-[#110d05] border-t border-[#C9A84C]/15 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder={t("Type secure dispatch...", "সুরক্ষিত মেসেজ লিখুন...")}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="flex-1 glass-input py-2.5 text-xs"
        />
        <button
          onClick={handleSend}
          className="btn-gold py-2 px-4 text-xs font-bold font-serif leading-none shrink-0"
        >
          🚀
        </button>
      </div>
    </div>
  );
}

// ─── MATCHES LIST SCREEN ─────────────────────────────────────────────────────
interface MatchesScreenProps {
  onTabChange: (tab: string) => void;
  onOpenChat: (match: ClubProfile) => void;
  isBangla: boolean;
}

export function MatchesScreen({ onTabChange, onOpenChat, isBangla }: MatchesScreenProps) {
  const matches = CLUBLIST_PROFILES.slice(0, 3);
  const t = (en: string, bn: string) => (isBangla ? bn : en);

  return (
    <div className="flex flex-col h-full overflow-hidden select-none relative z-10">
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <h1 className="font-serif text-[22px] text-[#FFE066] font-bold tracking-wide">
            {t("Synergic Matches", "কগনিটিভ ম্যাচ")}
          </h1>
          <p className="font-sans text-[11px] text-white/40 mt-0.5">
            {matches.length} {t("active secure interlocks", "সক্রিয় নিরাপদ সংযোগ")}
          </p>
        </div>
        <AuraLogo size={18} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-hide space-y-4">
        {/* Golden Pairs horizontal carousel */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[#C9A84C]">🌟</span>
            <span className="font-serif text-[10.5px] text-[#C9A84C] tracking-widest font-bold uppercase">
              {t("HIGH SYNERGY PAIRS", "সর্বোত্তম জোড়")}
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C9A84C]/25 to-transparent" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 px-1 scroll-hide">
            {matches
              .filter(m => m.compatibility >= 90)
              .map(m => (
                <div key={m.id} className="w-20 flex flex-col items-center gap-1.5 shrink-0 text-center">
                  <div
                    onClick={() => onOpenChat(m)}
                    className="w-16 h-16 rounded-full flex items-center justify-center border-[2.5px] border-[#C9A84C] relative cursor-pointer shadow-[0_0_12px_rgba(201,168,76,0.35)] hover:scale-105 transition-transform"
                    style={{ background: m.gradient }}
                  >
                    <span className="text-2xl">👤</span>
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[9px] w-5 h-5 rounded-full border-2 border-black flex items-center justify-center font-bold">
                      🔥
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11.5px] text-white font-medium truncate max-w-[75px] font-serif">
                      {m.name.split(" ")[0]}
                    </span>
                    <span className="block text-[9.5px] font-mono text-[#C9A84C] font-semibold mt-0.5">
                      {m.compatibility}% vibe
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Regular list columns */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="font-serif text-[10px] text-white/35 tracking-widest uppercase">
              {t("ALL SYNCHRONIZATIONS", "সকল সক্রিয় ম্যাচ")}
            </span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          {matches.map((m, idx) => (
            <div
              key={m.id}
              onClick={() => onOpenChat(m)}
              className="match-row flex items-center gap-3.5 p-3.5 bg-[#C9A84C]/4 border border-[#C9A84C]/10 rounded-2xl cursor-pointer hover:bg-[#C9A84C]/10 transition-colors animate-[fadeUp_0.4s_ease_both]"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div
                className="w-12 h-12 rounded-full border border-[#C9A84C]/35 shrink-0 flex items-center justify-center text-xl relative"
                style={{ background: m.gradient }}
              >
                👤
                {m.elite && (
                  <span className="absolute -top-1 -left-1 text-[10px] bg-[#C9A84C] px-1 rounded text-black font-extrabold leading-none">
                    E
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-[14.5px] text-white font-bold">{m.name}</span>
                  {m.elite && <span className="text-[7.5px] font-mono bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 px-1.5 py-0.5 rounded font-black">ELITE</span>}
                </div>
                <div className="font-sans text-[10px] text-white/40 mt-1">
                  {m.mbti} • {m.compatibility}% {t("Synergy match", "সমযোগ")} • {t(m.intent, "সম্পর্ক")}
                </div>
                <p className="font-serif italic text-[11px] text-white/55 mt-1.5 truncate">
                  "{t(m.bio, "কফি এবং বইয়ের গন্ধ আমার দিনটিকে রঙিন করে তোলে।")}"
                </p>
              </div>

              <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B6914] to-[#C9A84C] text-[15px] border-none flex items-center justify-center shrink-0">
                💬
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav activeTab="matches" onTabChange={onTabChange} />
    </div>
  );
}

// ─── PROFILE SCREEN ──────────────────────────────────────────────────────────
interface ProfileScreenProps {
  user: {
    name: string;
    age: number;
    city: string;
    intent: string;
    mbti: string;
    elite: boolean;
    stealth: boolean;
  };
  onTabChange: (tab: string) => void;
  onUpgrade: () => void;
  isBangla: boolean;
}

export function ProfileScreen({ user, onTabChange, onUpgrade, isBangla }: ProfileScreenProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const t = (en: string, bn: string) => (isBangla ? bn : en);

  return (
    <div className="flex flex-col h-full overflow-hidden select-none relative z-10">
      <div className="flex-1 overflow-y-auto pb-24 scroll-hide">
        {/* Hero image space with deep glow */}
        <div className="relative h-60 bg-gradient-to-b from-[#251804] to-[#0a0800] shrink-0 border-b border-[#C9A84C]/20">
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20">👤</div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div className="text-left">
              <h2 className="font-serif text-[26px] text-white font-bold leading-none">{user.name || "User Name"}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="font-sans text-xs text-white/50">
                  {t("Age", "বয়স")} {user.age} • {user.city}
                </span>
                {user.elite && <span className="elite-badge text-[8.5px]">👑 ELITE PLAN</span>}
              </div>
            </div>
            <ShieldSVG size={42} />
          </div>
        </div>

        {/* Dashboard parameters */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {([["👑", "3", "Members Synced"], ["💛", "8", "Likes Sent"], ["⭐", "2", "Super Liked"]] as [string, string, string][]).map(([icon, val, label]) => (
              <div
                key={label}
                className="bg-[#C9A84C]/5 border border-[#C9A84C]/15 rounded-2xl p-3 flex flex-col items-center justify-center"
              >
                <span className="text-lg mb-0.5">{icon}</span>
                <span className="font-mono text-base font-bold text-[#FFE066] leading-none">{val}</span>
                <span className="font-sans text-[8px] text-white/35 mt-1">{t(label, label)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/15 rounded-2xl p-3.5 text-center">
              <span className="font-sans text-[8px] text-[#C9A84C]/60 uppercase tracking-widest">{t("Personality", "ব্যক্তিত্ব")}</span>
              <span className="font-serif text-[19px] text-[#FFE066] font-extrabold block mt-1">{user.mbti}</span>
            </div>
            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/15 rounded-2xl p-3.5 text-center">
              <span className="font-sans text-[8px] text-[#C9A84C]/60 uppercase tracking-widest">{t("Relationship Type", "সম্পর্ক")}</span>
              <span className="font-serif text-xs text-white block mt-2 font-medium italic">
                {t(user.intent, user.intent === "Long-term" ? "দীর্ঘমেয়াদী" : "ক্যাজুয়াল")}
              </span>
            </div>
          </div>

          {/* Stealth Mode toggle status */}
          {user.stealth && (
            <div className="bg-lime-400/5 border border-lime-400/25 p-4 rounded-2xl animate-[limePulse_3.2s_infinite_ease-in-out]">
              <span className="font-sans text-xs text-[#B5E853] font-bold block">
                🛡️ Stealth Protocol Active
              </span>
              <span className="font-sans text-[10.1px] text-white/40 block mt-1 leading-relaxed">
                {t(
                  "Screenshots and screen sharing blocked. Wave signals remaining silent until mutual swipe verified.",
                  "স্ক্রিনশট এবং ডিভাইস শেয়ারিং ব্লক থাকবে। পারস্পরিক লাইক দেওয়া না পর্যন্ত প্রোফাইল হাইড থাকবে।"
                )}
              </span>
            </div>
          )}

          {/* Golden VIP activation banner */}
          {!user.elite && (
            <div className="relative overflow-hidden bg-gradient-to-r from-[#201403] to-[#0d0700] border-2 border-[#C9A84C] rounded-2xl p-4.5 text-left shadow-[0_0_24px_rgba(201,168,76,0.15)] animate-[glowPulse_4s_infinite_ease-in-out]">
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <h3 className="font-serif text-[16px] text-[#FFE066] font-extrabold tracking-wide">
                    👑 Premium VIP Access
                  </h3>
                  <p className="font-sans text-[10.5px] text-white/45 mt-0.5">
                    {t("Break all conversational caps instantly.", "ক্লাবের সব এলিট ফিচারগুলো আজই আনলক করুন।")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-[19px] text-[#FFE066] font-bold block">৳6,000</span>
                  <span className="font-sans text-[8px] text-white/30 tracking-wider">/ MONTHLY</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {["Unlimited Swipes", "Direct VIP Map suite", "Hide Location", "Cognitive Deep Analyser", "Priority Coffee Sessions"].map(tag => (
                  <span
                    key={tag}
                    className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded px-1.5 py-0.5 text-[8.5px] text-[#FFE066]/85"
                  >
                    💡 {t(tag, tag)}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setShowUpgradeModal(true)}
                className="btn-gold w-full py-3 text-xs uppercase font-serif tracking-widest font-bold"
              >
                {t("Upgrade Membership", "এলিট মেম্বারশিপ নিন →")}
              </button>
            </div>
          )}

          {/* Quick link buttons list */}
          <div className="space-y-2">
            {[
              ["🔒", t("Privacy Settings", "গোপন নিয়ামক"), t("Change visibility coordinates", "প্রোফাইল ভিজিবিলিটি")],
              ["🔔", t("Alert Chimes", "নোটিফিকেশন বেল"), t("Tone tuning and ping status", "নতুন সংকেত বেল")],
              ["🚪", t("Revoke Credentials", "লগআউট সমূহ"), t("Securely exit AURA Social session", "সেশন বন্ধ করে বের হন")]
            ].map(([icon, title, sub]) => (
              <div
                key={title}
                className="flex items-center gap-3.5 p-3.5 bg-white/3 border border-white/5 hover:border-[#C9A84C]/20 rounded-2xl cursor-pointer transition-colors"
              >
                <span className="text-lg shrink-0">{icon}</span>
                <div className="text-left">
                  <span className="block font-sans text-xs text-white/70 font-semibold">{title}</span>
                  <span className="block font-sans text-[9px] text-white/30 mt-0.5">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav activeTab="profile" onTabChange={onTabChange} />

      {/* Subscription Popup Modal */}
      {showUpgradeModal && (
        <div
          onClick={() => setShowUpgradeModal(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-5 font-sans animate-[fadeIn_0.3s_ease]"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-gradient-to-b from-[#181105] to-[#090702] border-2 border-[#C9A84C] p-6 rounded-[24px] max-w-sm w-full text-center relative shadow-[0_0_40px_rgba(201,168,76,0.25)] animate-[modalIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_both]"
          >
            <div className="text-4xl mb-2">👑</div>
            <h3 className="font-serif text-[19px] text-[#FFE066] font-bold">Elite Gold Shield</h3>
            <p className="font-serif italic text-xs text-white/45 mt-1 mb-4">
              {t("Vetted match exclusivity in Dhaka.", "গুলশান-বনানী জোনের এলিটদের জন্য নিরাপদ নেটওয়ার্ক।")}
            </p>

            <div className="py-3 border-y border-[#C9A84C]/15 mb-5 select-none">
              <span className="block font-serif text-[32px] text-[#FFE066] font-bold">৳6,000</span>
              <span className="text-[9.5px] font-sans text-white/30 tracking-widest">{t("MONTHLY TARIFF • CANCEL ANYTIME", "মাসিক সাবস্ক্রিপশন")}</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  onUpgrade();
                }}
                className="btn-gold w-full py-3.5 text-xs text-black font-semibold font-serif uppercase tracking-widest"
              >
                🔒 Activate Security Codes
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="btn-outline w-full py-2.5 text-xs font-mono"
              >
                {t("Dismiss Node", "পরে করব")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SEARCH / DISCOVER SCREEN ────────────────────────────────────────────────
interface SearchScreenProps {
  onTabChange: (tab: string) => void;
  onOpenChat: (match: ClubProfile) => void;
  isBangla: boolean;
}

export function SearchScreen({ onTabChange, onOpenChat, isBangla }: SearchScreenProps) {
  const [filterIntent, setFilterIntent] = useState<string>("");
  const [filterElite, setFilterElite] = useState(false);

  const t = (en: string, bn: string) => (isBangla ? bn : en);

  const filtered = CLUBLIST_PROFILES.filter(p => {
    if (filterIntent && p.intent !== filterIntent) return false;
    if (filterElite && !p.elite) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden select-none relative z-10">
      <div className="px-5 pt-4">
        <h1 className="font-serif text-[21px] text-[#FFE066] font-bold tracking-wide">
          {t("Secure Discover Grid", "নিরাপদ অনুসন্ধান")}
        </h1>
        <p className="font-sans text-[11px] text-white/40 mt-0.5">
          {t("Filter biological signatures manually.", "আপনার কগনিটিভ প্যারামিটার দিয়ে ফিল্টার সেট করুন।")}
        </p>
      </div>

      {/* Pill buttons */}
      <div className="px-4 pt-3.5 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scroll-hide">
          {["Long-term", "Casual", "Intimate"].map(label => (
            <button
              key={label}
              onClick={() => setFilterIntent(prev => (prev === label ? "" : label))}
              className="px-3.5 py-1.5 rounded-full font-sans text-[10.5px] font-semibold tracking-wide border transition-all duration-200 cursor-pointer shrink-0"
              style={{
                borderColor: filterIntent === label ? "#C9A84C" : "rgba(255,255,255,0.08)",
                background: filterIntent === label ? "rgba(201, 168, 76, 0.16)" : "rgba(255,255,255,0.03)",
                color: filterIntent === label ? "#FFE066" : "rgba(255,255,255,0.45)",
              }}
            >
              {label === "Long-term" ? "💍" : label === "Casual" ? "☕" : "🔒"} {label}
            </button>
          ))}

          <button
            onClick={() => setFilterElite(prev => !prev)}
            className="px-3.5 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-wider border transition-all duration-200 cursor-pointer shrink-0"
            style={{
              borderColor: filterElite ? "#C9A84C" : "rgba(255,255,255,0.08)",
              background: filterElite ? "rgba(201, 168, 76, 0.16)" : "rgba(255,255,255,0.03)",
              color: filterElite ? "#FFE066" : "rgba(255,255,255,0.45)",
            }}
          >
            👑 {t("Elite Plan Only", "শুধু এলিট")}
          </button>
        </div>
      </div>

      {/* Profile grid results */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scroll-hide">
        <div className="grid grid-cols-2 gap-2.5 pb-24">
          {filtered.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => onOpenChat(p)}
              className="grid-card relative h-48 rounded-[20px] overflow-hidden cursor-pointer bg-neutral-950 animate-[fadeUp_0.45s_ease_both]"
              style={{
                background: p.gradient,
                animationDelay: `${idx * 0.05}s`
              }}
            >
              {/* Center silhouette */}
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-25 select-none pointer-events-none">
                👤
              </div>

              {/* Bottom darken overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

              {p.elite && (
                <span className="absolute top-2 left-2 bg-[#C9A84C] text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded text-black tracking-widest leading-none">
                  ELITE
                </span>
              )}

              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                <span className="block font-serif text-[14.5px] font-bold text-white tracking-wide">
                  {p.name.split(" ")[0]}, {p.age}
                </span>

                <div className="flex items-center justify-between mt-1">
                  <span className="block font-mono text-[9px] text-[#FFE066] font-bold">
                    {p.compatibility}% Vibe
                  </span>
                  <span className="block text-[8.5px] font-mono text-white/40">{p.mbti}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <div className="text-4xl text-neutral-600">🔍</div>
            <p className="font-sans text-xs text-white/30">{t("No dynamic matching nodes active.", "এই ক্যাটাগরিতে কোনো প্রোফাইল নেই।")}</p>
          </div>
        )}
      </div>

      <BottomNav activeTab="search" onTabChange={onTabChange} />
    </div>
  );
}
