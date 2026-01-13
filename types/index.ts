
export interface Venue {
    place_id: string;
    name: string;
    rating: number;
    address: string;
    price_level: number;
    geometry: {
        location: {
            lat: number;
            lng: number
        }
    };
    photos?: any[];
}
