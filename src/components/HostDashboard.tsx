import React, { useState } from 'react';
import { RoomListing } from '../types';
import { Home, Plus, Star, MapPin, Users, Coins, Percent, ShieldCheck, CheckCircle, BarChart3, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

interface HostDashboardProps {
  rooms: RoomListing[];
  onAddRoom: (newRoom: RoomListing) => void;
}

export default function HostDashboard({ rooms, onAddRoom }: HostDashboardProps) {
  const [activeHostSubTab, setActiveHostSubTab] = useState<'listings' | 'analytics'>('listings');
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('1200');
  const [rating, setRating] = useState('5.0');
  const [capacity, setCapacity] = useState('2');
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['Smart Keyless Entry', 'Anti-Screenshot Shielding']);
  
  // Chart visual display mode state
  const [chartMode, setChartMode] = useState<'monthly' | 'total'>('monthly');
  
  // Earnings calculator temporary fields
  const [calcBookingsCount, setCalcBookingsCount] = useState(15);
  const [calcSelectedRoomId, setCalcSelectedRoomId] = useState(rooms[0]?.id || 'r1');

  // Submit Listing Form
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 1000) {
      alert("Error: Core standard restricts minimum hosting price to 1,000 BDT per booking.");
      return;
    }

    const ratingNum = parseFloat(rating);
    const validRating = isNaN(ratingNum) ? 5.0 : Math.min(5, Math.max(1, ratingNum));

    const newListing: RoomListing = {
      id: `r_host_${Date.now()}`,
      hostId: 'me_host',
      title: title || 'Aura Hidden Haven',
      location: location || 'Gulshan, Dhaka',
      pricePerBooking: priceNum,
      rating: validRating,
      capacity: parseInt(capacity) || 2,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400',
      amenities: [...amenities],
      reviewsCount: 1
    };

    onAddRoom(newListing);
    // Reset Form
    setTitle('');
    setLocation('');
    setPrice('1200');
    setRating('5.0');
    setCapacity('2');
    setShowAddForm(false);
  };

  const addAmenity = () => {
    if (amenityInput.trim() !== '') {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, idx) => idx !== index));
  };

  // Find selected room parameters for calculator
  const calcRoomInstance = rooms.find(r => r.id === calcSelectedRoomId) || rooms[0];

  // Logic: Earn minimum 1,000 BDT per booking. Ratings provide extra dynamic performance incentives!
  const calculatePayoutMultiplier = (rRating: number) => {
    if (rRating === 5.0) return 1.5; // +50% Elite rating boost
    if (rRating >= 4.8) return 1.3;  // +30% Star standard boost
    if (rRating >= 4.5) return 1.15; // +15% Regular tier boost
    return 1.0;                      // Base multiplier
  };

  const getPayoutPerBooking = (room: RoomListing) => {
    const basePrice = Math.max(1000, room.pricePerBooking);
    const multiplier = calculatePayoutMultiplier(room.rating);
    return Math.floor(basePrice * multiplier);
  };

  const getMonthlyEarningsData = () => {
    return rooms.map(room => {
      const payout = getPayoutPerBooking(room);
      // Generate consistent, distinct simulated bookings based on room details
      const seedVal = (room.title.charCodeAt(0) || 65) + room.pricePerBooking;
      
      const febBookings = Math.max(3, (seedVal % 5) + 4);
      const marBookings = Math.max(4, ((seedVal + 3) % 7) + 6);
      const aprBookings = Math.max(5, ((seedVal + 7) % 9) + 8);
      const mayBookings = Math.max(6, ((seedVal + 11) % 11) + 10);
      
      return {
        name: room.title.length > 20 ? room.title.substring(0, 18) + "..." : room.title,
        February: febBookings * payout,
        March: marBookings * payout,
        April: aprBookings * payout,
        May: mayBookings * payout,
        FebruaryBookings: febBookings,
        MarchBookings: marBookings,
        AprilBookings: aprBookings,
        MayBookings: mayBookings,
        totalEarnings: (febBookings + marBookings + aprBookings + mayBookings) * payout,
        totalBookings: febBookings + marBookings + aprBookings + mayBookings,
      };
    });
  };

  const chartData = getMonthlyEarningsData();
  const totalRevenue = chartData.reduce((acc, row) => acc + row.totalEarnings, 0);
  const totalBookings = chartData.reduce((acc, row) => acc + row.totalBookings, 0);
  const topRoom = chartData.reduce((max, r) => r.totalEarnings > (max?.totalEarnings || 0) ? r : max, chartData[0]);

  // Current month (May 2026) occupancy calculations based on total bookings vs total capacity
  const currentMonthBookings = chartData.reduce((acc, row) => acc + (row.MayBookings || 0), 0);
  const totalRoomNightsCapacity = Math.max(1, rooms.length) * 31;
  const occupancyRate = Math.min(100, (currentMonthBookings / totalRoomNightsCapacity) * 100);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b0b0d] border border-[#c5a059]/40 p-3.5 rounded-xl shadow-2xl text-[11px] font-mono leading-normal">
          <p className="font-serif italic text-xs text-[#c5a059] font-bold mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-bold text-white text-right">{entry.value.toLocaleString()} BDT</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Banner Indicator */}
      <div className="bg-[#131316] border border-[#c5a059]/25 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-mono tracking-wider font-bold px-2 py-0.5 rounded border border-[#c5a059]/20">HOST PARTNER HUB</span>
            <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
          </div>
          <h2 className="text-white text-lg font-serif italic text-[#c5a059] font-bold">Manage Your Booking Spaces</h2>
          <p className="text-white/60 text-xs max-w-xl leading-relaxed">
            List rooms for anonymous dating meetups secure under our screenshot shield. Earn a guaranteed minimum of 1,000 BDT per booking, scaled higher depending on guest star feedback.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#c5a059] hover:bg-[#d4b57a] text-black font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-black/40"
        >
          <Plus className="w-4 h-4" />
          List New Space
        </button>
      </div>

      {/* Sub-Tabs for Host Dashboard */}
      <div className="flex border-b border-white/5 gap-6 text-[11px] font-mono pl-1">
        <button
          onClick={() => setActiveHostSubTab('listings')}
          className={`pb-3 font-semibold transition-all relative cursor-pointer ${
            activeHostSubTab === 'listings' ? 'text-[#c5a059]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          {activeHostSubTab === 'listings' && (
            <motion.div
              layoutId="activeHostTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a059]"
            />
          )}
          <span className="flex items-center gap-1.5 uppercase">
            <Home className="w-3.5 h-3.5" />
            Dating Spaces & Simulator
          </span>
        </button>
        <button
          onClick={() => setActiveHostSubTab('analytics')}
          className={`pb-3 font-semibold transition-all relative cursor-pointer ${
            activeHostSubTab === 'analytics' ? 'text-[#c5a059]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          {activeHostSubTab === 'analytics' && (
            <motion.div
              layoutId="activeHostTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a059]"
            />
          )}
          <span className="flex items-center gap-1.5 uppercase">
            <BarChart3 className="w-3.5 h-3.5" />
            Earnings Analytics
          </span>
        </button>
      </div>

      {/* TAB 1: SPACE LISTINGS & REGISTER FORM */}
      {activeHostSubTab === 'listings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Listings column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-white/75 font-serif italic text-base flex items-center gap-2">
              <Home className="w-4 h-4 text-[#c5a059]" />
              Your Registered Dating Spaces ({rooms.length})
            </h3>

            {/* Form Modal overlay (renders in-grid for space efficiency and clean flow) */}
            {showAddForm && (
              <form onSubmit={handleCreateListing} className="bg-[#0d0d0f] border border-white/10 p-5 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[#c5a059] font-serif italic text-sm font-bold">Register New Secure Lounge</span>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white text-xs font-mono">Cancel</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="text-white/50 block mb-1">Space / Lounge Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Lavender Secret Suite"
                      className="w-full bg-[#141417] text-white p-2.5 rounded-lg border border-white/10 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 block mb-1">Neighborhood / District</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Banani Sector 3, Dhaka"
                      className="w-full bg-[#141417] text-white p-2.5 rounded-lg border border-white/10 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 block mb-1">Price per Booking (BDT)</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#141417] text-white p-2.5 rounded-lg border border-white/10 focus:border-[#c5a059] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#c5a059] mt-0.5 block">* Enforced min. 1,000 BDT</span>
                  </div>
                  <div>
                    <label className="text-white/50 block mb-1">Self-Rated Standard (Stars)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full bg-[#141417] text-white p-2.5 rounded-lg border border-white/10 focus:border-[#c5a059] focus:outline-none"
                    >
                      <option value="5.0">5.0 Star Premium (150% Boost)</option>
                      <option value="4.8">4.8 Star High Quality (130% Boost)</option>
                      <option value="4.5">4.5 Star Mid Quality (115% Boost)</option>
                      <option value="4.0">4.0 Star Standard (No Boost)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-white/50 text-xs font-mono block mb-1">Amenities & Security Features</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      placeholder="e.g. Private back-alley entry"
                      className="flex-1 bg-[#141417] text-xs text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#c5a059] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3.5 rounded-lg text-xs transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {amenities.map((am, i) => (
                      <span key={i} className="bg-[#c5a059]/10 text-[#c5a059] text-[10px] border border-[#c5a059]/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                        {am}
                        <button type="button" onClick={() => removeAmenity(i)} className="hover:text-red-400 font-bold ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#c5a059] hover:bg-[#d4b57a] text-black font-bold py-2.5 rounded-xl cursor-pointer text-xs mt-3 transition-all"
                >
                  Publish Space Listing
                </button>
              </form>
            )}

            {/* Listings Card Loop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden hover:border-[#c5a059]/30 transition-all flex flex-col">
                  <div className="h-40 overflow-hidden relative border-b border-white/5">
                    <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-mono flex items-center gap-1 border border-white/10">
                      <Star className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
                      <span>{room.rating} ({room.reviewsCount} reviews)</span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-[#0a0a0c] border border-[#c5a059]/30 px-3 py-1 rounded-lg">
                      <p className="text-[9px] text-[#c5a059] uppercase font-bold tracking-wider font-mono">Guaranteed pay</p>
                      <p className="text-[#c5a059] text-xs font-bold font-mono">{getPayoutPerBooking(room)} BDT / Booking</p>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-serif italic text-sm mb-1">{room.title}</h4>
                      <p className="text-white/50 text-xs flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3 text-[#c5a059]" />
                        {room.location}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {room.amenities.map((am, i) => (
                          <span key={i} className="text-[10px] bg-white/5 text-[#c5a059]/80 px-2 py-0.5 rounded border border-white/5">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                      <span className="text-white/40 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                        Cap: {room.capacity} guests
                      </span>
                      <span className="text-white text-xs font-semibold">
                        Listed Base Price: <span className="text-[#c5a059]">{room.pricePerBooking} BDT</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* HOST Payouts and Multipliers Side Widget */}
          <div className="space-y-6">
            <div className="bg-[#0d0d0f] border border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-white font-serif italic text-base flex items-center gap-2">
                <Coins className="text-[#c5a059] w-4 h-4" />
                Guaranteed BDT Multipliers
              </h3>

              <p className="text-white/50 text-xs leading-relaxed font-mono">
                The platform enforces 1000 BDT minimums. However higher star ratings trigger premium structural bonuses on listings:
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center bg-[#c5a059]/10 border border-[#c5a059]/20 p-2.5 rounded-xl text-[#c5a059]">
                  <div className="flex items-center gap-1.5 text-white">
                    <Star className="w-4 h-4 text-[#c5a059] fill-[#c5a059]" />
                    <span>5.0 Stars (Perfect)</span>
                  </div>
                  <span className="font-bold">+50% Bonus (1.5x)</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 text-white">
                    <Star className="w-4 h-4 text-white/40 fill-white/40" />
                    <span>4.8 - 4.9 Stars (High)</span>
                  </div>
                  <span className="text-[#c5a059] font-bold">+30% Bonus (1.3x)</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 border border-white/5 p-2.5 rounded-xl text-white/60">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-white/20 font-sans" />
                    <span>4.5 - 4.7 Stars (Mid)</span>
                  </div>
                  <span className="font-bold">+15% Bonus (1.15x)</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 border border-white/5 p-2.5 rounded-xl text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-white/10 font-sans" />
                    <span>&lt; 4.5 Stars</span>
                  </div>
                  <span className="font-bold">Base rate (1.0x)</span>
                </div>
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="bg-[#0d0d0f] border border-white/10 p-5 rounded-2xl space-y-4">
              <h4 className="text-white font-serif italic text-sm flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#c5a059]" />
                Host Earnings Simulator
              </h4>

              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="text-white/50 block mb-1">Select Room to Simulate</label>
                  <select
                    value={calcSelectedRoomId}
                    onChange={(e) => setCalcSelectedRoomId(e.target.value)}
                    className="w-full bg-[#141417] text-white p-2 rounded-lg border border-white/10 focus:outline-none"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.rating}★)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/50 block mb-1">Monthly Active Room Bookings</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={calcBookingsCount}
                    onChange={(e) => setCalcBookingsCount(parseInt(e.target.value))}
                    className="w-full text-[#c5a059] focus:outline-none bg-white/10 rounded-lg appearance-none h-1.5"
                  />
                  <div className="flex justify-between text-white/40 text-[10px] mt-1">
                    <span>1 Booking</span>
                    <span className="text-[#c5a059] font-bold">{calcBookingsCount} Bookings</span>
                    <span>50 Bookings</span>
                  </div>
                </div>

                {/* Dynamic Outputs */}
                <div className="bg-[#141417] p-3.5 rounded-xl space-y-3 border border-white/5">
                  <div className="flex justify-between text-[11px] text-white/50 text-[#848fa5]">
                    <span>Listed base price:</span>
                    <span className="text-white">{calcRoomInstance?.pricePerBooking} BDT</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-white/50 text-[#848fa5]">
                    <span>Rating multiplier ({calcRoomInstance?.rating}★):</span>
                    <span className="text-[#c5a059] font-bold">{calculatePayoutMultiplier(calcRoomInstance?.rating)}x</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#848fa5] text-white/50">
                    <span>Payout per booking:</span>
                    <span className="text-white font-bold">{getPayoutPerBooking(calcRoomInstance)} BDT</span>
                  </div>
                  <div className="border-t border-white/5 pt-2.5 flex justify-between items-center text-xs">
                    <span className="text-white font-bold">Estimated Monthly Pay:</span>
                    <span className="text-[#c5a059] text-sm font-black font-mono">
                      {(getPayoutPerBooking(calcRoomInstance) * calcBookingsCount).toLocaleString()} BDT
                    </span>
                  </div>
                </div>

                {/* Secure payout certification */}
                <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg flex items-start gap-2 text-[10px] text-white/40 leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059] shrink-0" />
                  <span>Certified standard matching payout protocol. Checks are dispatched direct to registered Bank Accounts / bKash in Bangladesh within 48 hours.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: BAR CHART & PERFORMANCE ANALYTICS */}
      {activeHostSubTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[#0c0c0e] border border-white/5 p-4.5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 block tracking-widest uppercase">Cumulative Revenue</span>
                <span className="text-base font-bold font-mono text-[#c5a059] block">
                  {totalRevenue.toLocaleString()} BDT
                </span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +18.4% performance delta
                </span>
              </div>
              <div className="bg-[#c5a059]/10 p-3 rounded-xl border border-[#c5a059]/20 text-[#c5a059]">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/5 p-4.5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 block tracking-widest uppercase">Total Session Bookings</span>
                <span className="text-base font-bold font-mono text-white block">
                  {totalBookings} Completed
                </span>
                <span className="text-[9px] font-mono text-white/30 block">
                  Average {(totalRevenue / (totalBookings || 1)).toFixed(0)} BDT per date
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-white/60">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/5 p-4.5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 block tracking-widest uppercase">Prime Space Asset</span>
                <span className="text-xs font-bold font-serif italic text-white block overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]" title={topRoom?.name}>
                  {topRoom?.name || 'None'}
                </span>
                <span className="text-[9px] font-mono text-[#c5a059] block">
                  Yielded {topRoom?.totalEarnings.toLocaleString() || '0'} BDT total
                </span>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[#c5a059]">
                <Star className="w-5 h-5 fill-[#c5a059]/10" />
              </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/5 p-4.5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 block tracking-widest uppercase">Occupancy Rate</span>
                <span className="text-base font-bold font-mono text-[#DEFF9A] block">
                  {occupancyRate.toFixed(1)}%
                </span>
                <span className="text-[9px] font-mono text-white/30 block">
                  {currentMonthBookings} / {totalRoomNightsCapacity} bookings in May
                </span>
              </div>
              <div className="bg-[#DEFF9A]/10 p-3 rounded-xl border border-[#DEFF9A]/20 text-[#DEFF9A]">
                <Percent className="w-5 h-5 animate-pulse" />
              </div>
            </div>

          </div>

          {/* Bar Chart Container */}
          <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-5.5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-white font-serif italic text-[15px] flex items-center gap-2 font-bold leading-normal">
                  <BarChart3 className="w-4 h-4 text-[#c5a059]" />
                  Monthly Earnings Breakdown per Space
                </h3>
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-1">
                  Comparing dynamic booking returns over the fiscal cycle (AURA Rating Multipliers active)
                </p>
              </div>
              
              {/* Toggle selector mode */}
              <div className="flex bg-[#141417] p-1 rounded-xl border border-white/5 self-start sm:self-center font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setChartMode('monthly')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMode === 'monthly'
                      ? 'bg-[#c5a059]/15 text-[#c5a059] font-bold border border-[#c5a059]/25'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Monthly Delta
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('total')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMode === 'total'
                      ? 'bg-[#c5a059]/15 text-[#c5a059] font-bold border border-[#c5a059]/25'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Cumulative Total
                </button>
              </div>
            </div>

            {/* Recharts chart drawing */}
            <div className="w-full h-[320px] select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#252529" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff70" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff10' }}
                  />
                  <YAxis 
                    stroke="#ffffff70" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={{ stroke: '#ffffff10' }}
                    tickFormatter={(val) => `${(val / 1000)}k BDT`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                  />
                  
                  {chartMode === 'monthly' ? (
                    <>
                      <Bar name="February" dataKey="February" fill="#4B5563" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar name="March" dataKey="March" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar name="April" dataKey="April" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar name="May" dataKey="May" fill="#c5a059" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </>
                  ) : (
                    <Bar name="Total Revenue" dataKey="totalEarnings" fill="url(#goldGradient)" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {/* Gold gradient mapping */}
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#dfb56c" stopOpacity={1} />
                          <stop offset="100%" stopColor="#c5a059" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Meta insight block */}
            <div className="bg-[#141417]/50 rounded-xl p-4 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-mono font-bold">Automatic Booking Booster Enabled</h4>
                  <p className="text-white/40 text-[10px] font-mono leading-snug">
                    Your average star rating of {rooms.length > 0 ? (rooms.reduce((sum, r) => sum + r.rating, 0) / rooms.length).toFixed(1) : '5.0'}★ across listed properties qualifies your account for premium status.
                  </p>
                </div>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] px-3 py-1 rounded-full uppercase font-bold text-center shrink-0">
                Excellent Tier Yield
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
