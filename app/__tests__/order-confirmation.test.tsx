import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderConfirmationPage from '../order-confirmation/[orderNumber]/page';
import { useParams, useRouter } from 'next/navigation';
import { CartProvider } from '../context/CartContext';
import * as api from '../lib/api';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock API
jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockOrder = {
  id: '1',
  orderNumber: 'GRP-20241105-1234',
  customerName: 'John Doe',
  customerPhone: '+224123456789',
  customerEmail: 'john@example.com',
  deliveryAddress: 'Test address, Conakry',
  totalAmount: 100000,
  status: 'PENDING',
  createdAt: '2024-11-05T10:00:00Z',
  updatedAt: '2024-11-05T10:00:00Z',
  items: [
    {
      id: '1',
      orderId: '1',
      productId: '1',
      size: 'M',
      quantity: 2,
      price: 50000,
      product: {
        id: '1',
        name: 'Test T-Shirt',
        images: ['/test-image.jpg'],
        category: 'T-Shirts',
      },
    },
  ],
};

describe('Order Confirmation Tests', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({
      orderNumber: 'GRP-20241105-1234',
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
  });

  const renderOrderConfirmation = () => {
    return render(
      <CartProvider>
        <OrderConfirmationPage />
      </CartProvider>
    );
  };

  test('should display order confirmation with order details', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: mockOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getByText('Commande confirmée !')).toBeInTheDocument();
      expect(screen.getAllByText('GRP-20241105-1234').length).toBeGreaterThan(0);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('+224123456789')).toBeInTheDocument();
    });
  });

  test('should display order items correctly', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: mockOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
      expect(screen.getByText(/Taille: M/)).toBeInTheDocument();
      expect(screen.getByText(/Quantité: 2/)).toBeInTheDocument();
    });
  });

  test('should display correct order status', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: mockOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });
  });

  test('should display confirmed status correctly', async () => {
    const confirmedOrder = { ...mockOrder, status: 'CONFIRMED' };
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: confirmedOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getByText('Confirmée')).toBeInTheDocument();
    });
  });

  test('should display delivered status correctly', async () => {
    const deliveredOrder = { ...mockOrder, status: 'DELIVERED' };
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: deliveredOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getByText('Livrée')).toBeInTheDocument();
    });
  });

  test('should display error when order is not found', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Commande non trouvée' },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getAllByText('Commande non trouvée').length).toBeGreaterThan(0);
    });
  });

  test('should display total amount correctly', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: mockOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      const totalElements = screen.getAllByText(/100\s*000/);
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  test('should display next steps information', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: mockOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getByText(/Prochaines étapes/i)).toBeInTheDocument();
      expect(screen.getByText(/vérifier la disponibilité/i)).toBeInTheDocument();
    });
  });

  test('should display delivery address', async () => {
    (api.default.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { order: mockOrder },
    });

    renderOrderConfirmation();

    await waitFor(() => {
      expect(screen.getByText('Test address, Conakry')).toBeInTheDocument();
    });
  });
});
