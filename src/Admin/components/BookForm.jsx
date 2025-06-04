import { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "https://libreriabackend-production.up.railway.app/libros";

const CATEGORIAS = [
  { id: 1, nombre: "Clasico" },
  { id: 2, nombre: "Realismo Mágico" },
  { id: 3, nombre: "Épico" },
  { id: 4, nombre: "Distopía" },
  { id: 5, nombre: "Romance" },
  { id: 6, nombre: "Ficción Psicológica" },
  { id: 7, nombre: "Literatura Infantil" },
  { id: 8, nombre: "Juvenil" },
];

const ESTADOS = ["Disponible", "Reservado", "No disponible"];

export default function BookForm() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    anio_publicacion: "",
    categoria_id: "",
    estado: "Disponible",
    descripcion: "",
    imagen_portada: "",
    precio_descarga: "",
    archivo_pdf: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingBook, setLoadingBook] = useState(isEditing);

  useEffect(() => {
    if (!isEditing || !token) return;

    const fetchBook = async () => {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const book = await res.json();
        setFormData({
          titulo: book.titulo || "",
          autor: book.autor || "",
          anio_publicacion: book.anioPublicacion || "",
          categoria_id: book.categoria?.id || "",
          estado: book.estado || "Disponible",
          descripcion: book.descripcion || "",
          imagen_portada: book.imagenPortada || "",
          precio_descarga: book.precioDescarga || "",
          archivo_pdf: null,
        });
      } catch (error) {
        console.error("Error al cargar libro:", error);
        alert("Error al cargar los datos del libro");
        navigate("/dashboard/books");
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBook();
  }, [id, isEditing, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, archivo_pdf: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    if (!token) return alert("Debes iniciar sesión para continuar.");

    const { titulo, autor, precio_descarga, categoria_id } = formData;
    if (!titulo || !autor) return alert("Título y autor son campos obligatorios");

    setLoading(true);

    const libroPayload = {
      titulo: titulo.trim(),
      autor: autor.trim(),
      anioPublicacion: formData.anio_publicacion || new Date().getFullYear().toString(),
      descripcion: formData.descripcion || "",
      imagenPortada: formData.imagen_portada || "",
      precioDescarga: parseFloat(precio_descarga) || 0.0,
      totalCapitulos: 10,
      capitulosGratis: 3,
      estado: formData.estado,
      categoriaId: categoria_id ? parseInt(categoria_id) : null,
      esGratuito: parseFloat(precio_descarga || 0) === 0,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("libro", new Blob([JSON.stringify(libroPayload)], { type: "application/json" }));
    if (formData.archivo_pdf) {
      formDataToSend.append("archivo", formData.archivo_pdf);
    }

    try {
      const response = await fetch(isEditing ? `${BASE_URL}/${id}` : BASE_URL, {
        method: isEditing ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await response.json() : await response.text();

      if (!response.ok) throw new Error(data);

      alert(`📖 ¡Libro ${isEditing ? "actualizado" : "agregado"} con éxito!`);
      navigate("/dashboard/books");
    } catch (error) {
      console.error("🚨 Error completo:", error);
      alert(`Error al ${isEditing ? "actualizar" : "agregar"} libro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingBook) return <div className="text-center mt-5">Cargando datos del libro...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 text-gray-800">{isEditing ? "Editar Libro" : "Agregar Nuevo Libro"}</h1>
        <NavLink to="/dashboard/books" className="btn btn-primary shadow rounded-pill px-4">
          <i className="fas fa-arrow-left text-white me-2"></i>Volver
        </NavLink>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card shadow p-4">
            <form>
              {[
                { label: "Título del Libro", name: "titulo", type: "text", placeholder: "Ingrese el título" },
                { label: "Autor", name: "autor", type: "text", placeholder: "Nombre del autor" },
                { label: "Año de Publicación", name: "anio_publicacion", type: "number", placeholder: "Ej: 2023" },
                { label: "Imagen de Portada (URL)", name: "imagen_portada", type: "text", placeholder: "https://..." },
                { label: "Precio de Descarga", name: "precio_descarga", type: "number", placeholder: "Ej: 9.99", step: "0.01" },
              ].map(({ label, name, ...rest }) => (
                <div className="mb-4" key={name}>
                  <label className="form-label fw-bold text-dark">{label}</label>
                  <input
                    {...rest}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="form-control rounded"
                  />
                </div>
              ))}

              <div className="mb-4">
                <label className="form-label fw-bold text-dark">Categoría</label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  className="form-select rounded"
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIAS.map(({ id, nombre }) => (
                    <option key={id} value={id}>{nombre}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="form-select rounded"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="form-control rounded"
                  placeholder="Detalles sobre el libro"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isEditing ? "Cambiar Archivo PDF (opcional)" : "Subir Archivo PDF"}
                </label>
                <input
                  type="file"
                  name="archivo_pdf"
                  onChange={handleFileChange}
                  className="form-control rounded"
                  accept="application/pdf"
                />
                {isEditing && <small className="text-muted">Deja este campo vacío si no deseas cambiar el archivo</small>}
              </div>

              <button
                type="button"
                className={`btn ${isEditing ? "btn-warning" : "btn-success"} w-100 shadow-sm`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (isEditing ? "Actualizando..." : "Agregando...") : (isEditing ? "Actualizar Libro" : "Agregar Libro")}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-5 d-flex justify-content-center align-items-center">
          <div className="card p-3 shadow-lg">
            <img
              src={formData.imagen_portada || "https://images.unsplash.com/photo-1512820790803-83ca734da794"}
              className="img-fluid rounded shadow-sm"
              alt="Vista previa del libro"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
