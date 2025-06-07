import "../../assets/css/sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2", end: true },
    { to: "/dashboard/books", label: "Libros", icon: "bi-book" },
    { to: "/dashboard/create-books", label: "Añadir Libros", icon: "bi-plus-lg" },
    { to: "/", label: "Pagina Principal", icon: "bi-house" },
    { to: "/dashboard/export", label: "Exportar a CSV", icon: "fa-regular fa-file-export" },
    
  ];

  if (user?.rol === "ADMIN") {
    navLinks.push({ to: "/dashboard/users", label: "Modificar Usuarios", icon: "bi-people-fill" });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
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

      {/* Nav links */}
      {navLinks.map(({ to, label, icon, end }, idx) => (
        <li key={idx} className="nav-item mx-1 my-1">
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-link custom-link ${isActive ? "active-link" : ""}`
            }
          >
            <i className={`bi ${icon} me-2`}></i>
            <span>{label}</span>
          </NavLink>
        </li>
      ))}

      {/* Footer: User info & Logout */}
      <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <hr className="sidebar-divider" />

        <div className="sidebar-footer text-center">
          <img
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            alt="Profile"
            className="sidebar-profile-img mb-2"
          />
          <div className="sidebar-user mb-2">{user?.nombre || "Usuario"}</div>
          <hr className="sidebar-divider" />
          <button className="btn btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </ul>
  );
}
