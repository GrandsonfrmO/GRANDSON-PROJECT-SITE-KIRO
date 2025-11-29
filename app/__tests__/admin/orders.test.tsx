import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderManagement from '../../admin/orders/page';
import { AuthProvider } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import * as api from '../../lib/api';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockOrders = [
  {
    id: '1',
    orderNumber: 'GRP-20241105-0001',
    customerName: 'John Doe',
    customerPhone: '+224123456789',
    deliveryAddress: 'Test Address, Conakry',
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
          description: 'Test',
          price: 50000,
          category: 'T-Shirts',
          sizes: ['M'],
          images: [],
          stock: 10,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
    ],
  },
  {
    id: '2',
    orderNumber: 'GRP-20241105-0002',
    customerName: 'Jane Smith',
    customerPhone: '+224987654321',
    deliveryAddress: 'Another Address, Conakry',
    totalAmount: 75000,
    status: 'CONFIRMED',
    createdAt: '2024-11-05T11:00:00Z',
    updatedAt: '2024-11-05T11:00:00Z',
    items: [],
  },
];

describe('Order Management Tests', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock authenticated admin
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'admin-token') return 'test-token';
      if (key === 'admin-data')
        return JSON.stringify({
          id: '1',
          username: 'admin',
          createdAt: '2024-01-01',
        });
      return null;
    });
  });

  const renderOrderManagement = () => {
    return render(
      <AuthProvider>
        <OrderManagement />
      </AuthProvider>
    );
  };

  test('should display orders list', async () => {
    (api.default.get as jest.Mock).mockResolvedValue(mockOrders);

    renderOrderManagement();

    await waitFor(() => {
      expect(screen.getByText('GRP-20241105-0001')).toBeInTheDocument();
      expect(screen.getByText('GRP-20241105-0002')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('should filter orders by status', async () => {
    (api.default.get as jest.Mock).mockResolvedValue(mockOrders);

    renderOrderManagement();

    await waitFor(() => {
      expect(screen.getByText('GRP-20241105-0001')).toBeInTheDocument();
    });

    // Click on CONFIRMED filter
    const confirmedButton = screen.getByText(/Confirmée \(1\)/i);
    fireEvent.click(confirmedButton);

    await waitFor(() => {
      expect(screen.getByText('GRP-20241105-0002')).toBeInTheDocument();
      expect(screen.queryByText('GRP-20241105-0001')).not.toBeInTheDocument();
    });
  });

  test('should update order status', async () => {
    (api.default.get as jest.Mock).mockResolvedValue(mockOrders);
    (api.default.put as jest.Mock).mockResolvedValue({ success: true });

    renderOrderManagement();

    await waitFor(() => {
      expect(screen.getByText('GRP-20241105-0001')).toBeInTheDocument();
    });

    // Find and change status select - orders are sorted by date (most recent first)
    // So order 2 (11:00) appears before order 1 (10:00)
    const selects = screen.getAllByRole('combobox');
    const secondSelect = selects[1]; // This is order 1 (PENDING)
    
    fireEvent.change(secondSelect, { target: { value: 'CONFIRMED' } });

    await waitFor(() => {
      expect(api.default.put).toHaveBeenCalledWith(
        '/api/admin/orders/1',
        { status: 'CONFIRMED' },
        true
      );
    });
  });

  test('should search orders by customer name', async () => {
    (api.default.get as jest.Mock).mockResolvedValue(mockOrders);

    renderOrderManagement();

    await waitFor(() => {
      expect(screen.getByText('GRP-20241105-0001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.getByText('GRP-20241105-0002')).toBeInTheDocument();
      expect(screen.queryByText('GRP-20241105-0001')).not.toBeInTheDocument();
    });
  });
});
