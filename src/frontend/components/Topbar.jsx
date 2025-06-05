import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirigir a página de resultados de búsqueda con el término como parámetro
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      // Opcional: limpiar el campo de búsqueda después de buscar
      // setSearchTerm("");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Función para búsqueda en tiempo real (opcional)
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand navbar-light bg-white topbar static-top d-flex justify-content-between">
        {/* Buscador */}
        <form 
          className="d-none d-sm-inline-block form-inline mr-auto navbar-search"
          onSubmit={handleSearchSubmit}
        >
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text bg-white border-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </span>
            </div>
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Buscar..."
              aria-label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            <div className="input-group-append">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!searchTerm.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </button>
            </div>
          </div>
        </form>

        {/* Icono de campana + perfil */}
        <ul className="navbar-nav ml-auto align-items-center">
          <li className="nav-item mx-2 d-flex align-items-center">
            {user ? (
              <>
                <span className="mr-2 text-gray-600 small">{user.nombre}</span>
                <img
                  className="img-profile rounded-circle"
                  src={user.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                  alt="User profile"
                  style={{ width: "40px", height: "40px", objectFit: "cover", marginLeft: "10px" }}
                />
                <button
                  onClick={logout}
                  className="btn btn-link text-danger ml-3"
                  style={{ padding: 0, marginLeft: "15px" }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}