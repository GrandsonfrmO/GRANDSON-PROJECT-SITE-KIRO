import Link from 'next/link';
import { Product } from '../types';
import { getImageUrl } from '../lib/imageOptimization';

interface ProductListViewProps {
  products: Product[];
}

export default function ProductListView({ products }: ProductListViewProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const images = Array.isArray(product.images) ? product.images : [];
        const rawImage = images.length > 0 ? images[0] : null;
        const firstImage = rawImage ? getImageUrl(rawImage, 'thumbnail') : null;

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block"
          >
            <article
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-200 hover:border-accent flex flex-col sm:flex-row"
              itemScope
              itemType="https://schema.org/Product"
            >
              {/* Image */}
              <div className="relative w-full sm:w-48 h-48 flex-shrink-0 bg-gradient-to-br from-neutral-100 to-neutral-200">
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    itemProp="image"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Stock Badge */}
                {product.stock < 5 && product.stock > 0 && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Stock limité
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg">
                      Rupture de stock
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className="text-xl font-bold text-neutral-900 group-hover:text-accent transition-colors"
                      itemProp="name"
                    >
                      {product.name}
                    </h3>
                    {product.isNew && (
                      <span className="bg-accent text-black text-xs font-bold px-2 py-1 rounded-full ml-2">
                        Nouveau
                      </span>
                    )}
                  </div>

                  <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </span>
                    {product.stock > 0 && (
                      <span className="text-green-600 text-xs font-semibold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        En stock ({product.stock})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <meta itemProp="priceCurrency" content="GNF" />
                    <meta itemProp="price" content={product.price.toString()} />
                    <meta
                      itemProp="availability"
                      content={
                        product.stock > 0
                          ? 'https://schema.org/InStock'
                          : 'https://schema.org/OutOfStock'
                      }
                    />
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-accent">
                        {product.price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-neutral-500 text-sm">GNF</span>
                    </div>
                  </div>

                  {product.stock > 0 && (
                    <button className="bg-accent hover:bg-green-500 text-black px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                      Voir les détails
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
