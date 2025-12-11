'use client';

interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
}

interface ProductSchema {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  brand: string;
  sku?: string;
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface BreadcrumbSchema {
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export function OrganizationSchema({ data }: { data: OrganizationSchema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: data.name,
          url: data.url,
          logo: data.logo,
          description: data.description,
          sameAs: data.sameAs || [],
          contactPoint: data.contactPoint,
        }),
      }}
    />
  );
}

export function ProductSchema({ data }: { data: ProductSchema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.image,
          brand: {
            '@type': 'Brand',
            name: data.brand,
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: data.currency,
            availability: `https://schema.org/${data.availability}`,
          },
          sku: data.sku,
          aggregateRating: data.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: data.rating.ratingValue,
                reviewCount: data.rating.reviewCount,
              }
            : undefined,
        }),
      }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbSchema['itemListElement'] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items,
        }),
      }}
    />
  );
}

export function LocalBusinessSchema({
  name,
  address,
  phone,
  email,
}: {
  name: string;
  address: string;
  phone: string;
  email: string;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'GN',
            addressLocality: 'Conakry',
            streetAddress: address,
          },
          telephone: phone,
          email,
          url: 'https://grandson-project.com',
        }),
      }}
    />
  );
}
