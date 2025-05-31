import React, { useState, useEffect } from "react";
import LibraryBooks from "./LibraryBooks";
import BooksFavorite from "./BooksFavorite";

export default function LibraryContainer() {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const token = localStorage.getItem("token");

  // Obtener todos los libros
  useEffect(() => {
    fetch("https://libreriabackend-production.up.railway.app/libros")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch(console.error);
  }, []);

  // Obtener libros favoritos del usuario
  useEffect(() => {
    if (!token) {
      setFavorites(new Set());
      return;
    }
    fetch("https://libreriabackend-production.up.railway.app/favoritos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Asumo que data es array de objetos favoritos que tienen la propiedad libro con el id
        const favIds = new Set(data.map((fav) => fav.libro.id));
        setFavorites(favIds);
      })
      .catch(console.error);
  }, [token]);

  // Función para agregar o eliminar favorito
  function toggleFavorite(bookId) {
    if (!token) {
      alert("Debes iniciar sesión para agregar favoritos");
      return;
    }

    const method = favorites.has(bookId) ? "DELETE" : "POST";

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
      .catch(() => alert("Error al actualizar favoritos"));
  }

  // Filtrar solo libros favoritos
  const favoriteBooks = books.filter((book) => favorites.has(book.id));

  return (
    <>
      <LibraryBooks
        books={books}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
      <BooksFavorite books={favoriteBooks} />
    </>
  );
}
