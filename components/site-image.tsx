import type { ComponentPropsWithRef } from 'react';
import plan from '../revamp.images.json';
import generated from '../lib/revamp-images.generated.json';

type Placement = { src: string; sizes: string; loading: 'lazy' | 'eager' };
type Prepared = { src: string; srcSet?: string; width?: number; height?: number };
export type ImageName = keyof typeof plan.images;
type Props = Omit<ComponentPropsWithRef<'img'>, 'src' | 'srcSet' | 'sizes' | 'loading' | 'width' | 'height'> & {
  name: ImageName;
  alt: string;
};

/** The same prepared attributes work on img and motion.img without wrapping
 * the animation or inventing another image loader. */
export function siteImageProps(name: ImageName) {
  const placement = (plan.images as Record<string, Placement>)[name];
  if (!placement) throw new Error('Unknown image placement: ' + name + '. Register it with prepare_images.');
  const image = (generated as Record<string, Prepared>)[name];
  return {
    'data-revamp-image': name,
    src: image?.src ?? placement.src,
    srcSet: image?.srcSet,
    sizes: image?.srcSet ? placement.sizes : undefined,
    width: image?.width,
    height: image?.height,
    loading: placement.loading,
    fetchPriority: placement.loading === 'eager' ? 'high' as const : undefined,
    decoding: 'async' as const,
  };
}

/** Static responsive files; no image endpoint, client effect or paid transformation. */
export function SiteImage({ name, alt, ...props }: Props) {
  return <img {...props} {...siteImageProps(name)} alt={alt} />;
}
