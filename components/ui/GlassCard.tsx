import React from "react";
import { cn } from "@/lib/utils";

export const GlassCard = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "glass-panel rounded-2xl p-6 relative overflow-hidden",
                className
            )}
        >
            {/* Dynamic Shine Effect could go here */}
            <div className="relative z-10">{children}</div>
        </div>
    );
};
