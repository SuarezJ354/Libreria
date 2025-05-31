import { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function BookForm() {
  const { token } = useAuth();
  const { id } = useParams(); // Para obtener el ID del libro si estamos editando
  const navigate = useNavigate();
  const isEditing = Boolean(id); // Determinar si estamos editando o creando

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

  // Cargar datos del libro si estamos editando
  useEffect(() => {
    if (isEditing && token) {
      setLoadingBook(true);
      fetch(`https://libreriabackend-production.up.railway.app/libros/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        })
        .then((book) => {
          setFormData({
            titulo: book.titulo || "",
            autor: book.autor || "",
            anio_publicacion: book.anioPublicacion || "",
            categoria_id: book.categoria?.id || "",
            estado: book.estado || "Disponible",
            descripcion: book.descripcion || "",
            imagen_portada: book.imagenPortada || "",
            precio_descarga: book.precioDescarga || "",
            archivo_pdf: null, // No cargamos el archivo existente
          });
          setLoadingBook(false);
        })
        .catch((error) => {
          console.error("Error al cargar libro:", error);
          alert("Error al cargar los datos del libro");
          setLoadingBook(false);
          navigate("/dashboard/books");
        });
    }
  }, [id, isEditing, token, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setFormData((prev) => ({ ...prev, archivo_pdf: e.target.files[0] }));
  }

  function handleSubmit() {
    if (!token) {
      alert("Debes iniciar sesión para continuar.");
      return;
    }

    // Validaciones básicas
    if (!formData.titulo || !formData.autor) {
      alert("Título y autor son campos obligatorios");
      return;
    }

    setLoading(true);

    // Construir payload exactamente como lo espera el backend
    const libroPayload = {
      titulo: formData.titulo.trim(),
      autor: formData.autor.trim(),
      anioPublicacion: formData.anio_publicacion || new Date().getFullYear().toString(),
      descripcion: formData.descripcion || "",
      imagenPortada: formData.imagen_portada || "",
      precioDescarga: parseFloat(formData.precio_descarga) || 0.0,
      totalCapitulos: 10,
      capitulosGratis: 3,
      estado: formData.estado || "Disponible",
      categoriaId: formData.categoria_id ? parseInt(formData.categoria_id) : null,
      esGratuito: (parseFloat(formData.precio_descarga) || 0) === 0,
    };

    console.log(`📝 Datos a ${isEditing ? 'actualizar' : 'enviar'}:`, libroPayload);

    // Preparar FormData
    const formDataToSend = new FormData();
    
    // Agregar el JSON del libro
    formDataToSend.append(
      "libro",
      new Blob([JSON.stringify(libroPayload)], { type: "application/json" })
    );
    
    // Agregar archivo si existe (solo para crear o si se seleccionó un nuevo archivo)
    if (formData.archivo_pdf) {
      console.log("📁 Agregando archivo PDF:", formData.archivo_pdf.name);
      formDataToSend.append("archivo", formData.archivo_pdf);
    }

    // Configurar la petición según si estamos creando o editando
    const url = isEditing 
      ? `https://libreriabackend-production.up.railway.app/libros/${id}` 
      : "https://libreriabackend-production.up.railway.app/libros";
    
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataToSend,
    })
      .then(async (response) => {
        console.log("📡 Respuesta recibida - Status:", response.status);

        if (response.status === 401) {
          throw new Error("Token expirado o inválido. Por favor, inicia sesión nuevamente.");
        }

        if (response.status === 400) {
          const errorText = await response.text();
          console.error("🚨 Error 400 - Datos inválidos:", errorText);
          throw new Error(`Error de validación: ${errorText}`);
        }

        if (response.status === 500) {
          const errorText = await response.text();
          console.error("🚨 Error 500 - Servidor:", errorText);
          throw new Error(`Error del servidor: ${errorText}`);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`🚨 Error ${response.status}:`, errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then((data) => {
        console.log("✅ Respuesta exitosa:", data);
        alert(`📖 ¡Libro ${isEditing ? 'actualizado' : 'agregado'} con éxito!`);
        
        // Navegar de vuelta a la lista de libros
        navigate("/dashboard/books");
      })
      .catch((error) => {
        console.error("🚨 Error completo:", error);
        alert(`Error al ${isEditing ? 'actualizar' : 'agregar'} libro: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Mostrar loading mientras carga los datos del libro
  if (loadingBook) {
    return <div className="text-center mt-5">Cargando datos del libro...</div>;
  }

  return (
    <div id="content">
      <div className="container-fluid">
        {/* Encabezado */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800">
            {isEditing ? 'Editar Libro' : 'Agregar Nuevo Libro'}
          </h1>
          <NavLink
            to="/dashboard/books"
            className="btn btn-primary btn-lg shadow-lg rounded-pill px-4 d-flex align-items-center gap-2"
            style={{ transition: "background-color 0.3s ease-in-out" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          >
            <i className="fas fa-arrow-left fa-lg text-white"></i>
            <span className="fw-bold text-white">Volver</span>
          </NavLink>
        </div>

        {/* Content Row */}
        <div className="row">
          {/* Formulario */}
          <div className="col-lg-6">
            <div className="card shadow p-4">
              <form>
                {/* Título del libro */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Título del Libro</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="form-control rounded"
                    placeholder="Ingrese el título"
                  />
                </div>

                {/* Autor */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Autor</label>
                  <input
                    type="text"
                    name="autor"
                    value={formData.autor}
                    onChange={handleChange}
                    className="form-control rounded"
                    placeholder="Nombre del autor"
                  />
                </div>

                {/* Año de publicación */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Año de Publicación</label>
                  <input
                    type="number"
                    name="anio_publicacion"
                    value={formData.anio_publicacion}
                    onChange={handleChange}
                    className="form-control rounded"
                    placeholder="Ej: 2023"
                  />
                </div>

                {/* Categoría */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Categoría</label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleChange}
                    className="form-select form-control rounded"
                  >
                    <option value="">Seleccionar categoría</option>
                    {[ 
                      { id: 1, nombre: "Clasico" },
                      { id: 2, nombre: "Realismo Mágico" },
                      { id: 3, nombre: "Épico" },
                      { id: 4, nombre: "Distopía" },
                      { id: 5, nombre: "Romance" },
                      { id: 6, nombre: "Ficción Psicológica" },
                      { id: 7, nombre: "Literatura Infantil" },
                      { id: 8, nombre: "Juvenil" },
                      { id: 9, nombre: "Juvenil" },
                    ].map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado del libro */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="form-select form-control rounded"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Reservado">Reservado</option>
                    <option value="No disponible">No Disponible</option>
                  </select>
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="form-control rounded"
                    rows="4"
                    placeholder="Detalles sobre el libro"
                  ></textarea>
                </div>

                {/* Imagen de portada */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Imagen de Portada (URL)</label>
                  <input
                    type="text"
                    name="imagen_portada"
                    value={formData.imagen_portada}
                    onChange={handleChange}
                    className="form-control rounded"
                    placeholder="Ejemplo: https://example.com/imagen.jpg"
                  />
                </div>

                {/* Precio de descarga */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Precio de Descarga</label>
                  <input
                    type="number"
                    name="precio_descarga"
                    value={formData.precio_descarga}
                    onChange={handleChange}
                    className="form-control rounded"
                    placeholder="Ej: 9.99"
                    step="0.01"
                  />
                </div>

                {/* Archivo PDF */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {isEditing ? 'Cambiar Archivo PDF (opcional)' : 'Subir Archivo PDF'}
                  </label>
                  <input
                    type="file"
                    name="archivo_pdf"
                    onChange={handleFileChange}
                    className="form-control rounded"
                    accept="application/pdf"
                  />
                  {isEditing && (
                    <small className="text-muted">
                      Deja este campo vacío si no quieres cambiar el archivo actual
                    </small>
                  )}
                </div>

                {/* Botón para enviar */}
                <button
                  type="button"
                  className={`btn ${isEditing ? 'btn-warning' : 'btn-success'} btn-block rounded shadow-sm`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading 
                    ? (isEditing ? 'Actualizando...' : 'Agregando...')
                    : (isEditing ? 'Actualizar Libro' : 'Agregar Libro')
                  }
                </button>
              </form>
            </div>
          </div>

          {/* Vista previa de la imagen */}
          <div className="col-lg-5 d-flex justify-content-center align-items-center">
            <div className="card p-3 shadow-lg">
              <img
                id="imagen-libro"
                src={
                  formData.imagen_portada ||
                  "https://images.unsplash.com/photo-1512820790803-83ca734da794"
                }
                className="img-fluid rounded shadow-sm"
                alt="Vista previa del libro"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}