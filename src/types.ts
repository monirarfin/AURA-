export type UserTier = 'Free' | 'Basic' | 'Standard' | 'Elite';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  location: string;
  mbti: string;
  tier: UserTier;
  avatar: string;
  bio: string;
  interests: string[];
}

export interface Conversation {
  id: string;
  participantId: string; // Partner's profile ID
  messages: Message[];
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface RoomListing {
  id: string;
  hostId: string;
  title: string;
  location: string;
  pricePerBooking: number; // Minimum 1000 BDT
  rating: number; // 1-5 stars
  capacity: number;
  image: string;
  amenities: string[];
  reviewsCount: number;
}

export interface BlindDateRequest {
  id: string;
  requesterId: string;
  recipientId: string; // Can be anonymous matching in blind room
  status: 'pending' | 'accepted' | 'declined' | 'concluded';
  roomId?: string; // Assigned room from Host Listings
  maskedSenderId: string; // e.g. "Silent Wolf (INFJ)"
  maskedRecipientId: string; // e.g. "Golden Phoenix (ENFP)"
  createdAt: string;
  rating?: number;
  reviewText?: string;
}
