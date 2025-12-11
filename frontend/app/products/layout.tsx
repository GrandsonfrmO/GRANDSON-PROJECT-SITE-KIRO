import { Metadata } from 'next';
import { generateSEOMetadata } from '../components/SEOHead';

export const metadata: Metadata = {
  title: 'Tous nos Produits - Streetwear Premium | Grandson Project',
  description: 'Découvrez notre collection complète de streetwear premium. Designs uniques, qualité exceptionnelle et livraison rapide en Guinée.',
  keywords: ['streetwear', 'vêtements urbains', 'mode premium', 'Grandson Project', 'collection complète'],
  openGraph: {
    title: 'Tous nos Produits - Grandson Project',
    description: 'Collection complète de streetwear premium',
    type: 'website',
    url: 'https://grandson-project.com/products',
    images: [
      {
        url: 'https://grandson-project.com/og-products.jpg',
        width: 1200,
        height: 630,
        alt: 'Collection de produits Grandson Project',
      },
    ],
  },
  alternates: {
    canonical: 'https://grandson-project.com/products',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
