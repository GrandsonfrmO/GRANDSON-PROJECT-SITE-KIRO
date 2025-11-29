import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductManagement from '../../admin/products/page';
import { AuthProvider } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import * as api from '../../lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockProducts = [
  {
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
  },
  {
    id: '2',
    name: 'Test Sweat',
    description: 'Test sweat description',
    price: 75000,
    category: 'Sweats',
    sizes: ['M', 'L', 'XL'],
    images: ['/test-sweat.jpg'],
    stock: 5,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('Product Management Tests', () => {
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
    Storage.prototype.setItem = jest.fn();
  });

  const renderProductManagement = () => {
    return render(
      <AuthProvider>
        <ProductManagement />
      </AuthProvider>
    );
  };

  test('should display products list', async () => {
    (api.default.get as jest.Mock).mockResolvedValue(mockProducts);

    renderProductManagement();

    await waitFor(() => {
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('Test Sweat')).toBeInTheDocument();
    });
  });

  test('should show add product button', async () => {
    (api.default.get as jest.Mock).mockResolvedValue(mockProducts);

    renderProductManagement();

    await waitFor(() => {
      expect(screen.getByText(/ajouter un produit/i)).toBeInTheDocument();
    });
  });

  test('should delete product on confirmation', async () => {
    (api.default.get as jest.Mock).mockResolvedValue(mockProducts);
    (api.default.delete as jest.Mock).mockResolvedValue({ success: true });

    renderProductManagement();

    await waitFor(() => {
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByText('Supprimer');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Confirmer')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirmer');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.default.delete).toHaveBeenCalledWith('/api/admin/products/1', true);
    });
  });
});
