import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function BooksList() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      console.warn("Token ausente. Usuario no autenticado.");
      setLoading(false);
      return;
    }

    const fetchBooks = async () => {
      try {
        const res = await fetch("https://libreriabackend-production.up.railway.app/libros", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Error al obtener libros:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [token]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Eliminar el libro "${title}"?`)) return;

    try {
      const res = await fetch(`https://libreriabackend-production.up.railway.app/libros/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo eliminar el libro");

      setBooks((prev) => prev.filter((book) => book.id !== id));
      alert("Libro eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar libro:", err.message);
      alert("Hubo un error al intentar eliminar el libro");
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando libros...</div>;

  return (
    <div className="container-fluid" id="content">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Libros</h1>
        <NavLink
          to="/dashboard/create-books"
          className="btn btn-primary btn-lg shadow rounded-pill d-flex align-items-center gap-2 px-4"
        >
          <i className="fas fa-plus fa-lg text-white" />
          <span className="fw-bold text-white">Agregar Libro</span>
        </NavLink>
      </div>

      <div className="input-group mb-3 rounded-pill border w-50">
        <span className="input-group-text bg-white border-0 pe-1">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="search"
          className="form-control border-0"
          placeholder="Buscar Libro"
          aria-label="Buscar Libro"
        />
      </div>

      <table className="table align-middle mb-0 bg-white shadow-sm">
        <thead className="bg-light">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Autor</th>
            <th>Año</th>
            <th>Género</th>
            <th>Imagen</th>
            <th>Capítulos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.titulo}</td>
              <td>{book.descripcion}</td>
              <td>{book.autor}</td>
              <td>{book.anioPublicacion}</td>
              <td>{book.categoria?.nombre || "Sin categoría"}</td>
              <td>
                <img src={book.imagenPortada} alt={book.titulo} width="50" height="75" />
              </td>
              <td>{book.capitulos?.length || 0}</td>
              <td>
                <div className="d-flex gap-2">
                  <NavLink
                    to={`/dashboard/edit-books/${book.id}`}
                    className="btn btn-warning btn-sm"
                    title="Editar libro"
                  >
                    <i className="bi bi-pen" />
                  </NavLink>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(book.id, book.titulo)}
                    title="Eliminar libro"
                  >
                    <i className="bi bi-trash" />
                  </button>
                  <NavLink
                    to={`/dashboard/books/${book.id}/chapters`}
                    className="btn btn-info btn-sm"
                    title="Ver capítulos"
                  >
                    <i className="bi bi-journal-text" />
                  </NavLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
