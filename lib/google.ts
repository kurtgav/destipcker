import { Venue, Location } from "@/types/database";

export type { Location };

const MOCK_VENUES: Record<string, Venue[]> = {
    cafe: [
        {
            place_id: "mock_cafe_1",
            name: "Starry Matcha Lounge",
            vicinity: "Celestial Way, Metro",
            rating: 4.9,
            price_level: 2,
            geometry: { location: { lat: 14.5995, lng: 120.9842 } },
            types: ["cafe", "food", "point_of_interest", "establishment"],
            photos: [{ photo_reference: "mock1", height: 800, width: 600 }]
        },
        {
            place_id: "mock_cafe_2",
            name: "Zen Garden Tea House",
            vicinity: "Bamboo Grove St.",
            rating: 4.7,
            price_level: 3,
            geometry: { location: { lat: 14.6010, lng: 120.9850 } },
            types: ["cafe", "food", "point_of_interest", "establishment"],
            photos: [{ photo_reference: "mock2", height: 800, width: 600 }]
        }
    ],
    restaurant: [
        {
            place_id: "mock_rest_1",
            name: "The Matcha Kitchen",
            vicinity: "Gourmet Plaza",
            rating: 4.8,
            price_level: 3,
            geometry: { location: { lat: 14.5980, lng: 120.9830 } },
            types: ["restaurant", "food", "point_of_interest", "establishment"],
            photos: [{ photo_reference: "mock3", height: 800, width: 600 }]
        },
        {
            place_id: "mock_rest_2",
            name: "Emerald Dining",
            vicinity: "Skyline Towers",
            rating: 4.6,
            price_level: 4,
            geometry: { location: { lat: 14.6020, lng: 120.9860 } },
            types: ["restaurant", "food", "point_of_interest", "establishment"],
            photos: [{ photo_reference: "mock4", height: 800, width: 600 }]
        }
    ],
    shopping_mall: [
        {
            place_id: "mock_shop_1",
            name: "Matcha Central Mall",
            vicinity: "Retail District",
            rating: 4.5,
            price_level: 2,
            geometry: { location: { lat: 14.5900, lng: 120.9800 } },
            types: ["shopping_mall", "establishment"],
            photos: [{ photo_reference: "mock5", height: 800, width: 600 }]
        }
    ],
    park: [
        {
            place_id: "mock_park_1",
            name: "Matcha Botanic Garden",
            vicinity: "Green belt",
            rating: 4.9,
            price_level: 0,
            geometry: { location: { lat: 14.5950, lng: 120.9900 } },
            types: ["park", "establishment"],
            photos: [{ photo_reference: "mock6", height: 800, width: 600 }]
        }
    ],
    night_club: [
        {
            place_id: "mock_club_1",
            name: "Neon Matcha Bar",
            vicinity: "After Dark St.",
            rating: 4.7,
            price_level: 3,
            geometry: { location: { lat: 14.6050, lng: 120.9880 } },
            types: ["night_club", "establishment"],
            photos: [{ photo_reference: "mock7", height: 800, width: 600 }]
        }
    ]
};

export async function geocodeLocation(address: string): Promise<Location | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return null;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "OK" && data.results[0]) {
            return data.results[0].geometry.location;
        }
        console.error("Geocoding API Error:", data.status, data.error_message);
        return null;
    } catch (e) {
        console.error("Geocoding failed:", e);
        return null;
    }
}

export async function fetchNearbyPlaces(
    location: Location,
    radius: number,
    category: string,
    maxPrice: number = 4
): Promise<Venue[] | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return null;

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius * 1000}&type=${category}&key=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'OK') {
            console.error("Google Places API Error:", data.status, data.error_message);
            return null;
        }

        return data.results;
    } catch (error) {
        console.error("Failed to fetch places:", error);
        return null;
    }
}

export function getMockVenues(category: string): Venue[] {
    return MOCK_VENUES[category] || MOCK_VENUES.cafe;
}
