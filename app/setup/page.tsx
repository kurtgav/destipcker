"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowInput } from "@/components/ui/GlowInput";
import { MapPin, Calendar, User as UserIcon, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CURRENCIES } from "@/lib/currency-utils";

export default function SetupPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Form data
    const [username, setUsername] = useState("");
    const [birthday, setBirthday] = useState("");
    const [location, setLocation] = useState("");
    const [currency, setCurrency] = useState("PHP");

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth");
            } else {
                setUserId(user.id);
            }
        };
        checkAuth();
    }, [router, supabase]);

    const handleNext = async () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Save to database
            setLoading(true);
            try {
                const { error } = await supabase
                    .from("users")
                    .update({
                        username,
                        birthday,
                        location,
                        currency,
                    })
                    .eq("id", userId);

                if (error) throw error;

                router.push("/home");
            } catch (err) {
                console.error("Error saving profile:", err);
                alert("Failed to save profile. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1:
                return username.length >= 3;
            case 2:
                return birthday !== "";
            case 3:
                return location.length >= 2;
            case 4:
                return currency !== "";
            default:
                return false;
        }
    };

    return (
        <div className="h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <StarsBackground />
                <ShootingStars />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8 justify-center">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${step >= i
                                    ? "w-8 bg-[#88B04B] shadow-[0_0_10px_rgba(136,176,75,0.5)]"
                                    : "w-2 bg-white/20"
                                }`}
                        />
                    ))}
                </div>

                <GlassCard className="min-h-[350px] flex flex-col justify-center border-white/10">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-[#88B04B]/10 flex items-center justify-center mx-auto mb-4 border border-[#88B04B]/20">
                                        <UserIcon className="w-6 h-6 text-[#88B04B]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Choose your username</h2>
                                    <p className="text-gray-400 text-sm">This is how others will see you.</p>
                                </div>
                                <GlowInput
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="text-center"
                                />
                                <button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className="w-full h-12 btn-matcha rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                                        <Calendar className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">When's your birthday?</h2>
                                    <p className="text-gray-400 text-sm">We use this to curate age-appropriate experiences.</p>
                                </div>
                                <GlowInput
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    className="text-center [color-scheme:dark]"
                                />
                                <button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className="w-full h-12 btn-matcha rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                                        <MapPin className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Where are you?</h2>
                                    <p className="text-gray-400 text-sm">To find the best spots near you.</p>
                                </div>
                                <GlowInput
                                    placeholder="Enter your city (e.g. Manila)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                                <button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className="w-full h-12 btn-matcha rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-[#88B04B]/10 flex items-center justify-center mx-auto mb-4 border border-[#88B04B]/20">
                                        <DollarSign className="w-6 h-6 text-[#88B04B]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Your currency</h2>
                                    <p className="text-gray-400 text-sm">We'll show prices in your preferred currency.</p>
                                </div>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all [color-scheme:dark]"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} - {c.name} ({c.symbol})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleNext}
                                    disabled={loading || !isStepValid()}
                                    className="w-full h-12 btn-matcha rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Finish Setup"
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassCard>
            </div>
        </div>
    );
}
