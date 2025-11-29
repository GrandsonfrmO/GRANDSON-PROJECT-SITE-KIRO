 'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/app/components/Layout';
import Toast from '@/app/components/Toast';
import OptimizedImage from '@/app/components/OptimizedImage';
import ParticleBackground from '@/app/components/ParticleBackground';
import { Product } from '@/app/types';
import api from '@/app/lib/api';
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
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [productResponse, allProductsResponse] = await Promise.all([
          api.get(`/api/products/${params.id}`),
          api.get('/api/products')
        ]);
        
        const productData = productResponse.data?.product || productResponse.product || productResponse;
        setProduct(productData);
        
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        const allProducts = allProductsResponse.data?.products || allProductsResponse.products || [];
        const related = allProducts
          .filter((p: Product) => p.id !== productData.id && p.category === productData.category && p.isActive)
          .slice(0, 4);
        setRelatedProducts(related);
        
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

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getColorName = (colorValue: string): string => {
    const colorMap: { [key: string]: string } = {
      '#000000': 'Noir', '#FFFFFF': 'Blanc', '#FF0000': 'Rouge',
      '#00FF00': 'Vert', '#0000FF': 'Bleu', '#FFFF00': 'Jaune',
      '#FFA500': 'Orange', '#FFC0CB': 'Rose', '#800080': 'Violet'
    };
    return colorMap[colorValue.toUpperCase()] || colorValue;
  };

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
    
    if (!product || product.stock === 0) {
      setToast({ message: 'Produit non disponible', type: 'error' });
      return;
    }

    addToCart(product, selectedSize, quantity);
    setToast({ message: `${quantity} produit(s) ajouté(s) au panier!`, type: 'success' });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleImageZoom = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  if (loading) {
    return (
      <Layout>
        <ParticleBackground />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-neutral-800">
          <div className="relative">
            {/* Animated loading rings */}
            <div className="w-32 h-32 relative">
              <div className="absolute inset-0 rounded-full border-4 border-accent/30 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-green-500/30 animate-spin animate-reverse"></div>
              <div className="absolute inset-4 rounded-full border-4 border-white/30 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-2xl font-black animate-pulse">⚡</div>
            </div>
            <div className="text-center mt-8">
              <div className="text-white text-xl font-black mb-2">Chargement...</div>
              <div className="text-neutral-400">Préparation de l'expérience</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <ParticleBackground />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900/20 via-black to-neutral-800">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-9xl mb-8 animate-bounce">💥</div>
            <h1 className="text-4xl font-black text-white mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              {error || 'Produit introuvable'}
            </h1>
            <p className="text-neutral-300 mb-8 text-lg">
              Ce produit semble avoir disparu dans une autre dimension...
            </p>
            <Link 
              href="/" 
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-accent via-green-500 to-accent hover:from-green-500 hover:via-accent hover:to-green-500 text-black px-8 py-4 rounded-3xl font-black uppercase tracking-wide transition-all duration-500 shadow-2xl hover:shadow-accent/50 hover:scale-110 transform-gpu"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la réalité
            </Link>
          </div>
        </div>
      </Layout>
    );
  } 
 return (
    <Layout>
      <ParticleBackground />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Ultra-Modern Hero Section with 3D Effects */}
      <div className="relative min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div 
            className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{
              left: `${mousePosition.x * 0.01}px`,
              top: `${mousePosition.y * 0.01}px`,
            }}
          ></div>
          <div 
            className="absolute w-64 h-64 bg-green-500/10 rounded-full blur-2xl animate-pulse delay-1000"
            style={{
              right: `${mousePosition.x * 0.005}px`,
              bottom: `${mousePosition.y * 0.005}px`,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </div>

        {/* Floating Navigation */}
        <div className="relative z-20 container mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
              <Link href="/" className="text-white/70 hover:text-accent transition-colors font-medium">
                🏠 Accueil
              </Link>
              <div className="w-1 h-4 bg-white/30 rounded-full"></div>
              <span className="text-white/50 font-medium">{product.category}</span>
              <div className="w-1 h-4 bg-white/30 rounded-full"></div>
              <span className="text-accent font-bold">{product.name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Main Product Showcase */}
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
            {/* Revolutionary Image Gallery */}
            <div className="relative">
              {/* Floating Status Indicators */}
              <div className="absolute -top-6 -right-6 z-30 flex flex-col gap-3">
                {product.stock > 0 && product.stock < 5 && (
                  <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-2xl animate-bounce">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                      🔥 Dernières pièces !
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-accent/20 to-green-500/20 backdrop-blur-xl border border-accent/30 text-accent px-4 py-2 rounded-2xl text-sm font-black">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                    ✨ Exclusif
                  </div>
                </div>
              </div>

              {/* Main Image with Advanced 3D Effects */}
              <div className="relative group perspective-1000">
                <div 
                  ref={imageRef}
                  className={`relative aspect-square overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-[3rem] shadow-2xl transition-all duration-1000 cursor-zoom-in border border-white/20 transform-gpu ${
                    isImageZoomed ? 'scale-110 rotate-y-12 shadow-4xl' : 'hover:scale-105 hover:rotate-y-6 hover:shadow-3xl'
                  }`}
                  onClick={handleImageZoom}
                  style={{
                    transform: `perspective(1000px) rotateY(${mousePosition.x * 0.01}deg) rotateX(${mousePosition.y * -0.01}deg)`,
                  }}
                >
                  {/* Holographic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem]"></div>
                  
                  {/* Scan Lines Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 animate-scan rounded-[3rem]"></div>
                  
                  <OptimizedImage
                    src={product.images[selectedImageIndex] || ''}
                    alt={product.name}
                    size="detail"
                    fill
                    className={`object-cover transition-all duration-1000 rounded-[3rem] ${
                      isImageZoomed ? 'scale-150' : 'group-hover:scale-110'
                    }`}
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={95}
                  />

                  {/* Interactive Hotspots */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-accent rounded-full animate-ping"></div>
                    <div className="absolute top-3/4 right-1/3 w-4 h-4 bg-green-500 rounded-full animate-ping delay-500"></div>
                    <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-white rounded-full animate-ping delay-1000"></div>
                  </div>

                  {/* Navigation Arrows with Neon Effect */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedImageIndex > 0) setSelectedImageIndex(selectedImageIndex - 1);
                        }}
                        disabled={selectedImageIndex === 0}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 backdrop-blur-xl border border-accent/50 text-accent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent/20 hover:scale-110 hover:shadow-accent/50 hover:shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center z-20"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedImageIndex < product.images.length - 1) setSelectedImageIndex(selectedImageIndex + 1);
                        }}
                        disabled={selectedImageIndex === product.images.length - 1}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 backdrop-blur-xl border border-accent/50 text-accent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent/20 hover:scale-110 hover:shadow-accent/50 hover:shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center z-20"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Zoom Indicator with Pulse Effect */}
                  <div className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm font-bold border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                      Cliquer pour zoomer
                    </div>
                  </div>
                </div>

                {/* Holographic Thumbnails */}
                {product.images.length > 1 && (
                  <div className="mt-8 grid grid-cols-4 gap-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`group relative aspect-square overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border-2 transition-all duration-500 hover:scale-110 hover:-translate-y-2 transform-gpu ${
                          selectedImageIndex === index
                            ? 'border-accent shadow-2xl shadow-accent/40 scale-105 ring-4 ring-accent/30'
                            : 'border-white/20 hover:border-accent/50 shadow-xl hover:shadow-2xl'
                        }`}
                      >
                        {/* Holographic Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                        
                        <OptimizedImage
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          size="gallery"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500 relative z-10 rounded-2xl"
                          sizes="(max-width: 768px) 25vw, 12vw"
                          loading="lazy"
                          quality={85}
                        />
                        
                        {/* Selection Indicator with Neon Effect */}
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 bg-gradient-to-t from-accent/30 via-accent/10 to-transparent flex items-center justify-center z-20 rounded-2xl">
                            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-2xl animate-bounce border-2 border-white">
                              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        {/* Neon Glow Effect */}
                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl ${
                          selectedImageIndex === index ? 'bg-accent animate-pulse' : 'bg-accent'
                        }`}></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>        
    {/* Ultra-Modern Product Information */}
            <div className="space-y-12">
              {/* Floating Header with Holographic Effect */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-green-500/20 to-accent/20 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="group relative overflow-hidden bg-gradient-to-r from-accent/20 via-accent/30 to-green-500/20 border border-accent/40 px-6 py-3 rounded-2xl backdrop-blur-xl hover:scale-105 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <p className="relative text-accent font-black uppercase tracking-wider text-sm flex items-center gap-2">
                        <span className="w-3 h-3 bg-accent rounded-full animate-pulse"></span>
                        {product.category}
                      </p>
                    </div>
                    
                    {product.stock > 0 ? (
                      <div className="group relative overflow-hidden bg-gradient-to-r from-green-500/20 via-green-500/30 to-green-600/20 border border-green-500/40 px-6 py-3 rounded-2xl backdrop-blur-xl hover:scale-105 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-green-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <p className="relative text-green-400 font-black uppercase tracking-wider text-sm flex items-center gap-2">
                          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          En stock ({product.stock})
                        </p>
                      </div>
                    ) : (
                      <div className="group relative overflow-hidden bg-gradient-to-r from-red-500/20 via-red-500/30 to-red-600/20 border border-red-500/40 px-6 py-3 rounded-2xl backdrop-blur-xl">
                        <p className="relative text-red-400 font-black uppercase tracking-wider text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Épuisé
                        </p>
                      </div>
                    )}
                    
                    <div className="group relative overflow-hidden bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-pink-500/20 border border-purple-500/40 px-6 py-3 rounded-2xl backdrop-blur-xl hover:scale-105 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <p className="relative text-purple-400 font-black uppercase tracking-wider text-sm flex items-center gap-2">
                        <span className="text-lg animate-bounce">⚡</span>
                        Édition limitée
                      </p>
                    </div>
                  </div>
                  
                  {/* Product Title with Neon Effect */}
                  <div className="space-y-6">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
                      <span className="bg-gradient-to-r from-white via-accent to-green-500 bg-clip-text text-transparent animate-gradient">
                        {product.name}
                      </span>
                    </h1>
                    
                    {/* Animated Underline */}
                    <div className="w-32 h-2 bg-gradient-to-r from-accent via-green-500 to-accent rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Price with Holographic Effect */}
                  <div className="relative mt-8">
                    <div className="flex items-baseline gap-8">
                      <div className="relative">
                        <p className="text-6xl md:text-7xl font-black bg-gradient-to-r from-accent via-green-500 to-accent bg-clip-text text-transparent animate-pulse">
                          {formatPrice(product.price)}
                        </p>
                        {/* Holographic Glow */}
                        <div className="absolute inset-0 text-6xl md:text-7xl font-black text-accent/20 blur-lg -z-10 animate-pulse">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                      
                      {/* Value Indicators */}
                      <div className="space-y-2">
                        <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-2xl text-sm font-bold border border-green-500/30 backdrop-blur-xl">
                          💎 Prix exclusif
                        </div>
                        <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-2xl text-sm font-bold border border-blue-500/30 backdrop-blur-xl">
                          🚀 Livraison express
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Description with Glassmorphism */}
              {product.description && (
                <div className="group relative overflow-hidden bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  {/* Floating Background Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-colors duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-accent to-green-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">📝</span>
                      </div>
                      <h3 className="text-3xl font-black text-white">
                        Description du produit
                      </h3>
                    </div>
                    
                    <div className="prose prose-lg max-w-none">
                      <p className="text-neutral-300 leading-relaxed text-xl font-medium">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Enhanced Features List */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                        <div className="w-12 h-12 bg-green-500/30 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-white font-bold">Qualité premium garantie</span>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                        <div className="w-12 h-12 bg-blue-500/30 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-white font-bold">Garantie satisfaction</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}        
      {/* Revolutionary Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-accent to-green-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">🎨</span>
                      </div>
                      <div>
                        <label className="text-3xl font-black text-white block">
                          Couleur disponible
                        </label>
                        <p className="text-neutral-400 font-medium">
                          Choisissez votre style
                        </p>
                      </div>
                    </div>
                    
                    {selectedColor && (
                      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/30 shadow-2xl">
                        <div className="relative">
                          <div 
                            className="w-16 h-16 rounded-3xl border-4 border-white shadow-2xl"
                            style={{ backgroundColor: selectedColor }}
                          ></div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-xl animate-bounce">
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-white">
                            {getColorName(selectedColor)}
                          </div>
                          <div className="text-sm text-neutral-400 font-medium">
                            Couleur sélectionnée
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 3D Color Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
                    {product.colors.map((color, index) => {
                      const colorName = getColorName(color);
                      const isSelected = selectedColor === color;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`group relative w-24 h-24 rounded-3xl border-4 transition-all duration-700 hover:scale-125 hover:-translate-y-4 hover:rotate-12 transform-gpu ${
                            isSelected
                              ? 'border-accent shadow-2xl shadow-accent/50 scale-110 ring-4 ring-accent/40 -translate-y-2 rotate-6'
                              : 'border-white/30 hover:border-accent/60 shadow-2xl hover:shadow-3xl'
                          }`}
                          style={{ backgroundColor: color }}
                          title={colorName}
                        >
                          {/* Holographic Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                          
                          {/* Selection Indicator with Neon Effect */}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce border-2 border-accent">
                                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                          
                          {/* Advanced Tooltip */}
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 px-4 py-3 bg-black/90 backdrop-blur-xl text-white text-sm font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-30 shadow-2xl border border-white/20">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-5 h-5 rounded-full border-2 border-white/50 shadow-sm"
                                style={{ backgroundColor: color }}
                              ></div>
                              <span>{colorName}</span>
                              {isSelected && (
                                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-black/90"></div>
                          </div>
                          
                          {/* Magical Glow Effect */}
                          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-40 transition-all duration-700 blur-2xl ${
                            isSelected ? 'animate-pulse' : ''
                          }`}
                               style={{ 
                                 backgroundColor: color,
                                 transform: 'scale(1.8)',
                               }}>
                          </div>
                          
                          {/* Ripple Effect */}
                          <div className="absolute inset-0 rounded-3xl overflow-hidden">
                            <div className={`absolute inset-0 bg-white/40 scale-0 rounded-full transition-transform duration-500 ${
                              isSelected ? 'animate-ping' : ''
                            }`}></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Enhanced Color Info */}
                  <div className="text-center bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20">
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-accent to-green-500 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-white font-bold text-sm">{product.colors.length}</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {product.colors.length} couleur{product.colors.length > 1 ? 's' : ''} disponible{product.colors.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="text-neutral-400 text-sm">
                      Chaque couleur est testée pour sa durabilité et son éclat exceptionnel
                    </p>
                  </div>
                </div>
              )}

              {/* Ultra-Modern Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">📏</span>
                      </div>
                      <div>
                        <label className="text-3xl font-black text-white block">
                          Taille
                        </label>
                        <p className="text-neutral-400 font-medium">
                          Trouvez votre fit parfait
                        </p>
                      </div>
                    </div>
                    
                    <button className="group flex items-center gap-3 bg-accent/20 hover:bg-accent/30 text-accent px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 border border-accent/40 backdrop-blur-xl">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Guide des tailles
                    </button>
                  </div>
                  
                  {/* 3D Size Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {product.sizes.map((size, index) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`group relative px-8 py-6 border-4 rounded-3xl font-black text-xl text-center transition-all duration-700 hover:scale-110 hover:-translate-y-2 hover:rotate-3 transform-gpu ${
                          selectedSize === size
                            ? 'border-accent bg-gradient-to-r from-accent via-green-500 to-accent text-black shadow-2xl shadow-accent/50 scale-105 ring-4 ring-accent/40 -translate-y-1 rotate-1'
                            : 'border-white/30 hover:border-accent/60 bg-white/5 backdrop-blur-xl hover:bg-white/10 shadow-xl hover:shadow-2xl text-white'
                        }`}
                      >
                        {/* Holographic Background */}
                        <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
                          selectedSize === size
                            ? 'bg-gradient-to-r from-accent/30 via-green-500/30 to-accent/30'
                            : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-accent/10 group-hover:via-green-500/10 group-hover:to-accent/10'
                        }`}></div>
                        
                        {/* Size Text */}
                        <span className="relative z-10">{size}</span>
                        
                        {/* Selection Indicator with Neon Effect */}
                        {selectedSize === size && (
                          <div className="absolute -top-4 -right-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce border-2 border-white">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Magical Glow Effect */}
                        <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-2xl ${
                          selectedSize === size ? 'bg-accent animate-pulse' : 'bg-accent'
                        }`}></div>
                        
                        {/* Popularity Badge */}
                        {index === Math.floor(product.sizes.length / 2) && selectedSize !== size && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                            ⭐ Populaire
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}