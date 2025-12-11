'use client';

import Head from 'next/head';

interface DynamicMetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  canonicalUrl?: string;
}

export function DynamicMetaTags({
  title,
  description,
  image = 'https://grandson-project.com/og-image.jpg',
  url = 'https://grandson-project.com',
  type = 'website',
  keywords = [],
  author = 'Grandson Project',
  publishedDate,
  modifiedDate,
  canonicalUrl,
}: DynamicMetaTagsProps) {
  const fullTitle = `${title} | Grandson Project`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Grandson Project" />
      <meta property="og:locale" content="fr_GN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@grandsonproject" />

      {/* Article Meta Tags (if applicable) */}
      {type === 'article' && (
        <>
          {publishedDate && (
            <meta property="article:published_time" content={publishedDate} />
          )}
          {modifiedDate && (
            <meta property="article:modified_time" content={modifiedDate} />
          )}
          <meta property="article:author" content={author} />
          <meta property="article:section" content="Blog" />
        </>
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  );
}
