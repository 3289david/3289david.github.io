import { headers } from 'next/headers';

export async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.endsWith('/') ? configured.slice(0, -1) : configured;
  }

  const incoming = await headers();
  const host = incoming.get('x-forwarded-host') ?? incoming.get('host');
  if (host) {
    const forwardedProtocol = incoming.get('x-forwarded-proto');
    const protocol = forwardedProtocol === 'http' ? 'http' : 'https';
    return protocol + '://' + host;
  }

  return 'http://localhost:3000';
}
