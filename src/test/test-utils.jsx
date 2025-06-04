// src/test/test-utils.jsx
import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock del AuthContext para evitar errores
const MockAuthProvider = ({ children }) => children

// Wrapper personalizado para tests que incluye providers necesarios
const AllTheProviders = ({ children, initialEntries = ['/'] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <MockAuthProvider>
        {children}
      </MockAuthProvider>
    </MemoryRouter>
  )
}

// Función de render personalizada
const customRender = (ui, options = {}) => {
  const { initialEntries, ...renderOptions } = options
  
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} initialEntries={initialEntries} />,
    ...renderOptions,
  })
}

// Mock personalizado para AuthContext
export const mockAuthContext = (overrides = {}) => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    ...overrides
  }
}

// Mock para usuario autenticado
export const mockAuthenticatedUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
}

// Mock para usuario admin
export const mockAdminUser = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
}

// Re-exportar todo de testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Sobreescribir render con nuestro customRender
export { customRender as render }                                                                                                   