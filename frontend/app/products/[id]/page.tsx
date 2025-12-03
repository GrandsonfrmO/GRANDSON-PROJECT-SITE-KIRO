'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/types';
import Layout from '@/app/components/Layout';
import { useCart } from '@/app/context/CartContext';
import { transformProduct } from '@/app/lib/dataTransform';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (data.success && data.data?.product) {
          // Transformer le produit pour s'assurer que images/sizes sont des tableaux
          const prod = transformProduct(data.data.product);
          if (!prod) {
            setError('Produit non trouvé');
            return;
          }
          setProduct(prod);
          
          // Set default selections
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          }
          if (prod.colors && prod.colors.length > 0) {
            setSelectedColor(prod.colors[0]);
          }
        } else {
          setError('Produit non trouvé');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock === 0) {
      alert('Ce produit est en rupture de stock');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Veuillez sélectionner une taille');
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Veuillez sélectionner une couleur');
      return;
    }

    addToCart(product, selectedSize, quantity, selectedColor);

    // Show success message
    alert(`✅ ${product.name} ajouté au panier !`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-neutral-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
                <div className="h-24 bg-neutral-200 rounded"></div>
                <div className="h-12 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-3xl font-black text-neutral-900 mb-4">
            {error || 'Produit non trouvé'}
          </h2>
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            ← Retour aux produits
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-600">
          <button onClick={() => router.push('/')} className="hover:text-accent transition-colors">
            Accueil
          </button>
          <span>→</span>
          <button onClick={() => router.push('/products')} className="hover:text-accent transition-colors">
            Produits
          </button>
          <span>→</span>
          <span className="text-neutral-900 font-semibold">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden relative">
              {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Stock Badge */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-600 text-white text-lg font-black px-6 py-3 rounded-xl">
                    Rupture de stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-neutral-100 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-accent scale-105' : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 mb-2">
                {product.name}
              </h1>
              <p className="text-neutral-600 text-sm uppercase tracking-wide">
                {product.category}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-accent">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xl text-neutral-600">GNF</span>
            </div>

            {/* Description */}
            <div className="border-t border-b border-neutral-200 py-6">
              <p className="text-neutral-700 leading-relaxed">
                {product.description || 'Aucune description disponible.'}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">
                  Taille
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-accent text-black scale-105'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-3">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        selectedColor === color
                          ? 'bg-accent text-black scale-105'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-3">
                Quantité
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold text-xl transition-colors"
                  disabled={product.stock === 0}
                >
                  −
                </button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold text-xl transition-colors"
                  disabled={product.stock === 0}
                >
                  +
                </button>
                <span className="text-sm text-neutral-600">
                  {product.stock} disponible{product.stock > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                product.stock === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black hover:scale-105 active:scale-95'
              }`}
            >
              {product.stock === 0 ? '❌ Rupture de stock' : '🛒 Ajouter au panier'}
            </button>

            {/* Additional Info */}
            <div className="bg-neutral-50 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">🚚</span>
                <span className="text-neutral-700">Livraison disponible à Conakry</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">💳</span>
                <span className="text-neutral-700">Paiement à la livraison</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">✅</span>
                <span className="text-neutral-700">Produit authentique garanti</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
