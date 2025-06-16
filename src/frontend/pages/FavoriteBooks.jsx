import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/FavoriteBooks.css";

export default function FavoriteBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);

  // ID único para este componente
  const componentId = "favorite-books-unique";

  const token = localStorage.getItem("token");

  // Fetch all books
  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const res = await fetch("https://libreriabackend-production.up.railway.app/libros");
        if (!res.ok) throw new Error("Error al cargar libros");
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  // Fetch favorites if token exists
  useEffect(() => {
    if (!token) {
      setFavorites(new Set());
      return;
    }

    async function fetchFavorites() {
      try {
        const res = await fetch("https://libreriabackend-production.up.railway.app/favoritos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar favoritos");
        const data = await res.json();
        setFavorites(new Set(data.map(fav => fav.libro.id)));
      } catch (error) {
        console.error(error);
      }
    }

    fetchFavorites();
  }, [token]);

  // Remove favorite handler
  const removeFavorite = useCallback(async (bookId) => {
    if (!token) return;
    try {
      const res = await fetch(`https://libreriabackend-production.up.railway.app/favoritos/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar favorito");
      setFavorites(prev => {
        const updated = new Set(prev);
        updated.delete(bookId);
        return updated;
      });
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  // Filtered favorite books
  const favoriteBooks = useMemo(() => books.filter(book => favorites.has(book.id)), [books, favorites]);

  // Categories from favorite books
  const categories = useMemo(() => {
    const cats = new Set(favoriteBooks.map(book => book.genero || book.genre).filter(Boolean));
    return ["All Categories", ...cats];
  }, [favoriteBooks]);

  // Books filtered by selected category
  const filteredBooks = useMemo(() => {
    if (selectedCategory === "All Categories") return favoriteBooks;
    return favoriteBooks.filter(book => (book.genero || book.genre) === selectedCategory);
  }, [selectedCategory, favoriteBooks]);

  if (loading) {
    return (
      <div id={`${componentId}-page`} className="fb-favorites-page">
        <div id={`${componentId}-container`} className="fb-container">
          <div id={`${componentId}-loading`} className="fb-loading-message">
            Cargando libros favoritos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={`${componentId}-page`} className="fb-favorites-page">
      <div id={`${componentId}-container`} className="fb-container">
        <div id={`${componentId}-header`} className="fb-favorites-header">
          <h1 id={`${componentId}-title`} className="fb-favorites-title">
            Mis Libros Favoritos
          </h1>
          
          <div id={`${componentId}-filter-container`} className="fb-category-filter-container">
            <select
              id={`${componentId}-category-filter`}
              className="fb-category-filter"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {!token ? (
          <div id={`${componentId}-auth-message`} className="fb-auth-message">
            <p>Inicia sesión para ver tus libros favoritos</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div id={`${componentId}-no-favorites`} className="fb-no-favorites-message">
            <p>No tienes libros favoritos en esta categoría.</p>
          </div>
        ) : (
          <div id={`${componentId}-book-grid`} className="fb-book-grid">
            {filteredBooks.map(book => (
              <div 
                key={book.id} 
                id={`${componentId}-book-${book.id}`}
                className="fb-book-card"
              >
                <img
                  id={`${componentId}-book-image-${book.id}`}
                  src={book.imagenPortada || book.image}
                  alt={book.titulo || book.name}
                  className="fb-book-image"
                />
                <div id={`${componentId}-book-info-${book.id}`} className="fb-book-info">
                  <h3 id={`${componentId}-book-title-${book.id}`} className="fb-book-title">
                    {book.titulo || book.name}
                  </h3>
                  <p id={`${componentId}-book-desc-${book.id}`} className="fb-book-description">
                    {book.descripcion || book.description}
                  </p>

                  <div id={`${componentId}-book-actions-${book.id}`} className="fb-book-actions">
                    <button
                      id={`${componentId}-read-more-${book.id}`}
                      className="fb-read-more-btn"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      Leer Más
                    </button>

                    <button
                      id={`${componentId}-favorite-btn-${book.id}`}
                      className="fb-favorite-btn fb-active"
                      onClick={() => removeFavorite(book.id)}
                      aria-label="Eliminar de favoritos"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        fill="currentColor"
                        className="fb-heart-icon"
                        viewBox="0 0 16 16"
                      >
                        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}