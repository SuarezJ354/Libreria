// src/__tests__/App.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

// Mocks de componentes
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
}))

vi.mock('../components/Auth/PrivateRoute', () => ({
  default: ({ children }) => <div data-testid="private-route">{children}</div>
}))

vi.mock('../layouts/PublicLayout', () => ({
  default: () => <div data-testid="public-layout">Public Layout</div>
}))

vi.mock('../layouts/DashboardLayout', () => ({
  default: () => <div data-testid="dashboard-layout">Dashboard Layout</div>
}))

vi.mock('../frontend/pages/Library', () => ({
  default: () => <div data-testid="library-page">Library Page</div>
}))

vi.mock('../frontend/pages/login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('../frontend/pages/Register', () => ({
  default: () => <div data-testid="register-page">Register Page</div>
}))

vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">404 - Not Found</div>
}))

// Mock de componentes específicos
vi.mock('../Admin/pages/ChapterForm', () => ({
  default: () => <div data-testid="chapterform-page">ChapterForm Page</div>
}))

vi.mock('../Admin/components/BookForm', () => ({
  default: () => <div data-testid="bookform-component">BookForm Component</div>
}))

vi.mock('../Admin/pages/dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

vi.mock('../Admin/pages/Books', () => ({
  default: () => <div data-testid="books-page">Books Page</div>
}))

vi.mock('../Admin/pages/UsersPage', () => ({
  default: () => <div data-testid="userspage-page">UsersPage Page</div>
}))

vi.mock('../frontend/pages/BooksByCategory', () => ({
  default: () => <div data-testid="booksbycategory-page">BooksByCategory Page</div>
}))

vi.mock('../frontend/pages/FavoriteBooks', () => ({
  default: () => <div data-testid="favoritebooks-page">FavoriteBooks Page</div>
}))

vi.mock('../frontend/pages/CategoriesBook', () => ({
  default: () => <div data-testid="categoriesbook-page">CategoriesBook Page</div>
}))

vi.mock('../frontend/pages/BooksDetails', () => ({
  default: () => <div data-testid="booksdetails-page">BooksDetails Page</div>
}))

vi.mock('../frontend/pages/ChapterReader', () => ({
  default: () => <div data-testid="chapterreader-page">ChapterReader Page</div>
}))

vi.mock('../frontend/pages/Messages', () => ({
  default: () => <div data-testid="messages-page">Messages Page</div>
}))

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  )
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente el AuthProvider', () => {
    renderWithRouter()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
  })

  it('renderiza la página de biblioteca en la ruta raíz', () => {
    renderWithRouter(['/'])
    expect(screen.getByTestId('public-layout')).toBeInTheDocument()
  })

  it('renderiza la página de login en /login', () => {
    renderWithRouter(['/login'])
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('renderiza la página de registro en /register', () => {
    renderWithRouter(['/register'])
    expect(screen.getByTestId('register-page')).toBeInTheDocument()
  })

  it('renderiza la página 404 para rutas inexistentes', () => {
    renderWithRouter(['/ruta-inexistente'])
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
  })

  it('protege las rutas del dashboard con PrivateRoute', () => {
    renderWithRouter(['/dashboard'])
    expect(screen.getByTestId('private-route')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  it('maneja rutas con parámetros correctamente', () => {
    // Test para ruta con ID de libro
    renderWithRouter(['/book/123'])
    expect(screen.getByTestId('public-layout')).toBeInTheDocument()
  })

  it('maneja rutas de capítulos con múltiples parámetros', () => {
    renderWithRouter(['/capitulos/123/1'])
    expect(screen.getByTestId('public-layout')).toBeInTheDocument()
  })

  it('maneja rutas de categorías con parámetros', () => {
    renderWithRouter(['/books/category/ficcion'])
    expect(screen.getByTestId('public-layout')).toBeInTheDocument()
  })
})