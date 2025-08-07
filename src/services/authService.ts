import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

const AUTH_BASE_URL = 'http://localhost:8080/auth';

export const authService = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<string> => {
    try {
      // Create URL-encoded form data for @RequestParam
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const fullUrl = `${AUTH_BASE_URL}/register`;
      console.log('🔍 Full URL being called:', fullUrl);
      console.log('📡 Request details:', {
        method: 'POST',
        url: fullUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      console.log('Sending registration request with:', {
        username: credentials.username,
        password: credentials.password ? '[HIDDEN]' : 'undefined'
      });

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('📥 Registration response status:', response.status);
      console.log('📥 Registration response headers:', response.headers);
      console.log('📥 Response URL:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(errorText || `Registration failed with status ${response.status}`);
      }

      const result = await response.text();
      console.log('✅ Registration successful, response:', result);
      return result;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<string> => {
    try {
      // Create URL-encoded form data for @RequestParam
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      console.log('Sending login request with:', {
        username: credentials.username,
        password: credentials.password ? '[HIDDEN]' : 'undefined'
      });

      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(errorText || `Login failed with status ${response.status}`);
      }

      const token = await response.text();
      console.log('Login successful, token received');
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Save token to localStorage
  saveToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Remove token from localStorage
  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return token !== null && token.length > 0;
  },

  // Get authenticated user info
  getCurrentUser: (): User | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decode JWT token to get username (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.sub || 'Unknown',
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Create authorization header for API requests
  getAuthHeader: (): { Authorization: string } | {} => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}; 