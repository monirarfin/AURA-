import { useState } from "react";
import { ClubProfile } from "../utils/mockClubData";
import { CoffeeKeySVG } from "./SVGIcons";

interface BlindModalProps {
  profile: ClubProfile;
  onClose: () => void;
  onConfirm: () => void;
  isBangla: boolean;
}

const VENUES = [
  { name: "The Gold Lounge, Gulshan", rating: "4.9★", price: "৳2,500/hr", tag: "AURA Vetted ✓" },
  { name: "Crimson Room, Banani", rating: "4.8★", price: "৳2,000/hr", tag: "AURA Vetted ✓" },
  { name: "Eclipse Suite, Dhanmondi", rating: "4.7★", price: "৳1,800/hr", tag: "AURA Vetted ✓" },
];

export function BlindModal({ profile, onClose, onConfirm, isBangla }: BlindModalProps) {
  const [step, setStep] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState(0);

  const t = (en: string, bn: string) => {
    return isBangla ? bn : en;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end justify-center pointer-events-auto"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-gradient-to-b from-[#180e02] to-[#0a0701] border-t-2 border-[#C9A84C]/60 rounded-t-[28px] px-5 pb-8 pt-2 w-full max-w-md animate-[slideUp_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_both] shadow-[0_-15px_45px_10px_rgba(0,0,0,0.8),0_0_35px_rgba(201,168,76,0.1)]"
      >
        {/* Grab notch */}
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto my-3" />
        {/* Shimmer line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent rounded-full mb-5" />

        {step === 0 && (
          <div className="text-left">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#311f01] to-[#805500] border border-[#C9A84C] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(201,168,76,0.3)]">
                <CoffeeKeySVG size={30} />
              </div>
              <div>
                <h3 className="font-serif text-[17px] text-[#FFE066] font-bold">
                  {t("Blind Room Coffee offer", "ব্লাইন্ড কফি ডেটিং")}
                </h3>
                <p className="font-sans text-[10.5px] text-[#C9A84C]/70">
                  {t("Encrypted Coffee Date • Strict Safety Vetted ☕🔑", "সিকিউর কফি ডেট • শতভাগ তথ্য গোপন রাখার নিশ্চয়তা ☕🔑")}
                </p>
              </div>
            </div>

            <p className="font-sans text-xs text-white/70 leading-relaxed mb-4">
              {t("Send a direct, anonymous premium room invitation to ", "আপনার পরিচয় গোপন রেখে সরাসরি কফি সেশনের আমন্ত্রণ পাঠান ")}
              <strong className="text-white font-bold">{profile.name}</strong>.
              {t(" Your identities are fully masked until both parties swipe to accept.", " উভয় পক্ষ আমন্ত্রণ গ্রহণ করার আগ পর্যন্ত নাম সম্পূর্ণ গোপন থাকবে।")}
            </p>

            <div className="p-3.5 bg-lime-400/5 border border-lime-400/20 rounded-xl mb-5 space-y-1.5">
              <div className="font-sans text-xs text-[#B5E853] font-bold">
                🛡️ AURA Safety Protocols Active
              </div>
              <ul className="space-y-1 text-white/40 text-[9.5px] font-sans">
                <li>• {t("Host-vetted absolute secure rooms", "নিরাপদ ও বিশেষ হোস্ট-প্রমাণিত রুম")}</li>
                <li>• {t("Anonymous coordinates routing protection", "সম্পূর্ণ এনক্রিপ্টেড লোকেশন ট্র্যাকিং")}</li>
                <li>• {t("Verified security guards available on-site", "যেকোনো সাহায্যার্থে অন-সাইট সাপোর্ট সিস্টেম")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setStep(1)}
                className="btn-gold w-full py-3.5 text-xs uppercase font-serif tracking-widest font-bold text-black"
              >
                ☕ {t("SELECT PREMIUM VENUE →", "ভেন্যু নির্বাচন করুন →")}
              </button>
              <button
                onClick={onClose}
                className="btn-outline w-full py-2.5 text-xs"
              >
                {t("Dismiss offer", "পরে করব")}
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="text-left">
            <h3 className="font-serif text-base text-[#FFE066] font-bold">
              {t("Secure Premium Venues", "নিরাপদ এলিট ভেন্যু")}
            </h3>
            <p className="font-sans text-[10.5px] text-white/35 mb-3.5">
              {t("All physical coordinates are AURA managed and safe.", "সবগুলো ভেন্যু আউরা ডিরেক্টরি দ্বারা সম্পূর্ণ সংরক্ষিত।")}
            </p>

            <div className="space-y-2.5 mb-5">
              {VENUES.map((venue, i) => (
                <button
                  key={venue.name}
                  onClick={() => setSelectedVenue(i)}
                  className={`choice-card flex justify-between items-center w-full ${selectedVenue === i ? "selected" : ""}`}
                >
                  <div className="text-left flex flex-col">
                    <span className="font-serif text-[13.5px] text-white font-medium">🏛️ {venue.name}</span>
                    <span className="font-sans text-[9.5px] text-white/35 mt-0.5">
                      {venue.rating} • {venue.price} • {venue.tag}
                    </span>
                  </div>
                  {selectedVenue === i && <span className="text-[#C9A84C] text-[15px] font-bold">✓</span>}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3 text-xs">
                {t("← Back", "← পিছনে")}
              </button>
              <button
                onClick={onConfirm}
                className="btn-gold flex-2 py-3 text-xs uppercase font-serif tracking-wider font-extrabold"
              >
                ☕ {t("INVITE NOW", "আমন্ত্রণ পাঠান")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
