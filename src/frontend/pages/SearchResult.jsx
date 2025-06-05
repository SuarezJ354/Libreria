import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [errorBooks, setErrorBooks] = useState(null);
  const [errorFavorites, setErrorFavorites] = useState(null);
  const [updatingFavoriteIds, setUpdatingFavoriteIds] = useState(new Set());

  const token = localStorage.getItem("token");

  // Función para buscar libros
  const searchBooks = async (searchQuery) => {
    const controller = new AbortController();
    let isMounted = true;
    
    try {
      setLoadingBooks(true);
      setErrorBooks(null);
      
      // Obtener todos los libros primero
      const response = await fetch("https://libreriabackend-production.up.railway.app/libros", {
        signal: controller.signal
      });
      
      if (!response.ok) throw new Error("Error al buscar libros");
      
      const allBooks = await response.json();
      
      if (isMounted) {
        // Filtrar libros que coincidan con la búsqueda
        const filteredBooks = allBooks.filter(book => 
          book.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.autor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.categoria?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setBooks(filteredBooks);
      }
    } catch (err) {
      if (isMounted && err.name !== 'AbortError') {
        setErrorBooks(err.message);
      }
    } finally {
      if (isMounted) {
        setLoadingBooks(false);
      }
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  };

  // Obtener favoritos del usuario
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (!token) {
      setFavorites(new Set());
      setLoadingFavorites(false);
      return;
    }
    
    setLoadingFavorites(true);
    fetch("https://libreriabackend-production.up.railway.app/favoritos", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar favoritos");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          const favIds = new Set(data.map((fav) => fav.libro.id));
          setFavorites(favIds);
          setErrorFavorites(null);
        }
      })
      .catch((err) => {
        if (isMounted && err.name !== 'AbortError') {
          setErrorFavorites(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingFavorites(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token]);

  // Ejecutar búsqueda cuando cambie el query
  useEffect(() => {
    if (query) {
      searchBooks(query);
    }
  }, [query]);

  // Toggle favorito (agregar o quitar)
  function toggleFavorite(bookId) {
    if (!token) {
      alert("Debes iniciar sesión para agregar favoritos");
      return;
    }

    if (updatingFavoriteIds.has(bookId)) return;

    const method = favorites.has(bookId) ? "DELETE" : "POST";

    setUpdatingFavoriteIds((prev) => new Set(prev).add(bookId));

    fetch(`https://libreriabackend-production.up.railway.app/favoritos/${bookId}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error actualizando favoritos");
        setFavorites((prev) => {
          const updated = new Set(prev);
          if (method === "POST") updated.add(bookId);
          else updated.delete(bookId);
          return updated;
        });
      })
      .catch(() => alert("Error al actualizar favoritos"))
      .finally(() => {
        setUpdatingFavoriteIds((prev) => {
          const updated = new Set(prev);
          updated.delete(bookId);
          return updated;
        });
      });
  }

  const categories = ["All Categories", ...new Set(books.map((book) => book.categoria?.nombre))];
  
  // Filtrar y ordenar libros alfabéticamente por título
  const filteredBooks = (selectedCategory === "All Categories"
    ? books
    : books.filter((book) => book.categoria?.nombre === selectedCategory)
  ).sort((a, b) => a.titulo.localeCompare(b.titulo));

  if (!query) {
    return (
      <div
        id="content"
        style={{ backgroundColor: "#fafafa", padding: "20px", minHeight: "100vh" }}
      >
        <div className="container-fluid">
          <div className="text-center">
            <h2 className="text-gray-800">No se especificó un término de búsqueda</h2>
            <button 
              onClick={() => navigate('/library')} 
              className="btn btn-primary mt-3"
            >
              Volver a la biblioteca
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingBooks) return (
    <div
      id="content"
      style={{ backgroundColor: "#fafafa", padding: "20px", minHeight: "100vh" }}
    >
      <div className="container-fluid">
        <p>Buscando libros...</p>
      </div>
    </div>
  );

  if (errorBooks) return (
    <div
      id="content"
      style={{ backgroundColor: "#fafafa", padding: "20px", minHeight: "100vh" }}
    >
      <div className="container-fluid">
        <p>Error en la búsqueda: {errorBooks}</p>
        <button 
          onClick={() => navigate('/library')} 
          className="btn btn-primary mt-3"
        >
          Volver a la biblioteca
        </button>
      </div>
    </div>
  );

  return (
    <div
      id="content"
      style={{ backgroundColor: "#fafafa", padding: "20px", minHeight: "100vh" }}
    >
      <div className="container-fluid">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h3 mb-0 text-gray-800 fw-bold">Resultados de Búsqueda</h1>
            <p className="text-gray-600 mt-2">
              {filteredBooks.length} resultado{filteredBooks.length !== 1 ? 's' : ''} para "{query}"
            </p>
          </div>

          {books.length > 0 && (
            <select
              className="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
        </div>

        {loadingFavorites && <p>Cargando favoritos...</p>}
        {errorFavorites && <p>Error cargando favoritos: {errorFavorites}</p>}

        {filteredBooks.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                fill="#6c757d" 
                className="bi bi-search" 
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </div>
            <h3 className="text-gray-600">No se encontraron resultados</h3>
            <p className="text-gray-500">
              No pudimos encontrar libros que coincidan con "{query}"
            </p>
            <button 
              onClick={() => navigate('/library')} 
              className="btn btn-primary mt-3"
            >
              Explorar todos los libros
            </button>
          </div>
        ) : (
          <div className="book-list">
            {filteredBooks.map((book) => {
              const isFavorite = favorites.has(book.id);
              const isUpdating = updatingFavoriteIds.has(book.id);
              return (
                <div key={book.id} className="book-card">
                  <img src={book.imagenPortada} alt={book.titulo} className="book-image" />
                  <div className="book-info">
                    <h3 className="book-title">{book.titulo}</h3>
                    <p className="book-description">{book.descripcion}</p>
                    <div>
                      <button
                        className="read-more-btn mx-3"
                        style={{ textDecoration: "none" }}
                        onClick={() => navigate(`/book/${book.id}`)}
                      >
                        Leer Más
                      </button>
                      <svg
                        onClick={() => !isUpdating && toggleFavorite(book.id)}
                        style={{ cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.6 : 1 }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        fill={isFavorite ? "#e25555" : "currentColor"}
                        className={isFavorite ? "bi bi-heart-fill" : "bi bi-heart"}
                        viewBox="0 0 16 16"
                      >
                        {isFavorite ? (
                          <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                        ) : (
                          <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}