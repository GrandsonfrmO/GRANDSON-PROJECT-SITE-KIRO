/**
 * Schema.org JSON-LD Generator
 * Generates structured data for better SEO
 */

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Grandson Project',
    url: 'https://grandson-project.com',
    logo: 'https://grandson-project.com/logo.png',
    description: 'Streetwear premium guinéen avec designs uniques et qualité exceptionnelle',
    sameAs: [
      'https://www.facebook.com/grandsonproject',
      'https://www.instagram.com/grandsonproject',
      'https://www.twitter.com/grandsonproject',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+224-XXX-XXX-XXX',
      email: 'contact@grandson-project.com',
      areaServed: 'GN',
      availableLanguage: ['fr'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Conakry',
      addressLocality: 'Conakry',
      addressCountry: 'GN',
    },
  };
}

export function generateProductSchema(product: {
  id: string;
  name: string;
  description: string;
  image: string | string[];
  price: number;
  currency?: string;
  category?: string;
  sku?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  const {
    id,
    name,
    description,
    image,
    price,
    currency = 'GNF',
    category,
    sku = id,
    availability = 'InStock',
    rating,
  } = product;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    brand: {
      '@type': 'Brand',
      name: 'Grandson Project',
    },
    offers: {
      '@type': 'Offer',
      url: `https://grandson-project.com/products/${id}`,
      priceCurrency: currency,
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'Grandson Project',
      },
    },
    sku,
    category,
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.ratingValue,
        reviewCount: rating.reviewCount,
      },
    }),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Grandson Project',
    image: 'https://grandson-project.com/logo.png',
    description: 'Streetwear premium guinéen',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Conakry',
      addressLocality: 'Conakry',
      addressCountry: 'GN',
    },
    telephone: '+224-XXX-XXX-XXX',
    email: 'contact@grandson-project.com',
    url: 'https://grandson-project.com',
    sameAs: [
      'https://www.facebook.com/grandsonproject',
      'https://www.instagram.com/grandsonproject',
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  content: string;
}) {
  const {
    title,
    description,
    image,
    datePublished,
    dateModified = datePublished,
    author = 'Grandson Project',
    content,
  } = article;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image,
    datePublished,
    dateModified,
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grandson Project',
      logo: {
        '@type': 'ImageObject',
        url: 'https://grandson-project.com/logo.png',
      },
    },
    articleBody: content,
  };
}

export function generateCollectionPageSchema(collection: {
  name: string;
  description: string;
  url: string;
  items: Array<{
    name: string;
    url: string;
    image: string;
    price: number;
  }>;
}) {
  const { name, description, url, items } = collection;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
        image: item.image,
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'GNF',
        },
      })),
    },
  };
}

export function generateAggregateOfferSchema(offers: Array<{ price: number; availability: string }>) {
  const prices = offers.map((o) => o.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    priceCurrency: 'GNF',
    lowPrice: minPrice.toString(),
    highPrice: maxPrice.toString(),
    offerCount: offers.length,
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      price: offer.price,
      availability: `https://schema.org/${offer.availability}`,
    })),
  };
}
