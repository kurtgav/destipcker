import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
const isPlaceholder = !key || key.includes('placeholder');

export const stripe = new Stripe(isPlaceholder ? 'NOT_REAL_KEY' : key, {
    typescript: true,
});
