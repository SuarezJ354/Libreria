import React, { useState, useEffect } from "react";
import "../../assets/css/sidebarLibrary.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SidebarLibrary() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("https://libreriabackend-production.up.railway.app/categorias")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  return (
    <ul className="navbar-nav sidebar accordion" id="accordionSidebar">
      {/* Título principal */}
      <h1 className="sidebar-title">Library</h1>

      {/* Sección del menú */}
      <h3 className="sidebar-subtitle">Menu</h3>

      {/* Libros */}
      <li className="nav-item mx-1 my-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-link custom-link ${isActive ? "active-links" : ""}`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-journals"
            viewBox="0 0 16 16"
          >
            <path d="M5 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2h1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1H1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1H3a2 2 0 0 1 2-2" />
            <path d="M1 6v-.5a.5.5 0 0 1 1 0V6h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V9h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 2.5v.5H.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H2v-.5a.5.5 0 0 0-1 0" />
          </svg>{" "}
          <span>Libros</span>
        </NavLink>
      </li>

      {/* Libros Favoritos */}
      <li className="nav-item mx-1 my-1">
        <NavLink
          to="/favorite-books"
          className={({ isActive }) =>
            `nav-link custom-link ${isActive ? "active-links" : ""}`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-heart"
            viewBox="0 0 16 16"
          >
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
          </svg>
          <span>Libros Favoritos</span>
        </NavLink>
      </li>

      {/* Mis Categorías */}
      <li className="nav-item mx-1 my-1">
        <NavLink
          to="/my-categories"
          className={({ isActive }) =>
            `nav-link custom-link ${isActive ? "active-links" : ""}`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-list-ul"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            />
          </svg>
          <span>Mis Categorias</span>
        </NavLink>
      </li>

      {/* Mensajes */}
      <li className="nav-item mx-1 my-1">
        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `nav-link custom-link ${isActive ? "active-links" : ""}`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-chat-right-dots"
            viewBox="0 0 16 16"
          >
            <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
            <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
          </svg>
          <span>Mensajes</span>
        </NavLink>
      </li>

      {/* Dashboard para roles ADMIN y BIBLIOTECARIO */}
      {(user?.rol === "ADMIN" || user?.rol === "BIBLIOTECARIO") && (
        <li className="nav-item mx-1 my-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link custom-link ${isActive ? "active-links" : ""}`
            }
          >
            <i className="bi bi-file-lock2"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
      )}

      {/* Sección categorías */}
      <h3 className="sidebar-subtitle">Categorias</h3>

      {categories.map((category) => (
        <li key={category.id} className="nav-item mx-1 my-1">
          <NavLink
            to={`/books/category/${category.nombre
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className={({ isActive }) =>
              `nav-link custom-link ${isActive ? "active-links" : ""}`
            }
          >
            <i className="bi bi-book"></i> {category.nombre}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
