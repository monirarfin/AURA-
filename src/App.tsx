import React, { useState } from 'react';
import { UserProfile, RoomListing, Conversation, BlindDateRequest, Message } from './types';
import { INITIAL_USER_PROFILE, MOCK_PROFILES, MOCK_ROOMS } from './mockData';
import AURAApp from './components/AURAApp';
import BlindRoomDate from './components/BlindRoomDate';
import HostDashboard from './components/HostDashboard';
import SpecsHub from './components/SpecsHub';
import { EyeOff, User, MapPin, Building, Cpu, ShieldAlert, BadgeInfo, Volume2, VolumeX, Sparkles, Star, Award, Heart } from 'lucide-react';
import { audioEngine } from './utils/audio';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [candidates, setCandidates] = useState<UserProfile[]>(MOCK_PROFILES);
  const [rooms, setRooms] = useState<RoomListing[]>(MOCK_ROOMS);
  const [screenshotShieldActive, setScreenshotShieldActive] = useState(true);
  
  // App navigation tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'dating' | 'blind-room' | 'host' | 'specs'>('dating');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState<{ active: boolean; partnerName: string; partnerMbti: string } | null>(null);

  const isTier1Match = (currentUserMbti: string, candidateMbti: string): boolean => {
    const t1 = [
      ['INTJ', 'ENFP'], ['INTJ', 'ENTP'],
      ['INFJ', 'ENTP'], ['INFJ', 'ENFP'],
      ['INFP', 'ENFJ'], ['INFP', 'ENTJ'],
      ['INTP', 'ENTJ'], ['INTP', 'ENFJ'],
      ['ISFP', 'ESFJ'], ['ISFP', 'ESTJ'],
      ['ISTP', 'ESTJ'], ['ISTP', 'ESFJ'],
      ['ISFJ', 'ESFP'], ['ISFJ', 'ESTP'],
      ['ISTJ', 'ESTP'], ['ISTJ', 'ESFP']
    ];
    const m1U = currentUserMbti.toUpperCase();
    const m2U = candidateMbti.toUpperCase();
    return t1.some(
      ([a, b]) => (a === m1U && b === m2U) || (a === m2U && b === m1U)
    );
  };

  // Conversations state represent dating matches
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'c1',
      participantId: 'p1', // Sarah Rahman
      unreadCount: 1,
      messages: [
        { id: 'm1', senderId: 'p1', text: "Hey! I\'m an ENFP... MBTI matcher says we are 95% compatible!", timestamp: '12:00 PM' }
      ]
    },
    {
      id: 'c2',
      participantId: 'p2', // Nabila Karim
      unreadCount: 0,
      messages: [
        { id: 'm2', senderId: 'p2', text: "I like quiet conversations. What book are you reading currently?", timestamp: 'Yesterday' }
      ]
    }
  ]);

  // Blind date requests list matching dating invites
  const [blindRequests, setBlindRequests] = useState<BlindDateRequest[]>([
    {
      id: 'bd_default_1',
      requesterId: 'p1', // Sarah requested Arfin
      recipientId: 'me',
      status: 'pending',
      roomId: 'r1',
      maskedSenderId: 'Golden Phoenix (ENFP)',
      maskedRecipientId: 'Silent Wolf (INTJ)',
      createdAt: new Date().toISOString()
    }
  ]);

  // Trigger matches on swipes
  const handleTriggerMatch = (matchId: string, customIcebreaker?: string) => {
    const matchProfile = candidates.find(c => c.id === matchId);
    if (matchProfile) {
      const isTier1 = isTier1Match(currentUser.mbti, matchProfile.mbti);
      if (isTier1) {
        setShowCelebration({
          active: true,
          partnerName: matchProfile.name,
          partnerMbti: matchProfile.mbti
        });
      }
    }
    // Generate new conversation if it doesn't already exist
    const exists = conversations.find(c => c.participantId === matchId);
    if (!exists) {
      const mbtiLabel = matchProfile?.mbti || 'AURA';
      const greeting = customIcebreaker || `Match Activated! I noticed you are an ${mbtiLabel}. Let\'s initiate a safe conversation.`;

      const newConversation: Conversation = {
        id: `c_${Date.now()}`,
        participantId: matchId,
        unreadCount: 0,
        messages: [
          { id: `m_greet_${Date.now()}`, senderId: matchId, text: greeting, timestamp: 'Just Now' }
        ]
      };
      setConversations([...conversations, newConversation]);
      if (soundEnabled) {
        audioEngine.playMatchChime();
      }
    }
  };

  // Deliver user messages
  const handleSendMessage = (matchId: string, text: string) => {
    setConversations(prev => prev.map(chat => {
      if (chat.participantId === matchId) {
        const newMessage: Message = {
          id: `m_${Date.now()}`,
          senderId: currentUser.id,
          text,
          timestamp: 'Just Now'
        };
        return {
          ...chat,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));

    // Auto chatbot answer simulating other user response
    setTimeout(() => {
      setConversations(prev => prev.map(chat => {
        if (chat.participantId === matchId) {
          const partner = candidates.find(c => c.id === matchId);
          const alias = partner?.name || "Buddy";
          const autoAnswers = [
            `That\'s quite interesting! As an ${partner?.mbti || 'MBTI'}, I process that cognitive logic smoothly. Let\'s book a secure Blind Room and meet privately!`,
            `Sounds promising. Have you checked out the nearby secret OYO listings of Banani? Send a blind date request so we are masked.`,
            `I totally agree with that. Privacy is a key priority for me too. Let\'s connect under the screenshot shield.`,
            `Excellent! Looking forward to matching further.`
          ];
          const textResponse = autoAnswers[Math.floor(Math.random() * autoAnswers.length)];

          const replyMessage: Message = {
            id: `m_reply_${Date.now()}`,
            senderId: matchId,
            text: textResponse,
            timestamp: 'Just Now'
          };
          return {
            ...chat,
            messages: [...chat.messages, replyMessage],
            unreadCount: chat.unreadCount + 1
          };
        }
        return chat;
      }));
    }, 1500);
  };

  // Add Host listing room
  const handleAddRoomListing = (newRoom: RoomListing) => {
    setRooms([newRoom, ...rooms]);
  };

  // Anonymous requests submissions
  const handleAddBlindRequest = (newReq: BlindDateRequest) => {
    setBlindRequests([newReq, ...blindRequests]);
    if (soundEnabled) {
      audioEngine.playRequestPing();
    }
  };

  // Accept blind book date
  const handleAcceptBlindRequest = (id: string, roomId: string) => {
    setBlindRequests(prev => prev.map(req => {
      if (req.id === id) {
        // Find if this requester has an MBTI of Tier 1 compatibility
        const requester = candidates.find(c => c.id === req.requesterId) || candidates.find(c => c.id === req.recipientId);
        if (requester) {
          const isTier1 = isTier1Match(currentUser.mbti, requester.mbti);
          if (isTier1) {
            setShowCelebration({
              active: true,
              partnerName: requester.name,
              partnerMbti: requester.mbti
            });
          }
        }
        return {
          ...req,
          roomId,
          status: 'accepted'
        };
      }
      return req;
    }));
    if (soundEnabled) {
      audioEngine.playMatchChime();
    }
  };

  // Submit anonymous rating for a concluded blind date
  const handleReviewBlindRequest = (id: string, rating: number, reviewText: string) => {
    const req = blindRequests.find(r => r.id === id);
    if (!req) return;

    // Update the request status and set rating/review details
    setBlindRequests(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'concluded',
          rating,
          reviewText
        };
      }
      return r;
    }));

    // Recalculate room review metrics
    if (req.roomId) {
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === req.roomId) {
          const newCount = room.reviewsCount + 1;
          const newRating = parseFloat((((room.rating * room.reviewsCount) + rating) / newCount).toFixed(1));
          return {
            ...room,
            rating: Math.min(5, Math.max(1, newRating)),
            reviewsCount: newCount
          };
        }
        return room;
      }));
    }

    if (soundEnabled) {
      audioEngine.playRequestPing();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-sans antialiased pb-12">
      {/* Absolute top info ribbon */}
      <div className="bg-[#0b0b0d] border-b border-white/5 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono text-white/40 select-none">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
          AURA COGNITIVE matchmaking & SECURITY ENGINE • v2.4.1
        </span>
        <div className="flex items-center gap-5">
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) {
                audioEngine.playRequestPing();
              }
            }}
            className="flex items-center gap-1.5 hover:text-[#c5a059] transition-all cursor-pointer"
            title="Toggle notification chimes"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">CHIMES: ACTIVE</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-500/80">CHIMES: MUTED</span>
              </>
            )}
          </button>
          <button
            onClick={() => audioEngine.playMatchChime()}
            disabled={!soundEnabled}
            className={`hover:underline cursor-pointer ${soundEnabled ? 'text-[#c5a059]/90 hover:text-white' : 'text-white/20 cursor-not-allowed select-none'}`}
            title="Preview connection chime"
          >
            [TEST CHIME]
          </button>
          <span>CURRENCY: BDT (৳)</span>
          <span>LOCATION: DHAKA, BANGLADESH</span>
        </div>
      </div>

      {/* Screen container */}
      <div className={`max-w-7xl mx-auto px-4 md:px-6 mt-6 space-y-6 ${screenshotShieldActive ? 'relative' : ''}`}>
        
        {/* Screenshot shield visual effect warning overlay - Blurs the whole interface mockup if simulated shield triggers */}
        {screenshotShieldActive && (
          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-[#c5a059]/20 rounded-3xl animate-pulse z-40" />
        )}

        {/* Dynamic header / control deck */}
        <header className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#c5a059] to-[#8a6d3b] flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <span className="text-black font-serif font-bold text-xl">A</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif italic tracking-widest text-[#c5a059] hover:scale-105 transition-all">
                  AURA
                </h1>
                <span className="bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-mono px-2.5 py-0.5 rounded border border-[#c5a059]/20">SOPHISTICATED DARK</span>
              </div>
              <p className="text-xs text-white/50 font-medium font-sans">
                AI personality matching • Strict multi-tier chat restrictions • Secure Blind Room Dates
              </p>
            </div>
          </div>

          {/* Environment metrics indicator widget */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col text-xs font-mono pr-4 lg:border-r border-white/10">
              <span className="text-white/40 text-[10px]/none">CURRENT USERS</span>
              <span className="text-white font-bold mt-1">14,209 Active</span>
            </div>
            <div className="flex flex-col text-xs font-mono pr-4 lg:border-r border-white/10">
              <span className="text-white/40 text-[10px]/none">SECURE LOCATIONS</span>
              <span className="text-[#c5a059] font-bold mt-1">{rooms.filter(r => r.pricePerBooking >= 1000).length} OYO / Airbnb</span>
            </div>
            <div className="flex flex-col text-xs font-mono">
              <span className="text-white/40 text-[10px]/none">SHIELD STATUS</span>
              <span className={`font-bold flex items-center gap-1 mt-1 ${screenshotShieldActive ? 'text-green-400' : 'text-slate-500'}`}>
                {screenshotShieldActive ? '🛡️ ENABLED' : '■ INACTIVE'}
              </span>
            </div>
          </div>
        </header>

        {/* Global Navigation Hub */}
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold font-mono">
          <button
            onClick={() => setActiveWorkspaceTab('dating')}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all cursor-pointer ${
              activeWorkspaceTab === 'dating'
                ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059] shadow-lg shadow-black/40'
                : 'bg-[#141417] text-white/50 border-white/5 hover:text-white hover:border-white/15'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            Dating Portal
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('blind-room')}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all cursor-pointer ${
              activeWorkspaceTab === 'blind-room'
                ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059] shadow-lg shadow-black/40'
                : 'bg-[#141417] text-white/50 border-white/5 hover:text-white hover:border-white/15'
            }`}
          >
            <EyeOff className="w-4 h-4 shrink-0" />
            Anonymous Blind Dates
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('host')}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all cursor-pointer ${
              activeWorkspaceTab === 'host'
                ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059] shadow-lg shadow-black/40'
                : 'bg-[#141417] text-white/50 border-white/5 hover:text-white hover:border-white/15'
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            Host Partner Suite
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('specs')}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all cursor-pointer ${
              activeWorkspaceTab === 'specs'
                ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059] shadow-lg shadow-black/40'
                : 'bg-[#141417] text-white/50 border-white/5 hover:text-white hover:border-white/15'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            Specs & DB Terminals
          </button>
        </nav>

        {/* Interactive Workspace Area */}
        <main className="bg-[#141417] border border-white/5 rounded-3xl p-6 shadow-2xl relative">
          
          {/* Simulated Screenshot Warning Screen overlay if shield active is checked */}
          {screenshotShieldActive && (
            <div className="absolute top-2 right-2 bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 z-30 pointer-events-none">
              <EyeOff className="w-3.5 h-3.5" />
              IDENTITY SHIELD OPTIMIZED
            </div>
          )}

          {activeWorkspaceTab === 'dating' && (
            <AURAApp
              currentUser={currentUser}
              candidates={candidates}
              conversations={conversations}
              onUpdateCurrentUser={setCurrentUser}
              onSendMessage={handleSendMessage}
              onTriggerMatch={handleTriggerMatch}
              onNavigateToBlindRoom={() => setActiveWorkspaceTab('blind-room')}
            />
          )}

          {activeWorkspaceTab === 'blind-room' && (
            <BlindRoomDate
              currentUser={currentUser}
              candidates={candidates}
              rooms={rooms}
              requests={blindRequests}
              onAddRequest={handleAddBlindRequest}
              onAcceptRequest={handleAcceptBlindRequest}
              onReviewRequest={handleReviewBlindRequest}
              screenshotShieldActive={screenshotShieldActive}
              onToggleShield={() => setScreenshotShieldActive(!screenshotShieldActive)}
            />
          )}

          {activeWorkspaceTab === 'host' && (
            <HostDashboard
              rooms={rooms}
              onAddRoom={handleAddRoomListing}
            />
          )}

          {activeWorkspaceTab === 'specs' && (
            <SpecsHub />
          )}

        </main>

        {/* Golden Pair Match Celebration Overlay with golden-glow and floating sparkles */}
        <AnimatePresence>
          {showCelebration?.active && showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden select-none"
            >
              {/* Ambient golden halo background glow */}
              <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-yellow-500/20 via-[#c5a059]/15 to-transparent rounded-full blur-[120px] animate-pulse" />

              {/* Simulated falling golden particles / confetti */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => {
                  const size = Math.random() * 6 + 3;
                  const left = Math.random() * 100;
                  const duration = Math.random() * 4 + 3;
                  const delay = Math.random() * 2;
                  return (
                    <motion.div
                      key={i}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{
                        y: "110vh",
                        opacity: [0, 1, 1, 0],
                        x: [0, Math.sin(i) * 35, 0],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: duration,
                        repeat: Infinity,
                        delay: delay,
                        ease: "linear",
                      }}
                      className="absolute bg-gradient-to-b from-[#c5a059] to-yellow-100 rounded-full shadow-[0_0_8px_rgba(197,160,89,0.8)]"
                      style={{
                        width: size,
                        height: size,
                        left: `${left}%`,
                        top: `-20px`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Celebration Card component */}
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                className="bg-[#0e0e12] border-2 border-[#c5a059]/40 p-8 rounded-[36px] max-w-lg w-full text-center relative shadow-[0_0_50px_rgba(197,160,89,0.15)] overflow-hidden"
              >
                {/* Top luxury badge */}
                <div className="flex justify-center -mt-2 mb-4">
                  <div className="bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-full px-4 py-1.5 flex items-center gap-2 animate-bounce">
                    <Award className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#c5a059] uppercase">
                      TIER 1 DETECTED
                    </span>
                  </div>
                </div>

                {/* Heart and MBTI union badge animation */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-[#c5a059]/5 rounded-full animate-ping duration-1000" />
                  <div className="absolute inset-2 bg-gradient-to-tr from-[#c5a059]/20 to-yellow-500/10 rounded-full border border-[#c5a059]/40 flex items-center justify-center shadow-inner">
                    <div className="relative">
                      <Heart className="w-12 h-12 text-[#c5a059] fill-[#c5a059]/10 stroke-[1.5]" />
                      <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Text content details */}
                <div className="space-y-4">
                  <h2 className="text-[#c5a059] text-3xl font-serif italic font-extrabold tracking-tight">
                    Golden Pair Aligned!
                  </h2>
                  <div className="px-3 py-1 bg-white/5 inline-block rounded-lg font-mono text-[11px] text-white/70">
                    {currentUser.mbti} <span className="text-[#c5a059] mx-1">↔</span> {showCelebration.partnerMbti}
                  </div>
                  <p className="text-white/95 text-sm leading-relaxed px-2 font-sans">
                    The AURA alignment engine confirms a perfect compatibility match with <strong className="text-white font-medium">{showCelebration.partnerName}</strong> ({showCelebration.partnerMbti}). You have unlocked exclusive direct VIP communication channels.
                  </p>
                  <div className="bg-[#15151b] border border-white/5 rounded-2xl p-3.5 space-y-1">
                    <div className="text-[10px] font-mono text-[#c5a059] font-bold uppercase tracking-wider">
                      COMPATIBILITY METRIC
                    </div>
                    <div className="text-2xl font-mono text-emerald-400 font-extrabold tracking-tighter">
                      98.9%
                    </div>
                    <div className="text-[8.5px] font-mono text-white/30 lowercase italic">
                      *neural wave synergy absolute maximum achieved
                    </div>
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="mt-8 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowCelebration(null);
                      // Switch to chats tab
                      setActiveWorkspaceTab('dating');
                    }}
                    className="w-full bg-[#c5a059] hover:bg-[#dfb56c] text-black font-semibold font-mono py-3.5 rounded-2xl text-xs transition-all uppercase tracking-widest cursor-pointer shadow-lg shadow-yellow-500/10 active:scale-[0.98]"
                  >
                    ⚡ Open Secure Direct Chat
                  </button>
                  <button
                    onClick={() => setShowCelebration(null)}
                    className="w-full text-white/50 hover:text-white text-[10px] font-mono py-2 transition-colors cursor-pointer"
                  >
                    DISMISS AND CONTINUE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="text-center text-[10px] font-mono text-white/30 space-y-1 select-none">
          <p>© 2026 AURA Dating Systems Ltd. Dhaka Headquarters.</p>
          <p className="text-white/20">Secure AES-256 chat keying • Verified Minimum BDT 1,000 Host protection guarantee.</p>
        </footer>

      </div>
    </div>
  );
}
