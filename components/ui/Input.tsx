
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="text-sm font-medium text-deep-ceremonial ml-2">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full rounded-2xl border border-bamboo bg-white/50 px-5 py-3 
          text-deep-ceremonial placeholder:text-roasted-hojicha/50 outline-none 
          focus:border-fresh-matcha focus:ring-2 focus:ring-fresh-matcha/20 
          transition-all duration-300
          ${className}
        `}
                {...props}
            />
        </div>
    );
}
