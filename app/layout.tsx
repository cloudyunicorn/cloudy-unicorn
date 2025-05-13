'use client';

import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@/contexts/UserContext';
import './globals.css';
import { SupabaseProvider } from '@/providers/supabase-provider';
import { Toaster, toast } from 'sonner';
import { useEffect, useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Only show if not already shown this session
      if (!sessionStorage.getItem('pwaPromptShown')) {
        setShowInstall(true);
        sessionStorage.setItem('pwaPromptShown', 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    const promptEvent = installPrompt as any;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      // Clear the flag if installed
      sessionStorage.removeItem('pwaPromptShown');
    }
  };

  return (
    <html lang="en" className={`${geistSans.className} antialiased`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cloudy Unicorn | AI-Powered Fitness & Nutrition Platform</title>
        <meta name="description" content="Cloudy Unicorn provides personalized workout plans and meal recommendations powered by AI. Track your fitness journey, get smart nutrition advice, and achieve your health goals." />
        <link rel="canonical" href="https://www.cloudyunicorn.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.cloudyunicorn.com" />
        <meta property="og:title" content="Cloudy Unicorn | AI-Powered Fitness & Nutrition Platform" />
        <meta property="og:description" content="Personalized workout plans and meal recommendations powered by AI. Track your fitness journey and achieve your health goals." />
        <meta property="og:image" content="https://www.cloudyunicorn.com/assets/Logo/cover.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Cloudy Unicorn" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.cloudyunicorn.com" />
        <meta name="twitter:title" content="Cloudy Unicorn | AI-Powered Fitness & Nutrition Platform" />
        <meta name="twitter:description" content="Personalized workout plans and meal recommendations powered by AI. Track your fitness journey and achieve your health goals." />
        <meta name="twitter:image" content="https://www.cloudyunicorn.com/assets/Logo/cover.png" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#13131a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cloudy Unicorn" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#13131a" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Cloudy Unicorn",
            "url": "https://www.cloudyunicorn.com",
            "description": "AI-powered fitness and nutrition platform providing personalized workout plans and meal recommendations",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </head>
      <SupabaseProvider>
        <body>
          <UserProvider>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main>
              {children}
              <SpeedInsights />
              <Analytics />
            </main>
            <Toaster position="top-center" expand={false} visibleToasts={1} richColors />
            {showInstall && (
              toast('Add to home screen for better experience', {
                duration: 10000,
                action: {
                  label: 'Install',
                  onClick: handleInstallClick
                },
                className: 'cursor-pointer'
              })
            )}
            </ThemeProvider>
          </UserProvider>
        </body>
      </SupabaseProvider>
    </html>
  );
}
