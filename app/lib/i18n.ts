// French localization utilities for Grandson Project

export const translations = {
  // Common
  loading: 'Chargement...',
  error: 'Erreur',
  success: 'Succès',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  save: 'Enregistrer',
  delete: 'Supprimer',
  edit: 'Modifier',
  close: 'Fermer',
  
  // Navigation
  catalog: 'Catalogue',
  cart: 'Panier',
  checkout: 'Commander',
  admin: 'Admin',
  orderTracking: 'Suivre ma commande',
  
  // Product
  product: 'Produit',
  products: 'Produits',
  category: 'Catégorie',
  size: 'Taille',
  price: 'Prix',
  stock: 'Stock',
  inStock: 'En stock',
  outOfStock: 'Épuisé',
  lowStock: 'Stock limité',
  addToCart: 'Ajouter au panier',
  selectSize: 'Sélectionner une taille',
  
  // Cart
  emptyCart: 'Votre panier est vide',
  continueShopping: 'Continuer vos achats',
  removeItem: 'Retirer',
  quantity: 'Quantité',
  subtotal: 'Sous-total',
  total: 'Total',
  
  // Checkout
  customerInfo: 'Informations client',
  fullName: 'Nom complet',
  phone: 'Téléphone',
  email: 'Email (optionnel)',
  deliveryAddress: 'Adresse de livraison',
  orderSummary: 'Récapitulatif',
  placeOrder: 'Passer la commande',
  
  // Order
  order: 'Commande',
  orderNumber: 'Numéro de commande',
  orderDate: 'Date de commande',
  orderStatus: 'Statut',
  orderConfirmed: 'Commande confirmée',
  orderPending: 'En attente',
  orderDelivered: 'Livrée',
  orderCancelled: 'Annulée',
  
  // Admin
  login: 'Connexion',
  logout: 'Déconnexion',
  username: 'Nom d\'utilisateur',
  password: 'Mot de passe',
  dashboard: 'Tableau de bord',
  productManagement: 'Gestion des produits',
  orderManagement: 'Gestion des commandes',
  
  // Validation messages
  validation: {
    required: 'Ce champ est requis',
    invalidEmail: 'Email invalide',
    invalidPhone: 'Numéro de téléphone invalide',
    minLength: (min: number) => `Minimum ${min} caractères`,
    maxLength: (max: number) => `Maximum ${max} caractères`,
    selectSize: 'Veuillez sélectionner une taille',
    insufficientStock: 'Stock insuffisant',
    outOfStock: 'Produit épuisé',
  },
  
  // Error messages
  errors: {
    generic: 'Une erreur est survenue',
    network: 'Erreur de connexion',
    notFound: 'Non trouvé',
    unauthorized: 'Non autorisé',
    serverError: 'Erreur serveur',
    loadProducts: 'Impossible de charger les produits',
    loadProduct: 'Impossible de charger le produit',
    loadOrder: 'Impossible de charger la commande',
    createOrder: 'Impossible de créer la commande',
    updateOrder: 'Impossible de mettre à jour la commande',
    uploadImage: 'Impossible de télécharger l\'image',
    loginFailed: 'Connexion échouée',
    sessionExpired: 'Session expirée',
  },
  
  // Success messages
  successMessages: {
    addedToCart: 'Produit ajouté au panier!',
    orderPlaced: 'Commande passée avec succès!',
    orderUpdated: 'Commande mise à jour',
    productCreated: 'Produit créé',
    productUpdated: 'Produit mis à jour',
    productDeleted: 'Produit supprimé',
    loginSuccess: 'Connexion réussie',
  },
};

// Currency formatting for Guinean Franc (GNF)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-GN').format(num);
}

// Date formatting in French
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-GN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-GN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// Phone number validation for Guinea (+224)
export function validateGuineanPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check for +224 followed by 8-9 digits or just 8-9 digits
  const regex = /^(\+224)?[0-9]{8,9}$/;
  return regex.test(cleaned);
}

// Format phone number for display
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  if (cleaned.startsWith('+224')) {
    const number = cleaned.substring(4);
    return `+224 ${number.substring(0, 3)} ${number.substring(3, 5)} ${number.substring(5)}`;
  }
  
  return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5)}`;
}

// Get translation by key
export function t(key: string): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations;
  
  for (const k of keys) {
    value = value[k];
    if (value === undefined) return key;
  }
  
  return typeof value === 'string' ? value : key;
}

export default translations;
