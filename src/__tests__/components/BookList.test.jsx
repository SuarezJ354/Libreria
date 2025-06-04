import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BooksList from '../../Admin/components/BooksList';
import * as AuthContext from '../../context/AuthContext';

// Mockear el hook useAuth
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('BooksList', () => {
  beforeEach(() => {
    // Mockear funciones globales
    global.alert = vi.fn();
    global.confirm = vi.fn();
    global.fetch = vi.fn();

    // Configurar el mock de useAuth para retornar un token
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      token: 'fake-token',
      // Agregar otras propiedades que tu contexto pueda tener
      user: { id: 1, name: 'Test User' },
      login: vi.fn(),
      logout: vi.fn()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Maneja error al eliminar libro', async () => {
    // Datos de prueba
    const mockBooks = [{
      id: 1,
      titulo: 'Libro de Prueba',
      descripcion: 'Una descripción',
      autor: 'Autor X',
      anioPublicacion: 2024,
      categoria: { nombre: 'Novela' },
      imagenPortada: 'http://fakeurl.com/imagen.jpg',
      capitulos: [1, 2, 3]
    }];

    // Configurar mocks
    global.confirm.mockReturnValue(true); // Usuario confirma eliminación
    
    // Mock de fetch: primero exitoso para cargar libros, luego error para eliminar
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBooks)
      })
      .mockRejectedValueOnce(new Error('Delete failed'));

    // Renderizar componente dentro de BrowserRouter (por el NavLink)
    render(
      <BrowserRouter>
        <BooksList />
      </BrowserRouter>
    );

    // Esperar a que los libros se carguen
    await waitFor(() => {
      expect(screen.getByText('Libro de Prueba')).toBeInTheDocument();
    });

    // Hacer clic en el botón de eliminar
    const deleteButton = screen.getByTitle('Eliminar libro');
    fireEvent.click(deleteButton);

    // Verificar que se muestre el mensaje de error
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error al eliminar el libro');
    });

    // Verificaciones adicionales
    expect(global.confirm).toHaveBeenCalledWith('¿Eliminar el libro "Libro de Prueba"?');
  });
});