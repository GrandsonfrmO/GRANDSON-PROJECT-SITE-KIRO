import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
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

  const imageUrl = item.product.images[0] || '/placeholder-product.svg';

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      onUpdateQuantity(newQuantity);
    }
  };

  const isOutOfStock = !item.product.isActive || item.product.stock === 0;
  const isLowStock = item.product.stock > 0 && item.product.stock < item.quantity;
  const stockWarning = isOutOfStock 
    ? 'Épuisé' 
    : isLowStock 
    ? `Seulement ${item.product.stock} disponible(s)` 
    : null;

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-200">
      {/* Product Image */}
      <div className="relative w-20 h-20 shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={item.product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="grow">
        <h3 className="font-medium text-sm text-neutral-900 mb-1">
          {item.product.name}
        </h3>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs text-neutral-500">
            Taille: {item.size}
          </p>
          {item.color && (
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-neutral-300"
                style={{ backgroundColor: getColorHex(item.color) }}
              ></div>
              <p className="text-xs text-neutral-500">
                {item.color}
              </p>
            </div>
          )}
        </div>
        {stockWarning && (
          <p className={`text-xs font-medium mb-1 ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`}>
            ⚠️ {stockWarning}
          </p>
        )}
        <p className="font-semibold text-sm text-neutral-900">
          {formatPrice(item.product.price)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={onRemove}
          className="text-neutral-400 hover:text-red-600 transition-colors touch-target p-2"
          aria-label="Supprimer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            aria-label="Diminuer la quantité"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={item.quantity >= item.product.stock}
            className="w-8 h-8 flex items-center justify-center rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            aria-label="Augmenter la quantité"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
