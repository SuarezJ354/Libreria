import "../../assets/css/sidebar.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { user, logout } = useAuth();  // <-- Obtener user aquí
  const navigate = useNavigate();

  return (
    <>
      <ul
        className="navbar-nav sidebars sidebar-dashboard accordion"
        id="accordionSidebar"
        style={{
          width: "250px",
          minHeight: "100vh",
          backgroundColor: "#5953cd",
          color: "white",
          position: "relative",
        }}
      >
        {/* Sidebar - Brand */}
        <NavLink
          to="/dashboard"
          className="sidebar-brand d-flex align-items-center justify-content-center my-4 sidebar-brand-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="white"
            className="bi bi-journal-bookmark-fill"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M6 1h6v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8z"
            />
            <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
            <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
          </svg>
          <div className="sidebar-brand-text mx-3 text-white">Libros</div>
        </NavLink>

        {/* Links con estilos dinámicos */}
        <li className="nav-item mx-1 my-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link custom-link ${isActive ? "active-link" : ""}`}
            end
          >
            <i className="fas fa-fw fa-tachometer-alt"></i> <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="nav-item mx-1 my-1">
          <NavLink
            to="/dashboard/books"
            className={({ isActive }) => `nav-link custom-link ${isActive ? "active-link" : ""}`}
          >
            <i className="fas fa-fw fa-book"></i> <span>Libros</span>
          </NavLink>
        </li>
        <li className="nav-item mx-1 my-1">
          <NavLink
            to="/dashboard/create-books"
            className={({ isActive }) => `nav-link custom-link ${isActive ? "active-link" : ""}`}
          >
            <i className="fas fa-fw fa-plus"></i> <span>Añadir Libros</span>
          </NavLink>
        </li>
        <li className="nav-item mx-1 my-1">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link custom-link ${isActive ? "active-link" : ""}`}
          >
            <i className="fa-solid fa-house"></i> <span>Pagina Principal</span>
          </NavLink>
        </li>

        {user?.rol === "ADMIN" && (
          <li className="nav-item mx-1 my-1">
            <NavLink
              to="/dashboard/users"
              className={({ isActive }) => `nav-link custom-link ${isActive ? "active-link" : ""}`}
            >
              <i className="fas fa-fw fa-users-cog"></i> <span>Modificar Usuarios</span>
            </NavLink>
          </li>
        )}

        {/* Bottom User Info + Logout */}
        <div>
          <hr className="sidebar-divider" />

          <div className="sidebar-footer">
            <hr className="sidebar-divider" />
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Profile"
              className="sidebar-profile-img"
            />
            <div className="sidebar-user">{user?.nombre || "Usuario"}</div>
            <hr className="sidebar-divider" />
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                margin: "10px auto",
                display: "block",
                cursor: "pointer"
              }}
            >
              Cerrar sesión
            </button>

          </div>
        </div>
      </ul>
    </>
  );
}
