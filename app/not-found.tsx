import Link from 'next/link';

import { FallbackScreen, fallbackActionClassName } from '@/components/fallback-screen';

export default function NotFound() {
  return (
    <FallbackScreen
      title="Page not found"
      description="This page does not exist."
      action={
        <Link href="/" className={fallbackActionClassName}>
          Back to home
        </Link>
      }
    />
  );
}
