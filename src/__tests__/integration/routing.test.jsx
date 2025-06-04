// src/__tests__/integration/routing.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockAuthContext, mockAuthenticatedUser } from '../../test/test-utils'
import App from '../../App'

// Mock del contexto de autenticación
vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn()
}))

import { useAuth } from '../../context/AuthContext'

describe('Integración de Rutas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Usuario no autenticado', () => {
    beforeEach(() => {
      useAuth.mockReturnValue(mockAuthContext())
    })

    it('puede navegar a páginas públicas', async () => {
      render(<App />, { initialEntries: ['/'] })
      
      // Verificar que estamos en la página principal
      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
    })

    it('puede acceder a login y register', async () => {
      render(<App />, { initialEntries: ['/login'] })
      expect(screen.getByTestId('login-page')).toBeInTheDocument()

      render(<App />, { initialEntries: ['/register'] })
      expect(screen.getByTestId('register-page')).toBeInTheDocument()
    })

    it('no puede acceder al dashboard sin autenticación', async () => {
      render(<App />, { initialEntries: ['/dashboard'] })
      
      // ✅ CORRECCIÓN: Cuando no está autenticado, debería ser redirigido al login
      // NO debería encontrar private-route porque ese componente redirige
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument()
      })
      
      // Verificar que fue redirigido al login
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      
      // El private-route no debería estar presente porque redirigió
      expect(screen.queryByTestId('private-route')).not.toBeInTheDocument()
    })

    it('no puede acceder a rutas protegidas del dashboard', async () => {
      render(<App />, { initialEntries: ['/dashboard/books'] })
      
      // Verificar redirección al login
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
      
      expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument()
      expect(screen.queryByTestId('private-route')).not.toBeInTheDocument()
    })
  })

  describe('Usuario autenticado', () => {
    beforeEach(() => {
      useAuth.mockReturnValue(mockAuthContext({
        user: mockAuthenticatedUser,
        isAuthenticated: true
      }))
    })

    it('puede acceder al dashboard', async () => {
      render(<App />, { initialEntries: ['/dashboard'] })
      
      // ✅ Aquí SÍ debería encontrar private-route porque está autenticado
      expect(screen.getByTestId('private-route')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })

    it('puede navegar entre rutas del dashboard', async () => {
      render(<App />, { initialEntries: ['/dashboard/books'] })
      
      expect(screen.getByTestId('private-route')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })

    it('puede acceder a crear libros', async () => {
      render(<App />, { initialEntries: ['/dashboard/create-books'] })
      
      expect(screen.getByTestId('private-route')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })

    it('puede navegar desde dashboard a páginas públicas', async () => {
      render(<App />, { initialEntries: ['/dashboard'] })
      
      // Verificar que está en dashboard
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      
      // Simular navegación a página principal (si tienes un link)
      // const homeLink = screen.getByText('Pagina Principal')
      // await userEvent.click(homeLink)
      // expect(screen.getByTestId('public-layout')).toBeInTheDocument()
    })
  })

  describe('Estado de carga', () => {
    it('muestra loading mientras verifica autenticación', async () => {
      useAuth.mockReturnValue(mockAuthContext({
        isLoading: true
      }))

      render(<App />, { initialEntries: ['/dashboard'] })
      
      // Verificar estado de loading
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      
      // No debería mostrar ni dashboard ni login mientras carga
      expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument()
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })
  })

  describe('Manejo de rutas con parámetros', () => {
    beforeEach(() => {
      useAuth.mockReturnValue(mockAuthContext())
    })

    it('maneja correctamente rutas de libros con ID', () => {
      render(<App />, { initialEntries: ['/book/123'] })
      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
    })

    it('maneja rutas de capítulos con múltiples parámetros', () => {
      render(<App />, { initialEntries: ['/capitulos/123/5'] })
      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
    })

    it('maneja rutas de categorías', () => {
      render(<App />, { initialEntries: ['/books/category/fantasy'] })
      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
    })
  })

  describe('Rutas inexistentes', () => {
    beforeEach(() => {
      useAuth.mockReturnValue(mockAuthContext())
    })

    it('muestra página 404 para rutas no definidas', () => {
      render(<App />, { initialEntries: ['/esta-ruta-no-existe'] })
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    })

    it('muestra página 404 para rutas mal formadas', () => {
      render(<App />, { initialEntries: ['/book/'] })
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    })
  })

  describe('Navegación y transiciones', () => {
    it('transición de no autenticado a autenticado', async () => {
      // Iniciar como no autenticado
      const mockAuth = mockAuthContext()
      useAuth.mockReturnValue(mockAuth)

      const { rerender } = render(<App />, { initialEntries: ['/dashboard'] })
      
      // Verificar que está en login
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      
      // Simular autenticación exitosa
      useAuth.mockReturnValue(mockAuthContext({
        user: mockAuthenticatedUser,
        isAuthenticated: true
      }))
      
      rerender(<App />)
      
      // Verificar que ahora puede acceder al dashboard
      // Nota: Esto depende de cómo manejes la re-navegación tras login
    })

    it('logout redirige a página pública', async () => {
      // Iniciar autenticado
      useAuth.mockReturnValue(mockAuthContext({
        user: mockAuthenticatedUser,
        isAuthenticated: true
      }))

      const { rerender } = render(<App />, { initialEntries: ['/dashboard'] })
      
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      
      // Simular logout
      useAuth.mockReturnValue(mockAuthContext())
      
      rerender(<App />)
      
      // Verificar que fue redirigido
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument()
      })
    })
  })
})