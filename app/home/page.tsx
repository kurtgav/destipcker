"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlowSlider } from "@/components/ui/GlowSlider";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { Logo } from "@/components/ui/Logo";
import { Coffee, Utensils, ShoppingBag, Leaf, Moon, User, LogOut, MapPin, Shirt, ScanLine, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, convertFromUSD } from "@/lib/currency-utils";
import type { User as UserType } from "@/types/database";
import { useSearchParams } from "next/navigation";
import { confetti } from "@/lib/confetti";

const categories = [
    { id: "cafe", name: "Cafe", icon: Coffee, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: "restaurant", name: "Food", icon: Utensils, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { id: "shopping_mall", name: "Shopping", icon: ShoppingBag, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { id: "park", name: "Nature", icon: Leaf, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { id: "night_club", name: "Nightlife", icon: Moon, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { id: "favorites", name: "Favorites", icon: Heart, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", isLink: true },
];

export default function HomePage() {
    const [user, setUser] = useState<UserType | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("cafe");
    const [budget, setBudget] = useState(500);
    const [radius, setRadius] = useState(10);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push("/auth");
                return;
            }

            const { data: userData } = await supabase
                .from("users")
                .select("*")
                .eq("id", authUser.id)
                .single();

            if (userData) {
                setUser(userData);
                // Set default budget based on currency
                const defaultBudgetUSD = 10;
                const budgetInUserCurrency = convertFromUSD(defaultBudgetUSD, userData.currency);
                setBudget(Math.round(budgetInUserCurrency));
            }

            setLoading(false);
        };

        loadUser();

        if (searchParams.get("success") === "true") {
            setShowSuccess(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#88B04B", "#A8D070", "#FFFFFF"]
            });
            // Clean up URL
            window.history.replaceState({}, "", "/home");
        }
    }, [router, supabase, searchParams]);

    const handleGetLocation = () => {
        setLocationLoading(true);
        setLocationError("");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationLoading(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationError("Could not retrieve location. Please check permissions.");
                    setLocationLoading(false);
                }
            );
        } else {
            setLocationError("Geolocation is not supported by your browser");
            setLocationLoading(false);
        }
    };

    const handleDecide = async () => {
        if (!user) return;

        // Store decision params in sessionStorage for result page
        sessionStorage.setItem("decisionParams", JSON.stringify({
            category: selectedCategory,
            budget,
            currency: user.currency,
            radius,
            userLocation,
            useCurrentLocation: !!userLocation
        }));

        router.push("/result");
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#88B04B]/30 border-t-[#88B04B] rounded-full animate-spin" />
            </div>
        );
    }

    const maxBudget = user?.currency === "PHP" ? 5000 : user?.currency === "USD" ? 100 : 1000;
    const budgetStep = user?.currency === "PHP" ? 50 : user?.currency === "USD" ? 5 : 10;

    return (
        <div className="min-h-screen w-full bg-[#050505] relative pb-20 overflow-x-hidden">
            <div className="fixed inset-0 z-0">
                <StarsBackground />
                <ShootingStars />
            </div>

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center">
                <Logo />
                <div className="flex items-center gap-3">
                    <Link href="/favorites">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                            <Heart className="w-5 h-5 text-red-400" />
                        </div>
                    </Link>
                    <Link href="/profile">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition"
                    >
                        <LogOut className="w-5 h-5 text-white" />
                    </button>
                </div>
            </header>

            <main className="relative z-10 px-6 max-w-4xl mx-auto space-y-12 mt-4">
                {/* Welcome */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Hey, {user?.username || "there"}! 👋
                    </h2>
                    {user?.is_premium ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88B04B]/20 border border-[#88B04B]/30 mb-4">
                            <span className="w-2 h-2 rounded-full bg-[#88B04B] animate-pulse" />
                            <span className="text-xs font-bold text-[#88B04B] uppercase tracking-wider">Premium Member</span>
                        </div>
                    ) : (
                        <p className="text-gray-400">
                            {3 - (user?.daily_usage_count || 0)} decisions left today
                        </p>
                    )}
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-2xl bg-[#88B04B]/10 border border-[#88B04B]/20 mb-6"
                        >
                            <p className="text-[#88B04B] font-bold">✨ Welcome to Premium! Unlimited decisions unlocked.</p>
                        </motion.div>
                    )}
                    <p className="text-gray-400">What are you in the mood for?</p>
                </div>

                {/* Activities */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-6">Choose Activity</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        {categories.map((cat) => (
                            cat.isLink ? (
                                <Link key={cat.id} href="/favorites">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative flex flex-col items-center justify-center aspect-square rounded-2xl border bg-white/5 border-transparent hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                    >
                                        <cat.icon className={`w-8 h-8 mb-2 ${cat.color}`} />
                                        <span className="text-xs font-medium text-gray-300">{cat.name}</span>
                                    </motion.div>
                                </Link>
                            ) : (
                                <motion.button
                                    key={cat.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`
                                        relative flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all duration-300
                                        ${selectedCategory === cat.id
                                            ? `bg-white/10 ${cat.border} shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                        }
                                    `}
                                >
                                    <cat.icon className={`w-8 h-8 mb-2 ${cat.color}`} />
                                    <span className="text-xs font-medium text-gray-300">{cat.name}</span>

                                    {selectedCategory === cat.id && (
                                        <div className={`absolute inset-0 rounded-2xl ${cat.bg} blur-xl -z-10`} />
                                    )}
                                </motion.button>
                            )
                        ))}
                    </div>
                </section>

                {/* Sliders */}
                <section className="space-y-8">
                    <GlassCard className="space-y-6 glass-matcha">
                        <div>
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-400 font-medium">Budget Limit</span>
                                <span className="text-[#88B04B] font-bold">
                                    {user && formatCurrency(budget, user.currency)}
                                </span>
                            </div>
                            <GlowSlider
                                min={budgetStep}
                                max={maxBudget}
                                step={budgetStep}
                                value={budget}
                                onChange={setBudget}
                                glowColor="#88B04B"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-400 font-medium">Search Radius</span>
                                <span className="text-purple-400 font-bold">{radius} km</span>
                            </div>
                            <GlowSlider min={1} max={50} value={radius} onChange={setRadius} glowColor="#c084fc" />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleGetLocation}
                                className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 border transition-all ${userLocation
                                    ? "bg-[#88B04B]/20 border-[#88B04B]/50 text-[#88B04B]"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                <MapPin className="w-5 h-5" />
                                {locationLoading ? "Locating..." : userLocation ? "Using Current Location" : "Use Current Location"}
                            </button>
                            {locationError && (
                                <p className="text-red-400 text-xs mt-2 text-center">{locationError}</p>
                            )}
                        </div>
                    </GlassCard>
                </section>

                {/* Magic AI Tools */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-6">Magic Tools <span className="text-xs bg-[#88B04B]/20 text-[#88B04B] px-2 py-1 rounded-full border border-[#88B04B]/30 ml-2">NEW</span></h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/outfit">
                            <GlassCard className="p-4 hover:bg-white/5 transition group cursor-pointer border-[#88B04B]/20">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <Shirt className="w-5 h-5 text-purple-400" />
                                </div>
                                <h4 className="font-bold text-white">Outfit Picker</h4>
                                <p className="text-xs text-gray-400 mt-1">AI picks your best look</p>
                            </GlassCard>
                        </Link>
                        <Link href="/menu">
                            <GlassCard className="p-4 hover:bg-white/5 transition group cursor-pointer border-[#88B04B]/20">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <ScanLine className="w-5 h-5 text-orange-400" />
                                </div>
                                <h4 className="font-bold text-white">Menu Scanner</h4>
                                <p className="text-xs text-gray-400 mt-1">Find the best dish instantly</p>
                            </GlassCard>
                        </Link>
                    </div>
                </section>

                {/* CTA */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleDecide}
                        className="w-full max-w-sm h-16 btn-matcha rounded-full text-xl font-bold shadow-[0_0_30px_rgba(136,176,75,0.4)]"
                    >
                        Decide For Me ✨
                    </button>
                </div>
            </main>
        </div>
    );
}
