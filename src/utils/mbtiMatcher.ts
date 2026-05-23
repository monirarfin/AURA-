import { UserProfile } from '../types';

/**
 * Calculates MBTI compatibility match score as a percentage (integer between 50 and 99).
 * Relies on the standard MBTI Golden Pair rules, supplemented by cognitive function matches.
 * 
 * Golden pairs (e.g., INTJ + ENFP) receive an exceptional 98%.
 * High compatibility pairs sharing cognitive perception (N/N or S/S) receive around 80% to 92%.
 * Inter-worldview pairings (N/S) receive standard baseline matches (60% to 75%).
 *
 * @param user1 The first user's profile
 * @param user2 The second user's profile
 * @returns An integer percentage representing the compatibility score (50-99)
 */
export function calculateMatchScore(user1: UserProfile, user2: UserProfile): number {
  if (!user1 || !user2 || !user1.mbti || !user2.mbti) {
    return 65; // Safe default
  }

  const m1 = user1.mbti.toUpperCase().trim();
  const m2 = user2.mbti.toUpperCase().trim();

  // Validate standard 4-letter format
  if (m1.length !== 4 || m2.length !== 4) {
    return 65;
  }

  // 1. Golden Pairs definition (98% match)
  const goldenPairs: [string, string][] = [
    ['INTJ', 'ENFP'], ['INTJ', 'ENTP'],
    ['INFJ', 'ENTP'], ['INFJ', 'ENFP'],
    ['INFP', 'ENFJ'], ['INFP', 'ENTJ'],
    ['INTP', 'ENTJ'], ['INTP', 'ENFJ'],
    ['ISFP', 'ESFJ'], ['ISFP', 'ESTJ'],
    ['ISTP', 'ESTJ'], ['ISTP', 'ESFJ'],
    ['ISFJ', 'ESFP'], ['ISFJ', 'ESTP'],
    ['ISTJ', 'ESTP'], ['ISTJ', 'ESFP']
  ];

  const isGolden = goldenPairs.some(
    ([a, b]) => (a === m1 && b === m2) || (a === m2 && b === m1)
  );

  if (isGolden) {
    return 98;
  }

  // 2. Extrapolate scores based on MBTI dichotomies
  // Dichotomies: E/I, S/N, T/F, J/P
  const sameE = m1[0] === m2[0];
  const sameS = m1[1] === m2[1];
  const sameT = m1[2] === m2[2];
  const sameJ = m1[3] === m2[3];

  if (sameS) {
    // Shared core worldview (both Intuitives, or both Sensors)
    let score = 82;
    
    // Complementary on Extraversion/Introversion
    if (!sameE) score += 5; // Opposites attract in energy balance
    // Complementary on Judging/Perceiving (flexible vs structured plan)
    if (!sameJ) score += 4; 
    // Similar decision matrix (Thinking/Feeling harmony)
    if (sameT) score += 2;

    return Math.min(score, 94);
  } else {
    // Worldview divergence (one Intuitive, one Sensor)
    // Communication requires a bit more translation effort, but still highly matching in other areas
    let score = 62;

    if (!sameE) score += 5; // Energy complement
    if (sameT) score += 5;  // Alignment in analytical/empathic judgment styles
    if (!sameJ) score += 3; // Action/reaction balance

    return Math.min(score, 76);
  }
}
