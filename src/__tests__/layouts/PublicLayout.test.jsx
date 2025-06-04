import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PublicLayout from '../../layouts/PublicLayout'

// Mock del AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
}))

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' })
  }
})

// Mock de todos los componentes que puedan usar useAuth
vi.mock('../../frontend/components/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}))

vi.mock('../../frontend/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

describe('PublicLayout Component', () => {
  const renderPublicLayout = () => {
    return render(
      <MemoryRouter>
        <PublicLayout />
      </MemoryRouter>
    )
  }

  it('renderiza el layout público correctamente', () => {
    renderPublicLayout()
    // Verificar que el Outlet se renderiza
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})