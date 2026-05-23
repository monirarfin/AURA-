import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK with custom user-agent for telemetry as mandated
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Server will run in simulation fallback mode.");
}

const app = express();
app.use(express.json());

// API: MBTI compatibility matching endpoint
const getMbtiCompatibility = (m1: string, m2: string): { tier: number; score: number; label: string } => {
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

  const m1U = m1.toUpperCase();
  const m2U = m2.toUpperCase();

  const isTier1 = t1.some(
    ([a, b]) => (a === m1U && b === m2U) || (a === m2U && b === m1U)
  );

  if (isTier1) {
    return { tier: 1, score: 98, label: 'Golden Pair' };
  }

  const samePerception = m1U[1] === m2U[1];
  if (samePerception) {
    return { tier: 2, score: 85, label: 'High Compatibility' };
  }

  return { tier: 3, score: 65, label: 'Neutral Compatibility' };
};

app.post("/api/mbti-match", async (req, res) => {
  const { userMBTI, partnerMBTI, userGender, partnerGender, userAge, partnerAge, interests } = req.body;

  if (!userMBTI || !partnerMBTI) {
    return res.status(400).json({ error: "Missing required profiles (userMBTI or partnerMBTI)" });
  }

  const compInfo = getMbtiCompatibility(userMBTI, partnerMBTI);

  // Fallback output generator if Gemini AI is offline/unconfigured
  const getFallbackMatch = (m1: string, m2: string) => {
    const isIntrovertDiff = m1[0] !== m2[0];
    const isSensingDiff = m1[1] !== m2[1]; 
    const score = compInfo.score;

    let tierLabel = "Neutral Compatibility";
    if (compInfo.tier === 1) tierLabel = "Maximum Attraction & Golden Pair";
    else if (compInfo.tier === 2) tierLabel = "High Compatibility (Opposite, complementary traits)";

    const strengths = [
      compInfo.tier === 1 
        ? `Exceptional natural resonance as a verified Golden Pair.` 
        : `Shared orientation in ${!isSensingDiff ? (m1[1] === 'N' ? "abstract, conceptual thinking" : "practical, grounded realistic discussions") : "complementary view structures"}.`,
      `${isIntrovertDiff ? "Opposite social energy levels (I vs E) creating a balanced social dynamic." : "Shared social preferences enabling shared rhythms."}`,
      `High cognitive and emotional resonance (${score}% vibe index).`
    ];

    const challenges = [
      isSensingDiff ? "Potential cognitive gap between intuitive concepts and concrete data." : "Over-analyzing shared habits without fresh external input.",
      m1[2] !== m2[2] ? "Struggling to reconcile deeply logical explanations with value-guided empathy." : "Tending to handle tension identically without checks and balances."
    ];

    const chemistryAnalysis = `This is a ${tierLabel} match between ${m1} and ${m2} with an evaluated compatibility index of ${score}%. ${
      compInfo.tier === 1 
        ? "This pairing is recognized as having supreme natural chemistry, combining mutual growth potentials with almost instantaneous mutual comprehension." 
        : "You share structural perception lenses which serve as a launchpad for deep mental resonance and long-term balance."
    }`;

    const icebreaker = compInfo.tier === 1
      ? `Hey! The AURA MBTI match indicates we're a verified Golden Pair (${score}% Vibe Match!). As an ${m1} matching with your ${m2}, I must connect. What's your favorite mind-bending paradox?`
      : `Hi! I noticed we match high on cognitive style. As an ${m1}, I'd love to exchange thoughts with an ${m2}. What's something interesting you've been pondering lately?`;

    return {
      score,
      tier: compInfo.tier,
      strengths,
      challenges,
      chemistryAnalysis,
      icebreaker,
      isRealAI: false
    };
  };

  if (!ai) {
    // Fallback response when developer hasn't configured key
    const fallback = getFallbackMatch(userMBTI, partnerMBTI);
    return res.json(fallback);
  }

  try {
    const prompt = `Calculate dating compatibility between a User (MBTI: ${userMBTI}, interests: ${interests?.join(", ") || "various interests"}) and a Potential Match (MBTI: ${partnerMBTI}).
    According to the compatibility matrix hierarchy:
    - Tier 1 (Golden Pair): score must be EXACTLY 98.
    - Tier 2 (High Compatibility - complementary opposite traits): score must be EXACTLY 85.
    - Tier 3 (Neutral Compatibility): score must be EXACTLY 65.
    
    Since this pair (${userMBTI} <-> ${partnerMBTI}) is categorized into compatibility Tier ${compInfo.tier}, please output a MATCHING compatibility analysis where the 'score' field is EXACTLY ${compInfo.score}.

    Please output JSON with exactly this structure:
    {
      "score": ${compInfo.score},
      "strengths": [<string array of 3 relationship strengths>],
      "challenges": [<string array of 2 relationship challenges>],
      "chemistryAnalysis": "<paragraphs analyzing the dynamic pairing of these two MBTI types in a romantic relationship>",
      "icebreaker": "<an engaging, non-corny custom icebreaker based on their personality synergy>"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "strengths", "challenges", "chemistryAnalysis", "icebreaker"],
          properties: {
            score: { type: Type.INTEGER, description: "Must be exactly " + compInfo.score + " as required by Tier " + compInfo.tier + "." },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three detailed, unique relational strengths of this MBTI coupling."
            },
            challenges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Two detailed, unique relational challenges of this MBTI coupling."
            },
            chemistryAnalysis: {
              type: Type.STRING,
              description: "A deeply insightful romantic compatibility analysis paragraph."
            },
            icebreaker: {
              type: Type.STRING,
              description: "A creative, charming custom introductory message tailored for the user to send first."
            }
          }
        },
        systemInstruction: `You are the primary cognitive psychology and MBTI matchmaking engine of the elite dating platform AURA. Analyze MBTI personality traits, communication styles, lifestyle differences, and emotional needs with top-tier accuracy. This pairing is Tier ${compInfo.tier} (${compInfo.label}) compatibility - ensure your analysis and tone align perfectly with deep psychological theories. The score must be exactly ${compInfo.score} as requested.`
      }
    });

    const resultText = response.text || "";
    const cleanJson = JSON.parse(resultText.trim());
    return res.json({
      ...cleanJson,
      score: compInfo.score, // Enforce exact score to be absolutely robust
      tier: compInfo.tier,
      isRealAI: true
    });

  } catch (error) {
    console.error("Gemini MBTI Match endpoint failed:", error);
    // Gracefully handle rate limits, blocks, or api errors with a high fidelity fallback
    const fallback = getFallbackMatch(userMBTI, partnerMBTI);
    return res.json({
      ...fallback,
      errorFeedback: "AURA cloud API fallback activated due to API limits."
    });
  }
});

// Configure Vite middleware in development, serve static assets in production
const startServer = async () => {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server linked via Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled static production files from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AURA Server] Online and listening on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failure starting the fullstack AURA server:", err);
});
