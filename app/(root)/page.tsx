import {
  Sparkles,
  Apple,
  Dumbbell,
  ClipboardCheck,
  BarChart,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { ArrowRight } from 'lucide-react'; // Added ArrowRight
import Subscription from "@/components/Subscription";

export default async function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section - Enhanced Background and Padding */}
      <div className="relative flex items-center justify-center bg-gradient-to-b from-background via-background/90 to-background">
        {/* Optional: Add a subtle pattern or overlay here if desired */}
        {/* <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-5"></div> */}
        <div className="max-w-7xl px-6 py-24 md:py-32 lg:py-40 mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 shadow-sm">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Your Ultimate Fitness Companion
            </span>
          </div>

          {/* Enhanced Typography and Spacing */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6">
            AI-Powered Fitness & Nutrition Platform | <p className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">Cloudy Unicorn</p>
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-muted-foreground">
            Achieve Your Health Goals with Personalized Plans
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Your all-in-one platform for personalized meal plans, custom workouts,
            AI health insights, and seamless progress tracking. Start your transformation today.
          </p>

          {/* Refined Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 rounded-full text-base font-semibold group" asChild>
              <Link href="/sign-up">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 rounded-full text-base font-semibold"
              asChild
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid - Updated Styling */}
      <div className="py-20 lg:py-24 bg-background/80"> {/* Slightly different background */}
        <div className="max-w-7xl mx-auto px-6"> {/* Adjusted padding */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight"> {/* Refined title */}
            Everything You Need to Succeed
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Adjusted lg breakpoint */}
            {[
              {
                icon: <Apple className="h-10 w-10" aria-label="Nutrition icon" />,
                title: 'Personalized Meal Plans',
                description:
                  'Tailored nutrition guides based on your goals and preferences.',
              },
              {
                icon: <Dumbbell className="h-10 w-10" aria-label="Workout icon" />,
                title: 'Custom Workout Programs',
                description:
                  'Exercise routines designed for your fitness level and schedule.',
              },
              {
                icon: <ClipboardCheck className="h-10 w-10" aria-label="Habits icon" />,
                title: 'Habit‑Changing Challenges',
                description:
                  'Daily and weekly challenges to build lasting healthy habits.',
              },
              {
                icon: <BarChart className="h-10 w-10" aria-label="Progress icon" />,
                title: 'Progress Tracking',
                description:
                  'Monitor workouts, meals, and habits with intuitive charts.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                // Enhanced card styling
                className="p-6 rounded-2xl border border-border/50 bg-card hover:bg-muted/50 hover:shadow-md transition-all duration-300 flex flex-col items-start"
              >
                <div className="mb-5 text-primary p-3 bg-primary/10 rounded-lg">{feature.icon}</div> {/* Icon background */}
                <h3 className="text-lg font-semibold mb-2"> {/* Adjusted font size */}
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground"> {/* Adjusted font size */}
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Enhanced Styling */}
      <div className="py-20 lg:py-24 bg-gradient-to-t from-background/50 via-background/10 to-transparent"> {/* Added gradient */}
        <div className="max-w-4xl mx-auto px-6 text-center"> {/* Adjusted padding */}
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <CheckCircle className="h-6 w-6" />
            <span className="text-sm font-medium"> {/* Adjusted font size */}
              Trusted by 10,000+ Fitness Enthusiasts
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6"> {/* Refined title */}
            Ready to Transform Your Life?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"> {/* Adjusted text & spacing */}
            Join thousands already achieving their fitness goals with Cloudy Unicorn's personalized approach.
          </p>
          {/* Updated Button to match Hero */}
          <Button size="lg" className="h-12 px-8 rounded-full text-base font-semibold group" asChild>
            <Link href="/sign-up">
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /> {/* Added Arrow */}
            </Link>
          </Button>
          <Subscription />

          {/* Legal Links */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/refund" className="hover:text-foreground transition-colors">
                Refund Policy
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "Service",
                "name": "Personalized Meal Plans",
                "description": "Tailored nutrition guides based on your goals and preferences."
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "Service",
                "name": "Custom Workout Programs",
                "description": "Exercise routines designed for your fitness level and schedule."
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "Service",
                "name": "Habit-Changing Challenges",
                "description": "Daily and weekly challenges to build lasting healthy habits."
              }
            },
            {
              "@type": "ListItem",
              "position": 4,
              "item": {
                "@type": "Service",
                "name": "Progress Tracking",
                "description": "Monitor workouts, meals, and habits with intuitive charts."
              }
            }
          ]
        })
      }} />
    </main>
  );
}
