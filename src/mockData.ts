import { UserProfile, RoomListing } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'me',
  name: 'Arfin Ahmed',
  age: 26,
  gender: 'Male',
  location: 'Gulshan, Dhaka',
  mbti: 'INTJ', // Default chosen MBTI
  tier: 'Basic', // Start as Basic so user can upgrade
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  bio: 'Systems architect interested in cognitive psychology, chess, and long-term tech projects. Let\'s match on compatibility first.',
  interests: ['Tech Startup', 'Chess', 'Psychology', 'Cafe hopping', 'Books']
};

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'p1',
    name: 'Sarah Rahman',
    age: 24,
    gender: 'Female',
    location: 'Banani, Dhaka',
    mbti: 'ENFP',
    tier: 'Elite',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'Passionate artist and campaigner! Always curious and exploring alternative realities of art. Seeking someone structured who can Ground my abstract loops.',
    interests: ['Painting', 'Adventure sports', 'Philosophy', 'Aura scanning']
  },
  {
    id: 'p2',
    name: 'Nabila Karim',
    age: 25,
    gender: 'Female',
    location: 'Dhanmondi, Dhaka',
    mbti: 'INFJ',
    tier: 'Standard',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    bio: 'Looking for deep intellectual connections. Quiet cafe talks, psych theory, and books. Let\'s keep it real.',
    interests: ['Reading', 'Writing', 'Piano', 'Altruism']
  },
  {
    id: 'p3',
    name: 'Muntasir Mahmud',
    age: 28,
    gender: 'Male',
    location: 'Uttara, Dhaka',
    mbti: 'ESTP',
    tier: 'Free',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Life is either an adventure or nothing. Speed, gym, and outdoor treks. Let\'s grab milktea!',
    interests: ['Track Racing', 'Gym', 'Street Food']
  },
  {
    id: 'p4',
    name: 'Tahrima Anjum',
    age: 23,
    gender: 'Female',
    location: 'Gulshan, Dhaka',
    mbti: 'INTP',
    tier: 'Basic',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    bio: 'Mostly coding or overthinking theories of the universe. I process feelings in binary. Convince me to step outside.',
    interests: ['Cybersecurity', 'Anime', 'Sci-fi Novel', 'Synthwave']
  },
  {
    id: 'p5',
    name: 'Zishan Haider',
    age: 27,
    gender: 'Male',
    location: 'Mirpur, Dhaka',
    mbti: 'ENTJ',
    tier: 'Elite',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Building the next unicorn. Focused, organized, and strategic. Looking for someone who matches my ambition and cognitive speed.',
    interests: ['Venture Capital', 'Tennis', 'Strategy Games', 'Fine Dining']
  },
  {
    id: 'p6',
    name: 'Anika Tabassum',
    age: 26,
    gender: 'Female',
    location: 'Bashundhara, Dhaka',
    mbti: 'ESFJ',
    tier: 'Basic',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    bio: 'Love cooking for my friends and keeping everyone happy. Community organizer. Seeking a partner to create stable, lasting memories.',
    interests: ['Baking', 'Board Games', 'Live Concerts', 'Volunteering']
  }
];

export const MOCK_ROOMS: RoomListing[] = [
  {
    id: 'r1',
    hostId: 'h1',
    title: 'Aura Crimson Retreat Studio',
    location: 'Gulshan-2, Dhaka',
    pricePerBooking: 1500, // min 1000 BDT
    rating: 4.8,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
    amenities: ['Secure Lockbox', 'High Privacy Blackout', 'Masked check-in', 'Premium Soundbar', 'Snacks & Soda'],
    reviewsCount: 142
  },
  {
    id: 'r2',
    hostId: 'h2',
    title: 'The Cozy Zen Secret Loft',
    location: 'Banani Road 11, Dhaka',
    pricePerBooking: 2500,
    rating: 4.95,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400',
    amenities: ['Express Automated Check-in', 'Anti-screenshot shielding', 'High-speed Wi-Fi', 'Coffee Machine'],
    reviewsCount: 96
  },
  {
    id: 'r3',
    hostId: 'h3',
    title: 'Dhanmondi Lakeside Privacy Nest',
    location: 'Dhanmondi, Dhaka',
    pricePerBooking: 1200,
    rating: 4.5,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400',
    amenities: ['Underground Dedicated Parking', 'Masked Entry', 'AC & Smart TV'],
    reviewsCount: 54
  },
  {
    id: 'r4',
    hostId: 'h4',
    title: 'Elite Skyview Haven',
    location: 'Sector 4, Uttara, Dhaka',
    pricePerBooking: 3200,
    rating: 4.97,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400',
    amenities: ['Sky Garden Access', 'Strict Masked Privacy', '24/7 Security Gate', 'Smart Lighting Controls'],
    reviewsCount: 201
  }
];
