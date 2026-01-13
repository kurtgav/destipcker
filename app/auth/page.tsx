"use client";
import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { Logo } from "@/components/ui/Logo";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
    return (
        <Suspense fallback={null}>
            <AuthContent />
        </Suspense>
    );
}

function AuthContent() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorMsg = searchParams.get("error");
        if (errorMsg) {
            setError(errorMsg);
        }
    }, [searchParams]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === "signup") {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user) {
                    router.push("/setup");
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                // Check if profile is complete
                const { data: userData } = await supabase
                    .from("users")
                    .select("username, birthday, location")
                    .eq("id", data.user.id)
                    .single();

                if (userData?.username && userData?.birthday && userData?.location) {
                    router.push("/home");
                } else {
                    router.push("/setup");
                }
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || "An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <StarsBackground />
                <ShootingStars />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                {/* Logo */}
                <div className="mb-8 flex justify-start">
                    <Logo variant="icon" className="w-16 h-16" />
                </div>

                {/* Title */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {mode === "login" ? "Welcome\nBack." : "Create\nAccount."}
                        </h1>
                    </motion.div>
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                    {/* Email Input */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-14 bg-[#1a1a1a] border-none rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-[#88B04B]/30 transition-all"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-14 bg-[#1a1a1a] border-none rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-[#88B04B]/30 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4"
                        >
                            <p className="text-red-400 text-sm text-center">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 btn-matcha rounded-full flex items-center justify-center gap-2 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {mode === "login" ? "Log In" : "Sign Up"}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="h-12 bg-white text-black rounded-2xl flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2 6.5 2 12s4.42 10 10 10c5.05 0 8.76-3.43 8.76-10c0-.6 0-1-.15-1.3z"
                            />
                        </svg>
                        Google
                    </button>
                    <button
                        disabled={loading}
                        className="h-12 bg-white text-black rounded-2xl flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Apple
                    </button>
                </div>

                {/* Toggle Mode */}
                <div className="text-center">
                    <button
                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                        className="text-gray-400 text-sm"
                    >
                        {mode === "login" ? (
                            <>
                                New here? <span className="text-[#88B04B] font-semibold">Sign Up</span>
                            </>
                        ) : (
                            <>
                                Have an account? <span className="text-[#88B04B] font-semibold">Log In</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
