import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'

// Mock user data
export const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    role: 'user',
  },
}

export const mockAdminUser = {
  id: '456',
  email: 'admin@example.com',
  user_metadata: {
    full_name: 'Admin User',
    role: 'admin',
  },
}

// Mock product data
export const mockProduct = {
  id: '1',
  name: 'Chocolate Cake',
  description: 'Delicious chocolate cake',
  price: 29.99,
  category: 'Cakes',
  image_url: null,
  ingredients: 'Flour, Sugar, Cocoa',
  nutrition_info: 'Calories: 350',
  in_stock: true,
  featured: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockProducts = [
  mockProduct,
  {
    id: '2',
    name: 'Vanilla Cupcakes',
    description: 'Light vanilla cupcakes',
    price: 18.99,
    category: 'Cupcakes',
    image_url: null,
    ingredients: 'Flour, Sugar, Vanilla',
    nutrition_info: 'Calories: 280',
    in_stock: true,
    featured: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Mock testimonial data
export const mockTestimonial = {
  id: '1',
  customer_name: 'Sarah Johnson',
  rating: 5,
  comment: 'Amazing chocolate cake!',
  image_url: null,
  created_at: '2024-01-01T00:00:00Z',
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  user?: typeof mockUser | null
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    user = null,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Mock auth context value
  const mockAuthValue = {
    user,
    session: user ? { user, access_token: 'mock-token' } : null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthProvider value={mockAuthValue}>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock fetch for API calls
export const mockFetch = (data: any, ok = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
    } as Response)
  )
}

// Helper to create mock events
export const createMockEvent = (value: string) => ({
  target: { value },
  preventDefault: vi.fn(),
})
