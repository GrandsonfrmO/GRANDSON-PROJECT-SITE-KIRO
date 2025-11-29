'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/app/components/Layout';
import Toast from '@/app/components/Toast';
import { Product } from '@/app/types';
import { useCart } from '@/app/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        const productData = data.data?.product || data.product || data;
        setProduct(productData);
        
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
      } catch (err) {
        setError('Impossible de charger le produit');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setToast({ message: 'Veuillez sélectionner une taille', type: 'warning' });
      return;
    }
    
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setToast({ message: 'Veuillez sélectionner une couleur', type: 'warning' });
      return;
    }
    
    if (!product || product.stock === 0) {
      setToast({ message: 'Produit non disponible', type: 'error' });
      return;
    }

    addToCart(product, selectedSize, quantity, selectedColor);
    
    let message = `${quantity} produit(s) ajouté(s) au panier!`;
    if (selectedColor) message += ` (Couleur: ${selectedColor})`;
    if (selectedSize) message += ` (Taille: ${selectedSize})`;
    
    setToast({ message, type: 'success' });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Fonction pour obtenir la couleur hexadécimale à partir du nom
  const getColorHex = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      // Couleurs de base
      'noir': '#000000',
      'blanc': '#FFFFFF',
      'rouge': '#DC2626',
      'bleu': '#2563EB',
      'vert': '#16A34A',
      'jaune': '#EAB308',
      'orange': '#EA580C',
      'violet': '#9333EA',
      'rose': '#EC4899',
      'gris': '#6B7280',
      'marron': '#92400E',
      'beige': '#D2B48C',
      
      // Couleurs streetwear populaires
      'navy': '#1E3A8A',
      'olive': '#65A30D',
      'burgundy': '#991B1B',
      'cream': '#FEF3C7',
      'charcoal': '#374151',
      'khaki': '#A3A3A3',
      'coral': '#F97316',
      'teal': '#0D9488',
      'lavender': '#A78BFA',
      'mint': '#6EE7B7',
      
      // Couleurs tendance
      'sage': '#84CC16',
      'dusty-pink': '#F9A8D4',
      'forest': '#166534',
      'sand': '#FDE68A',
      'slate': '#475569',
      'wine': '#7C2D12',
      'powder-blue': '#BFDBFE',
      'mustard': '#F59E0B',
      'plum': '#7C3AED',
      'copper': '#EA580C'
    };
    
    return colorMap[colorName.toLowerCase()] || '#6B7280'; // Gris par défaut
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Image Skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-3xl"></div>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-neutral-200 rounded-2xl"></div>
                  ))}
                </div>
              </div>
              
              {/* Info Skeleton */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 rounded-lg w-32"></div>
                  <div className="h-10 bg-neutral-200 rounded-lg w-3/4"></div>
                  <div className="h-8 bg-neutral-200 rounded-lg w-1/2"></div>
                </div>
                <div className="h-24 bg-neutral-200 rounded-2xl"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-neutral-200 rounded-lg w-24"></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-neutral-200 rounded-xl"></div>
                    ))}
                  </div>
                </div>
                <div className="h-16 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-2xl"></div>
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
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-8xl mb-8 animate-bounce">😵</div>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6">
              <span className="bg-gradient-to-r from-accent to-red-500 bg-clip-text text-transparent">
                Oups !
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
              {error || 'Ce produit n\'existe pas ou n\'est plus disponible dans notre collection streetwear.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0l-4-4m4 4l-4 4" />
                </svg>
                Voir tous les produits
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center gap-3 bg-transparent hover:bg-neutral-100 text-neutral-700 px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 border-2 border-neutral-300 hover:border-accent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Modern Breadcrumb */}
        <nav className="flex items-center space-x-3 text-sm mb-8 animate-fade-in-up">
          <Link 
            href="/" 
            className="text-neutral-600 hover:text-accent transition-colors font-semibold"
          >
            Accueil
          </Link>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link 
            href="/products" 
            className="text-neutral-600 hover:text-accent transition-colors font-semibold"
          >
            Produits
          </Link>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-accent font-bold">{product.category}</span>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 font-black">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Enhanced Images Section */}
          <div className="space-y-6 animate-fade-in-up delay-200">
            {/* Main Image with Modern Design */}
            <div className="relative group">
              <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                {product.images[selectedImageIndex] ? (
                  <img 
                    src={product.images[selectedImageIndex]} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg 
                      className="w-24 h-24 text-neutral-400" 
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
                
                {/* Overlay Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Stock Badge */}
                {product.stock > 0 ? (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg animate-pulse">
                    ✓ En Stock ({product.stock})
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-lg font-black px-8 py-4 rounded-2xl shadow-2xl">
                      Rupture de Stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`group aspect-square rounded-2xl overflow-hidden border-3 transition-all duration-300 hover:scale-105 ${
                      selectedImageIndex === index
                        ? 'border-accent shadow-lg shadow-accent/25'
                        : 'border-neutral-200 hover:border-accent/50 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Product Info */}
          <div className="space-y-8 animate-fade-in-up delay-400">
            {/* Header Section */}
            <div className="space-y-4">
              {/* Category Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-block bg-gradient-to-r from-accent/20 to-green-500/20 border border-accent/30 text-accent px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider">
                  {product.category}
                </span>
                {product.stock < 5 && product.stock > 0 && (
                  <span className="inline-block bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider animate-pulse">
                    🔥 Stock Limité
                  </span>
                )}
              </div>
              
              {/* Product Name */}
              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
                <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent">
                  {product.name}
                </span>
              </h1>
              
              {/* Price */}
              <div className="flex items-baseline gap-3">
                <p className="text-4xl md:text-5xl font-black text-accent">
                  {product.price.toLocaleString()}
                </p>
                <span className="text-xl font-bold text-neutral-600 uppercase tracking-wide">GNF</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-gradient-to-br from-neutral-50 to-white p-6 rounded-2xl border border-neutral-200 shadow-lg">
                <h3 className="font-black text-neutral-900 mb-3 text-lg uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-neutral-700 leading-relaxed text-lg">{product.description}</p>
              </div>
            )}

            {/* Colors Selection - Glass Effect */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3 md:space-y-4 bg-white/70 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/40 shadow-2xl shadow-black/5">
                <label className="block text-base md:text-xl font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-1.5 md:w-2 h-6 md:h-8 bg-gradient-to-b from-accent to-green-500 rounded-full"></span>
                  Choisir la Couleur
                </label>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative flex items-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-5 border rounded-xl md:rounded-2xl transition-all duration-300 active:scale-95 md:hover:scale-105 shadow-lg ${
                        selectedColor === color
                          ? 'border-accent/50 bg-accent/10 backdrop-blur-md shadow-accent/30 scale-95 md:scale-105'
                          : 'border-white/60 bg-white/50 backdrop-blur-md hover:border-accent/40 hover:bg-white/70 hover:shadow-xl'
                      }`}
                    >
                      {/* Color Circle */}
                      <div 
                        className={`w-8 md:w-10 h-8 md:h-10 rounded-full border-2 md:border-3 shadow-xl transition-all duration-300 ${
                          selectedColor === color ? 'border-white shadow-accent/50 scale-110' : 'border-neutral-400'
                        }`}
                        style={{ backgroundColor: getColorHex(color) }}
                      >
                        {selectedColor === color && (
                          <div className="w-full h-full rounded-full flex items-center justify-center bg-black/20">
                            <svg className="w-4 md:w-5 h-4 md:h-5 text-white drop-shadow-2xl" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Color Name */}
                      <span className={`font-black uppercase tracking-wide text-sm md:text-base ${
                        selectedColor === color ? 'text-accent' : 'text-neutral-800'
                      }`}>
                        {color}
                      </span>
                      
                      {/* Selection Glow Effect */}
                      {selectedColor === color && (
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-green-500/30 rounded-xl md:rounded-2xl blur-md"></div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Selected Color Display - Mobile Responsive */}
                {selectedColor && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 p-3 md:p-5 bg-accent/5 backdrop-blur-md rounded-xl md:rounded-2xl border border-accent/20 shadow-lg">
                    <span className="text-sm md:text-base font-black text-neutral-800 uppercase tracking-wide">Couleur sélectionnée:</span>
                    <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg md:rounded-xl border border-accent/30 shadow-md">
                      <div 
                        className="w-6 md:w-8 h-6 md:h-8 rounded-full border-2 md:border-3 border-white shadow-xl"
                        style={{ backgroundColor: getColorHex(selectedColor) }}
                      ></div>
                      <span className="font-black text-accent uppercase text-base md:text-lg">{selectedColor}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sizes Selection - Glass Effect */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 md:space-y-4 bg-white/70 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/40 shadow-2xl shadow-black/5">
                <label className="block text-base md:text-xl font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-1.5 md:w-2 h-6 md:h-8 bg-gradient-to-b from-accent to-green-500 rounded-full"></span>
                  Choisir la Taille
                </label>
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 md:py-5 px-2 md:px-4 border rounded-xl md:rounded-2xl text-center font-black uppercase tracking-wide transition-all duration-300 active:scale-95 md:hover:scale-110 shadow-lg text-base md:text-lg ${
                        selectedSize === size
                          ? 'border-accent/50 bg-gradient-to-br from-accent/90 to-green-500/90 backdrop-blur-sm text-black shadow-accent/50 scale-95 md:scale-105'
                          : 'border-white/60 bg-white/50 backdrop-blur-md hover:border-accent/40 hover:bg-white/70 text-neutral-800 hover:shadow-xl'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector - Glass Effect */}
            <div className="space-y-3 md:space-y-4 bg-white/70 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/40 shadow-2xl shadow-black/5">
              <label className="block text-base md:text-xl font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 md:w-2 h-6 md:h-8 bg-gradient-to-b from-accent to-green-500 rounded-full"></span>
                Quantité
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <div className="flex items-center bg-white/60 backdrop-blur-md border border-white/60 rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-12 md:w-16 h-12 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-black text-neutral-800 active:bg-accent hover:bg-accent hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    −
                  </button>
                  <span className="w-16 md:w-24 text-center font-black text-2xl md:text-3xl text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock || 1)}
                    className="w-12 md:w-16 h-12 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-black text-neutral-800 active:bg-accent hover:bg-accent hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    +
                  </button>
                </div>
                
                <div className="flex-1 bg-accent/10 backdrop-blur-md p-4 md:p-5 rounded-xl md:rounded-2xl border border-accent/20 shadow-lg">
                  <div className="text-xs md:text-sm font-black text-neutral-800 uppercase tracking-wide mb-1 md:mb-2">Total</div>
                  <div className="text-2xl md:text-3xl font-black text-accent">
                    {(product.price * quantity).toLocaleString()} GNF
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`group relative w-full py-6 px-8 rounded-2xl font-black uppercase tracking-wide text-lg transition-all duration-300 shadow-xl hover:shadow-2xl ${
                  product.stock === 0
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black hover:scale-105 active:scale-95'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {product.stock === 0 ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      Produit Épuisé
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Ajouter au Panier
                    </>
                  )}
                </span>
                
                {product.stock > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-accent rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-bold text-green-700 uppercase">Qualité Premium</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-xs font-bold text-blue-700 uppercase">Livraison Rapide</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-bold text-purple-700 uppercase">Garantie</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Products Button */}
        <div className="text-center mt-16">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-neutral-900 to-black hover:from-black hover:to-neutral-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voir Plus de Produits
          </Link>
        </div>
      </div>
    </Layout>
  );
}