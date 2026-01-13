"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { GlassCard } from "@/components/ui/GlassCard";
import { MapPin, Star, ArrowLeft, Heart, Navigation, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Venue } from "@/types/database";

export default function FavoritesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem("destipicker_favorite_venues");
        if (saved) {
            try {
                setVenues(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load favorites", e);
            }
        }
        setLoading(false);
    }, []);

    const removeFavorite = (placeId: string) => {
        const newVenues = venues.filter(v => v.place_id !== placeId);
        setVenues(newVenues);
        localStorage.setItem("destipicker_favorite_venues", JSON.stringify(newVenues));

        const savedIds = localStorage.getItem("destipicker_favorites");
        if (savedIds) {
            const ids = JSON.parse(savedIds).filter((id: string) => id !== placeId);
            localStorage.setItem("destipicker_favorites", JSON.stringify(ids));
        }
    };

    const getPhotoUrl = (photoReference: string) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`;
    };

    const getDirectionsUrl = (venue: Venue) => {
        if (venue.geometry?.location) {
            return `https://www.google.com/maps/dir/?api=1&destination=${venue.geometry.location.lat},${venue.geometry.location.lng}&destination_place_id=${venue.place_id}`;
        }
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue.name)}&destination_place_id=${venue.place_id}`;
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#88B04B]/30 border-t-[#88B04B] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] relative pb-20">
            <div className="fixed inset-0 z-0">
                <StarsBackground />
                <ShootingStars />
            </div>

            <header className="relative z-10 p-6 flex items-center gap-4">
                <Link href="/home">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </div>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400 fill-red-400" /> Favorites
                    </h1>
                    <p className="text-xs text-gray-500">{venues.length} saved places</p>
                </div>
            </header>

            <main className="relative z-10 px-4 max-w-5xl mx-auto">
                {venues.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No favorites yet</h2>
                        <p className="text-gray-400 mb-6">Save your favorite venues from the results page</p>
                        <Link href="/home">
                            <button className="btn-matcha px-6 py-3 rounded-full font-bold">
                                Discover Places
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {venues.map((venue, idx) => (
                            <motion.div
                                key={venue.place_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlassCard className="p-0 border-white/10 overflow-hidden group hover:border-[#88B04B]/30 transition-all duration-500">
                                    <div className="relative h-40 w-full overflow-hidden bg-gray-800">
                                        {venue.photos && venue.photos[0] ? (
                                            <img
                                                src={getPhotoUrl(venue.photos[0].photo_reference)}
                                                alt={venue.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                No image
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs font-bold text-white">{venue.rating?.toFixed(1) || "N/A"}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFavorite(venue.place_id)}
                                            className="absolute top-3 left-3 w-7 h-7 rounded-full bg-red-500/80 border border-red-400 flex items-center justify-center text-white hover:bg-red-600 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-base font-bold text-white line-clamp-1 mb-1">{venue.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                                            <MapPin className="w-3 h-3" />
                                            <span className="line-clamp-1">{venue.vicinity}</span>
                                        </div>
                                        <a
                                            href={getDirectionsUrl(venue)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-9 bg-[#88B04B]/10 border border-[#88B04B]/20 rounded-lg text-[#88B04B] font-semibold flex items-center justify-center gap-2 hover:bg-[#88B04B]/20 transition text-sm"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            Get Directions
                                        </a>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
