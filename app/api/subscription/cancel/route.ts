import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripe();
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user data to find Stripe customer ID
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("stripe_customer_id, stripe_subscription_id, is_premium")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!userData.is_premium) {
            return NextResponse.json({ error: "No active subscription" }, { status: 400 });
        }

        // Cancel Stripe subscription if exists
        if (userData.stripe_subscription_id) {
            try {
                await stripe.subscriptions.cancel(userData.stripe_subscription_id);
            } catch (stripeError: any) {
                console.warn("Stripe cancellation error:", stripeError.message);
            }
        }

        // Update user to free tier
        await supabase
            .from("users")
            .update({
                is_premium: false,
                stripe_subscription_id: null,
                premium_expires_at: null,
            })
            .eq("id", user.id);

        return NextResponse.json({
            success: true,
            message: "Subscription cancelled successfully. You now have the Free plan."
        });

    } catch (error: any) {
        console.error("Cancel subscription error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to cancel subscription" },
            { status: 500 }
        );
    }
}
