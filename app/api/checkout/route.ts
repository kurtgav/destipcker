import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: Request) {
    const { email } = await request.json();

    // If no key or placeholder, return mock success url immediately for testing
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
        console.warn("STRIPE_SECRET_KEY missing. Returning mock URL.");
        return NextResponse.json({ url: `${request.headers.get('origin')}/?success=true` });
    }

    const stripe = getStripe();
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'gcash', 'paymaya', 'grabpay'] as any,
            line_items: [
                {
                    price_data: {
                        currency: 'php',
                        product_data: {
                            name: 'DestiPicker Unlimited',
                            description: '2 months access to unlimited decisions',
                        },
                        unit_amount: 11900,
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
