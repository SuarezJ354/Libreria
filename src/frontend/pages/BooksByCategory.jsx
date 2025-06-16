import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../../assets/css/BooksByCategory.css";

export default function BooksByCategory() {
  const { categoria } = useParams();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`https://libreriabackend-production.up.railway.app/libros/categoria/${categoria}`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Error al obtener libros por categoría:", err));
  }, [categoria]);

  const formattedCategory = categoria.replace(/-/g, " ");

  return (
    <div id="category-page-unique">
      <div id="container-category-unique">
        <h2 id="category-title-unique">Categoría: {formattedCategory}</h2>
        {books.length === 0 ? (
          <p id="no-books-message-unique">No hay libros en esta categoría.</p>
        ) : (
          <div id="book-grid-unique">
            {books.map((book) => (
              <div key={book.id} className="book-card-unique">
                <img
                  src={book.imagenPortada}
                  alt={book.titulo}
                  className="book-image-unique"
                />
                <div className="book-info-category-unique">
                  <h3 className="book-title-category-unique">{book.titulo}</h3>
                  <p className="book-description-category-unique">{book.descripcion}</p>
                  <div className="book-actions-unique">
                    <Link
                      to={`/book/${book.id}`}
                      className="read-more-btn-unique"
                    >
                      Leer Más
                    </Link>
                    <button className="heart-btn-unique" aria-label="Agregar a favoritos">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        fill="currentColor"
                        className="bi bi-heart"
                        viewBox="0 0 16 16"
                      >
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
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