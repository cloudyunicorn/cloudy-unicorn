import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const Subscription = () => {
  const plans = [
    {
      title: 'Basic',
      price: 'Free',
      features: [
        'Basic workout tracking',
        '3 meal plans per week',
        'Standard analytics',
        'Community support',
      ],
      cta: 'Get Started',
    },
    {
      title: 'Pro',
      price: '₹ 499',
      features: [
        'Advanced workout tracking',
        '7 meal plans per week',
        'Detailed analytics',
        'Priority support',
        'Custom workout plans',
      ],
      cta: 'Upgrade Now',
      featured: true,
      href: '/pricing/element',
    },
    {
      title: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited meal plans',
        'Team accounts',
        'Dedicated support',
        'Custom integrations',
        'API access',
        'White-label options',
      ],
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pricing Plans
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that's right for you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.title}
            className={`relative overflow-hidden ${
              plan.featured ? 'border-2 border-primary' : ''
            }`}
          >
            {plan.featured && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.title}</CardTitle>
              <div className="text-4xl font-bold pt-4">
                {plan.price}
                {plan.price !== 'Free' && plan.price !== 'Custom' && (
                  <span className="text-lg font-normal">/month</span>
                )}
              </div>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={plan.href || '/pricing'}>
                <Button
                  variant={plan.featured ? 'default' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
