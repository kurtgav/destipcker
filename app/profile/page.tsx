"use client";
import React, { useEffect, useState } from "react";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowInput } from "@/components/ui/GlowInput";
import { User, CreditCard, Crown, MapPin, Calendar, Trash2, ChevronRight, ArrowLeft, Loader2, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CURRENCIES } from "@/lib/currency-utils";
import type { User as UserType } from "@/types/database";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cancellingSubscription, setCancellingSubscription] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const supabase = createClient();
    const router = useRouter();

    // Form state
    const [username, setUsername] = useState("");
    const [location, setLocation] = useState("");
    const [birthday, setBirthday] = useState("");
    const [currency, setCurrency] = useState("PHP");

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
                setUsername(userData.username || "");
                setLocation(userData.location || "");
                setBirthday(userData.birthday || "");
                setCurrency(userData.currency || "PHP");
            }

            setLoading(false);
        };

        loadUser();
    }, [router, supabase]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from("users")
                .update({
                    username,
                    location,
                    birthday,
                    currency,
                })
                .eq("id", user.id);

            if (error) throw error;

            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelSubscription = async () => {
        setCancellingSubscription(true);
        try {
            const res = await fetch("/api/subscription/cancel", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            alert(data.message || "Subscription cancelled successfully!");
            setUser(user ? { ...user, is_premium: false } : null);
            setShowCancelModal(false);
        } catch (err: any) {
            alert(err.message || "Failed to cancel subscription");
        } finally {
            setCancellingSubscription(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") return;

        setDeletingAccount(true);
        try {
            const res = await fetch("/api/account", { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Redirect to landing page
            router.push("/");
        } catch (err: any) {
            alert(err.message || "Failed to delete account");
            setDeletingAccount(false);
        }
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
                <h1 className="text-xl font-bold text-white">Profile & Settings</h1>
            </header>

            <main className="relative z-10 px-4 max-w-2xl mx-auto space-y-8">

                {/* Profile Info */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400 px-2">Personal Info</h2>
                    <GlassCard className="space-y-6 glass-matcha">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#88B04B] to-[#6A8C3A] flex items-center justify-center text-2xl font-bold text-white">
                                {username.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{username || "User"}</h3>
                                <p className="text-gray-400 text-sm">{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider ml-1">Username</label>
                                <GlowInput value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider ml-1">Location</label>
                                <GlowInput value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider ml-1">Birthday</label>
                                <GlowInput type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="[color-scheme:dark]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider ml-1">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all [color-scheme:dark]"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} - {c.symbol}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 h-10 btn-matcha rounded-full text-sm font-bold disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </GlassCard>
                </section>

                {/* Subscription */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400 px-2">Subscription</h2>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#88B04B]/20 to-[#A8D070]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <GlassCard className="border-[#88B04B]/30 relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-[#88B04B] fill-[#88B04B]" />
                                    <span className="font-bold text-white">{user?.is_premium ? "Premium Plan" : "Free Plan"}</span>
                                </div>
                                {user?.is_premium && (
                                    <span className="text-xs font-bold bg-[#88B04B]/20 text-[#88B04B] px-2 py-1 rounded-full border border-[#88B04B]/30">ACTIVE</span>
                                )}
                            </div>

                            {user?.is_premium ? (
                                <>
                                    <ul className="space-y-3 mb-6">
                                        {["Unlimited AI Decisions", "No Ads", "5 Venue Suggestions", "Priority Support"].map((perk, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] shadow-[0_0_5px_#88B04B]" />
                                                {perk}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full h-10 text-xs text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Cancel Subscription
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Upgrade to Premium for unlimited decisions and more!
                                    </p>
                                    <Link href="/pricing">
                                        <button className="w-full h-10 btn-matcha rounded-full text-sm font-bold">
                                            Upgrade to Premium
                                        </button>
                                    </Link>
                                </>
                            )}
                        </GlassCard>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-8">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 text-red-500/70 hover:text-red-500 transition-colors text-sm mx-auto"
                    >
                        <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                </section>

            </main>

            {/* Cancel Subscription Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Cancel Subscription?</h3>
                            <button onClick={() => setShowCancelModal(false)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm">
                            You'll lose access to Premium features immediately. Your account will revert to the Free plan.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 h-10 bg-white/5 border border-white/10 rounded-full text-white text-sm font-semibold hover:bg-white/10 transition"
                            >
                                Keep Premium
                            </button>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={cancellingSubscription}
                                className="flex-1 h-10 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-semibold hover:bg-red-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {cancellingSubscription ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Subscription"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-6 max-w-md w-full space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Delete Account</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            This action is <strong className="text-red-400">permanent and cannot be undone</strong>. All your data, decisions, and preferences will be deleted.
                        </p>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500">Type <span className="text-red-400 font-mono">DELETE</span> to confirm</label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-4 text-white text-sm outline-none focus:border-red-500/50"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                                className="flex-1 h-10 bg-white/5 border border-white/10 rounded-full text-white text-sm font-semibold hover:bg-white/10 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== "DELETE" || deletingAccount}
                                className="flex-1 h-10 bg-red-500 rounded-full text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

