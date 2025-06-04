import React, { useEffect, useState, useCallback, useMemo } from "react";
import "../../assets/css/sidebarLibrary.css";
import { useNavigate } from "react-router-dom";

export default function BooksFavorite() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const token = localStorage.getItem("token");

  // Fetch all books
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("https://libreriabackend-production.up.railway.app/libros");
        if (!res.ok) throw new Error("Error al cargar libros");
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        console.error(error);
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

  return (
    <div id="content" style={{ backgroundColor: "#fafafa", padding: 20, minHeight: "100vh" }}>
      <div className="container-fluid">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800 my-4 fw-bold">Mis Libros Favoritos</h1>

          <select
            className="category-filter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="book-list">
          {filteredBooks.length === 0 ? (
            <p>No tienes libros favoritos en esta categoría.</p>
          ) : (
            filteredBooks.map(book => (
              <div key={book.id} className="book-card">
                <img
                  src={book.imagenPortada || book.image}
                  alt={book.titulo || book.name}
                  className="book-image"
                />
                <div className="book-info">
                  <h3 className="book-title">{book.titulo || book.name}</h3>
                  <p className="book-description">{book.descripcion || book.description}</p>

                  <div>
                    <button
                      className="read-more-btn mx-3"
                      style={{ textDecoration: "none" }}
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      Leer Más
                    </button>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      fill="#e00"
                      className="bi bi-heart-fill"
                      viewBox="0 0 16 16"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeFavorite(book.id)}
                    >
                      <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
