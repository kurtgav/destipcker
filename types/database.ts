export interface Location {
    lat: number;
    lng: number;
}

export interface User {
    id: string;
    email: string | null;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    birthday: string | null;
    location: string | null;
    currency: string;
    is_premium: boolean;
    daily_usage_count: number;
    daily_outfit_count: number;
    daily_menu_count: number;
    last_reset_date: string;
    created_at: string;
    updated_at: string;
}

export interface Venue {
    place_id: string;
    name: string;
    rating: number;
    price_level: number;
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    types: string[];
    user_ratings_total?: number;
    opening_hours?: {
        open_now: boolean;
    };
}

export interface Decision {
    id: string;
    user_id: string;
    category: string;
    budget: number;
    currency: string;
    radius: number;
    venue_count: number;
    venues: Venue[];
    created_at: string;
}

export interface DecisionRequest {
    category: string;
    budget: number;
    currency: string;
    radius: number;
    userLocation?: {
        lat: number;
        lng: number;
    };
    useCurrentLocation?: boolean;
}

export interface DecisionResponse {
    venues: Venue[];
    count: number;
    is_premium: boolean;
}
