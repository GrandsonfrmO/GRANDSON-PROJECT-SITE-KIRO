'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function MobileDebugPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const { cart, clearCart, forceCleanCart } = useCart();

  useEffect(() => {
    // Collecter les informations de l'appareil
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof Storage !== 'undefined',
      location: {
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol
      }
    };
    setDeviceInfo(info);
  }, []);

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      const newTest = { name, status, message, details };
      
      if (existing) {
        return prev.map(t => t.name === name ? newTest : t);
      } else {
        return [...prev, newTest];
      }
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Connectivité de base
    updateTest('connectivity', 'pending', 'Test en cours...');
    try {
      const startTime = Date.now();
      const response = await fetch('/api/products/1');
      const endTime = Date.now();
      
      if (response.ok) {
        updateTest('connectivity', 'success', `Connectivité OK (${endTime - startTime}ms)`);
      } else {
        updateTest('connectivity', 'error', `Erreur HTTP ${response.status}`);
      }
    } catch (error) {
      updateTest('connectivity', 'error', `Erreur: ${error}`);
    }

    // Test 2: API des produits
    updateTest('products', 'pending', 'Test en cours...');
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success || data.products) {
        const productCount = data.products?.length || 0;
        updateTest('products', 'success', `API produits OK (${productCount} produits)`, data);
      } else {
        updateTest('products', 'error', 'API produits invalide', data);
      }
    } catch (error) {
      updateTest('products', 'error', `Erreur API produits: ${error}`);
    }

    // Test 3: Connexion admin
    updateTest('admin', 'pending', 'Test en cours...');
    try {
      const loginData = {
        email: 'admin@grandson.com',
        password: 'admin123'
      };

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        updateTest('admin', 'success', 'Connexion admin OK', { hasToken: !!data.token });
        
        // Sauvegarder le token pour les tests suivants
        localStorage.setItem('adminToken', data.token);
      } else {
        updateTest('admin', 'error', 'Connexion admin échouée', data);
      }
    } catch (error) {
      updateTest('admin', 'error', `Erreur connexion admin: ${error}`);
    }

    // Test 4: Validation du panier
    updateTest('cart', 'pending', 'Test en cours...');
    try {
      // Créer un panier de test
      const testCart = [{
        product: { id: '1', name: 'T-Shirt Test', price: 45000 },
        quantity: 1,
        size: 'M',
        color: 'Noir'
      }];

      // Vérifier le produit
      const productResponse = await fetch('/api/products/1');
      const productData = await productResponse.json();
      
      if (productData.success) {
        const product = productData.data.product;
        const isValid = product.isActive && 
                       product.sizes.includes('M') && 
                       product.colors.includes('Noir') &&
                       product.stock >= 1;

        if (isValid) {
          updateTest('cart', 'success', 'Validation panier OK', { product });
        } else {
          updateTest('cart', 'warning', 'Panier invalide', { 
            active: product.isActive,
            sizes: product.sizes,
            colors: product.colors,
            stock: product.stock
          });
        }
      } else {
        updateTest('cart', 'error', 'Erreur récupération produit', productData);
      }
    } catch (error) {
      updateTest('cart', 'error', `Erreur validation panier: ${error}`);
    }

    // Test 5: LocalStorage
    updateTest('storage', 'pending', 'Test en cours...');
    try {
      const testKey = 'mobile-debug-test';
      const testValue = { timestamp: Date.now(), mobile: true };
      
      localStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = localStorage.getItem(testKey);
      
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        if (parsed.mobile === true) {
          updateTest('storage', 'success', 'LocalStorage OK');
          localStorage.removeItem(testKey);
        } else {
          updateTest('storage', 'error', 'LocalStorage corrompu');
        }
      } else {
        updateTest('storage', 'error', 'LocalStorage non accessible');
      }
    } catch (error) {
      updateTest('storage', 'error', `Erreur LocalStorage: ${error}`);
    }

    // Test 6: Cookies
    updateTest('cookies', 'pending', 'Test en cours...');
    try {
      document.cookie = 'mobile-debug-test=true; path=/';
      const cookies = document.cookie;
      
      if (cookies.includes('mobile-debug-test=true')) {
        updateTest('cookies', 'success', 'Cookies OK');
        // Nettoyer
        document.cookie = 'mobile-debug-test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } else {
        updateTest('cookies', 'warning', 'Cookies non fonctionnels');
      }
    } catch (error) {
      updateTest('cookies', 'error', `Erreur cookies: ${error}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'pending': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🔧 Debug Mobile - Grandson Project
          </h1>

          {/* Informations de l'appareil */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">📱 Informations de l'appareil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User Agent:</strong><br />
                <span className="text-xs break-all">{deviceInfo.userAgent}</span>
              </div>
              <div>
                <strong>Plateforme:</strong> {deviceInfo.platform}<br />
                <strong>Langue:</strong> {deviceInfo.language}<br />
                <strong>En ligne:</strong> {deviceInfo.onLine ? '✅' : '❌'}<br />
                <strong>Cookies:</strong> {deviceInfo.cookieEnabled ? '✅' : '❌'}
              </div>
              <div>
                <strong>Écran:</strong> {deviceInfo.screen?.width}x{deviceInfo.screen?.height}<br />
                <strong>Viewport:</strong> {deviceInfo.viewport?.width}x{deviceInfo.viewport?.height}
              </div>
              <div>
                <strong>Hostname:</strong> {deviceInfo.location?.hostname}<br />
                <strong>Port:</strong> {deviceInfo.location?.port}<br />
                <strong>Protocole:</strong> {deviceInfo.location?.protocol}
              </div>
            </div>
          </div>

          {/* Panier actuel */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">🛒 Panier actuel</h2>
            {cart.length > 0 ? (
              <div>
                <p className="mb-2">{cart.length} article(s) dans le panier:</p>
                {cart.map((item, index) => (
                  <div key={index} className="text-sm bg-white p-2 rounded mb-2">
                    <strong>{item.product.name}</strong><br />
                    Taille: {item.size} | Couleur: {item.color || 'N/A'} | Quantité: {item.quantity}
                  </div>
                ))}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={forceCleanCart}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    🧹 Nettoyer
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    🗑️ Vider
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Panier vide</p>
            )}
          </div>

          {/* Bouton de test */}
          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? '⏳ Tests en cours...' : '🚀 Lancer tous les tests'}
            </button>
          </div>

          {/* Résultats des tests */}
          {tests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">📊 Résultats des tests</h2>
              {tests.map((test, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {getStatusIcon(test.status)} {test.name}
                    </span>
                    <span className={`text-sm ${getStatusColor(test.status)}`}>
                      {test.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700">{test.message}</p>
                  {test.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">
                        Voir les détails
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions rapides */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🏠 Retour au site
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}