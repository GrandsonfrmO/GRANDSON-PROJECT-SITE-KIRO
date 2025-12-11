'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { generateBreadcrumbs } from '../lib/seoUtils';

export function BreadcrumbSEO() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200 py-4 px-4 md:px-6"
      >
        <div className="container mx-auto">
          <ol className="flex flex-wrap items-center gap-2 text-sm md:text-base">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.url} className="flex items-center gap-2">
                {index > 0 && (
                  <svg
                    className="w-4 h-4 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span
                    className="text-neutral-900 font-semibold"
                    aria-current="page"
                  >
                    {breadcrumb.name}
                  </span>
                ) : (
                  <Link
                    href={breadcrumb.url}
                    className="text-accent hover:text-accent/80 transition-colors font-medium"
                  >
                    {breadcrumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((breadcrumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: breadcrumb.name,
              item: `https://grandson-project.com${breadcrumb.url}`,
            })),
          }),
        }}
      />
    </>
  );
}
