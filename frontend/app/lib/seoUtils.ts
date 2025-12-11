/**
 * SEO Utilities for optimizing content
 */

export function generateMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grandson-project.com';
  return `${baseUrl}${path}`;
}

export function generateOGImage(
  title: string,
  subtitle?: string,
  imageUrl?: string
): string {
  const params = new URLSearchParams({
    title,
    ...(subtitle && { subtitle }),
    ...(imageUrl && { image: imageUrl }),
  });
  return `https://grandson-project.com/api/og?${params.toString()}`;
}

export function generateKeywords(
  baseKeywords: string[],
  category?: string,
  productName?: string
): string[] {
  const keywords = [...baseKeywords];
  
  if (category) {
    keywords.push(category);
    keywords.push(`${category} guinée`);
    keywords.push(`${category} streetwear`);
  }
  
  if (productName) {
    keywords.push(productName);
    keywords.push(`${productName} prix`);
    keywords.push(`acheter ${productName}`);
  }
  
  keywords.push('Grandson Project');
  keywords.push('streetwear guinéen');
  keywords.push('mode urbaine');
  
  return [...new Set(keywords)];
}

export function generateBreadcrumbs(
  pathname: string
): Array<{ name: string; url: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Accueil', url: '/' }];

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({ name, url: currentPath });
  });

  return breadcrumbs;
}

export const SEO_CONFIG = {
  siteName: 'Grandson Project',
  siteUrl: 'https://grandson-project.com',
  locale: 'fr_GN',
  defaultImage: 'https://grandson-project.com/og-image.jpg',
  twitterHandle: '@grandsonproject',
  businessName: 'Grandson Project',
  businessPhone: '+224 XXX XXX XXX',
  businessEmail: 'contact@grandson-project.com',
  businessAddress: 'Conakry, Guinée',
};
