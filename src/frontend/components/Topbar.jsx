import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowMobileSearch(false); // Cerrar búsqueda móvil después de buscar
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  return (
    <>
      <nav className="navbar navbar-expand navbar-light bg-white topbar static-top shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          
          {/* Buscador Desktop */}
          <form 
            className="d-none d-md-inline-block form-inline mr-auto navbar-search flex-grow-1 mx-3"
            onSubmit={handleSearchSubmit}
            style={{ maxWidth: "400px" }}
          >
            <div className="input-group w-100">
              <div className="input-group-prepend">
                <span className="input-group-text bg-white border-right-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </span>
              </div>
              <input
                type="text"
                className="form-control border-left-0 border-right-0"
                placeholder="Buscar..."
                aria-label="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                style={{ boxShadow: "none" }}
              />
              <div className="input-group-append">
                <button 
                  type="submit" 
                  className="btn btn-primary border-left-0"
                  disabled={!searchTerm.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            {/* Botón de búsqueda móvil */}
            <button 
              className="btn btn-light d-md-none mr-2"
              onClick={toggleMobileSearch}
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </button>

            {/* Sección de usuario */}
            <div className="d-flex align-items-center">
              {user ? (
                <div className="d-flex align-items-center">
                  {/* Nombre del usuario - solo visible en tablets y desktop */}
                  <span className="d-none d-sm-inline mr-2 text-muted small">
                    {user.nombre}
                  </span>
                  
                  {/* Avatar */}
                  <div className="dropdown">
                    <img
                      className="img-profile rounded-circle dropdown-toggle"
                      src={user.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                      alt="User profile"
                      style={{ 
                        width: "35px", 
                        height: "35px", 
                        objectFit: "cover",
                        cursor: "pointer"
                      }}
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    />
                    
                    {/* Dropdown menu para móvil */}
                    <div className="dropdown-menu dropdown-menu-right">
                      <span className="dropdown-item-text d-sm-none">
                        <strong>{user.nombre}</strong>
                      </span>
                      <div className="dropdown-divider d-sm-none"></div>
                      <button
                        onClick={logout}
                        className="dropdown-item text-danger"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                  
                  {/* Botón cerrar sesión - solo visible en desktop */}
                  <button
                    onClick={logout}
                    className="btn btn-link text-danger d-none d-lg-inline ml-2 p-0"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm">
                  <span className="d-none d-sm-inline">Iniciar Sesión</span>
                  <span className="d-sm-none">Login</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Barra de búsqueda móvil colapsable */}
        {showMobileSearch && (
          <div className="bg-light border-top d-md-none p-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar..."
                  aria-label="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  autoFocus
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
                  <button 
                    type="button" 
                    className="btn btn-light"
                    onClick={toggleMobileSearch}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </>
    );
}