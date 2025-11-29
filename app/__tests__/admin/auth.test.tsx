import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminLogin from '../../admin/login/page';
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
    post: jest.fn(),
  },
}));

describe('Admin Authentication Tests', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  const renderLogin = () => {
    return render(
      <AuthProvider>
        <AdminLogin />
      </AuthProvider>
    );
  };

  test('should display login form', () => {
    renderLogin();

    expect(screen.getByText('Connexion Admin')).toBeInTheDocument();
    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test('should validate required fields', async () => {
    renderLogin();

    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/veuillez remplir tous les champs/i)).toBeInTheDocument();
    });
  });

  test('should successfully login with valid credentials', async () => {
    (api.default.post as jest.Mock).mockResolvedValue({
      success: true,
      token: 'test-token',
      admin: {
        id: '1',
        username: 'admin',
        createdAt: '2024-01-01',
      },
    });

    renderLogin();

    const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.default.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'admin',
        password: 'password123',
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  test('should display error on login failure', async () => {
    (api.default.post as jest.Mock).mockRejectedValue(
      new Error('Identifiants invalides')
    );

    renderLogin();

    const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument();
    });
  });
});
