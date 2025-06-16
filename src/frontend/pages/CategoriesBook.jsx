import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/CategoriesBook.css";

export default function CategoriesBook() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ID único para este componente
  const componentId = "categories-book-unique";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          fetch("https://libreriabackend-production.up.railway.app/libros"),
          fetch("https://libreriabackend-production.up.railway.app/categorias"),
        ]);

        if (!booksRes.ok || !categoriesRes.ok) {
          throw new Error("Error al obtener datos del servidor");
        }

        const booksData = await booksRes.json();
        const categoriesData = await categoriesRes.json();

        setBooks(booksData);
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBooks =
    selectedCategory === "Todos"
      ? books
      : books.filter((book) => book.categoria?.nombre === selectedCategory);

  return (
    <div id={`${componentId}-page`} className="cb-categories-page">
      <div id={`${componentId}-container`} className="cb-container">
        <h1 id={`${componentId}-title`} className="cb-category-title">
          Mis Categorías de Libros
        </h1>

        <div id={`${componentId}-filter-section`} className="cb-category-filter-section">
          <div id={`${componentId}-filter`} className="cb-category-filter">
            <button
              id={`${componentId}-filter-todos`}
              className={`cb-filter-btn ${selectedCategory === "Todos" ? "cb-active" : ""}`}
              onClick={() => setSelectedCategory("Todos")}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                id={`${componentId}-filter-${category.id}`}
                className={`cb-filter-btn ${selectedCategory === category.nombre ? "cb-active" : ""}`}
                onClick={() => setSelectedCategory(category.nombre)}
              >
                {category.nombre}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p id={`${componentId}-loading`} className="cb-loading-message">
            Cargando libros...
          </p>
        ) : error ? (
          <p id={`${componentId}-error`} className="cb-error-message">
            {error}
          </p>
        ) : (
          <>
            <div id={`${componentId}-results-counter`} className="cb-results-counter">
              <p>
                {selectedCategory === "Todos"
                  ? `Mostrando todos los libros (${filteredBooks.length})`
                  : `Categoría: ${selectedCategory} (${filteredBooks.length} libro${
                      filteredBooks.length !== 1 ? "s" : ""
                    })`}
              </p>
            </div>

            <div id={`${componentId}-book-grid`} className="cb-book-grid">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <div 
                    key={book.id} 
                    id={`${componentId}-book-${book.id}`}
                    className="cb-book-card"
                  >
                    <img 
                      id={`${componentId}-book-image-${book.id}`}
                      src={book.imagenPortada} 
                      alt={book.titulo} 
                      className="cb-book-image" 
                    />
                    <div id={`${componentId}-book-info-${book.id}`} className="cb-book-info">
                      <h3 id={`${componentId}-book-title-${book.id}`} className="cb-book-title">
                        {book.titulo}
                      </h3>
                      <p id={`${componentId}-book-desc-${book.id}`} className="cb-book-description">
                        {book.descripcion}
                      </p>
                      <button
                        id={`${componentId}-read-more-${book.id}`}
                        className="cb-read-more-btn"
                        onClick={() => navigate(`/book/${book.id}`)}
                      >
                        Leer Más
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div id={`${componentId}-no-books`} className="cb-no-books-message">
                  <h3 id={`${componentId}-no-books-title`}>No hay libros en esta categoría</h3>
                  <p id={`${componentId}-no-books-desc`}>
                    Intenta seleccionar otra categoría o explora todos los libros disponibles.
                  </p>
                  <button
                    id={`${componentId}-reset-filter`}
                    className="cb-reset-filter-btn"
                    onClick={() => setSelectedCategory("Todos")}
                  >
                    Ver todos los libros
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}