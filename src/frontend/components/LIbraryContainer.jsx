import React, { useState, useEffect, useCallback } from "react";
import LibraryBooks from "./LibraryBooks";
import BooksFavorite from "./BooksFavorite";

export default function LibraryContainer() {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const token = localStorage.getItem("token");

  // Fetch general books
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("https://libreriabackend-production.up.railway.app/libros");
        if (!res.ok) throw new Error("Error cargando libros");
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchBooks();
  }, []);

  // Fetch favoritos del usuario
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
        if (!res.ok) throw new Error("Error cargando favoritos");
        const data = await res.json();
        setFavorites(new Set(data.map(fav => fav.libro.id)));
      } catch (error) {
        console.error(error);
      }
    }
    fetchFavorites();
  }, [token]);

  // Función para agregar o eliminar favorito
  const toggleFavorite = useCallback(async (bookId) => {
    if (!token) {
      alert("Debes iniciar sesión para agregar favoritos");
      return;
    }
    const isFavorite = favorites.has(bookId);
    try {
      const res = await fetch(`https://libreriabackend-production.up.railway.app/favoritos/${bookId}`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Error actualizando favoritos");
      setFavorites(prev => {
        const updated = new Set(prev);
        if (isFavorite) {
          updated.delete(bookId);
        } else {
          updated.add(bookId);
        }
        return updated;
      });
    } catch (error) {
      alert(error.message || "Error al actualizar favoritos");
    }
  }, [favorites, token]);

  const favoriteBooks = books.filter(book => favorites.has(book.id));

  return (
    <>
      <LibraryBooks books={books} favorites={favorites} toggleFavorite={toggleFavorite} />
      <BooksFavorite books={favoriteBooks} favorites={favorites} toggleFavorite={toggleFavorite} />
    </>
  );
}
