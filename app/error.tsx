'use client';

import { useEffect } from 'react';

import { FallbackScreen, fallbackActionClassName } from '@/components/fallback-screen';

export default function Error({
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
    <FallbackScreen
      title="Something went wrong"
      description="This page could not be rendered."
      action={
        <button type="button" onClick={() => retry()} className={fallbackActionClassName}>
          Try again
        </button>
      }
    />
  );
}
