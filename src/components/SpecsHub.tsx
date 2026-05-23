import React, { useState } from 'react';
import { Database, Shield, Server, FileText, Cpu, Check, Copy, Layers } from 'lucide-react';

export default function SpecsHub() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'firebase' | 'postgresql' | 'gemini'>('architecture');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const firebaseSchema = `{
  // Firestore Database Schema for AURA
  "users": {
    "me": {
      "id": "me",
      "name": "Arfin Ahmed",
      "age": 26,
      "gender": "Male",
      "location": "Gulshan, Dhaka",
      "mbti": "INTJ",
      "tier": "Basic", // Free | Basic | Standard | Elite
      "avatar": "https://images.unsplash.com...",
      "bio": "Systems architect...",
      "interests": ["Tech Startup", "Chess", "Psychology"],
      "createdAt": "2026-05-23T16:02:40Z",
      "chatsCount": 12 // Current count for tiers limit checks
    }
  },
  "rooms": {
    "r1": {
      "id": "r1",
      "hostId": "h1",
      "title": "Aura Crimson Retreat Studio",
      "location": "Gulshan-2, Dhaka",
      "pricePerBooking": 1500, // Min 1000 BDT
      "rating": 4.8,
      "capacity": 2,
      "amenities": ["Secure Lockbox", "Blackout Shielding"],
      "reviewsCount": 142
    }
  },
  "chats": {
    "chat_me_p1": {
      "id": "chat_me_p1",
      "participants": ["me", "p1"],
      "lastMessage": "Hey! I'm an INTJ standard of intellect...",
      "updatedAt": "2026-05-23T16:02:40Z"
    }
  },
  "messages": {
    "msg_101": {
      "id": "msg_101",
      "chatId": "chat_me_p1",
      "senderId": "me",
      "text": "Hello, Sarah!",
      "timestamp": "2026-05-23T16:02:40Z"
    }
  },
  "blind_dates": {
    "bd_202": {
      "id": "bd_202",
      "requesterId": "me",
      "recipientId": "p1",
      "status": "accepted", // pending | accepted | declined
      "roomId": "r1",
      "maskedSenderId": "Silent Wolf (INTJ)",
      "maskedRecipientId": "Golden Phoenix (ENFP)",
      "createdAt": "2026-05-23T16:02:40Z"
    }
  }
}`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile rule: Read allowed for all, write only for matching owner
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Chat rules enforcing socio-economic tier hierarchies
    match /chats/{chatId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.participants;
      
      // Enforce Socio-Economic tier logic on room creations:
      // High tiers can initiate chats to low tiers, but not vice versa.
      allow create: if request.auth != null 
        && request.auth.uid in request.resource.data.participants
        && (
          // Elite: can text any user
          get(/documents/users/$(request.auth.uid)).data.tier == 'Elite' ||
          
          // Standard: can text Standard and Basic
          (get(/documents/users/$(request.auth.uid)).data.tier == 'Standard' &&
           get(/documents/users/$(request.resource.data.recipientId)).data.tier in ['Standard', 'Basic', 'Free']) ||
           
          // Basic: can only text Basic
          (get(/documents/users/$(request.auth.uid)).data.tier == 'Basic' &&
           get(/documents/users/$(request.resource.data.recipientId)).data.tier == 'Basic' &&
           get(/documents/users/$(request.auth.uid)).data.chatsCount < 50)
        );
    }
  }
}`;

  const postgresqlSchema = `-- SQL DDL Schema representing AURA DB structures
CREATE TYPE aura_tier AS ENUM ('Free', 'Basic', 'Standard', 'Elite');
CREATE TYPE date_status AS ENUM ('pending', 'accepted', 'declined');

-- Users Profiles Table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT CHECK (age >= 18),
    gender VARCHAR(20) NOT NULL,
    location VARCHAR(150),
    mbti VARCHAR(4) NOT NULL,
    tier aura_tier DEFAULT 'Free',
    avatar TEXT,
    bio TEXT,
    chats_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Host Rooms Table
CREATE TABLE rooms (
    id VARCHAR(255) PRIMARY KEY,
    host_id VARCHAR(255) NOT NULL,
    title VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    price_per_booking DECIMAL(10, 2) NOT NULL CHECK (price_per_booking >= 1000.00), -- minimum 1000 BDT
    rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 1.00 AND 5.00),
    capacity INT DEFAULT 2,
    image TEXT,
    reviews_count INT DEFAULT 0
);

-- Chats Enforcer table
CREATE TABLE chats (
    id VARCHAR(255) PRIMARY KEY,
    initiator_id VARCHAR(255) REFERENCES users(id),
    recipient_id VARCHAR(255) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blind Room Dates Table with high-privacy structures
CREATE TABLE blind_dates (
    id VARCHAR(255) PRIMARY KEY,
    requester_id VARCHAR(255) REFERENCES users(id),
    recipient_id VARCHAR(255) REFERENCES users(id),
    status date_status DEFAULT 'pending',
    room_id VARCHAR(255) REFERENCES rooms(id),
    masked_sender VARCHAR(100) NOT NULL, -- e.g. "Silent Wolf"
    masked_recipient VARCHAR(100) NOT NULL, -- e.g. "Golden Phoenix"
    screenshot_protection_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const geminiIntegration = `import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini SDK with telemetry header requested by AI Studio build
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Serves MBTI-driven Compatibility Match for AURA dating app
 * Uses gemini-3.5-flash for structured response generation on compatibility
 */
export async function computeMbtiCompatibility(userMbti: string, matchMbti: string) {
  const prompt = \`Compare compatibility of User MBTI (\${userMbti}) with Match MBTI (\${matchMbti}).
  Output exactly structured JSON with score, 3 strengths, 2 challenges, chemistry analysis, and icebreaker.\`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are the matchmaking algorithm of AURA. Provide insightful psychological matching details.",
      responseSchema: {
        type: Type.OBJECT,
        required: ["score", "strengths", "challenges", "chemistryAnalysis", "icebreaker"],
        properties: {
          score: { type: Type.INTEGER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
          chemistryAnalysis: { type: Type.STRING },
          icebreaker: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}`;

  return (
    <div id="specs-hub-container" className="bg-[#0f111a] border border-[#1e2336] rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#151928] border-b border-[#20273f] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#4f3bf6]/20 p-2 rounded-lg border border-[#4f3bf6]/40">
            <Cpu className="text-[#8b5cf6] w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AURA Production Specifications</h3>
            <p className="text-[#848fa5] text-[11px] font-mono">Build Mode: express-production • v1.0.0</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PLATFORM COMPLIANT
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#121624] border-b border-[#20273f] text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
            activeSubTab === 'architecture'
              ? 'border-[#8b5cf6] text-[#c084fc] bg-[#1a1f33]'
              : 'border-transparent text-[#6e7b99] hover:text-white hover:bg-[#151928]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Architecture
        </button>
        <button
          onClick={() => setActiveSubTab('firebase')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
            activeSubTab === 'firebase'
              ? 'border-[#8b5cf6] text-[#c084fc] bg-[#1a1f33]'
              : 'border-transparent text-[#6e7b99] hover:text-white hover:bg-[#151928]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Firebase Setup
        </button>
        <button
          onClick={() => setActiveSubTab('postgresql')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
            activeSubTab === 'postgresql'
              ? 'border-[#8b5cf6] text-[#c084fc] bg-[#1a1f33]'
              : 'border-transparent text-[#6e7b99] hover:text-white hover:bg-[#151928]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          PostgreSQL DDL
        </button>
        <button
          onClick={() => setActiveSubTab('gemini')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
            activeSubTab === 'gemini'
              ? 'border-[#8b5cf6] text-[#c084fc] bg-[#1a1f33]'
              : 'border-transparent text-[#6e7b99] hover:text-white hover:bg-[#151928]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          @google/genai SDK
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 text-sm">
        {activeSubTab === 'architecture' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-medium text-base mb-2">Cross-Platform Flutter & Node.js System Architecture</h4>
              <p className="text-[#a0aec0] text-xs leading-relaxed mb-4">
                AURA is designed as a secure, distributed hybrid matches solution. The dynamic matching logic utilizes a clean front-end (built with Flutter for native iOS/Android or visual web portal) querying a secure middleware Node.js API with server-side SDKs, keeping API keys protected.
              </p>

              {/* Graphical system chart */}
              <div className="bg-[#141824] border border-[#23293f] p-4 rounded-xl space-y-4 font-mono text-xs text-[#a0aec0]">
                <div className="text-center text-xs font-bold text-white bg-[#8b5cf6]/20 py-1.5 rounded border border-[#8b5cf6]/40">
                  AURA CLIENT SUITE (React Web / Flutter App)
                </div>
                <div className="flex justify-center my-1"><span className="text-[#d8b4fe]">↕ REST WebSockets (Screenshot Inhibitor alerts, Secure Blind invites, Star computations)</span></div>

                <div className="bg-gradient-to-r from-[#1b223c] to-[#252f54] border border-[#2e3b6d] rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-white">
                  <div>
                    <div className="text-[#a855f7] font-semibold text-[11px] mb-1">Dating Client</div>
                    <div className="bg-[#121628] py-1 select-none text-[10px] rounded text-[#848fa5]">Socio-Economic Enforcer</div>
                  </div>
                  <div>
                    <div className="text-[#ec4899] font-semibold text-[11px] mb-1">Host Portal</div>
                    <div className="bg-[#121628] py-1 select-none text-[10px] rounded text-[#848fa5]">Star Estimator Minimum 1000 BDT</div>
                  </div>
                  <div>
                    <div className="text-[#3b82f6] font-semibold text-[11px] mb-1">Shield Enclosure</div>
                    <div className="bg-[#121628] py-1 select-none text-[10px] rounded text-[#848fa5]">Masked Profiles & Blurs</div>
                  </div>
                </div>

                <div className="flex justify-center my-1"><span className="text-[#d8b4fe]">↕ HTTPS Endpoints (User Verification)</span></div>

                <div className="text-center text-xs text-[#22d3ee] font-bold bg-[#1e2335] py-2 rounded border border-[#334155]">
                  SECURE MIDDLEWARE API (server.ts express backend)
                </div>

                <div className="flex justify-center gap-10 text-[10px] py-1 text-[#848fa5]">
                  <span>↙ Calls server-side Gemini</span>
                  <span>↘ Synchronizes Collections</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#151c2f] border border-[#2e3751] p-2 rounded text-center">
                    <span className="text-white block font-semibold text-[11px] mb-1">Gemini AI Client</span>
                    <span className="text-[#a78bfa] text-[10px]">gemini-3.5-flash (MBTI match engine)</span>
                  </div>
                  <div className="bg-[#151c2f] border border-[#2e3751] p-2 rounded text-center">
                    <span className="text-white block font-semibold text-[11px] mb-1">Cloud Firestore / PostgreSQL</span>
                    <span className="text-[#f59e0b] text-[10px]">Rules Enforced Multi-tier Syncs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#131722]/50 border border-[#22293b] rounded-xl p-4 space-y-3">
              <h5 className="text-[#d8b4fe] font-medium text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Socio-Economic Tier Governance Logic
              </h5>
              <div className="text-xs text-[#94a3b8] space-y-1 bg-[#0f1118] p-3 rounded border border-[#1e2538]">
                <p>• <strong>Free Tier</strong> (0 BDT) is flagged as <code className="text-[#a78bfa]">Browse-Only</code>. All outbound text pathways are blocked at routing layer.</p>
                <p>• <strong>Basic Tier</strong> (100 BDT) allows a max of <code className="text-[#a78bfa]">50 Chats</code> exclusively targeting other Basic Tier members.</p>
                <p>• <strong>Standard Tier</strong> (300 BDT) allows a max of <code className="text-[#a78bfa]">100 Chats</code> with standard or basic tier members.</p>
                <p>• <strong>Elite Tier</strong> (1000 BDT) allows <code className="text-[#a78bfa]">unlimited Chats</code> with any tier in the system.</p>
                <p>• <strong>Asymmetrical Rule:</strong> High-tiers can message downwards (Elite → any, Standard → Basic/Free), but initiating a message upwards throws HTTP Code 403 Tier Upgrade Needed.</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'firebase' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm">Recommended NoSQL Data Blueprint</h4>
                <button
                  onClick={() => copyToClipboard(firebaseSchema, 'firebase')}
                  className="flex items-center gap-1 text-[11px] font-mono hover:text-white text-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 rounded border border-[#8b5cf6]/20"
                >
                  {copiedKey === 'firebase' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'firebase' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#0b0d16] border border-[#1e2439] rounded-xl p-3 overflow-x-auto text-[11px] font-mono text-[#a5b4fc] max-h-60 leading-relaxed">
                {firebaseSchema}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  firestore.rules Security Specifications
                </h4>
                <button
                  onClick={() => copyToClipboard(firestoreRules, 'rules')}
                  className="flex items-center gap-1 text-[11px] font-mono hover:text-white text-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 rounded border border-[#8b5cf6]/20"
                >
                  {copiedKey === 'rules' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'rules' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#0b0d16] border border-[#1e2439] rounded-xl p-3 overflow-x-auto text-[11px] font-mono text-[#34d399] max-h-60 leading-relaxed">
                {firestoreRules}
              </pre>
            </div>
          </div>
        )}

        {activeSubTab === 'postgresql' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h4 className="text-white font-medium text-sm">PostgreSQL relational DDL Schema</h4>
                <p className="text-[11px] text-[#6e7b99]">Includes precise ENUM declarations and structural checks matching BDT pricing rules</p>
              </div>
              <button
                onClick={() => copyToClipboard(postgresqlSchema, 'postgres')}
                className="flex items-center gap-1 text-[11px] font-mono hover:text-white text-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 rounded border border-[#8b5cf6]/20"
              >
                {copiedKey === 'postgres' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'postgres' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="bg-[#0b0d16] border border-[#1e2439] rounded-xl p-3 overflow-x-auto text-[11px] font-mono text-[#e2e8f0] max-h-96 leading-relaxed">
              {postgresqlSchema}
            </pre>
          </div>
        )}

        {activeSubTab === 'gemini' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h4 className="text-white font-medium text-sm">Server-Side @google/genai Integration Steps</h4>
                <p className="text-[11px] text-[#6e7b99]">Express endpoint backend code using the recommended Node SDK on Gemini 3.5</p>
              </div>
              <button
                onClick={() => copyToClipboard(geminiIntegration, 'gemini')}
                className="flex items-center gap-1 text-[11px] font-mono hover:text-white text-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 rounded border border-[#8b5cf6]/20"
              >
                {copiedKey === 'gemini' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'gemini' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="bg-[#0b0d16] border border-[#1e2439] rounded-xl p-3 overflow-x-auto text-[11px] font-mono text-[#f472b6] max-h-96 leading-relaxed">
              {geminiIntegration}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
