import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event;

    try {
        const stripe = getStripe();
        // Verify webhook signature (requires STRIPE_WEBHOOK_SECRET)
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
            // Allow bypass for testing if secret is missing (NOT for production)
            console.warn("Missing STRIPE_WEBHOOK_SECRET, assuming valid for dev.");
            event = JSON.parse(body);
        }
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const userEmail = session.customer_email;

        if (userEmail) {
            const supabaseAdmin = getSupabaseAdmin();
            const { error } = await supabaseAdmin
                .from('users')
                .update({ is_premium: true })
                .eq('email', userEmail);

            if (error) {
                console.error('Error updating user premium status:', error);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
            console.log(`User ${userEmail} upgraded to Premium!`);
        }
    }

    return NextResponse.json({ received: true });
}
