import { Metadata } from 'next';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  author?: string;
}

export function generateSEOMetadata(props: SEOHeadProps): Metadata {
  const {
    title,
    description,
    image = 'https://grandson-project.com/og-image.jpg',
    url = 'https://grandson-project.com',
    type = 'website',
    keywords = [],
    author = 'Grandson Project',
  } = props;

  return {
    title: `${title} | Grandson Project`,
    description,
    keywords,
    authors: [{ name: author }],
    openGraph: {
      type,
      locale: 'fr_GN',
      url,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function StructuredData({
  type,
  data,
}: {
  type: 'Organization' | 'Product' | 'BreadcrumbList' | 'LocalBusiness';
  data: Record<string, any>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type,
          ...data,
        }),
      }}
    />
  );
}
