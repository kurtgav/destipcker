
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'sage';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
    // Variants use the utility classes defined in globals.css or composed here
    const baseStyles = "rounded-3xl p-6 transition-all duration-300";

    const variants = {
        default: "glass shadow-[0_10px_30px_-10px_rgba(44,76,59,0.08)]",
        sage: "glass-sage shadow-[0_10px_30px_-10px_rgba(44,76,59,0.08)]"
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
