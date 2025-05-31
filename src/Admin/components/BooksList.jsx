import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Importar el contexto de autenticación

export default function BooksList() {
  const { token } = useAuth(); // Obtener el token del contexto
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Token en useAuth():", token);
    if (!token) {
      console.error("El token es undefined, el usuario probablemente no ha iniciado sesión.");
      setLoading(false);
      return;
    }

    fetch("https://libreriabackend-production.up.railway.app/libros", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener libros:", error);
        setLoading(false);
      });
  }, [token]);

  const handleDelete = (bookId, bookTitle) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el libro "${bookTitle}"?`)) return;

    fetch(`https://libreriabackend-production.up.railway.app/libros/${bookId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar libro");
        setBooks((prev) => prev.filter((book) => book.id !== bookId));
        alert('Libro eliminado exitosamente');
      })
      .catch((error) => {
        console.error("Error al eliminar libro:", error);
        alert('Error al eliminar el libro');
      });
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando libros...</div>;
  }

  return (
    <div id="content">
      <div className="container-fluid">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800">Libros</h1>
          <NavLink 
            to="/dashboard/create-books" 
            className="btn btn-primary btn-lg shadow-lg rounded-pill d-flex align-items-center justify-content-center gap-2 px-4"
            style={{ transition: "all 0.3s ease", textDecoration: "none" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#635eba"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#5953cd"}
          >
            <i className="fas fa-plus fa-lg text-white"></i>  
            <span className="fw-bold text-white">Agregar Libro</span>
          </NavLink>
        </div>

        <div className="row">
          <div className="input-group mb-3 rounded-pill overflow-hidden border w-50">
            <span className="input-group-text bg-white border-0 pe-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </span>
            <input type="search" className="form-control hide-focus border-0" placeholder="Buscar Libro" />
          </div>

          <table className="table align-middle mb-0 bg-white">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Autor</th>
                <th>Año de Publicación</th>
                <th>Género</th>
                <th>Imagen</th>
                <th>Total de capítulos</th> {/* Nueva columna */}
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
                  <td>{book.categoria.nombre}</td>
                  <td><img src={book.imagenPortada} alt={book.name} width="50" height="75" /></td>

                  {/* Total capítulos: si existe el array de capítulos lo cuenta, si no muestra 0 */}
                  <td>{book.capitulos ? book.capitulos.length : 0}</td> 

                  <td>
                    <div className="d-flex gap-2">
                      {/* Botón Editar libro */}
                      <NavLink 
                        to={`/dashboard/edit-books/${book.id}`}
                        className="btn btn-warning btn-sm"
                        title="Editar libro"
                      >
                        <i className="bi bi-pen"></i>
                      </NavLink>

                      {/* Botón Eliminar libro */}
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(book.id, book.titulo)}
                        title="Eliminar libro"
                      >
                        <i className="bi bi-trash"></i>
                      </button>

                      {/* Botón Editar capítulos */}
                      <NavLink
                        to={`/dashboard/books/${book.id}/chapters`}
                        className="btn btn-info btn-sm"
                        title="Editar capítulos"
                      >
                        <i className="bi bi-journal-text"></i>
                      </NavLink>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}