"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const TypewriterEffect = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, 20); // Adjust speed here (lower = faster)
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text]);

    // Simple markdown parser for bolding
    const parseMarkdown = (content: string) => {
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index} className="text-[#88B04B]">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-200 text-sm leading-relaxed"
        >
            {parseMarkdown(displayedText)}
            <span className="inline-block w-1.5 h-4 bg-[#88B04B] ml-1 animate-pulse" />
        </motion.div>
    );
};
