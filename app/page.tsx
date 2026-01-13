"use client";
import React from "react";
import { motion } from "framer-motion";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Onboarding() {
  return (
    <div className="h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <StarsBackground />
        <ShootingStars />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto space-y-8">

        {/* Logo & Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <Logo variant="icon" className="w-24 h-24" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#88B04B]/20 bg-[#88B04B]/5 backdrop-blur-md mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#88B04B] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-[#A8D070] uppercase">AI-Powered Decisions</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-[#A8D070] to-[#88B04B] filter drop-shadow-[0_0_30px_rgba(136,176,75,0.3)]">
            DestiPcker
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Stop scrolling. Start experiencing.
            <span className="block mt-2 text-white/80">The high-end AI concierge for your social life.</span>
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Link href="/auth">
            <button className="h-14 px-10 text-lg btn-matcha rounded-full font-bold">
              Get Started
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative gradients */}
      <div className="absolute -bottom-40 left-0 right-0 h-96 bg-gradient-to-t from-[#88B04B]/10 to-transparent blur-3xl -z-0 pointer-events-none" />
    </div>
  );
}
