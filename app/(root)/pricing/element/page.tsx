'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import converToSubcurrency from '@/lib/converToSubcurrency';
import CheckoutPage from "@/components/pricing/CheckoutPage";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function ElementPage() {
  const amount = 499;

  return (
    <div className="flex flex-col justify-center items-center container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>
      <span className="font-bold">₹ {amount}</span>
      <Elements
        stripe={stripePromise}
        options={{
          mode: 'payment',
          amount: converToSubcurrency(amount),
          currency: 'inr',
        }}
      >
        <div className="max-w-md mx-auto p-6 rounded-lg shadow">
          {/* Payment form will be added here */}
          Payment processing will appear here
        </div>
        <CheckoutPage amount={amount} />
      </Elements>
    </div>
  );
}
