
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    const { priceId = 'price_123', email } = await request.json(); // In real app, get proper price ID

    // If no key or placeholder, return mock success url immediately for testing
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
        console.warn("STRIPE_SECRET_KEY missing. Returning mock URL.");
        // Return a URL that simulates success (e.g., back to home with ?success=true)
        return NextResponse.json({ url: `${request.headers.get('origin')}/?success=true` });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'gcash', 'paymaya', 'grabpay'] as any,
            line_items: [
                {
                    price_data: {
                        currency: 'php', // Localize to PHP for GCash/Maya support
                        product_data: {
                            name: 'DestiPicker Unlimited',
                            description: '2 months access to unlimited decisions',
                        },
                        unit_amount: 11900, // ₱119.00 (Approx $2)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/?success=true`,
            cancel_url: `${request.headers.get('origin')}/result?canceled=true`,
            customer_email: email,
            metadata: {
                feature: 'unlimited_unlock'
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Stripe Checkout Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
