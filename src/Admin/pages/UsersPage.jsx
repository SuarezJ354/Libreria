import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/UsersPage.css";

export default function UsersPage() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [editUsuarioId, setEditUsuarioId] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", correo: "", rol: "" });

  useEffect(() => {
    if (!token) return console.error("Token no disponible");

    const fetchUsuarios = async () => {
      try {
        const res = await fetch("https://libreriabackend-production.up.railway.app/usuarios/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const data = await res.json();
        setUsuarios(data);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };

    fetchUsuarios();
  }, [token]);

  const iniciarEdicion = ({ id, nombre, correo, rol }) => {
    setEditUsuarioId(id);
    setFormData({ nombre, correo, rol });
  };

  const cancelarEdicion = () => {
    setEditUsuarioId(null);
    setFormData({ nombre: "", correo: "", rol: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    try {
      const res = await fetch(`https://libreriabackend-production.up.railway.app/usuarios/${editUsuarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al actualizar usuario");

      const updatedUser = await res.json();

      setUsuarios((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      cancelarEdicion();
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
    }
  };

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
      const res = await fetch(`https://libreriabackend-production.up.railway.app/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar usuario");

      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    }
  };

  return (
    <div className="users-container">
      <h2 className="mb-4">Administrar Usuarios</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => {
            const isEditing = editUsuarioId === usuario.id;
            return (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>
                  {isEditing ? (
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  ) : (
                    usuario.nombre
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                    />
                  ) : (
                    usuario.correo
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select name="rol" value={formData.rol} onChange={handleChange}>
                      <option value="ADMIN">Administrador</option>
                      <option value="BIBLIOTECARIO">Bibliotecario</option>
                      <option value="USUARIO">Usuario</option>
                    </select>
                  ) : (
                    usuario.rol
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <>
                      <button className="action-btn save-btn" onClick={guardarCambios}>
                        Guardar
                      </button>
                      <button className="action-btn cancel-btn" onClick={cancelarEdicion}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="action-btn edit-btn" onClick={() => iniciarEdicion(usuario)}>
                        Editar
                      </button>
                      <button className="action-btn delete-btn" onClick={() => eliminarUsuario(usuario.id)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
