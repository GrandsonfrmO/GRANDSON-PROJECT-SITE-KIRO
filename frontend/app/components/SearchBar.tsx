'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '../types';

interface SearchBarProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  placeholder?: string;
}

export default function SearchBar({ products, onProductSelect, placeholder = "Rechercher un produit..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6); // Limit to 6 results
      
      setFilteredProducts(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredProducts([]);
      setIsOpen(false);
    }
  }, [query, products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
          handleProductSelect(filteredProducts[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent/30 text-accent font-bold">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(filteredProducts.length > 0)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-neutral-200 rounded-2xl focus:border-accent focus:outline-none transition-all duration-300 shadow-lg focus:shadow-xl"
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-50 animate-fade-in-up">
          {filteredProducts.length > 0 ? (
            <>
              <div className="p-3 bg-neutral-50 border-b border-neutral-200">
                <p className="text-sm text-neutral-600 font-semibold">
                  {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {filteredProducts.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors duration-200 border-b border-neutral-100 last:border-b-0 ${
                      index === selectedIndex ? 'bg-accent/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 truncate">
                          {highlightMatch(product.name, query)}
                        </h4>
                        <p className="text-sm text-neutral-500 truncate">
                          {highlightMatch(product.category, query)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-accent">
                            {product.price.toLocaleString()} GNF
                          </span>
                          {product.stock > 0 ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                              En stock
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Rupture
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="text-neutral-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* View All Results */}
              <div className="p-3 bg-neutral-50 border-t border-neutral-200">
                <button
                  onClick={() => {
                    // Navigate to products page with search query
                    window.location.href = `/products?search=${encodeURIComponent(query)}`;
                  }}
                  className="w-full text-center text-accent font-semibold hover:text-accent/80 transition-colors"
                >
                  Voir tous les résultats pour "{query}"
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-neutral-600 font-semibold">
                Aucun résultat pour "{query}"
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}