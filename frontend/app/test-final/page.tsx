'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/app/components/OptimizedImage';
import { getImageUrl } from '@/app/lib/imageOptimization';

export default function TestFinalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success && data.data?.products) {
          setProducts(data.data.products.slice(0, 6));
        } else {
          setError('Erreur lors du chargement des produits');
        }
      } catch (err) {
        setError('Erreur de connexion');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Test Final des Images</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Test Final des Images</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Final des Images</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Informations</h2>
        <p><strong>Nombre de produits:</strong> {products.length}</p>
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
        <p><strong>Mode:</strong> {process.env.NODE_ENV}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{product.name}</h3>
            
            <div className="space-y-4">
              {/* Image avec notre composant OptimizedImage */}
              <div>
                <h4 className="font-medium mb-2">OptimizedImage Component</h4>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={product.images[0] || ''}
                    alt={product.name}
                    size="card"
                    fill
                    className="object-cover"
                    onLoad={() => console.log('✅ Image chargée:', product.name)}
                    onError={() => console.error('❌ Erreur image:', product.name)}
                  />
                </div>
              </div>

              {/* Informations sur l'image */}
              <div className="text-sm space-y-1">
                <p><strong>Image originale:</strong> {product.images[0] || 'Aucune'}</p>
                <p><strong>URL générée:</strong> {getImageUrl(product.images[0] || '', 'card')}</p>
                <p><strong>Stock:</strong> {product.stock}</p>
                <p><strong>Prix:</strong> {product.price.toLocaleString()} GNF</p>
              </div>

              {/* Test de l'URL directe */}
              <div>
                <button
                  onClick={async () => {
                    const url = getImageUrl(product.images[0] || '', 'card');
                    try {
                      const response = await fetch(url, { method: 'HEAD' });
                      console.log(`Test URL ${url}:`, response.status, response.ok ? '✅' : '❌');
                      alert(`Test URL: ${response.status} ${response.ok ? 'OK' : 'ERREUR'}`);
                    } catch (error) {
                      console.error('Erreur test URL:', error);
                      alert('Erreur lors du test de l\'URL');
                    }
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Tester URL
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Test d'images statiques */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Test d'Images Statiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            '/images/tshirt-classic-black.jpg',
            '/images/hoodie-urban-black.jpg',
            '/images/bomber-jacket-olive.jpg',
            '/placeholder-product.svg'
          ].map((imagePath, index) => (
            <div key={index} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-2 bg-gray-200 rounded">
                <OptimizedImage
                  src={imagePath}
                  alt={`Test statique ${index + 1}`}
                  size="thumbnail"
                  fill
                  className="object-cover rounded"
                />
              </div>
              <p className="text-xs break-all">{imagePath}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}