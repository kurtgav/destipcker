"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const GlowInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, placeholder, ...props }, ref) => {
        const [focused, setFocused] = useState(false);

        return (
            <div className="relative w-full group">
                <input
                    ref={ref}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-all duration-300",
                        "focus:bg-white/10 focus:border-white/20",
                        className
                    )}
                    placeholder={placeholder}
                    {...props}
                />
                {/* Glow Line */}
                <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-transparent overflow-hidden pointer-events-none">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: focused ? "0%" : "-100%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    />
                </div>
            </div>
        );
    }
);
GlowInput.displayName = "GlowInput";
