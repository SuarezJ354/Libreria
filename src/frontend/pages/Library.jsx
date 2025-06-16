import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/Library.css"

export default function Library() {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set()); // IDs favoritos
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const navigate = useNavigate();
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [errorBooks, setErrorBooks] = useState(null);
  const [errorFavorites, setErrorFavorites] = useState(null);
  const [updatingFavoriteIds, setUpdatingFavoriteIds] = useState(new Set()); // para controlar botones bloqueados

  const token = localStorage.getItem("token");

  // Obtener libros
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    setLoadingBooks(true);
    fetch("https://libreriabackend-production.up.railway.app/libros", {
      signal: controller.signal
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar libros");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setBooks(data);
          setErrorBooks(null);
        }
      })
      .catch((err) => {
        if (isMounted && err.name !== 'AbortError') {
          setErrorBooks(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingBooks(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

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
          // data es array de Favorito { id, usuario, libro }
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

  // Toggle favorito (agregar o quitar)
  function toggleFavorite(bookId) {
    if (!token) {
      alert("Debes iniciar sesión para agregar favoritos");
      return;
    }

    if (updatingFavoriteIds.has(bookId)) return; // evitar clicks múltiples

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

  if (loadingBooks) return <p className="library-loading">Cargando libros...</p>;
  if (errorBooks) return <p className="library-error">Error cargando libros: {errorBooks}</p>;

  return (
    <div id="library-container">
      <div className="container-fluid">
        <div id="library-header">
          <h1 id="library-title">Mis Libros</h1>

          <select
            id="library-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loadingFavorites && <p className="library-loading">Cargando favoritos...</p>}
        {errorFavorites && <p className="library-error">Error cargando favoritos: {errorFavorites}</p>}

        <div id="library-book-list">
          {filteredBooks.map((book) => {
            const isFavorite = favorites.has(book.id);
            const isUpdating = updatingFavoriteIds.has(book.id);
            return (
              <div key={book.id} className="library-book-card">
                <img 
                  src={book.imagenPortada} 
                  alt={book.titulo} 
                  className="library-book-image" 
                />
                <div className="library-book-info">
                  <h3 className="library-book-title">{book.titulo}</h3>
                  <p className="library-book-description">{book.descripcion}</p>
                  <div className="library-book-actions">
                    <button
                      className="library-read-more-btn"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      Leer Más
                    </button>
                      <svg
                        onClick={() => !isUpdating && toggleFavorite(book.id)}
                        style={{ 
                          cursor: isUpdating ? "not-allowed" : "pointer", 
                          opacity: isUpdating ? 0.6 : 1 
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        fill={isFavorite ? "#e25555" : "currentColor"}
                        className={`library-favorite-icon ${isFavorite ? "bi bi-heart-fill" : "bi bi-heart"}`}
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
      </div>
    </div>
  );
}