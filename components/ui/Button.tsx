
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
    const baseStyles = "rounded-full px-6 py-3 font-medium transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-fresh-matcha text-matcha-creme shadow-[0_4px_12px_rgba(136,176,75,0.4)] hover:bg-[#7a9e43]",
        secondary: "border-2 border-deep-ceremonial text-deep-ceremonial bg-transparent hover:bg-deep-ceremonial/5 backdrop-blur-sm"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
