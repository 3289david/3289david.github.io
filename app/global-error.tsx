'use client';

import { useEffect } from 'react';

import { FallbackScreen, fallbackActionClassName } from '@/components/fallback-screen';
import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';
import './navigation.css';

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <title>Something went wrong</title>
          <FallbackScreen
            title="Something went wrong"
            description="The site could not render this page."
            action={
              <button type="button" onClick={() => retry()} className={fallbackActionClassName}>
                Try again
              </button>
            }
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
