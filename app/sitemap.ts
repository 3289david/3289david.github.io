import type { MetadataRoute } from 'next';

import { publicRoutes } from '@/lib/public-routes';
import { siteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await siteUrl();

  return publicRoutes.map((path) => ({
    url: path === '/' ? base : base + path,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.7,
  }));
}
