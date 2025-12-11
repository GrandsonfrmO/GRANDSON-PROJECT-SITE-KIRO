/**
 * SEO Performance Optimization
 * Core Web Vitals and performance metrics
 */

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
}

export const PERFORMANCE_THRESHOLDS = {
  lcp: {
    good: 2500, // 2.5s
    needsImprovement: 4000, // 4s
  },
  fid: {
    good: 100, // 100ms
    needsImprovement: 300, // 300ms
  },
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  ttfb: {
    good: 600, // 600ms
    needsImprovement: 1800, // 1.8s
  },
  fcp: {
    good: 1800, // 1.8s
    needsImprovement: 3000, // 3s
  },
};

export function reportWebVitals(metric: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'web_vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function getPerformanceStatus(metric: string, value: number): 'good' | 'needsImprovement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
  
  if (!threshold) return 'poor';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needsImprovement';
  return 'poor';
}

export function optimizeImageForSEO(imageUrl: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
}): string {
  const { width = 1200, height = 630, quality = 75, format = 'webp' } = options || {};
  
  // For Cloudinary URLs
  if (imageUrl.includes('cloudinary.com')) {
    return `${imageUrl}?w=${width}&h=${height}&q=${quality}&f_auto&c_fill`;
  }
  
  // For Supabase URLs
  if (imageUrl.includes('supabase.co')) {
    return `${imageUrl}?width=${width}&height=${height}&quality=${quality}`;
  }
  
  return imageUrl;
}

export function generateImageSrcSet(baseUrl: string, sizes: number[] = [640, 1024, 1920]): string {
  return sizes
    .map((size) => `${optimizeImageForSEO(baseUrl, { width: size })} ${size}w`)
    .join(', ');
}

export function generateImageSizes(breakpoints?: { mobile?: string; tablet?: string; desktop?: string }): string {
  const defaults = {
    mobile: '(max-width: 640px) 100vw',
    tablet: '(max-width: 1024px) 90vw',
    desktop: '80vw',
  };
  
  const final = { ...defaults, ...breakpoints };
  return `${final.mobile}, ${final.tablet}, ${final.desktop}`;
}

export const SEO_PERFORMANCE_TIPS = {
  images: [
    'Use Next.js Image component for automatic optimization',
    'Provide width and height to prevent layout shift',
    'Use srcSet for responsive images',
    'Compress images before upload',
    'Use WebP format with fallbacks',
    'Add descriptive alt text',
  ],
  fonts: [
    'Use system fonts or Google Fonts with font-display: swap',
    'Limit font weights to 2-3 per family',
    'Preload critical fonts',
    'Use variable fonts when possible',
  ],
  css: [
    'Minimize CSS bundle size',
    'Use CSS-in-JS sparingly',
    'Defer non-critical CSS',
    'Use CSS Grid and Flexbox',
  ],
  javascript: [
    'Code split with dynamic imports',
    'Lazy load non-critical components',
    'Use React.memo for expensive components',
    'Minimize third-party scripts',
    'Use web workers for heavy computations',
  ],
  html: [
    'Use semantic HTML',
    'Minimize DOM depth',
    'Avoid inline styles',
    'Use data attributes for styling',
  ],
};

export function generatePerformanceReport(metrics: Partial<CoreWebVitals>) {
  const report: Record<string, any> = {};
  
  Object.entries(metrics).forEach(([key, value]) => {
    if (value !== undefined) {
      report[key] = {
        value,
        status: getPerformanceStatus(key, value),
        threshold: PERFORMANCE_THRESHOLDS[key as keyof typeof PERFORMANCE_THRESHOLDS],
      };
    }
  });
  
  return report;
}
