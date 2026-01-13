
import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Venue } from '@/types';

interface VenueCardProps {
    venue: Venue;
    onSelect: (venue: Venue) => void;
}

export function VenueCard({ venue, onSelect }: VenueCardProps) {
    return (
        <Card className="w-full mb-4 transform hover:scale-102 transition-transform cursor-pointer" variant="sage">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-serif font-bold text-deep-ceremonial">{venue.name}</h3>
                    <p className="text-sm text-roasted-hojicha mt-1">{venue.address}</p>
                </div>
                <div className="bg-fresh-matcha px-2 py-1 rounded-lg">
                    <span className="text-matcha-creme font-bold text-sm">★ {venue.rating}</span>
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-deep-ceremonial/60 italic">tap to reveal map</span>
                <Button
                    variant="secondary"
                    className="text-xs py-2 px-4 shadow-none border-1"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onSelect(venue);
                    }}
                >
                    Choose This
                </Button>
            </div>
        </Card>
    );
}
