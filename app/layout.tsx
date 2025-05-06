'use client';

import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { SupabaseProvider } from '@/providers/supabase-provider';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

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
      setShowInstall(true);
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
    }
  };

  return (
    <html lang="en" className={`${geistSans.className} antialiased`} suppressHydrationWarning>
      <head>
        <title>CyberSculpt</title>
        <meta name="description" content="The fastest way to improve your health." />
        <meta property="og:url" content={defaultUrl} />
        <link rel="canonical" href={defaultUrl} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <SupabaseProvider>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main>{children}</main>
            <Toaster position="top-center" richColors />
            {showInstall && (
              <Dialog open={showInstall} onOpenChange={setShowInstall}>
                <DialogContent className="fixed m-auto h-fit max-h-[90vh] w-[90vw] max-w-md rounded-lg z-50 overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Install CyberSculpt</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <p>Add CyberSculpt to your home screen for a better experience!</p>
                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">Later</Button>
                      </DialogClose>
                      <Button onClick={handleInstallClick}>Install</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </ThemeProvider>
        </body>
      </SupabaseProvider>
    </html>
  );
}
