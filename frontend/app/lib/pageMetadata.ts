/**
 * Page Metadata Configuration
 * Centralized metadata for all pages
 */

export const pageMetadata = {
  home: {
    title: 'Streetwear Guinéen Premium',
    description: 'Découvrez la collection exclusive de streetwear guinéen Grandson Project. Mode urbaine de qualité avec designs uniques et livraison rapide en Guinée.',
    keywords: [
      'streetwear guinéen',
      'mode urbaine',
      'vêtements premium',
      'Grandson Project',
      'fashion guinée',
      'streetwear Conakry',
      'mode Guinée',
    ],
    url: 'https://grandson-project.com',
    type: 'website' as const,
  },
  products: {
    title: 'Tous nos Produits',
    description: 'Découvrez notre collection complète de streetwear premium. Designs uniques, qualité exceptionnelle et livraison rapide en Guinée.',
    keywords: [
      'streetwear',
      'vêtements urbains',
      'mode premium',
      'Grandson Project',
      'collection complète',
      'acheter streetwear',
      'vêtements Guinée',
    ],
    url: 'https://grandson-project.com/products',
    type: 'website' as const,
  },
  checkout: {
    title: 'Panier & Commande',
    description: 'Finalisez votre commande de streetwear premium. Paiement sécurisé et livraison rapide en Guinée.',
    keywords: [
      'panier',
      'commande',
      'paiement',
      'livraison',
      'Grandson Project',
    ],
    url: 'https://grandson-project.com/checkout',
    type: 'website' as const,
  },
  personnalisation: {
    title: 'Personnalisation',
    description: 'Créez votre propre design de streetwear. Personnalisez vos vêtements avec Grandson Project.',
    keywords: [
      'personnalisation',
      'custom',
      'design',
      'vêtements personnalisés',
      'Grandson Project',
    ],
    url: 'https://grandson-project.com/personnalisation',
    type: 'website' as const,
  },
  contact: {
    title: 'Nous Contacter',
    description: 'Contactez Grandson Project pour toute question ou demande. Support client disponible.',
    keywords: [
      'contact',
      'support',
      'aide',
      'Grandson Project',
      'Guinée',
    ],
    url: 'https://grandson-project.com/contact',
    type: 'website' as const,
  },
};

export function getPageMetadata(page: keyof typeof pageMetadata) {
  return pageMetadata[page] || pageMetadata.home;
}

export function generateProductMetadata(
  productName: string,
  category: string,
  price: number
) {
  return {
    title: `${productName} - Streetwear Premium`,
    description: `Découvrez ${productName} de Grandson Project. Catégorie: ${category}. Prix: ${price} GNF. Livraison rapide en Guinée.`,
    keywords: [
      productName,
      category,
      'streetwear',
      'Grandson Project',
      `${productName} prix`,
      `acheter ${productName}`,
      'vêtements Guinée',
    ],
    type: 'product' as const,
  };
}

export function generateCategoryMetadata(categoryName: string, productCount: number) {
  return {
    title: `${categoryName} - Streetwear Premium`,
    description: `Découvrez notre collection de ${categoryName}. ${productCount} produits disponibles. Designs uniques et qualité premium.`,
    keywords: [
      categoryName,
      'streetwear',
      'vêtements urbains',
      'Grandson Project',
      `${categoryName} Guinée`,
      `${categoryName} prix`,
    ],
    type: 'website' as const,
  };
}
