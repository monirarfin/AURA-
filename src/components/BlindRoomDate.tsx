import React, { useState } from 'react';
import { UserProfile, RoomListing, BlindDateRequest } from '../types';
import { EyeOff, ShieldAlert, Key, MapPin, Calendar, Heart, Shield, Check, Star, CornerDownRight } from 'lucide-react';

interface BlindRoomDateProps {
  currentUser: UserProfile;
  candidates: UserProfile[];
  rooms: RoomListing[];
  requests: BlindDateRequest[];
  onAddRequest: (req: BlindDateRequest) => void;
  onAcceptRequest: (id: string, roomId: string) => void;
  onReviewRequest: (id: string, rating: number, reviewText: string) => void;
  screenshotShieldActive: boolean;
  onToggleShield: () => void;
}

export default function BlindRoomDate({
  currentUser,
  candidates,
  rooms,
  requests,
  onAddRequest,
  onAcceptRequest,
  onReviewRequest,
  screenshotShieldActive,
  onToggleShield
}: BlindRoomDateProps) {
  const [selectedMatchId, setSelectedMatchId] = useState(candidates[0]?.id || 'p1');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || 'r1');

  // Local state for the post-date room review submission panel
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Static pseudonyms generators based on MBTI to achieve masked identity
  const getPseudonym = (mbti: string, gender: string) => {
    const list: Record<string, string[]> = {
      INTJ: ['Silent Wolf', 'Deep Oracle', 'Crypto Sage'],
      ENFP: ['Golden Phoenix', 'Electric Muse', 'Wandering Bard'],
      INFJ: ['Mystic Seeker', 'Velvet Mirror', 'Midnight Echo'],
      ESTP: ['Iron Dynamo', 'Solar Blaze', 'Wild Tempest'],
      INTP: ['Logic Phantom', 'Binary Shade', 'Quantum Spark'],
      ENTJ: ['Grand Monarch', 'Sigma Vortex', 'Solaris General'],
      ESFJ: ['Haven Anchor', 'Aura Keeper', 'Harmonic Shield']
    };

    const options = list[mbti] || ['Anonymous Aura'];
    return options[0] + ` (${mbti})`;
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMatch = candidates.find(c => c.id === selectedMatchId);
    if (!targetMatch) return;

    // Verify if already exists
    const exists = requests.find(r => r.recipientId === selectedMatchId && r.status === 'pending');
    if (exists) {
      alert("A pending anonymous date request is already dispatched to this candidate.");
      return;
    }

    const newRequest: BlindDateRequest = {
      id: `bd_${Date.now()}`,
      requesterId: currentUser.id,
      recipientId: selectedMatchId,
      status: 'pending',
      roomId: selectedRoomId,
      maskedSenderId: getPseudonym(currentUser.mbti, currentUser.gender),
      maskedRecipientId: getPseudonym(targetMatch.mbti, targetMatch.gender),
      createdAt: new Date().toISOString()
    };

    onAddRequest(newRequest);
    alert(`Success: Secure Anonymous invite sent! Your identity is masked as "${newRequest.maskedSenderId}".`);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guard Notice */}
      <div className="bg-[#131316] border border-[#c5a059]/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-bl-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-[#c5a059]/20" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-mono tracking-wider font-bold px-2 py-0.5 rounded border border-[#c5a059]/20">
                AURA PRIVACY PARADIGM
              </span>
              <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
            </div>
            <h3 className="text-white text-base font-serif italic font-bold text-[#c5a059]">Secure Anonymous Dating & Blind Room-Dates</h3>
            <p className="text-white/60 text-xs max-w-xl">
              AURA completely protects you. When booking a Blind Date, your name is replaced by an MBTI-specific pseudonym. Video screens and capture devices trigger system blurs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleShield}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                screenshotShieldActive
                  ? 'bg-[#c5a059] text-black hover:bg-[#d4b57a] shadow-lg shadow-[#c5a059]/20'
                  : 'bg-white/5 text-[#c5a059]/95 hover:text-white border border-white/10'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              {screenshotShieldActive ? '🛡️ SHIELD: ACTIVE' : '🛡️ ENGAGE SHIELD'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* New Invite Form */}
        <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[#c5a059] font-serif italic text-base flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-[#c5a059]" />
              Initiate Secure Blind Room-Date
            </h3>
            <p className="text-white/55 text-xs mb-4 leading-relaxed">
              Dispatch a direct request to premium candidates. When they accept, your secure smart key maps out checked-in Airbnb/OYO host rooms listed with maximum privacy controls.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-white/50 block mb-1">Select Dating Profile Target</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-[#141417] text-[#e0e0e0] p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#c5a059]"
                >
                  {candidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.mbti} - {candidate.age}y/o, {candidate.location} ({candidate.tier} Plan)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-white/40 block mt-1">
                  * Note: Your name "{currentUser.name}" will be fully masked as <strong className="text-white">"{getPseudonym(currentUser.mbti, currentUser.gender)}"</strong>.
                </span>
              </div>

              <div>
                <label className="text-white/50 block mb-1">Select Secure Airbnb/OYO Host Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full bg-[#141417] text-[#e0e0e0] p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#c5a059]"
                >
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.title} - {room.location} ({room.rating}★, {room.reviewsCount} reviews) • {room.pricePerBooking} BDT
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#141417] p-3 rounded-xl border border-white/5 text-[10.5px] text-[#c5a059]">
                <p className="flex gap-1.5 items-start leading-relaxed">
                  <Key className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                  <span>A smart QR encryption key is generated automatically on confirmation. Guests use anonymous QR scans at entry terminals. Name logs on hosting terminals are disabled.</span>
                </p>
              </div>
            </form>
          </div>

          <button
            onClick={handleSendInvite}
            className="w-full bg-[#c5a059] hover:bg-[#d4b57a] text-black font-bold py-3 rounded-xl cursor-pointer text-xs mt-4 transition-all hover:scale-[1.01]"
          >
            Dispatch Masked Room Date Request
          </button>
        </div>

        {/* Requests Terminal */}
        <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-[#c5a059] font-serif italic text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#c5a059]" />
            Decentralized Blind room Requests Registry ({requests.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {requests.map(req => {
              const assignedRoom = rooms.find(r => r.id === req.roomId) || rooms[0];

              return (
                <div key={req.id} className="bg-[#141417] border border-white/5 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#c5a059] font-medium">Request ID: {req.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      req.status === 'accepted' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : req.status === 'declined'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/50">
                    <div>
                      <span className="block text-[10px] text-white/40">Sender Alias</span>
                      <span className="text-white font-semibold">{req.maskedSenderId}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-white/40">Recipient Alias</span>
                      <span className="text-white font-semibold">{req.maskedRecipientId}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-3 rounded-lg space-y-2">
                    <span className="text-[10px] text-[#c5a059] font-mono uppercase font-bold block">Assigned Security Space Venue</span>
                    
                    <div className="flex gap-2">
                      <img src={assignedRoom?.image} alt="" className="w-16 h-12 object-cover rounded-md border border-white/5" />
                      <div className="text-[11px] font-mono">
                        <p className="text-white font-bold">{assignedRoom?.title}</p>
                        <p className="text-white/50 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-[#c5a059]" />
                          {assignedRoom?.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' && req.requesterId !== currentUser.id && (
                    <div className="flex gap-2 pt-1 font-mono text-xs">
                      <button
                        onClick={() => onAcceptRequest(req.id, assignedRoom.id)}
                        className="flex-1 bg-[#c5a059] hover:bg-[#d4b57a] text-black font-bold py-2 rounded-lg text-center transition-all cursor-pointer"
                      >
                        Accept Booking
                      </button>
                    </div>
                  )}

                  {req.status === 'accepted' && (
                    <div className="border-t border-white/5 pt-2.5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#c5a059] font-bold">
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          AURA Entry Access Pin Unlocked
                        </span>
                        <span className="bg-[#c5a059]/10 border border-[#c5a059]/30 px-2 py-0.5 rounded text-[#c5a059] font-mono text-xs tracking-wider">
                          #AURA3901-KEY
                        </span>
                      </div>

                      {reviewingRequestId !== req.id ? (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setReviewingRequestId(req.id);
                              setRatingValue(5);
                              setReviewComment('');
                            }}
                            className="bg-[#c5a059]/15 text-[#c5a059] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 hover:border-[#c5a059] text-[10.5px] px-3.5 py-1.5 rounded-lg font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
                            Conclude & Leave Review
                          </button>
                        </div>
                      ) : (
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-3 font-mono text-xs text-white">
                          <div className="flex items-center justify-between">
                            <span className="text-[#c5a059] font-bold text-[10px] tracking-wider uppercase font-mono">ANONYMOUS LOUNGE REVIEW</span>
                            <button
                              type="button"
                              onClick={() => setReviewingRequestId(null)}
                              className="text-white/40 hover:text-white text-[10px] font-mono"
                            >
                              [CANCEL]
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-white/50 text-[11px]">Experience Score:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRatingValue(star)}
                                  className="cursor-pointer hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      ratingValue >= star
                                        ? 'text-[#c5a059] fill-[#c5a059]'
                                        : 'text-white/10'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="text-[#c5a059] font-bold text-xs ml-1">{ratingValue}.0★</span>
                          </div>

                          <div className="space-y-1 font-mono">
                            <span className="text-white/40 text-[10px] block">ANONYMOUS FEEDBACK COMMENT (OPTIONAL)</span>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="e.g. Exceptional location privacy. Shield terminal was responsive."
                              rows={2}
                              className="w-full bg-[#101012] text-[#e0e0e0] p-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#c5a059] text-[11px] font-sans"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onReviewRequest(req.id, ratingValue, reviewComment);
                              setReviewingRequestId(null);
                            }}
                            className="w-full bg-[#c5a059] hover:bg-[#d4b57a] text-black font-semibold py-2 rounded-lg text-center cursor-pointer text-xs transition-colors font-mono"
                          >
                            Publish Anonymous Review & Exit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {req.status === 'concluded' && (
                    <div className="border-t border-white/5 pt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Concluded & Reviewed
                        </span>
                        <div className="flex gap-0.5 items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                (req.rating ?? 5) >= star
                                  ? 'text-[#c5a059] fill-[#c5a059]'
                                  : 'text-white/10'
                              }`}
                            />
                          ))}
                          <span className="text-[#c5a059] font-bold ml-1">({req.rating}.0★)</span>
                        </div>
                      </div>
                      {req.reviewText && (
                        <p className="bg-white/5 border border-white/5 text-white/70 italic text-[10.5px] p-2.5 rounded-lg leading-relaxed font-sans">
                          "{req.reviewText}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {requests.length === 0 && (
              <div className="text-center py-10 text-white/30 font-mono text-xs">
                No custom date bookings currently listed.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Verified Premium Spaces Directory (inform future bookings) */}
      <div className="bg-[#0b0b0d] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-[#c5a059] font-serif italic text-sm font-bold flex items-center gap-1.5 leading-snug">
              <Star className="w-4 h-4 text-[#c5a059] fill-[#c5a059]" />
              VERIFIED PRIVACY LOUNGES & SUITES
            </h3>
            <p className="text-white/40 text-[10px]/none font-mono mt-1 uppercase">
              LIVE STAR RATINGS UPDATED DYNAMICALLY FROM ANONYMOUS BOOKING REVIEWS
            </p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded font-black tracking-widest uppercase self-start sm:self-center">
            ACTIVE SHIELD MATRIX
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="bg-[#131316] border border-white/5 rounded-xl overflow-hidden hover:border-[#c5a059]/35 transition-all duration-300 flex flex-col justify-between group">
              <div className="h-28 overflow-hidden relative">
                <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-mono flex items-center gap-1 border border-white/10">
                  <Star className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
                  <span className="font-bold text-[#c5a059]">{room.rating}</span>
                  <span className="text-white/40 text-[9px]">({room.reviewsCount} reviews)</span>
                </div>
              </div>
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between font-mono">
                <div>
                  <h4 className="text-white font-serif italic text-[12px] leading-tight font-bold">{room.title}</h4>
                  <p className="text-[10px] text-white/50 flex items-center gap-0.5 mt-1 font-mono">
                    <MapPin className="w-3 h-3 text-[#c5a059] shrink-0" />
                    <span>{room.location}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-[#c5a059] font-bold">{room.pricePerBooking} BDT</span>
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/40 text-[9px]">Cap: {room.capacity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
