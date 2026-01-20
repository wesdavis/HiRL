import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, ArrowLeft, RefreshCw, Loader2, Search, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

import Landing from './Landing'; 
import LocationCard from '@/components/location/LocationCard';
import UserGrid from '@/components/location/UserGrid';

// 1. MOCK DATA (No API Calls)
const MOCK_LOCATIONS = [
    { 
        id: 1, 
        name: "The Velvet Room", 
        address: "123 Main St", 
        latitude: 40.7128, 
        longitude: -74.0060, 
        image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
        category: "lounge",
        summary: "Upscale cocktail lounge with velvet seating and live jazz on weekends. Perfect for intimate conversations and craft cocktails.",
        hours: "Mon-Thu 5pm-12am, Fri-Sat 5pm-2am, Sun Closed",
        busyness: "Moderate",
        rating: 4.5,
        reviews: [
            { author: "Jessica M.", text: "Amazing atmosphere! The cocktails are creative and strong.", stars: 5 },
            { author: "David R.", text: "Great vibes but can get crowded on weekends.", stars: 4 }
        ]
    },
    { 
        id: 2, 
        name: "Neon Nights", 
        address: "456 Downtown Blvd", 
        latitude: 40.7138, 
        longitude: -74.0070, 
        image_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800",
        category: "club",
        summary: "High-energy nightclub featuring top DJs and LED dance floors. Dress code enforced.",
        hours: "Thu-Sat 10pm-4am",
        busyness: "Very Busy",
        rating: 4.2,
        reviews: [
            { author: "Alex K.", text: "Best club in the city! Music is always on point.", stars: 5 },
            { author: "Sarah T.", text: "Long wait times but worth it once inside.", stars: 4 }
        ]
    },
    { 
        id: 3, 
        name: "Skyline Lounge", 
        address: "789 High Rise", 
        latitude: 40.7148, 
        longitude: -74.0080, 
        image_url: "https://images.unsplash.com/photo-1570876050997-2fdefb00c004?w=800",
        category: "restaurant",
        summary: "Rooftop restaurant with panoramic city views. Modern American cuisine with seasonal menu.",
        hours: "Daily 11am-11pm, Brunch Sat-Sun 10am-3pm",
        busyness: "Quiet",
        rating: 4.7,
        reviews: [
            { author: "Maria L.", text: "The view alone is worth the visit. Food is excellent too!", stars: 5 },
            { author: "Tom W.", text: "Pricey but special occasion worthy.", stars: 4 }
        ],
        menu: ["Grilled Salmon - $32", "Wagyu Steak - $58", "Truffle Pasta - $28", "Signature Cocktails - $16"]
    }
];

const MOCK_USERS = [
    { id: 1, full_name: "Sarah", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", gender: "female", bio: "Here for the vibes" },
    { id: 2, full_name: "Mike", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", gender: "male", bio: "Anyone want a drink?" }
];

export default function Home() {
    const { user, isLoadingAuth } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [checkedInLocation, setCheckedInLocation] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [loadingGeo, setLoadingGeo] = useState(true);
    
    // Fake GPS loader
    useEffect(() => {
        const timer = setTimeout(() => setLoadingGeo(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleCheckIn = async (loc) => {
        setCheckingIn(true);
        setTimeout(() => {
            setCheckingIn(false);
            setCheckedInLocation(loc);
            setSelectedLocation(null);
            toast.success(`Checked in at ${loc.name}`);
        }, 800);
    };

    const handleCheckOut = () => {
        toast.success(`Checked out from ${checkedInLocation.name}`);
        setCheckedInLocation(null);
    };

    // BOUNCER: Check Context
    if (isLoadingAuth) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>;
    if (!user) return <Landing />;
    
    // Safety check for profile data
    if (!user.gender || !user.full_name) {
        window.location.href = '/profile-setup';
        return null;
    }

    const isFemale = user.gender === 'female';

    // If checked in, show the checked-in view
    if (checkedInLocation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
                <div className="max-w-lg mx-auto px-4 py-6 pb-24">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{checkedInLocation.name}</h1>
                            <p className="text-green-400 text-sm flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Checked In
                            </p>
                        </div>
                        <Button onClick={handleCheckOut} variant="outline" className="border-amber-500/30 text-amber-400">
                            Check Out
                        </Button>
                    </div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden h-48">
                            <img src={checkedInLocation.image_url} className="w-full h-full object-cover" alt={checkedInLocation.name} />
                        </div>

                        {/* Location Info Card */}
                        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                            <div>
                                <h3 className="text-white font-bold mb-2">About</h3>
                                <p className="text-slate-300 text-sm">{checkedInLocation.summary}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-xs mb-1">Hours</p>
                                    <p className="text-white text-sm">{checkedInLocation.hours}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs mb-1">Busy Level</p>
                                    <p className="text-white text-sm">{checkedInLocation.busyness}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-400 text-xs mb-1">Rating</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-400 text-lg font-bold">{checkedInLocation.rating}</span>
                                    <span className="text-slate-400 text-sm">/ 5.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Menu (if available) */}
                        {checkedInLocation.menu && (
                            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="text-white font-bold mb-4">Menu Highlights</h3>
                                <div className="space-y-2">
                                    {checkedInLocation.menu.map((item, idx) => (
                                        <div key={idx} className="text-slate-300 text-sm py-2 border-b border-white/5 last:border-0">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                            <h3 className="text-white font-bold mb-4">Recent Reviews</h3>
                            <div className="space-y-4">
                                {checkedInLocation.reviews.map((review, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium text-sm">{review.author}</span>
                                            <span className="text-amber-400 text-sm">{'★'.repeat(review.stars)}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* People Here (Female users only) */}
                        {isFemale && (
                            <div className="space-y-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500"/> People Here
                                </h3>
                                <UserGrid 
                                    users={MOCK_USERS} 
                                    currentUser={user} 
                                    locationId={checkedInLocation.id} 
                                    locationName={checkedInLocation.name} 
                                    existingPings={[]} 
                                    onPingSent={() => toast.success("Ping sent!")} 
                                />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-lg mx-auto px-4 py-6 pb-24">
                <div className="flex items-center justify-between mb-6">
                    {selectedLocation ? (
                        <Button variant="ghost" onClick={() => setSelectedLocation(null)} className="text-white"><ArrowLeft className="w-5 h-5 mr-2" /> Back</Button>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-white">Discover</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-slate-400 text-sm">Local Mock Mode</p>
                                {loadingGeo && <span className="text-amber-500 text-xs animate-pulse">Locating...</span>}
                            </div>
                        </div>
                    )}
                    <Button size="icon" variant="ghost" className="text-slate-400"><RefreshCw className="w-5 h-5" /></Button>
                </div>

                <AnimatePresence mode="wait">
                    {!selectedLocation ? (
                        <motion.div key="locations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            {MOCK_LOCATIONS.map(loc => (
                                <LocationCard 
                                    key={loc.id} 
                                    location={loc} 
                                    activeCount={Math.floor(Math.random() * 20)} 
                                    isNearby={true} 
                                    distance={500} 
                                    onClick={() => setSelectedLocation(loc)} 
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="relative rounded-2xl overflow-hidden h-48">
                                <img src={selectedLocation.image_url} className="w-full h-full object-cover" alt={selectedLocation.name} />
                            </div>

                            {/* Location Preview Card */}
                            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                                <div>
                                    <h2 className="text-white font-bold text-xl mb-2">{selectedLocation.name}</h2>
                                    <p className="text-slate-300 text-sm mb-4">{selectedLocation.summary}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400 mb-1">Hours</p>
                                        <p className="text-white">{selectedLocation.hours}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 mb-1">Currently</p>
                                        <p className="text-white">{selectedLocation.busyness}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-amber-400 font-bold">{selectedLocation.rating}</span>
                                    <span className="text-amber-400">{'★'.repeat(Math.floor(selectedLocation.rating))}</span>
                                    <span className="text-slate-400 text-sm">({selectedLocation.reviews.length} reviews)</span>
                                </div>
                            </div>

                            <Button onClick={() => handleCheckIn(selectedLocation)} disabled={checkingIn} className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl">
                                {checkingIn ? 'Checking In...' : 'Check In Here'}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}