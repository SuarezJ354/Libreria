import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'

// Mock del AuthContext con usuario autenticado
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@test.com' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })
}))

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="dashboard-outlet">Dashboard Content</div>,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/dashboard' })
  }
})

// Mock del Sidebar que está causando problemas
vi.mock('../../Admin/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

// Mock de otros componentes del dashboard
vi.mock('../../Admin/components/Header', () => ({
  default: () => <div data-testid="dashboard-header">Dashboard Header</div>
}))

describe('DashboardLayout Component', () => {
  const renderDashboardLayout = () => {
    return render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    )
  }

  it('renderiza el layout del dashboard correctamente', () => {
    renderDashboardLayout()
    expect(screen.getByTestId('dashboard-outlet')).toBeInTheDocument()
  })

  it('renderiza el sidebar cuando está autenticado', () => {
    renderDashboardLayout()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })
})