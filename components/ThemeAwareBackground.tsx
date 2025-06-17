'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Threads from "@/components/ui/Backgrounds/Threads/Threads";

export default function ThemeAwareBackground() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed -inset-y-40 -z-10 h-screen w-full" />
    );
  }

  return (
    <div className="fixed -inset-y-40 -z-10 h-screen w-full">
      {/* {theme === 'dark' ? (
        <Threads color={[0.6, 0.2, 0.8]} amplitude={0.3} distance={0.2} enableMouseInteraction={false} />
      ) : null} */}
    </div>
  );
}
