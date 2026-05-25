import { useState } from "react";
import { MBTI_QUESTIONS, QuestionType } from "../utils/mockClubData";

interface OnboardingProps {
  isBangla: boolean;
  onComplete: (data: {
    name: string;
    age: number;
    city: string;
    gender: 'female' | 'male' | 'nonbinary';
    intent: 'Long-term' | 'Casual' | 'Intimate';
    mbti: string;
    stealth: boolean;
  }) => void;
}

export function Onboarding({ isBangla, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [city, setCity] = useState("Dhaka");
  const [gender, setGender] = useState<'female' | 'male' | 'nonbinary' | "">("");
  const [intent, setIntent] = useState<'Long-term' | 'Casual' | 'Intimate' | "">("");
  const [mbtiAnswers, setMbtiAnswers] = useState<number[]>([]);
  const [mbtiIdx, setMbtiIdx] = useState(0);
  const [stealth, setStealth] = useState(false);
  const [loading, setLoading] = useState(false);

  const TOTAL_STEPS = 5;
  const progressPercent = (step / TOTAL_STEPS) * 100;

  const t = (en: string, bn: string) => {
    return isBangla ? bn : en;
  };

  const computeMBTIType = (answers: number[]) => {
    const formulas = ["EI", "SN", "TF", "JP"];
    return answers.map((val, idx) => formulas[idx][val]).join("");
  };

  const handleMbtiChoice = (choiceIndex: number) => {
    const updated = [...mbtiAnswers, choiceIndex];
    setMbtiAnswers(updated);

    if (mbtiIdx < MBTI_QUESTIONS.length - 1) {
      setMbtiIdx(prev => prev + 1);
    } else {
      setStep(4);
    }
  };

  const handleFinishOnboarding = () => {
    if (!name || !age || !gender || !intent) return;
    setLoading(true);

    const calculatedMbti = computeMBTIType(mbtiAnswers);
    setTimeout(() => {
      setLoading(false);
      onComplete({
        name,
        age: Number(age),
        city,
        gender,
        intent,
        mbti: calculatedMbti || "INTJ",
        stealth
      });
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden select-none relative z-10">
      {/* Step Counter Headers */}
      <div className="flex justify-between items-center px-5 pt-4">
        <span className="font-serif italic text-sm text-[#C9A84C] tracking-wide">
          AURA VIP Access
        </span>
        <span className="font-mono text-[10px] text-[#C9A84C]/60 tracking-wider">
          {t(`STEP ${step + 1} OF ${TOTAL_STEPS}`, `ধাপ ${step + 1} / ${TOTAL_STEPS}`)}
        </span>
      </div>

      {/* Progress Line */}
      <div className="mx-5 mt-3 h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#8B6914] to-[#FFE066] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scroll-hide">
        {step === 0 && (
          <div className="space-y-4 animate-[fadeUp_0.5s_ease_both]">
            <h2 className="font-serif italic text-xl text-[#FFE066] font-bold">
              {t("Identity Signature", "আপনার পরিচয়")}
            </h2>
            <p className="font-sans text-[11.5px] text-white/50 leading-relaxed">
              {t("Initiate your premium profile parameters with correct coordinates.", "ক্লাবে যোগদানের জন্য আপনার পরিচয় প্যারামিটারগুলো সেট করুন।")}
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block font-sans text-[9px] text-[#C9A84C]/80 uppercase tracking-widest mb-1.5 font-bold">
                  {t("Full Private Name", "আপনার নাম")}
                </label>
                <input
                  type="text"
                  placeholder={t("Enter name...", "নাম লিখুন...")}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block font-sans text-[9px] text-[#C9A84C]/80 uppercase tracking-widest mb-1.5 font-bold">
                  {t("Verified Biological Age (18+)", "প্রকৃত বয়স (১৮+)")}
                </label>
                <input
                  type="number"
                  placeholder={t("Years...", "বয়স...")}
                  value={age}
                  min={18}
                  max={85}
                  onChange={e => {
                    const v = e.target.value === "" ? "" : Number(e.target.value);
                    setAge(v);
                  }}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block font-sans text-[9px] text-[#C9A84C]/80 uppercase tracking-widest mb-1.5 font-bold">
                  {t("Club Region Zone", "আবাসিক অঞ্চল / শহর")}
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="glass-input cursor-pointer"
                >
                  <option value="Dhaka">Dhaka (Gulshan/Banani)</option>
                  <option value="Chittagong">Chittagong (Khulshi)</option>
                  <option value="Sylhet">Sylhet (Shahjalal)</option>
                  <option value="Rajshahi">Rajshahi (Uposhohor)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => name.trim().length > 1 && Number(age) >= 18 && setStep(1)}
              disabled={name.trim().length <= 1 || Number(age) < 18}
              className="btn-gold w-full py-3.5 mt-4 text-xs font-bold font-serif uppercase tracking-widest disabled:opacity-40"
            >
              {t("Proceed Verification →", "পরবর্তী ধাপ →")}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-[fadeUp_0.5s_ease_both]">
            <h2 className="font-serif italic text-xl text-[#FFE066] font-bold">
              {t("Biological Gender", "আপনার লিঙ্গ")}
            </h2>
            <p className="font-sans text-[11px] text-white/50">
              {t("Identify biological compatibility signals for verified matching protocols.", "লিঙ্গ পরিচয় নির্বাচন করুন যা কগনিটিভ তরঙ্গ মেলাতে সাহায্য করবে।")}
            </p>

            <div className="space-y-2.5 pt-2">
              {(
                [
                  ["👩 female", t("Female Signature", "নারী")],
                  ["👨 male", t("Male Signature", "পুরুষ")],
                  ["🌈 nonbinary", t("Non-binary Spectrum", "নন-বাইনারি")]
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setGender(val)}
                  className={`choice-card flex justify-between items-center ${gender === val ? "selected" : ""}`}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-sans text-[13.5px] text-white font-medium">
                      {val.startsWith("👩") ? "👩" : val.startsWith("👨") ? "👨" : "🌈"} {label}
                    </span>
                  </div>
                  {gender === val && <span className="text-[#C9A84C] text-sm">✓</span>}
                </button>
              ))}

              {gender === "female" && (
                <div className="mt-2 p-3 bg-lime-400/5 border border-lime-400/20 rounded-xl animate-[fadeIn_0.3s_ease]">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={stealth}
                      onChange={e => setStealth(e.target.checked)}
                      className="mt-0.5 accent-[#B5E853] w-4.5 h-4.5 shrink-0 rounded"
                    />
                    <div>
                      <span className="block font-sans text-xs text-[#B5E853] font-bold">
                        🛡️ Stealth Protection Activated
                      </span>
                      <span className="block font-sans text-[9.5px] text-white/30 mt-0.5">
                        {t(
                          "Your profile signals stay invisible. Only verified Elite members can sync.",
                          "আপনার প্রোফাইল হাইড থাকবে, শুধুমাত্র এলিট গোল্ড মেম্বাররা রিকোয়েস্ট করতে পারবেন।"
                        )}
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3 text-xs">
                {t("Back", "পিছনে")}
              </button>
              <button
                onClick={() => gender && setStep(2)}
                disabled={!gender}
                className="btn-gold flex-2 py-3 text-xs"
              >
                {t("Next →", "সামনে →")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-[fadeUp_0.5s_ease_both]">
            <h2 className="font-serif italic text-xl text-[#FFE066] font-bold">
              {t("Relationship Intent", "আপনার উদ্দেশ্য")}
            </h2>
            <p className="font-sans text-[11px] text-white/50">
              {t("Define lifestyle parameters. Honesty aligns cognitive compatibility.", "আস্থার সাথে আপনার প্রত্যাশা জানান যা কগনিটিভ জোড় মেলাবে।")}
            </p>

            <div className="space-y-2.5 pt-2">
              {(
                [
                  [
                    "Long-term",
                    "💍",
                    t("Long-term Alliance", "দীর্ঘমেয়াদী সম্পর্ক"),
                    t("Diving deep into long-term commitment.", "ভবিষ্যত জীবনসঙ্গী ও চিরস্থায়ী বন্ধন।")
                  ],
                  [
                    "Casual",
                    "☕",
                    t("Casual Dating", "ক্যাজুয়াল সংযোগ"),
                    t("Coffee meets, organic vibes, lightweight ties.", "বন্ধুত্বপূর্ণ আড্ডা ও মনোরম কফি ডেটিং।")
                  ],
                  [
                    "Intimate",
                    "🔒",
                    t("Intimate & Secured", "ঘনিষ্ঠ ও নিরাপদ"),
                    t("Secured, private chemistry and maturity.", "গোপনীয় অনুভূতিমূলক ও পরিপক্ব সম্পর্ক।")
                  ]
                ] as const
              ).map(([val, icon, title, subtitle]) => (
                <button
                  key={val}
                  onClick={() => setIntent(val)}
                  className={`choice-card flex items-center gap-3.5 text-left w-full ${intent === val ? "selected" : ""}`}
                >
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div className="flex-1">
                    <span className="block font-serif text-[14px] text-white font-medium">{title}</span>
                    <span className="block font-sans text-[10px] text-white/40 mt-0.5">{subtitle}</span>
                  </div>
                  {intent === val && <span className="text-[#C9A84C] text-[15px] shrink-0 font-bold">✓</span>}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3 text-xs">
                {t("Back", "পিছনে")}
              </button>
              <button
                onClick={() => intent && setStep(3)}
                disabled={!intent}
                className="btn-gold flex-2 py-3 text-xs"
              >
                {t("Evaluate MBTI →", "এমবিটিআই পরীক্ষা →")}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-[fadeUp_0.5s_ease_both]">
            <h2 className="font-serif italic text-xl text-[#FFE066] font-bold">
              {t("Personality Evaluation", "এমবিটিআই মূল্যায়ন")}
            </h2>
            <p className="font-sans text-[11.5px] text-white/50">
              {t(
                `Personality metric matching: ${mbtiIdx + 1} of ${MBTI_QUESTIONS.length}`,
                `ব্যক্তিত্ব ক্যাটাগরি বিশ্লেষণ: ধাপ ${mbtiIdx + 1} / ${MBTI_QUESTIONS.length}`
              )}
            </p>

            <div className="bg-[#FFE066]/5 border border-[#C9A84C]/25 rounded-2xl p-4 text-center mt-2">
              <p className="font-serif text-[13px] text-white font-medium leading-relaxed italic">
                "{MBTI_QUESTIONS[mbtiIdx].qBn}"
              </p>
              <p className="font-sans text-[10.5px] text-[#C9A84C]/50 mt-1">
                {MBTI_QUESTIONS[mbtiIdx].qEn}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {MBTI_QUESTIONS[mbtiIdx].aBn.map((ansBn, i) => (
                <button
                  key={i}
                  onClick={() => handleMbtiChoice(i)}
                  className="mbti-btn flex flex-col gap-0.5"
                >
                  <span className="font-sans text-xs text-white/90">{ansBn}</span>
                  <span className="font-sans text-[9px] text-[#C9A84C]/45">
                    {MBTI_QUESTIONS[mbtiIdx].aEn[i]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-[fadeUp_0.5s_ease_both] text-center">
            <div className="text-4xl">🌟</div>
            <h2 className="font-serif italic text-xl text-[#FFE066] font-bold">
              {t("AURA Evaluation Matcher", "মূল্যায়ন সম্পূর্ণ")}
            </h2>
            <p className="font-sans text-xs text-white/60">
              {t("We have compiled your personal MBTI cluster:", "আমরা আপনার এমবিটিআই ফাইল ক্যালকুলেট করেছি:")}{" "}
              <span className="text-[#C9A84C] font-bold text-sm bg-[#C9A84C]/10 px-2 py-0.5 rounded border border-[#C9A84C]/20 font-mono ml-1">
                {computeMBTIType(mbtiAnswers)}
              </span>
            </p>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left font-sans text-xs space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-center border-b border-white/5 pb-2">
                <div>
                  <span className="block text-[8px] text-white/30 uppercase tracking-widest">{t("Signature", "প্রোফাইল")}</span>
                  <span className="font-medium text-white/90 truncate block">{name}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-white/30 uppercase tracking-widest">{t("Verified Age", "বয়স")}</span>
                  <span className="font-medium text-white/90">{age}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="block text-[8px] text-white/30 uppercase tracking-widest">{t("Secure Zone", "অঞ্চল")}</span>
                  <span className="font-medium text-white/90">{city}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-white/30 uppercase tracking-widest">{t("Dating Intent", "উদ্দেশ্য")}</span>
                  <span className="font-medium text-white/90">{intent}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishOnboarding}
              disabled={loading}
              className="btn-gold w-full py-4 text-xs tracking-widest uppercase font-bold text-black"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Generating secure credential codes...
                </span>
              ) : (
                t("LAUNCH SECURE AURA DATING →", "আউরা ক্লাবে প্রবেশ করুন →")
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
