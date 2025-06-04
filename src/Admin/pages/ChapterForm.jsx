import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChapterCard from "../components/ChapterCard";
import "../../assets/css/ChapterForm.css";

export default function ChapterForm() {
  const { token } = useAuth();
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [loadingChapters, setLoadingChapters] = useState(true);
  const [bookInfo, setBookInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBook, setLoadingBook] = useState(true);

  // Estado para mensajes
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text: string }

  // Función para mostrar mensajes temporales
  const showMessage = (type, text, duration = 4000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), duration);
  };

  const fetchBookInfo = useCallback(async () => {
    if (!bookId || !token) return;

    try {
      const response = await fetch(
        `https://libreriabackend-production.up.railway.app/libros/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const book = await response.json();
      setBookInfo(book);
      setLoadingBook(false);
    } catch (error) {
      console.error("Error al cargar libro:", error);
      showMessage("error", "Error al cargar los datos del libro");
      navigate("/dashboard/books");
    }
  }, [bookId, token, navigate]);

  const fetchChapters = useCallback(async () => {
    if (!bookId || !token) return;

    try {
      const response = await fetch(
        `https://libreriabackend-production.up.railway.app/capitulos/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const existingChapters = await response.json();
        if (existingChapters.length > 0) {
          setChapters(existingChapters);
        } else {
          setChapters([
            {
              id: `temp_${Date.now()}`,
              titulo: "",
              numeroCapitulo: 1,
              contenido: "",
              esGratuito: true,
              orden: 1,
              duracionEstimada: "",
              isNew: true,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error al cargar capítulos:", error);
    } finally {
      setLoadingChapters(false);
    }
  }, [bookId, token]);

  useEffect(() => {
    fetchBookInfo();
  }, [fetchBookInfo]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const addChapter = () => {
    const newChapter = {
      id: `temp_${Date.now()}`,
      titulo: "",
      numeroCapitulo: chapters.length + 1,
      contenido: "",
      esGratuito: false,
      orden: chapters.length + 1,
      duracionEstimada: "",
      isNew: true,
    };
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = async (chapterId) => {
    if (chapters.length === 1) {
      showMessage("error", "Debe mantener al menos un capítulo");
      return;
    }

    try {
      const chapterToRemove = chapters.find((ch) => ch.id === chapterId);

      if (
        chapterToRemove &&
        !chapterToRemove.isNew &&
        !chapterId.toString().startsWith("temp_")
      ) {
        const response = await fetch(
          `https://libreriabackend-production.up.railway.app/capitulos/${chapterId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al eliminar capítulo del servidor");
        }
      }

      const updatedChapters = chapters
        .filter((chapter) => chapter.id !== chapterId)
        .map((chapter, index) => ({
          ...chapter,
          numeroCapitulo: index + 1,
          orden: index + 1,
        }));

      setChapters(updatedChapters);
      showMessage("success", "Capítulo eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar capítulo:", error);
      showMessage("error", `Error al eliminar capítulo: ${error.message}`);
    }
  };

  const updateChapter = (chapterId, field, value) => {
    const updatedChapters = chapters.map((chapter) => {
      if (chapter.id === chapterId) {
        return { ...chapter, [field]: value };
      }
      return chapter;
    });
    setChapters(updatedChapters);
  };

  const validateForm = () => {
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (!chapter.titulo.trim()) {
        showMessage("error", `El capítulo ${i + 1} debe tener un título`);
        return false;
      }
      if (!chapter.contenido.trim()) {
        showMessage("error", `El capítulo ${i + 1} debe tener contenido`);
        return false;
      }
    }
    return true;
  };

  const reloadChapters = useCallback(async () => {
    if (!bookId || !token) return;

    try {
      const response = await fetch(
        `https://libreriabackend-production.up.railway.app/capitulos/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const existingChapters = await response.json();
        setChapters(existingChapters);
      }
    } catch (error) {
      console.error("Error al recargar capítulos:", error);
    }
  }, [bookId, token]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const newChapters = chapters.filter(
        (ch) => ch.isNew || ch.id.toString().startsWith("temp_")
      );
      const existingChapters = chapters.filter(
        (ch) => !ch.isNew && !ch.id.toString().startsWith("temp_")
      );

      const promises = [];

      newChapters.forEach((chapter) => {
        const chapterData = {
          titulo: chapter.titulo.trim(),
          numeroCapitulo: chapter.numeroCapitulo,
          contenido: chapter.contenido.trim(),
          esGratuito: chapter.esGratuito,
          orden: chapter.orden,
          duracionEstimada: chapter.duracionEstimada || null,
          libro: { id: parseInt(bookId) },
        };

        promises.push(
          fetch("https://libreriabackend-production.up.railway.app/capitulos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(chapterData),
          })
        );
      });

      existingChapters.forEach((chapter) => {
        const chapterData = {
          id: chapter.id,
          titulo: chapter.titulo.trim(),
          numeroCapitulo: chapter.numeroCapitulo,
          contenido: chapter.contenido.trim(),
          esGratuito: chapter.esGratuito,
          orden: chapter.orden,
          duracionEstimada: chapter.duracionEstimada || null,
          libro: { id: parseInt(bookId) },
        };

        promises.push(
          fetch(
            `https://libreriabackend-production.up.railway.app/capitulos/${chapter.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(chapterData),
            }
          )
        );
      });

      const responses = await Promise.all(promises);
      const failedResponses = responses.filter((response) => !response.ok);

      if (failedResponses.length > 0) {
        throw new Error(`Error al guardar ${failedResponses.length} capítulos`);
      }

      showMessage("success", `¡${chapters.length} capítulos guardados exitosamente!`);
      await reloadChapters();
    } catch (error) {
      console.error("Error al guardar capítulos:", error);
      showMessage("error", `Error al guardar capítulos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingBook || loadingChapters) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando información del libro...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {message && <div className={`message-box ${message.type}`}>{message.text}</div>}
      <div id="content">
        <div className="container-fluid">
          {/* Encabezado */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="h3 mb-0 text-gray-800">Gestionar Capítulos</h1>
              {bookInfo && (
                <p className="text-muted">
                  Libro: <strong>{bookInfo.titulo}</strong> por {bookInfo.autor}
                </p>
              )}
            </div>
            <NavLink
              to="/dashboard/books"
              className="btn btn-primary btn-lg shadow-lg rounded-pill px-4 d-flex align-items-center gap-2"
            >
              <i className="fas fa-arrow-left fa-lg text-white"></i>
              <span className="fw-bold text-white">Volver</span>
            </NavLink>
          </div>

          {/* Controles principales */}
          <div className="rows mb-4">
            <div className="col-12">
              <div className="cards shadows p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Total de Capítulos: {chapters.length}</h5>
                    <small className="text-muted">
                      Capítulos gratuitos: {chapters.filter((ch) => ch.esGratuito).length}
                    </small>
                  </div>
                  <div className="btn-group">
                    <button type="button" className="btn btn-success" onClick={addChapter}>
                      <i className="fas fa-plus"></i> Agregar Capítulo
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i> Guardar Todos
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de capítulos */}
          <div className="row">
            {chapters && chapters.length > 0 ? (
              chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  onUpdate={updateChapter}
                  onRemove={removeChapter}
                  canRemove={chapters.length > 1}
                />
              ))
            ) : (
              <div className="col-12 text-center">
                <p>No hay capítulos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
