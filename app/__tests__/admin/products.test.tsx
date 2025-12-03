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

  test('should display edit form when edit button is clicked', async () => {
    // Mock fetch for products list
    global.fetch = jest.fn((url) => {
      if (url === '/api/admin/products') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderProductManagement();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    });

    // Find and click the edit button (using the emoji or text)
    const editButtons = screen.getAllByText(/Modifier|Edit/i);
    fireEvent.click(editButtons[0]);

    // Verify the form is displayed with the product data
    await waitFor(() => {
      expect(screen.getByText(/Modifier le produit/i)).toBeInTheDocument();
    });

    // Verify the form is populated with product data
    const nameInput = screen.getByDisplayValue('Test T-Shirt');
    expect(nameInput).toBeInTheDocument();
  });

  test('should hide product list and show form when editing', async () => {
    // Mock fetch for products list
    global.fetch = jest.fn((url) => {
      if (url === '/api/admin/products') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderProductManagement();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByText(/Modifier|Edit/i);
    fireEvent.click(editButtons[0]);

    // Verify product list is hidden and form is shown
    await waitFor(() => {
      expect(screen.getByText(/Modifier le produit/i)).toBeInTheDocument();
      expect(screen.queryByText('Gestion des Produits')).not.toBeInTheDocument();
    });
  });

  test('should return to product list when cancel is clicked', async () => {
    // Mock fetch for products list
    global.fetch = jest.fn((url) => {
      if (url === '/api/admin/products') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ products: mockProducts }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    renderProductManagement();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByText(/Modifier|Edit/i);
    fireEvent.click(editButtons[0]);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByText(/Modifier le produit/i)).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    // Verify we're back to the product list
    await waitFor(() => {
      expect(screen.getByText('Gestion des Produits')).toBeInTheDocument();
      expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    });
  });
});
