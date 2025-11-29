// Données de test temporaires pour le développement local
const mockProducts = [
  {
    id: "7a38d13d-a44e-45c2-ad10-64623d41b8e8",
    name: "T-shirt Premium",
    description: "T-shirt de qualité supérieure en coton bio",
    price: 29.99,
    category: "vetements",
    sizes: ["S", "M", "L", "XL"],
    stock: 50,
    images: ["/images/tshirt1.jpg"],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "b2c4e6f8-1234-5678-9abc-def012345678",
    name: "Casquette Snapback",
    description: "Casquette ajustable avec logo brodé",
    price: 24.99,
    category: "accessoires",
    sizes: ["Unique"],
    stock: 30,
    images: ["/images/cap1.jpg"],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "c3d5e7f9-2345-6789-abcd-ef0123456789",
    name: "Hoodie Confort",
    description: "Sweat à capuche ultra confortable",
    price: 49.99,
    category: "vetements",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 25,
    images: ["/images/hoodie1.jpg"],
    featured: false,
    created_at: new Date().toISOString()
  }
];

const mockOrders = [];
let orderCounter = 1000;

const mockAdmin = {
  username: 'admin',
  password: '$2b$10$x3QJrnmfeTwURHnTbSEkX.kQ7QTjqR9nflM5uxcPutt5PYQXkYfKG', // password: admin123
  role: 'admin'
};

module.exports = {
  mockProducts,
  mockOrders,
  mockAdmin,
  orderCounter
};