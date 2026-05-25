import { useState, useEffect } from "react";
import { GoldParticles } from "./components/GoldParticles";
import { Onboarding } from "./components/Onboarding";
import { SwipeCard } from "./components/SwipeCard";
import { BlindModal } from "./components/BlindModal";
import { CLUBLIST_PROFILES, ClubProfile } from "./utils/mockClubData";
import { AuraLogo, CoffeeKeySVG } from "./components/SVGIcons";
import { MatchesScreen, ProfileScreen, SearchScreen, ChatScreen, BottomNav } from "./components/AppScreens";

import HostDashboard from "./components/HostDashboard";
import BlindRoomDate from "./components/BlindRoomDate";
import SpecsHub from "./components/SpecsHub";
import { MOCK_ROOMS, MOCK_PROFILES } from "./mockData";
import { RoomListing, BlindDateRequest, UserProfile } from "./types";

export default function App() {
  const [platformView, setPlatformView] = useState<"dating" | "host" | "blind" | "specs">("dating");
  const [screen, setScreen] = useState<"splash" | "onboarding" | "app">("splash");
  const [activeTab, setActiveTab] = useState<string>("swipe");
  const [isBangla, setIsBangla] = useState(true);

  // Dynamic shared state for Host and Blind Date interfaces
  const [rooms, setRooms] = useState<RoomListing[]>(MOCK_ROOMS);
  const [requests, setRequests] = useState<BlindDateRequest[]>([
    {
      id: "bd_1",
      requesterId: "me",
      recipientId: "p1",
      status: "accepted",
      roomId: "r1",
      maskedSenderId: "Crypto Sage (INTJ)",
      maskedRecipientId: "Electric Muse (ENFP)",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "bd_2",
      requesterId: "p2",
      recipientId: "me",
      status: "pending",
      roomId: "r2",
      maskedSenderId: "Midnight Echo (INFJ)",
      maskedRecipientId: "Crypto Sage (INTJ)",
      createdAt: new Date().toISOString(),
    }
  ]);

  // Core User Profile parameters
  const [user, setUser] = useState({
    name: "Arfin Ahmed",
    age: 26,
    city: "Dhaka",
    gender: "male",
    intent: "Long-term",
    mbti: "INTJ",
    elite: false,
    stealth: false,
  });

  // Current reactive feed list
  const [profiles, setProfiles] = useState<ClubProfile[]>(CLUBLIST_PROFILES);
  const [swipedCount, setSwipedCount] = useState(0);
  const [likedCount, setLikedCount] = useState(3);
  const [superLikedCount, setSuperLikedCount] = useState(1);
  const [activeChatPartner, setActiveChatPartner] = useState<ClubProfile | null>(null);

  // In-app interactive popups
  const [showBlind, setShowBlind] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: "gold" | "lime" | "dim" } | null>(null);

  const t = (en: string, bn: string) => {
    return isBangla ? bn : en;
  };

  const showToast = (msg: string, type: "gold" | "lime" | "dim" = "gold") => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  const handleOnboardComplete = (data: {
    name: string;
    age: number;
    city: string;
    gender: "female" | "male" | "nonbinary";
    intent: "Long-term" | "Casual" | "Intimate";
    mbti: string;
    stealth: boolean;
  }) => {
    setUser({
      ...user,
      ...data,
      elite: false,
    });
    // Dynamically filter card feedstock based on intent/gender criteria
    const feedstock = CLUBLIST_PROFILES.filter(p => {
      // Intimate profiles are highly restricted
      if (data.intent === "Intimate") {
        return p.intent === "Intimate";
      }
      return p.intent !== "Intimate";
    });
    setProfiles(feedstock);
    setScreen("app");
  };

  const handleSwipe = (direction: "like" | "super" | "reject", swipedProfile: ClubProfile) => {
    // Pop card logic
    setProfiles(prev => prev.filter(p => p.id !== swipedProfile.id));
    setSwipedCount(prev => prev + 1);

    if (direction === "like") {
      setLikedCount(prev => prev + 1);
      showToast(t(`💛 Verified match with ${swipedProfile.name} in search!`, `💛 ${swipedProfile.name}-কে লাইক রিকোয়েস্ট পাঠিয়েছেন!`), "gold");
    } else if (direction === "super") {
      setSuperLikedCount(prev => prev + 1);
      showToast(t(`⭐ Super Like: ${swipedProfile.name} wave alignment locked`, `⭐ সুপার লাইক: ${swipedProfile.name}-এর সাথে কানেকশন লক করা হয়েছে`), "lime");
    } else {
      showToast(t("✗ Passed card metric", "✗ পরবর্তী প্রোফাইলে এগিয়ে গিয়েছেন"), "dim");
    }
  };

  const handleAction = (direction: "rewind" | "like" | "super" | "reject") => {
    if (profiles.length === 0) return;
    const topCard = profiles[0];

    if (direction === "rewind") {
      setProfiles(CLUBLIST_PROFILES);
      setSwipedCount(0);
      showToast(t("⏪ Deck signals rewound", "⏪ সেশন কার্ড পুনরায় লোড করা হয়েছে"), "dim");
      return;
    }
    handleSwipe(direction, topCard);
  };

  const handleUpgradeElite = () => {
    setUser(prev => ({
      ...prev,
      elite: true,
    }));
    showToast(t("👑 Subscribed to Elite Gold Shield Access Codes!", "👑 অভিনন্দন! আপনি আউরা গোল্ড এলিট ক্লাবে যুক্ত হয়েছেন!"), "lime");
  };

  // State update callbacks for admin suite integration
  const handleAddRoom = (newRoom: RoomListing) => {
    setRooms(prev => [newRoom, ...prev]);
    showToast(t("🏨 Successfully published new secure lounge!", "🏨 নতুন লাউঞ্জ স্পেস সফলভাবে তালিকাভুক্ত হয়েছে!"), "lime");
  };

  const handleAddRequest = (req: BlindDateRequest) => {
    setRequests(prev => [req, ...prev]);
    // Display interactive notification
    showToast(t("☕ Secure Anonymous invite dispatched to match!", "☕ পরিচয় প্রকাশ না করে কফি ইনভাইট পাঠানো হয়েছে!"), "lime");
  };

  const handleAcceptRequest = (id: string, roomId: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted', roomId } : r));
    showToast(t("☕ Date Booking confirmed! Unlocked Guest check-in PIN.", "☕ কফি ডেট কনফার্ম করা হয়েছে! গেস্ট পিন অ্যাক্টিভেট হয়েছে।"), "lime");
  };

  const handleReviewRequest = (id: string, rating: number, reviewText: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'concluded', rating, reviewText } : r));
    
    // Dynamically calculate and update Host Room aggregate rating metrics
    const request = requests.find(r => r.id === id);
    if (request && request.roomId) {
      setRooms(prev => prev.map(room => {
        if (room.id === request.roomId) {
          const count = room.reviewsCount + 1;
          const avg = parseFloat(((room.rating * room.reviewsCount + rating) / count).toFixed(2));
          return {
            ...room,
            rating: avg,
            reviewsCount: count
          };
        }
        return room;
      }));
    }
    showToast(t("⭐ Secure anonymous review published successfully!", "⭐ পরিচয় গোপন রেখে রিভিউ সফলভাবে পোস্ট করা হয়েছে!"), "lime");
  };

  const handleToggleShield = () => {
    setUser(prev => ({ ...prev, stealth: !prev.stealth }));
    showToast(user.stealth 
      ? t("🛡️ Telemetry screen shields deactivated", "🛡️ টেলিমেট্রি স্ক্রিন শিল্ড নিষ্ক্রিয় করা হয়েছে") 
      : t("🛡️ Screen shields active: anti-screenshot on", "🛡️ কগনিটিভ শিল্ড সক্রিয়: অ্যান্টি-স্ক্রিনশট অন"), 
      "gold"
    );
  };

  // Convert client states to strict user profiles for standard prop inputs
  const mappedCurrentUser: UserProfile = {
    id: "me",
    name: user.name || "Arfin Ahmed",
    age: user.age,
    gender: user.gender === "female" ? "Female" : user.gender === "male" ? "Male" : "Non-binary",
    location: user.city || "Dhaka",
    mbti: user.mbti,
    tier: user.elite ? "Elite" : "Basic",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    bio: user.intent ? `AURA verified member matching for: ${user.intent}` : "Elite design systems consultant.",
    interests: ["Tech Startup", "Chess", "Psychology"]
  };

  // Safe-exit hook
  useEffect(() => {
    showToast(t("🛡️ Multi-tier screenshot dynamic shield active", "🛡️ আউরা স্ক্রিনশট অ্যান্টি-কপি শিল্ড সক্রিয় রয়েছে"), "gold");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBangla]);

  return (
    <div className="flex flex-col min-h-screen bg-[#040301] text-[#e8dfcf] font-sans overflow-x-hidden antialiased">
      {/* ─── DESKTOP PLATFORM EXECUTIVES NAV BAR ─── */}
      <nav className="w-full bg-[#0a0804]/95 backdrop-blur-xl border-b border-[#C9A84C]/25 px-5 md:px-8 py-4.5 sticky top-0 z-[100] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        
        {/* Glowing Crest branding */}
        <div className="flex items-center gap-3 select-none">
          <div className="bg-gradient-to-tr from-[#1b1404] to-[#3a2c07] p-2.5 rounded-xl border border-[#C9A84C]/40 flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <AuraLogo size={18} />
          </div>
          <div>
            <h1 className="font-serif italic font-black text-sm tracking-[2.5px] bg-gradient-to-r from-[#FFE066] via-[#C9A84C] to-[#8B6914] bg-clip-text text-transparent uppercase leading-none">
              AURA ELITE CLUB
            </h1>
            <p className="text-[9.5px] font-mono text-[#C9A84C]/75 tracking-widest mt-1">
              {t("VIP LAUNCHER CONTROL BOARD", "ভিআইপি কন্ট্রোল বোর্ড • বাংলাদেশ")}
            </p>
          </div>
        </div>

        {/* Dynamic Center segment selection bar */}
        <div className="flex flex-wrap bg-[#100c04] p-1 rounded-2xl border border-[#C9A84C]/20 shrink-0">
          {[
            { id: "dating", label: t("📱 CLIENT DECK", "📱 মেম্বার ডেক") },
            { id: "host", label: t("🏨 HOST PORTAL", "🏨 হোস্ট পোর্টাল") },
            { id: "blind", label: t("☕ COFFEE ROOMS", "☕ ব্লাইন্ড রুম") },
            { id: "specs", label: t("📐 SYSTEM SPECS", "📐 টেকনিক্যাল স্পেক্স") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPlatformView(tab.id as any);
                showToast(`${t("Navigated to", "প্রবেশ করেছেন:")} ${tab.label}`, "gold");
              }}
              className={`px-4.5 py-2.5 rounded-xl text-[10.5px] font-sans font-extrabold tracking-wider transition-all cursor-pointer ${
                platformView === tab.id
                  ? "bg-gradient-to-r from-[#8B6914] via-[#C9A84C] to-[#8B6914] text-black font-black shadow-lg shadow-[#C9A84C]/25 scale-[1.02]"
                  : "text-white/45 hover:text-white/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side live monitoring chimes */}
        <div className="hidden lg:flex items-center gap-5 text-[10px] font-mono text-white/40 tracking-wider">
          <div className="flex items-center gap-1.5 bg-[#42ee85]/5 border border-[#42ee85]/15 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#42ee85] animate-pulse" />
            <span className="text-[#42ee85] font-bold">SHIELDS: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#C9A84C]/5 border border-[#C9A84C]/15 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE066] animate-pulse" />
            <span className="text-[#FFE066] font-bold">TELEMETRY: CONNECTED</span>
          </div>
        </div>
      </nav>

      {/* ─── PRINCIPAL DYNAMIC ROUTER VIEW CONTAINER ─── */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-85px)] relative">
        
        {/* Render Dating frame client app */}
        {platformView === "dating" && (
          <div className="relative w-full max-w-[390px] h-[812px] md:h-[844px] rounded-[38px] overflow-hidden bg-[#070502] flex flex-col shadow-[0_0_90px_20px_rgba(201,168,76,0.08),0_30px_100px_rgba(0,0,0,0.92)] border border-[#C9A84C]/25 animate-[fadeIn_0.4s_ease_both]">
            
            {/* Universal Gold Particle Background Simulation */}
            <GoldParticles density={screen === "splash" ? 80 : 38} />

            {/* Floating Global Toast Alert Notification inside device */}
            {notification && (
              <div className="absolute top-22 left-1/2 transform -translate-x-1/2 z-50 animate-[scaleIn_0.22s_cubic-bezier(0.34,1.56,0.64,1)_both] w-[90%]">
                <div
                  className="px-4 py-2.5 rounded-full border text-[11px] text-center font-serif shadow-lg backdrop-blur-xl"
                  style={{
                    background: notification.type === "gold"
                      ? "rgba(22, 14, 2, 0.96)"
                      : notification.type === "lime"
                        ? "rgba(10, 22, 2, 0.96)"
                        : "rgba(14, 14, 14, 0.96)",
                    borderColor: notification.type === "gold"
                      ? "#C9A84C"
                      : notification.type === "lime"
                        ? "#B5E853"
                        : "rgba(255, 255, 255, 0.12)",
                    color: notification.type === "gold"
                      ? "#FFE066"
                      : notification.type === "lime"
                        ? "#B5E853"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {notification.msg}
                </div>
              </div>
            )}

            {/* Absolute Language Control Pill inside device */}
            <div className="absolute top-5 right-5 z-40">
              <button
                onClick={() => setIsBangla(prev => !prev)}
                className="px-2.5 py-1 text-[9.5px] font-bold font-mono tracking-wider text-[#FFE066] border border-[#C9A84C]/40 bg-black/45 hover:bg-black/85 transition-colors cursor-pointer rounded-lg shadow-sm"
              >
                {isBangla ? "EN🇺🇸" : "বাংলা🇧🇩"}
              </button>
            </div>

            {/* Render Step Router */}
            {screen === "splash" && (
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center animate-[fadeIn_0.75s_ease_both]">
                <div className="relative z-10 space-y-6 px-6">
                  {/* Premium Emblem typography design */}
                  <div>
                    <h1
                      className="font-serif text-[60px] font-black tracking-[12px] leading-none mb-1 select-none"
                      style={{
                        background: "linear-gradient(135deg, #FFE066 0%, #C9A84C 50%, #8B6914 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      AURA
                    </h1>
                    <p className="font-serif italic text-xs tracking-[4px] text-[#C9A84C]/65 select-none uppercase">
                      {t("Sophisticated Match Club", "এলিট ডেটিং অ্যান্ড সোশাল ক্লাব")}
                    </p>
                  </div>

                  {/* Vertical line indicator */}
                  <div className="w-[1px] h-14 bg-gradient-to-b from-transparent via-[#C9A84C] to-transparent mx-auto" />

                  <p className="font-sans text-[11px] text-white/45 uppercase tracking-[2px] leading-relaxed max-w-[220px] mx-auto">
                    {t("Where Souls Align, Elegantly", "যেখানে আত্মার মিলন ঘটে, শালীনতায় ও গরিমায়")}
                  </p>

                  <button
                    onClick={() => setScreen("onboarding")}
                    className="btn-gold px-12 py-3.5 text-xs tracking-widest text-black font-semibold font-serif uppercase rounded-2xl w-full"
                  >
                    {t("BEGIN DISCOVERY PROTOCOL", "যাত্রা শুরু করুন")}
                  </button>

                  <p className="font-mono text-[9px] text-white/20 select-none">
                    {t("EXCLUSIVE VERIFIED SIGNATURES 18+", "শুধুমাত্র প্রাপ্তবয়স্ক এবং ভেরিফাইড মেম্বারদের জন্য ১৮+")}
                  </p>
                </div>
              </div>
            )}

            {screen === "onboarding" && (
              <Onboarding isBangla={isBangla} onComplete={handleOnboardComplete} />
            )}

            {screen === "app" && (
              <div className="relative w-full h-full flex flex-col overflow-hidden">
                {/* Header branding Row */}
                <header className="px-5 pt-13 pb-2 flex items-center justify-between shrink-0 bg-neutral-950/20 backdrop-blur-md z-20 border-b border-white/5 select-none">
                  <AuraLogo size={20} />

                  <div className="flex items-center gap-1.5">
                    {user.stealth && (
                      <span className="bg-lime-400/10 text-[#B5E853] text-[9px] border border-lime-400/20 px-2 py-0.5 rounded-full font-sans tracking-wide">
                        🛡️ {t("Stealth", "শিল্ড স্ক্রিন")}
                      </span>
                    )}
                    {user.elite && (
                      <span className="bg-[#C9A84C]/15 text-[#FFE066] text-[9.5px] border border-[#C9A84C]/35 px-2 py-0.5 rounded-full font-serif font-black">
                        👑 ELITE
                      </span>
                    )}
                  </div>
                </header>

                {/* Simulated chat dispatch overlays */}
                {activeChatPartner ? (
                  <ChatScreen
                    match={activeChatPartner}
                    onBack={() => setActiveChatPartner(null)}
                    isBangla={isBangla}
                  />
                ) : (
                  <>
                    {/* Router Sub-views */}
                    <div className="flex-1 overflow-hidden relative">
                      {activeTab === "swipe" && (
                        <div className="absolute inset-0 flex flex-col overflow-hidden">
                          {/* Active mini tracker labels */}
                          <div className="px-5 py-2 inline-flex items-center justify-around gap-2 bg-[#C9A84C]/3 border border-white/5 rounded-xl mx-4 my-2 shrink-0 select-none z-10">
                            <div className="text-center">
                              <span className="font-serif text-xs text-[#FFE066] block font-bold">✨ {swipedCount}</span>
                              <span className="text-[7.5px] text-white/30 uppercase tracking-wider font-sans">{t("Explored", "অন্বেষণ")}</span>
                            </div>
                            <div className="text-center">
                              <span className="font-serif text-xs text-[#FFE066] block font-bold">💛 {likedCount}</span>
                              <span className="text-[7.5px] text-white/30 uppercase tracking-wider font-sans">{t("Likes sent", "পছন্দ")}</span>
                            </div>
                            <div className="text-center">
                              <span className="font-serif text-xs text-[#FFE066] block font-bold">⭐ {superLikedCount}</span>
                              <span className="text-[7.5px] text-white/30 uppercase tracking-wider font-sans">{t("Super likes", "সুপার")}</span>
                            </div>
                          </div>

                          {/* Card stack area */}
                          <div className="flex-1 relative mx-4 mt-1 mb-2">
                            {profiles.length === 0 ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-4 animate-fadeIn">
                                <span className="text-5xl animate-bounce">✨</span>
                                <h3 className="font-serif text-lg text-[#FFE066] font-bold">
                                  {t("All Wave Alignments Concluded", "আজকের ডেক সম্পূর্ণ")}
                                </h3>
                                <p className="font-sans text-xs text-white/45 max-w-[210px] leading-relaxed">
                                  {t(
                                    "You have parsed the current club coordinates pool. Refresh the signal parameters below.",
                                    "আজকের সকল যাচাইকৃত মেম্বার খোঁজা সম্পন্ন হয়েছে। রিফ্রেশ বাটনে ট্যাপ করে পুনরায় লোড করুন।"
                                  )}
                                </p>
                                <button
                                  onClick={() => {
                                    setProfiles(CLUBLIST_PROFILES);
                                    setSwipedCount(0);
                                    showToast(t("Signal pool re-calibrated", "কার্ড ডেক সেশন রিস্টার্ট করা হয়েছে"), "lime");
                                  }}
                                  className="btn-gold px-8 py-2.5 text-xs tracking-wider cursor-pointer"
                                >
                                  🔄 {t("REFRESH SIGNAL POOL", "রিফ্রেশ ডেক")}
                                </button>
                              </div>
                            ) : (
                              [...profiles].reverse().map((profile, i, arr) => {
                                const isTop = i === arr.length - 1;
                                const offset = arr.length - 1 - i;
                                return (
                                  <div
                                    key={profile.id}
                                    className="absolute inset-0 transition-transform duration-350"
                                    style={{
                                      transform: `scale(${1 - offset * 0.035}) translateY(${offset * 8}px)`,
                                      transformOrigin: "bottom center",
                                    }}
                                  >
                                    <SwipeCard
                                      profile={profile}
                                      onSwipe={handleSwipe}
                                      isTop={isTop}
                                      isBangla={isBangla}
                                    />
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Floating Trigger controller tray */}
                          <footer className="px-5 pb-24 shrink-0 z-20 select-none">
                            <div className="flex items-center justify-between gap-2.5">
                              {/* Rewind */}
                              <button
                                onClick={() => handleAction("rewind")}
                                className="action-btn w-11 h-11 bg-gradient-to-tr from-[#161004] to-[#2e1f06] border border-[#C9A84C]/35 cursor-pointer flex items-center justify-center rounded-full"
                                title="Rewind"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M12.5 8L7 12l5.5 4V8zM17.5 8L12 12l5.5 4V8z"
                                    fill="url(#rwG)"
                                  />
                                  <defs>
                                    <linearGradient id="rwG" x1="0" y1="0" x2="0" y2="1">
                                      <stop stopColor="#FFE066" />
                                      <stop offset="1" stopColor="#8B6914" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </button>

                              {/* Swipe rejection */}
                              <button
                                onClick={() => handleAction("reject")}
                                className="action-btn w-13 h-13 bg-gradient-to-tr from-[#1f0202] to-[#360808] border border-red-500/40 cursor-pointer flex items-center justify-center rounded-full"
                                title="Refuse match"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M18 6L6 18M6 6l12 12"
                                    stroke="url(#rjG)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                  <defs>
                                    <linearGradient id="rjG" x1="0" y1="0" x2="1" y2="1">
                                      <stop stopColor="#ff6b6b" />
                                      <stop offset="1" stopColor="#c0392b" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </button>

                              {/* Super like */}
                              <button
                                onClick={() => handleAction("super")}
                                className="action-btn w-11 h-11 bg-gradient-to-tr from-[#241d01] to-[#3a3002] border border-[#C9A84C]/45 cursor-pointer flex items-center justify-center rounded-full"
                                title="Super like"
                              >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
                                    fill="url(#stG)"
                                  />
                                  <defs>
                                    <linearGradient id="stG" x1="0" y1="0" x2="0" y2="1">
                                      <stop stopColor="#FFE066" />
                                      <stop offset="1" stopColor="#C9A84C" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </button>

                              {/* ⭐ HERO ADVANDED BLIND DATE OFFER BUTTON ⭐ */}
                              <button
                                onClick={() => {
                                  if (profiles.length > 0) {
                                    setShowBlind(true);
                                  } else {
                                    showToast(t("No active card coordinates", "অঞ্চল সিগন্যাল খালি রয়েছে"), "dim");
                                  }
                                }}
                                className="blind-btn w-16 h-16 rounded-full flex items-center justify-center border-2 border-[#C9A84C] relative overflow-hidden cursor-pointer"
                                style={{
                                  background: "linear-gradient(145deg, #3d2800, #5a3a00, #3d2800)",
                                }}
                                title="Book Blind Room Date offer"
                              >
                                <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#5c3c00] to-[#362301] flex items-center justify-center animate-pulse">
                                  <CoffeeKeySVG size={32} />
                                </div>
                              </button>

                              {/* Swipe like */}
                              <button
                                onClick={() => handleAction("like")}
                                className="action-btn w-13 h-13 bg-gradient-to-tr from-[#240114] to-[#3a0322] border border-pink-500/40 cursor-pointer flex items-center justify-center rounded-full"
                                title="Accept match"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    fill="url(#lkG)"
                                  />
                                  <defs>
                                    <linearGradient id="lkG" x1="0" y1="0" x2="0" y2="1">
                                      <stop stopColor="#ff88a8" />
                                      <stop offset="1" stopColor="#e91e8c" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </button>

                              {/* Chat Tab Route shortcut */}
                              <button
                                onClick={() => setActiveTab("matches")}
                                className="action-btn w-11 h-11 bg-gradient-to-tr from-[#020e1f] to-[#041d3b] border border-[#3b82f6]/40 cursor-pointer flex items-center justify-center rounded-full"
                                title="Direct messages"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M12 2C6.48 2 2 6.03 2 11c0 2.67 1.19 5.07 3.08 6.77L4 22l4.43-1.55A10.46 10.46 0 0012 21c5.52 0 10-4.03 10-9s-4.48-9-10-9z"
                                    fill="url(#msgG)"
                                  />
                                  <defs>
                                    <linearGradient id="msgG" x1="0" y1="0" x2="1" y2="1">
                                      <stop stopColor="#6ee7f7" />
                                      <stop offset="1" stopColor="#3b82f6" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </button>
                            </div>

                            {/* Title text */}
                            <div className="text-center mt-3 select-none">
                              <span className="block font-serif text-[9px] text-[#C9A84C] tracking-widest font-extrabold uppercase animate-pulse">
                                {t("👑 INVITE TO ANONYMOUS COFFEE DATE 🔑", "👑 পরিচয় লুকিয়ে সরাসরি কফি ইনভাইট পাঠান 🔑")}
                              </span>
                              <span className="block font-sans text-[7.5px] text-white/30 uppercase mt-0.5">
                                {t("Protected secure verified host rooms", "যাচাইকৃত এবং সম্পূর্ণ নিরাপদ লাউঞ্জ সেশন")}
                              </span>
                            </div>
                          </footer>

                          <BottomNav activeTab="swipe" onTabChange={setActiveTab} />
                        </div>
                      )}

                      {activeTab === "matches" && (
                        <MatchesScreen
                          onTabChange={setActiveTab}
                          onOpenChat={setActiveChatPartner}
                          isBangla={isBangla}
                        />
                      )}

                      {activeTab === "profile" && (
                        <ProfileScreen
                          user={user}
                          onTabChange={setActiveTab}
                          onUpgrade={handleUpgradeElite}
                          isBangla={isBangla}
                        />
                      )}

                      {activeTab === "search" && (
                        <SearchScreen
                          onTabChange={setActiveTab}
                          onOpenChat={setActiveChatPartner}
                          isBangla={isBangla}
                        />
                      )}

                      {activeTab === "settings" && (
                        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden">
                          <div className="p-5 space-y-4">
                            <div className="text-left shrink-0">
                              <h1 className="font-serif text-[21px] text-[#FFE066] font-bold">
                                {t("Secure Console Panel", "নিরাপত্তা নিরাময়")}
                              </h1>
                              <p className="font-sans text-[11px] text-white/40 mt-0.5">
                                {t("Configure screenshot-anti-theft telemetry shields.", "স্ক্রিনশট এবং আইটি টেলিমেট্রি শীল্ড সেটআপ করুন।")}
                              </p>
                            </div>

                            <div className="bg-[#181206] p-4.5 rounded-2xl border border-[#C9A84C]/15 space-y-3">
                              <label className="flex items-center justify-between cursor-pointer select-none">
                                <div>
                                  <span className="block font-sans text-xs text-white/80 font-bold">{t("Screenshot Block Guard", "স্ক্রিনশট ব্লক গার্ড")}</span>
                                  <span className="block font-sans text-[9px] text-white/35 mt-0.5">{t("Block sharing sessions on other tabs", "অনলাইন ডিভাইস স্ক্রিনশট নিষ্ক্রিয়")}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={user.stealth}
                                  onChange={e => setUser(prev => ({ ...prev, stealth: e.target.checked }))}
                                  className="w-5 h-5 accent-[#C9A84C] cursor-pointer"
                                />
                              </label>

                              <div className="h-[1px] bg-white/5" />

                              <label className="flex items-center justify-between cursor-pointer select-none">
                                <div>
                                  <span className="block font-sans text-xs text-white/80 font-bold">{t("Premium Sound Chimes", "চিমস সাউন্ড ইমপ্যাক্ট")}</span>
                                  <span className="block font-sans text-[9px] text-white/35 mt-0.5">{t("Play alert chimes on successful match", "সফল তরঙ্গে মৃদু সংকেত বাজান")}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="w-5 h-5 accent-[#C9A84C] cursor-pointer"
                                />
                              </label>
                            </div>

                            <div className="p-4 bg-[#FFE066]/5 border border-[#C9A84C]/35 rounded-xl text-left space-y-2">
                              <span className="block font-serif text-[11.5px] text-[#FFE066] uppercase font-bold tracking-wider">
                                🛡️ AURA PRIVACY TELEMETRY
                              </span>
                              <p className="font-sans text-[10px]/relaxed text-white/45">
                                {t(
                                  "AURA protects VIP identity in Dhaka. Secure double hashing makes connection signals anonymous unless swiped mutual. Standard data standard protocol fits perfectly.",
                                  "আউরা আপনার সম্পূর্ণ প্রাইভেসি পরিচালনা করে। দুই স্তর এনক্রিপশন সিস্টেম ম্যাচ গ্রহণ করার আগ পর্যন্ত আপনার ছবি বা প্রোফাইল কপি করা থেকে অন্যদের বিরত রাখে।"
                                )}
                              </p>
                            </div>
                          </div>

                          <BottomNav activeTab="settings" onTabChange={setActiveTab} />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Global Coffee Invitation popup */}
            {showBlind && profiles.length > 0 && (
              <BlindModal
                profile={profiles[0]}
                onClose={() => {
                  setShowBlind(false);
                }}
                onConfirm={() => {
                  setShowBlind(false);
                  
                  // Dynamically dispatch a blind room date request
                  const currentMatch = profiles[0];
                  const newRequest: BlindDateRequest = {
                    id: `bd_auto_${Date.now()}`,
                    requesterId: "me",
                    recipientId: currentMatch.id.toString(),
                    status: "pending",
                    roomId: rooms[0]?.id || "r1",
                    maskedSenderId: `Silent Wolf (${user.mbti})`,
                    maskedRecipientId: `${currentMatch.name} (${currentMatch.mbti})`,
                    createdAt: new Date().toISOString()
                  };
                  handleAddRequest(newRequest);
                }}
                isBangla={isBangla}
              />
            )}
          </div>
        )}

        {/* Render Host Partner Suite */}
        {platformView === "host" && (
          <div className="w-full bg-[#0a0804]/90 backdrop-blur-xl border border-[#C9A84C]/25 rounded-[2.5rem] p-6.5 shadow-2xl animate-[fadeIn_0.4s_ease_both]">
            <HostDashboard rooms={rooms} onAddRoom={handleAddRoom} />
          </div>
        )}

        {/* Render Blind Room Date check-in console */}
        {platformView === "blind" && (
          <div className="w-full bg-[#0a0804]/90 backdrop-blur-xl border border-[#C9A84C]/25 rounded-[2.5rem] p-6.5 shadow-2xl animate-[fadeIn_0.4s_ease_both]">
            <BlindRoomDate
              currentUser={mappedCurrentUser}
              candidates={MOCK_PROFILES}
              rooms={rooms}
              requests={requests}
              onAddRequest={handleAddRequest}
              onAcceptRequest={handleAcceptRequest}
              onReviewRequest={handleReviewRequest}
              screenshotShieldActive={user.stealth}
              onToggleShield={handleToggleShield}
            />
          </div>
        )}

        {/* Render Platform Specs specs hub */}
        {platformView === "specs" && (
          <div className="w-full max-w-5xl h-[700px] shadow-2xl animate-[fadeIn_0.4s_ease_both]">
            <SpecsHub />
          </div>
        )}

      </main>
    </div>
  );
}
