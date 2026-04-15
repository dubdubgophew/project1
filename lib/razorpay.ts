import Razorpay from 'razorpay';
import crypto from 'crypto';

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const RAZORPAY_PLANS = {
  pro: {
    planId: process.env.RAZORPAY_PRO_PLAN_ID!,
    amount: 69900, // ₹699 in paise
    currency: 'INR',
    interval: 1,
    period: 'monthly',
  },
  unlimited: {
    planId: process.env.RAZORPAY_UNLIMITED_PLAN_ID!,
    amount: 149900, // ₹1499 in paise
    currency: 'INR',
    interval: 1,
    period: 'monthly',
  },
} as const;

export async function createRazorpayOrder(amount: number, currency = 'INR') {
  return razorpay.orders.create({
    amount,
    currency,
    receipt: `receipt_${Date.now()}`,
  });
}

export async function createRazorpaySubscription(planId: string, totalCount = 12) {
  return razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: totalCount,
  });
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export function verifyRazorpaySubscriptionSignature({
  subscriptionId,
  paymentId,
  signature,
}: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const body = `${paymentId}|${subscriptionId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}
