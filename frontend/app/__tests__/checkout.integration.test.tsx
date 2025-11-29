import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutPage from '../checkout/page';
import { CartProvider } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import * as api from '../lib/api';
import * as inventory from '../lib/inventory';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Mock inventory
jest.mock('../lib/inventory', () => ({
  checkCartStock: jest.fn(),
}));

const mockProduct = {
  id: '1',
  name: 'Test T-Shirt',
  description: 'Test description',
  price: 50000,
  category: 'T-Shirts',
  sizes: ['S', 'M', 'L'],
  images: ['/test-image.jpg'],
  stock: 10,
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('Checkout Integration Tests', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify([
        {
          product: mockProduct,
          size: 'M',
          quantity: 2,
        },
      ])
    );
    Storage.prototype.setItem = jest.fn();
  });

  const renderCheckout = () => {
    return render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );
  };

  test('should display checkout form with cart items', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: true,
      outOfStockItems: [],
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Finaliser la commande')).toBeInTheDocument();
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    });
  });

  test('should validate required fields', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: true,
      outOfStockItems: [],
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Finaliser la commande')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument();
    });
  });

  test('should validate phone number format', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: true,
      outOfStockItems: [],
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Finaliser la commande')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/nom complet/i);
    const phoneInput = screen.getByLabelText(/téléphone/i);
    const addressInput = screen.getByLabelText(/adresse complète/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '123456' } });
    fireEvent.change(addressInput, { target: { value: 'Test address 123' } });

    const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Format: \+224XXXXXXXX/i)).toBeInTheDocument();
    });
  });

  test('should successfully submit order with valid data', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: true,
      outOfStockItems: [],
    });

    (api.default.post as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        order: {
          orderNumber: 'GRP-20241105-1234',
          id: '1',
        },
      },
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Finaliser la commande')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/nom complet/i);
    const phoneInput = screen.getByLabelText(/téléphone/i);
    const addressInput = screen.getByLabelText(/adresse complète/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '+224123456789' } });
    fireEvent.change(addressInput, { target: { value: 'Test address 123, Conakry' } });

    const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.default.post).toHaveBeenCalledWith('/api/orders', expect.objectContaining({
        customerName: 'John Doe',
        customerPhone: '+224123456789',
        deliveryAddress: 'Test address 123, Conakry',
      }));
      expect(mockPush).toHaveBeenCalledWith('/order-confirmation/GRP-20241105-1234');
    });
  });

  test('should check stock before submitting order', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: true,
      outOfStockItems: [],
    });

    (api.default.post as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        order: {
          orderNumber: 'GRP-20241105-1234',
          id: '1',
        },
      },
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Finaliser la commande')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/nom complet/i);
    const phoneInput = screen.getByLabelText(/téléphone/i);
    const addressInput = screen.getByLabelText(/adresse complète/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '+224123456789' } });
    fireEvent.change(addressInput, { target: { value: 'Test address 123, Conakry' } });

    const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(inventory.checkCartStock).toHaveBeenCalled();
    });
  });

  test('should prevent checkout when items are out of stock', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: false,
      outOfStockItems: [
        {
          productId: '1',
          productName: 'Test T-Shirt',
          requestedQuantity: 2,
          availableStock: 0,
        },
      ],
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText(/Articles en rupture de stock/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
    expect(submitButton).toBeDisabled();
  });

  test('should display error message on order creation failure', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: true,
      outOfStockItems: [],
    });

    (api.default.post as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Finaliser la commande')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/nom complet/i);
    const phoneInput = screen.getByLabelText(/téléphone/i);
    const addressInput = screen.getByLabelText(/adresse complète/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '+224123456789' } });
    fireEvent.change(addressInput, { target: { value: 'Test address 123, Conakry' } });

    const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors de la création de la commande/i)).toBeInTheDocument();
    });
  });

  test('should calculate and display total price correctly', async () => {
    (inventory.checkCartStock as jest.Mock).mockResolvedValue({
      available: true,
      outOfStockItems: [],
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Finaliser la commande')).toBeInTheDocument();
    });

    // Total should be 2 * 50000 = 100000 GNF
    const totalElements = screen.getAllByText(/100\s*000/);
    expect(totalElements.length).toBeGreaterThan(0);
  });
});
