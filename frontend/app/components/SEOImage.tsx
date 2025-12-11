'use client';

import Image from 'next/image';
import { ImgHTMLAttributes } from 'react';

interface SEOImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

export function SEOImage({
  src,
  alt,
  title,
  width,
  height,
  priority = false,
  loading = 'lazy',
  sizes,
  className,
  ...props
}: SEOImageProps) {
  // Ensure alt text is always present for SEO
  const finalAlt = alt || 'Image';

  if (!width || !height) {
    return (
      <img
        src={src}
        alt={finalAlt}
        title={title || finalAlt}
        loading={loading}
        className={className}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={finalAlt}
      title={title || finalAlt}
      width={width}
      height={height}
      priority={priority}
      loading={loading}
      sizes={sizes}
      className={className}
      {...props}
    />
  );
}

export function ResponsiveSEOImage({
  src,
  alt,
  title,
  className,
  ...props
}: SEOImageProps) {
  return (
    <picture>
      <source srcSet={`${src}?w=640&q=75&fm=webp`} type="image/webp" media="(max-width: 640px)" />
      <source srcSet={`${src}?w=1024&q=75&fm=webp`} type="image/webp" media="(max-width: 1024px)" />
      <source srcSet={`${src}?w=1920&q=75&fm=webp`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        title={title || alt}
        className={className}
        loading="lazy"
        {...props}
      />
    </picture>
  );
}
