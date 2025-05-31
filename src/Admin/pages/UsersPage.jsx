import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/UsersPage.css"

export default function UsersPage() {
  const { token } = useAuth(); // Asegura que tienes el token de autenticación
  const [usuarios, setUsuarios] = useState([]);
  const [editUsuarioId, setEditUsuarioId] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", correo: "", rol: "" });

useEffect(() => {
  console.log("Token en useAuth():", token);
  if (!token) {
    console.error("El token es undefined, el usuario probablemente no ha iniciado sesión.");
    return;
  }

  fetch("http://localhost:8080/usuarios/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then(setUsuarios)
    .catch((error) => console.error("Error al obtener usuarios:", error));
}, [token]);


  function iniciarEdicion(usuario) {
    setEditUsuarioId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    });
  }

  function cancelarEdicion() {
    setEditUsuarioId(null);
    setFormData({ nombre: "", correo: "", rol: "" });
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

function guardarCambios() {
  console.log("Enviando datos:", formData);
  console.log("Token usado:", token); // Verificar si el token se está enviando

  fetch(`http://localhost:8080/usuarios/${editUsuarioId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Asegurar que el token está presente
    },
    body: JSON.stringify(formData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al actualizar usuario");
      return res.json();
    })
    .then((usuarioActualizado) => {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioActualizado.id ? usuarioActualizado : u))
      );
      cancelarEdicion();
    })
    .catch((error) => console.error("Error al actualizar usuario:", error));
}


  function eliminarUsuario(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    fetch(`http://localhost:8080/usuarios/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar usuario");
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
      })
      .catch((error) => console.error("Error al eliminar usuario:", error));
  }

  return (
    <div className="users-container">
  <h2>Administrar Usuarios</h2>
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
      {usuarios.map((usuario) => (
        <tr key={usuario.id}>
          <td>{usuario.id}</td>
          <td>{editUsuarioId === usuario.id ? (
            <input name="nombre" value={formData.nombre} onChange={handleChange} />
          ) : usuario.nombre}</td>
          <td>{editUsuarioId === usuario.id ? (
            <input name="correo" value={formData.correo} onChange={handleChange} />
          ) : usuario.correo}</td>
          <td>{editUsuarioId === usuario.id ? (
            <select name="rol" value={formData.rol} onChange={handleChange}>
              <option value="ADMIN">Administrador</option>
              <option value="BIBLIOTECARIO">Bibliotecario</option>
              <option value="USUARIO">Usuario</option>
            </select>
          ) : usuario.rol}</td>
          <td>
            {editUsuarioId === usuario.id ? (
              <>
                <button className="action-btn save-btn" onClick={guardarCambios}>Guardar</button>
                <button className="action-btn cancel-btn" onClick={cancelarEdicion}>Cancelar</button>
              </>
            ) : (
              <>
                <button className="action-btn edit-btn" onClick={() => iniciarEdicion(usuario)}>Editar</button>
                <button className="action-btn delete-btn" onClick={() => eliminarUsuario(usuario.id)}>Eliminar</button>
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}
