import { useState } from "react";
import "../../assets/css/sidebarLibrary.css";
import { books } from "../../data/BooksData";
import BookCard from "./BookCard";

export default function BooksCategories() {
 

  const categories = [...new Set(books.map(book => book.category))];
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredBooks = selectedCategory === "Todos" ? books : books.filter(book => book.category === selectedCategory);

  return (
    <div className="container">
      <h1 className="category-title">Mis Categorías de Libros</h1>

      {/* Filtrador basado en tus propias categorías */}
      <div className="category-filter">
        <button className={`filter-btn ${selectedCategory === "Todos" ? "active" : ""}`} onClick={() => setSelectedCategory("Todos")}>Todos</button>
        {categories.map(category => (
          <button key={category} className={`filter-btn ${selectedCategory === category ? "active" : ""}`} onClick={() => setSelectedCategory(category)}>
            {category}
          </button>
        ))}
      </div>

      {/* Listado de libros filtrados */}
      <div className="book-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <p className="no-books-message">No hay libros en esta categoría</p>
        )}
      </div>

    </div>
  );
}
