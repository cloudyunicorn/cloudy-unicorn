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

export default async function Home() {
  return (
    <main className="flex-1 relative min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <div className="flex items-center justify-center">
        <div className="max-w-7xl px-4 py-20 mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border shadow-sm">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Your Ultimate Fitness Companion
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Achieve Your Health Goals with{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              CyperSculpt
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Personalized meal plans, custom workouts, AI health assessments, and
            progress tracking—all in one platform.
          </p>

          <div className="flex gap-4 justify-center">
            <Button className="h-12 px-8 rounded-xl text-lg" asChild>
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 rounded-xl text-lg"
              asChild
            >
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Core Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Apple className="h-8 w-8" />,
                title: 'Personalized Meal Plans',
                description:
                  'Tailored nutrition guides based on your goals and preferences.',
              },
              {
                icon: <Dumbbell className="h-8 w-8" />,
                title: 'Custom Workout Programs',
                description:
                  'Exercise routines designed for your fitness level and schedule.',
              },
              {
                icon: <ClipboardCheck className="h-8 w-8" />,
                title: 'Habit‑Changing Challenges',
                description:
                  'Daily and weekly challenges to build lasting healthy habits.',
              },
              {
                icon: <BarChart className="h-8 w-8" />,
                title: 'Progress Tracking',
                description:
                  'Monitor workouts, meals, and habits with intuitive charts.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 text-primary">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium">
              Trusted by 10,000+ Fitness Enthusiasts
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands already hitting their goals with CyberSculpt.
          </p>
          <Button className="h-14 px-12 rounded-xl text-lg gap-2" asChild>
            <Link href="/sign-up">
              <Sparkles className="h-5 w-5" />
              Start Free Trial
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
