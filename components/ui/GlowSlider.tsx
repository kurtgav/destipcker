"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface GlowSliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    className?: string;
    glowColor?: string;
}

export const GlowSlider = ({
    min,
    max,
    step = 1,
    value,
    onChange,
    className,
    glowColor = "#22d3ee", // cyan-400
}: GlowSliderProps) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("relative w-full h-6 flex items-center", className)}>
            {/* Track Background */}
            <div className="absolute w-full h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Fill */}
                <div
                    className="h-full bg-cyan-400 transition-all duration-100 ease-out"
                    style={{
                        width: `${percentage}%`,
                        boxShadow: `0 0 10px ${glowColor}`
                    }}
                />
            </div>

            {/* Thumb (Invisible native input on top) */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />

            {/* Custom Thumb Visual - Following the fill position */}
            <div
                className="absolute h-5 w-5 bg-white border-2 border-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] pointer-events-none transition-all duration-100 ease-out transform -translate-x-1/2"
                style={{ left: `${percentage}%` }}
            />
        </div>
    );
};
