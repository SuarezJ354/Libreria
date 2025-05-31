import React, { useEffect, useState } from "react";
import "../../assets/css/sidebarLibrary.css";
import { useNavigate } from "react-router-dom";

export default function BooksFavorite() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const token = localStorage.getItem("token");

  // 1. Traer todos los libros desde backend (para info completa)
  useEffect(() => {
    fetch("http://localhost:8080/libros")
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(console.error);
  }, []);

  // 2. Traer favoritos del usuario
  useEffect(() => {
    if (!token) return setFavorites(new Set());

    fetch("http://localhost:8080/favoritos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const favIds = new Set(data.map(fav => fav.libro.id));
        setFavorites(favIds);
      })
      .catch(console.error);
  }, [token]);

  // Quitar favorito
  const removeFavorite = (bookId) => {
    fetch(`http://localhost:8080/favoritos/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          // Actualizar estado local
          setFavorites(prev => {
            const newFav = new Set(prev);
            newFav.delete(bookId);
            return newFav;
          });
        } else {
          console.error("Error al eliminar favorito");
        }
      })
      .catch(console.error);
  };

  // Filtrar solo libros favoritos
  const favoriteBooks = books.filter(book => favorites.has(book.id));

  // Categorías para filtro (de favoritos)
  const categories = [
    "All Categories",
    ...new Set(favoriteBooks.map(book => book.genero || book.genre))
  ];

  // Filtrar favoritos por categoría
  const filteredBooks = selectedCategory === "All Categories"
    ? favoriteBooks
    : favoriteBooks.filter(book => (book.genero || book.genre) === selectedCategory);

  return (
    <div id="content" style={{ backgroundColor: "#fafafa", padding: "20px", minHeight: "100vh" }}>
      <div className="container-fluid">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800 my-4 fw-bold">Mis Libros Favoritos</h1>

          <select
            className="category-filter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map((category, i) => (
              <option key={i} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="book-list">
          {filteredBooks.length === 0 && <p>No tienes libros favoritos en esta categoría.</p>}

          {filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              <img src={book.imagenPortada || book.image} alt={book.titulo || book.name} className="book-image" />
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
          ))}
        </div>
      </div>
    </div>
  );
}
