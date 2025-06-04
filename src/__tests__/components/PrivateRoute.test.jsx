import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrivateRoute from '../../components/Auth/PrivateRoute'

const mockUseAuth = vi.fn()

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

const TestComponent = () => <div data-testid="protected-content">Contenido Protegido</div>

const renderPrivateRoute = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>
    </MemoryRouter>
  )
}

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el contenido cuando el usuario está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User' },
      isLoading: false
    })

    renderPrivateRoute()
    
    expect(screen.getByTestId('private-route')).toBeInTheDocument()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('no renderiza el contenido cuando el usuario no está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false
    })

    renderPrivateRoute()
    
    expect(screen.queryByTestId('private-route')).not.toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('muestra loading cuando está cargando', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false, 
      user: null,
      isLoading: true
    })

    renderPrivateRoute()
    
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('private-route')).not.toBeInTheDocument()
  })
})