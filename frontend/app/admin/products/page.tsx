'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminRoute from '../../components/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductFilters from '../../components/admin/ProductFilters';
import ProductGrid from '../../components/admin/ProductGrid';
import api from '../../lib/api';
import { Product } from '../../types';
import ProductForm from '../../components/admin/ProductForm';
import { getImageUrl } from '../../lib/imageOptimization';
import { transformProducts } from '../../lib/dataTransform';

export default function ProductManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Utiliser l'API Next.js directement au lieu du backend
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      const productsList = data.products || data.data?.products || [];
      // Transformer les produits pour s'assurer que images/sizes sont des tableaux
      const transformedProducts = transformProducts(productsList);
      // Double vérification que tous les produits ont des tableaux valides
      const safeProducts = transformedProducts.map((p: Product) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
        sizes: Array.isArray(p.sizes) ? p.sizes : ['Unique'],
        colors: Array.isArray(p.colors) ? p.colors : null,
      }));
      setProducts(safeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Filter by status
    if (filterStatus === 'ACTIVE') {
      filtered = filtered.filter((p) => p.isActive);
    } else if (filterStatus === 'INACTIVE') {
      filtered = filtered.filter((p) => !p.isActive);
    } else if (filterStatus === 'LOW_STOCK') {
      filtered = filtered.filter((p) => p.stock < 5);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [filterCategory, filterStatus, searchTerm, products]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== productId));
        setDeleteConfirm(null);
      } else {
        throw new Error(data.error?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <AdminRoute>
      <AdminLayout>
        {!showForm ? (
          <div className="space-y-6 animate-fade-in-up">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-down">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Gestion des Produits
                </h2>
                <p className="text-neutral-400">
                  {products.length} produit(s) au total
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/products/add')}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold uppercase rounded-lg transition-all shadow-lg"
              >
                + Ajouter un produit
              </button>
            </div>

            {/* Filters */}
            <div className="gradient-overlay">
              <ProductFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                categories={categories.filter(cat => cat !== 'ALL')}
                totalProducts={products.length}
                filteredCount={products.filter(product => {
                  const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       product.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = !filterCategory || product.category === filterCategory;
                  return matchesSearch && matchesCategory;
                }).length}
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl p-4">
                      <div className="h-48 bg-white/10 rounded-xl mb-4"></div>
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ProductGrid
                products={products}
                onProductUpdate={fetchProducts}
                searchTerm={searchTerm}
                filterCategory={filterCategory}
                onEdit={handleEdit}
              />
            )}
          </div>
        ) : (
          <ProductForm
            product={editingProduct}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
      </AdminLayout>
    </AdminRoute>
  );
}
