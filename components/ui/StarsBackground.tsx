"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const StarsBackground = ({
    starDensity = 0.00015,
    allStarsTwinkle = true,
    twinkleProbability = 0.7,
    minTwinkleSpeed = 0.5,
    maxTwinkleSpeed = 1,
    className,
}: {
    starDensity?: number;
    allStarsTwinkle?: boolean;
    twinkleProbability?: number;
    minTwinkleSpeed?: number;
    maxTwinkleSpeed?: number;
    className?: string;
}) => {
    const [stars, setStars] = useState<
        {
            x: number;
            y: number;
            radius: number;
            opacity: number;
            twinkleSpeed: number | null;
        }[]
    >([]);

    useEffect(() => {
        const generateStars = () => {
            const { innerWidth, innerHeight } = window;
            const starCount = Math.floor(innerWidth * innerHeight * starDensity);
            const newStars = Array.from({ length: starCount }).map(() => {
                const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
                return {
                    x: Math.random() * innerWidth,
                    y: Math.random() * innerHeight,
                    radius: Math.random() * 0.5 + 0.5,
                    opacity: Math.random() * 0.5 + 0.1,
                    twinkleSpeed: shouldTwinkle
                        ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
                        : null,
                };
            });
            setStars(newStars);
        };

        generateStars();

        window.addEventListener("resize", generateStars);
        return () => window.removeEventListener("resize", generateStars);
    }, [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]);

    return (
        <div className={cn("fixed inset-0 z-0 pointer-events-none", className)}>
            <svg className="w-full h-full">
                {stars.map((star, i) => (
                    <circle
                        key={i}
                        cx={star.x}
                        cy={star.y}
                        r={star.radius}
                        fill="white"
                        opacity={star.opacity}
                        className={star.twinkleSpeed ? "animate-twinkle" : ""}
                        style={{
                            animationDuration: star.twinkleSpeed ? `${star.twinkleSpeed}s` : "0s",
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};
