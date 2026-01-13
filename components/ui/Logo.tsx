"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
    variant?: "full" | "icon";
    className?: string;
    animated?: boolean;
}

export const Logo = ({ variant = "full", className, animated = true }: LogoProps) => {
    const LogoIcon = () => (
        <motion.svg
            viewBox="0 0 200 200"
            className={cn("w-full h-full", animated && "animate-pulse-matcha")}
            initial={animated ? { scale: 0.9, opacity: 0 } : {}}
            animate={animated ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
        >
            {/* Outer frame corners */}
            <g stroke="#88B04B" strokeWidth="8" fill="none" strokeLinecap="round">
                {/* Top-left */}
                <path d="M 30 30 L 30 60 M 30 30 L 60 30" />
                {/* Top-right */}
                <path d="M 170 30 L 170 60 M 170 30 L 140 30" />
                {/* Bottom-left */}
                <path d="M 30 170 L 30 140 M 30 170 L 60 170" />
                {/* Bottom-right */}
                <path d="M 170 170 L 170 140 M 170 170 L 140 170" />
            </g>

            {/* Navigation arrow/compass */}
            <g transform="translate(100, 100)">
                <motion.g
                    animate={animated ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Arrow pointing up-right */}
                    <path
                        d="M -25 25 L 0 -35 L 25 25 L 0 10 Z"
                        fill="#88B04B"
                        stroke="#A8D070"
                        strokeWidth="3"
                        filter="url(#glow)"
                    />
                    {/* Center dot */}
                    <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
                </motion.g>
            </g>

            {/* Glow filter */}
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
        </motion.svg>
    );

    if (variant === "icon") {
        return (
            <div className={cn("relative", className)}>
                <LogoIcon />
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="w-10 h-10">
                <LogoIcon />
            </div>
            <span className="font-bold text-xl tracking-wider text-white">
                DestiPcker
            </span>
        </div>
    );
};
