"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { GlassCard } from "@/components/ui/GlassCard";
import { MapPin, Star, ArrowRight, Loader2, RefreshCw, Crown, Share2, Navigation, Heart, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Venue, DecisionResponse } from "@/types/database";

export default function ResultPage() {
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isPremium, setIsPremium] = useState(false);
    const [error, setError] = useState("");
    const [limitReached, setLimitReached] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [shareSuccess, setShareSuccess] = useState(false);
    const router = useRouter();

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("destipicker_favorites");
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load favorites", e);
            }
        }
    }, []);

    const toggleFavorite = (venue: Venue) => {
        const newFavorites = favorites.includes(venue.place_id)
            ? favorites.filter(id => id !== venue.place_id)
            : [...favorites, venue.place_id];

        setFavorites(newFavorites);
        localStorage.setItem("destipicker_favorites", JSON.stringify(newFavorites));

        // Also save full venue data for favorites page
        const savedVenues = localStorage.getItem("destipicker_favorite_venues");
        let venueData: Venue[] = savedVenues ? JSON.parse(savedVenues) : [];

        if (favorites.includes(venue.place_id)) {
            venueData = venueData.filter(v => v.place_id !== venue.place_id);
        } else {
            venueData.push(venue);
        }
        localStorage.setItem("destipicker_favorite_venues", JSON.stringify(venueData));
    };

    const handleShare = async () => {
        const venueNames = venues.map(v => v.name).join(", ");
        const shareData = {
            title: "DestiPicker Recommendations",
            text: `Check out these spots: ${venueNames}`,
            url: window.location.href,
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    const getDirectionsUrl = (venue: Venue) => {
        if (venue.geometry?.location) {
            return `https://www.google.com/maps/dir/?api=1&destination=${venue.geometry.location.lat},${venue.geometry.location.lng}&destination_place_id=${venue.place_id}`;
        }
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue.name)}&destination_place_id=${venue.place_id}`;
    };

    const fetchDecision = async () => {
        try {
            const paramsStr = sessionStorage.getItem("decisionParams");
            if (!paramsStr) {
                router.push("/home");
                return;
            }

            const params = JSON.parse(paramsStr);

            const response = await fetch("/api/decide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            });

            if (response.status === 429) {
                const data = await response.json();
                setLimitReached(true);
                setError("You've reached your daily limit! Upgrade to Premium for unlimited decisions.");
                setLoading(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch venues");
            }

            const data: DecisionResponse = await response.json();
            setVenues(data.venues);
            setIsPremium(data.is_premium);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
            setSpinning(false);
        }
    };

    useEffect(() => {
        fetchDecision();
    }, []);

    const handleSpinAgain = () => {
        setSpinning(true);
        fetchDecision();
    };

    const getPhotoUrl = (photoReference: string) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`;
    };

    if (loading || spinning) {
        return (
            <div className="h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center">
                <StarsBackground />
                <div className="z-10 flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#88B04B] blur-xl opacity-20 rounded-full animate-pulse"></div>
                        <Loader2 className="w-12 h-12 text-[#88B04B] animate-spin relative z-10" />
                    </div>
                    <p className="mt-4 text-[#88B04B] font-light tracking-widest uppercase text-sm animate-pulse">
                        {spinning ? "Finding new spots..." : "Consulting the stars..."}
                    </p>
                </div>
            </div>
        );
    }

    if (limitReached) {
        return (
            <div className="min-h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center px-4">
                <StarsBackground />
                <ShootingStars />
                <div className="relative z-10 max-w-md text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#88B04B]/10 flex items-center justify-center border border-[#88B04B]/20">
                        <Crown className="w-10 h-10 text-[#88B04B]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Daily Limit Reached</h2>
                    <p className="text-gray-400">{error}</p>
                    <div className="space-y-3">
                        <Link href="/pricing">
                            <button className="w-full h-12 btn-matcha rounded-full font-bold">
                                Upgrade to Premium
                            </button>
                        </Link>
                        <Link href="/home">
                            <button className="w-full h-12 bg-white/5 border border-white/10 rounded-full text-white font-semibold hover:bg-white/10 transition">
                                Back to Home
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !limitReached) {
        return (
            <div className="min-h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center px-4">
                <StarsBackground />
                <div className="relative z-10 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link href="/home">
                        <button className="btn-matcha px-6 py-3 rounded-full">Back to Home</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] relative pb-20 overflow-x-hidden">
            <div className="absolute inset-0 z-0 text-white">
                <StarsBackground />
                <ShootingStars />
            </div>

            <main className="relative z-10 px-4 pt-10 max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#88B04B] to-[#A8D070]"
                    >
                        {isPremium ? "Your Top 5 Matches" : "The Stars Have Aligned"}
                    </motion.h1>
                    <p className="text-gray-400 mt-2">
                        {isPremium ? "Premium picks just for you" : "Here are your top 2 matches"}
                    </p>
                </div>

                <div className={`grid ${isPremium ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
                    {venues.map((venue, idx) => (
                        <motion.div
                            key={venue.place_id}
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                        >
                            <GlassCard className="p-0 border-white/10 overflow-hidden group hover:border-[#88B04B]/30 transition-all duration-500">
                                <div className="relative h-48 w-full overflow-hidden bg-gray-800">
                                    {venue.photos && venue.photos[0] ? (
                                        <img
                                            src={getPhotoUrl(venue.photos[0].photo_reference)}
                                            alt={venue.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            No image
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-white">{venue.rating?.toFixed(1) || "N/A"}</span>
                                    </div>
                                    {/* Favorite Button */}
                                    <button
                                        onClick={() => toggleFavorite(venue)}
                                        className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${favorites.includes(venue.place_id) ? 'bg-red-500/80 border-red-400 text-white' : 'bg-black/60 backdrop-blur-md border-white/10 text-gray-400 hover:text-red-400'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${favorites.includes(venue.place_id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#88B04B] transition-colors line-clamp-1">
                                            {venue.name}
                                        </h3>
                                        <span className="text-gray-400 text-sm">
                                            {"₱".repeat(venue.price_level || 2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                        <MapPin className="w-3 h-3" />
                                        <span className="line-clamp-1">{venue.vicinity}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={getDirectionsUrl(venue)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 h-10 bg-[#88B04B]/10 border border-[#88B04B]/20 rounded-xl text-[#88B04B] font-semibold flex items-center justify-center gap-2 hover:bg-[#88B04B]/20 transition text-sm"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            Directions
                                        </a>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name)}&query_place_id=${venue.place_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition text-sm"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            View
                                        </a>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleSpinAgain}
                            disabled={spinning}
                            className="btn-matcha px-8 py-3 rounded-full flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${spinning ? "animate-spin" : ""}`} />
                            Spin Again
                        </button>
                        <button
                            onClick={handleShare}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 font-bold text-white hover:bg-white/10 transition"
                        >
                            {shareSuccess ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                            {shareSuccess ? "Copied!" : "Share"}
                        </button>
                    </div>
                    <Link href="/home">
                        <button className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
                            Change preferences <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
