/**
 * Open Graph Configuration
 * Centralized OG metadata for social sharing
 */

export const OG_CONFIG = {
  siteName: 'Grandson Project',
  siteUrl: 'https://grandson-project.com',
  locale: 'fr_GN',
  defaultImage: 'https://grandson-project.com/og-image.jpg',
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
  twitterHandle: '@grandsonproject',
  twitterCardType: 'summary_large_image',
};

export function generateOGTags(metadata: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  const {
    title,
    description,
    image = OG_CONFIG.defaultImage,
    url = OG_CONFIG.siteUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
  } = metadata;

  return {
    'og:type': type,
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:image': image,
    'og:image:width': OG_CONFIG.defaultImageWidth.toString(),
    'og:image:height': OG_CONFIG.defaultImageHeight.toString(),
    'og:site_name': OG_CONFIG.siteName,
    'og:locale': OG_CONFIG.locale,
    ...(type === 'article' && {
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:author': author,
    }),
  };
}

export function generateTwitterTags(metadata: {
  title: string;
  description: string;
  image?: string;
  creator?: string;
}) {
  const {
    title,
    description,
    image = OG_CONFIG.defaultImage,
    creator = OG_CONFIG.twitterHandle,
  } = metadata;

  return {
    'twitter:card': OG_CONFIG.twitterCardType,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:creator': creator,
    'twitter:site': OG_CONFIG.twitterHandle,
  };
}
