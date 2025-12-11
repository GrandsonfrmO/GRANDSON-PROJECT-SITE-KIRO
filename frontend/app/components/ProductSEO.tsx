'use client';

import { Product } from '../types';

interface ProductSEOProps {
  product: Product;
}

export function ProductSEO({ product }: ProductSEOProps) {
  const productUrl = `https://grandson-project.com/products/${product.id}`;
  const imageUrl = product.images?.[0] || 'https://grandson-project.com/og-image.jpg';

  return (
    <>
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={`${product.name} - Grandson Project`} />
      <meta property="og:description" content={product.description} />
      <meta property="og:url" content={productUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Product-specific Meta Tags */}
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content="GNF" />
      <meta property="product:category" content={product.category} />
      <meta property="product:availability" content={product.isActive ? 'in stock' : 'out of stock'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="product" />
      <meta name="twitter:title" content={`${product.name} - Grandson Project`} />
      <meta name="twitter:description" content={product.description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data - Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.images || [imageUrl],
            brand: {
              '@type': 'Brand',
              name: 'Grandson Project',
            },
            offers: {
              '@type': 'Offer',
              url: productUrl,
              priceCurrency: 'GNF',
              price: product.price.toString(),
              availability: product.isActive
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
            category: product.category,
            sku: product.id,
          }),
        }}
      />
    </>
  );
}

export function ProductListSEO({ products }: { products: Product[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Tous nos Produits',
          description: 'Collection complète de streetwear premium Grandson Project',
          url: 'https://grandson-project.com/products',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: products.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://grandson-project.com/products/${product.id}`,
              name: product.name,
              image: product.images?.[0],
              description: product.description,
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'GNF',
              },
            })),
          },
        }),
      }}
    />
  );
}
