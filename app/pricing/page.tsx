"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { GlassCard } from "@/components/ui/GlassCard";
import { Crown, Check, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const plans = [
    {
        name: "Free Explorer",
        price: "0",
        features: [
            "3 decisions per day",
            "Top 2 venue matches",
            "Basic filtering",
            "Community access"
        ],
        button: "Current Plan",
        current: true,
        premium: false
    },
    {
        name: "Premium Explorer",
        price: "119",
        features: [
            "Unlimited daily decisions",
            "Top 5 venue matches",
            "Priority support",
            "Exclusive 'Hidden Gems' filter",
            "No ads forever"
        ],
        button: "Upgrade Now",
        current: false,
        premium: true
    }
];

export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setUser(data);
            }
        };
        getUser();
    }, [supabase]);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user?.email }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("Failed to create checkout session");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("Payment system is currently in maintenance. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] relative pb-20 overflow-x-hidden">
            <div className="fixed inset-0 z-0">
                <StarsBackground />
                <ShootingStars />
            </div>

            <main className="relative z-10 px-6 max-w-5xl mx-auto pt-20">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#88B04B]/20 bg-[#88B04B]/5 backdrop-blur-md"
                    >
                        <Crown className="w-4 h-4 text-[#88B04B]" />
                        <span className="text-xs font-semibold tracking-wider text-[#A8D070] uppercase">Premium Access</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-white">Elevate Your Experience</h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Unlock the full power of DestiPcker and never let indecision hold you back again.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, idx) => {
                        const isUserPremium = user?.is_premium;
                        const isCurrent = (isUserPremium && plan.premium) || (!isUserPremium && !plan.premium);

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                            >
                                <GlassCard className={`h-full flex flex-col p-8 border-white/10 relative overflow-hidden ${plan.premium ? 'border-[#88B04B]/30' : ''}`}>
                                    {plan.premium && (
                                        <div className="absolute top-0 right-0 px-4 py-1 bg-[#88B04B] text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                                            Recommended
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-white">₱{plan.price}</span>
                                            <span className="text-gray-500 text-sm">/ two months</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.premium ? 'bg-[#88B04B]/20 text-[#88B04B]' : 'bg-white/10 text-gray-500'}`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={plan.premium && !isCurrent ? handleUpgrade : undefined}
                                        disabled={loading || isCurrent}
                                        className={`w-full h-12 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${isCurrent
                                            ? 'bg-white/5 border border-white/10 text-gray-400 cursor-default'
                                            : plan.premium
                                                ? 'btn-matcha shadow-[0_0_20px_rgba(136,176,75,0.3)]'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {loading && plan.premium ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : isCurrent ? (
                                            "Current Plan"
                                        ) : (
                                            plan.button
                                        )}
                                    </button>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/home" className="text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm">
                        Maybe later <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
