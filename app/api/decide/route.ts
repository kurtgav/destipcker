import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { convertToUSD, getPriceLevelFromBudget } from "@/lib/currency-utils";
import type { DecisionRequest, DecisionResponse, Venue, Location as DbLocation } from "@/types/database";
import { geocodeLocation, fetchNearbyPlaces, getMockVenues } from "@/lib/google";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check daily limit for free users
        const today = new Date().toISOString().split("T")[0];
        if (!userData.is_premium) {
            if (userData.last_reset_date !== today) {
                // Reset counter for new day
                await supabase
                    .from("users")
                    .update({ daily_usage_count: 0, last_reset_date: today })
                    .eq("id", user.id);
                userData.daily_usage_count = 0;
            }

            if (userData.daily_usage_count >= 3) {
                return NextResponse.json(
                    { error: "Daily limit reached", limit_reached: true },
                    { status: 429 }
                );
            }
        }

        // Parse request body
        const body: DecisionRequest = await request.json();
        const { category, budget, currency, radius } = body;

        // Convert budget to USD for Google Places API
        const budgetUSD = convertToUSD(budget, currency);
        const maxPriceLevel = getPriceLevelFromBudget(budgetUSD);

        const locationStr = userData.location || "Manila, Philippines";

        let selectedVenues: Venue[] = [];
        let isDemoMode = false;

        // 1. Determine Coordinates
        let coords: DbLocation | null = null;

        if (body.useCurrentLocation && body.userLocation) {
            coords = body.userLocation;
        } else {
            coords = await geocodeLocation(locationStr);
        }

        if (coords) {
            // 2. Fetch Places
            const places = await fetchNearbyPlaces(coords, radius, category);

            if (places && places.length > 0) {
                // Filter logic based on User Tier
                let filtered: Venue[] = [];

                if (userData.is_premium) {
                    // PREMIUM: 4.5 - 5.0 stars
                    filtered = places.filter((place: any) => {
                        const rating = place.rating || 0;
                        const priceLevel = place.price_level !== undefined ? place.price_level : 2;
                        return rating >= 4.5 && priceLevel <= maxPriceLevel;
                    });

                    // Fallback to 4.0 if strict premium filter yields nothing
                    if (filtered.length === 0) {
                        filtered = places.filter((place: any) => {
                            const rating = place.rating || 0;
                            return rating >= 4.0 && (place.price_level === undefined || place.price_level <= maxPriceLevel);
                        });
                    }
                } else {
                    // FREE: 3.0 - 5.0 stars
                    filtered = places.filter((place: any) => {
                        const rating = place.rating || 0;
                        const priceLevel = place.price_level !== undefined ? place.price_level : 2;
                        return rating >= 3.0 && priceLevel <= maxPriceLevel;
                    });
                }

                // Generic relax if still no results (last resort)
                if (filtered.length === 0) {
                    filtered = places.filter((place: any) => {
                        const rating = place.rating || 0;
                        return rating >= 3.0; // Just give them something decent
                    });
                }

                // Shuffle logic (Fisher-Yates)
                let finalPool = [...filtered];
                for (let i = finalPool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
                }

                const venueCount = userData.is_premium ? 5 : 2;
                selectedVenues = finalPool.slice(0, venueCount);
            }
        }

        // 3. Fallback to Demo Mode if no results or API failure
        if (selectedVenues.length === 0) {
            console.warn("Using Demo Mode fallback for results");
            selectedVenues = getMockVenues(category);
            isDemoMode = true;
        }

        // Save decision to database
        await supabase.from("decisions").insert({
            user_id: user.id,
            category,
            budget,
            currency,
            radius,
            venue_count: selectedVenues.length,
            venues: selectedVenues,
        });

        // Increment usage count for free users
        if (!userData.is_premium) {
            await supabase
                .from("users")
                .update({ daily_usage_count: userData.daily_usage_count + 1 })
                .eq("id", user.id);
        }

        const response: DecisionResponse = {
            venues: selectedVenues,
            count: selectedVenues.length,
            is_premium: userData.is_premium,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Decision API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
