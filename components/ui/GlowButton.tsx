"use client";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowButtonProps {
    variant?: "primary" | "secondary" | "outline";
    glowColor?: "cyan" | "purple" | "gold";
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
    ({ className, variant = "primary", glowColor = "cyan", children, disabled, onClick, type = "button" }, ref) => {

        // Base glow color mapping
        const glowMap = {
            cyan: "rgba(0, 255, 255, 0.6)",
            purple: "rgba(176, 38, 255, 0.6)",
            gold: "rgba(255, 215, 0, 0.6)",
        };

        const color = glowMap[glowColor];

        return (
            <motion.button
                ref={ref}
                type={type}
                disabled={disabled}
                onClick={onClick}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                className={cn(
                    "relative px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300",
                    "hover:shadow-[0_0_20px_var(--glow-color)]",
                    variant === "primary" && "bg-white text-black border-none",
                    variant === "outline" && "bg-transparent border border-white/20 text-white hover:bg-white/10",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                style={{ "--glow-color": color } as React.CSSProperties}
            >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                    {children}
                </span>
                {variant === "primary" && (
                    <div className="absolute inset-0 rounded-full blur-md bg-white/50 -z-0 opacity-0 hover:opacity-100 transition-opacity" />
                )}
            </motion.button>
        );
    }
);
GlowButton.displayName = "GlowButton";
