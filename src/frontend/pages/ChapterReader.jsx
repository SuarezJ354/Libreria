import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import '../../assets/css/Chapter.css'; // Importar los estilos
import PDFDownloader from "../components/PDFDownloader";

export default function ChapterReader() {
  const { libroId, numeroCapitulo} = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capitulosOrdenados, setCapitulosOrdenados] = useState([]);
  const [libro, setLibro] = useState(null);

  


  useEffect(() => {
    const fetchChapter = async () => {
      try {
        // Llamada corregida: libroId y número de capítulo
        const res = await axios.get(`http://localhost:8080/capitulos/${libroId}/${numeroCapitulo}`);
        const chapterData = res.data;
        
        if (!chapterData) {
          setChapter(null);
          setCapitulosOrdenados([]);
          setLoading(false);
          return;
        }

        setChapter(chapterData);

        // Obtener todos los capítulos del libro para navegación
        if (libroId) {
          const capsRes = await axios.get(`http://localhost:8080/capitulos/${libroId}`);
          const sorted = capsRes.data.sort((a, b) => a.orden - b.orden);
          setCapitulosOrdenados(sorted);
        }
        if (libroId) {
          const libroRes = await axios.get(`http://localhost:8080/libros/${libroId}`);
          setLibro(libroRes.data);
        }

      } catch (error) {
        console.error("Error al cargar el capítulo:", error);
        setChapter(null);
        setCapitulosOrdenados([]);
      } finally {
        setLoading(false);
      }
    }; 
         

    fetchChapter();
  }, [libroId, numeroCapitulo]);

 /*  const handlePurchase = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('Debes iniciar sesión para comprar capítulos');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8080/purchase/capitulo/${chapter.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('¡Capítulo comprado exitosamente!');
        window.location.reload();
      }
    } catch (error) {
      console.error("Error en la compra:", error);
      alert('Error al procesar la compra');
    }
  }; */

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner-border loading-spinner" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="loading-text">Cargando capítulo...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3 className="error-title">Capítulo no encontrado</h3>
          <Link to={`/libros/${libroId}`} className="btn btn-primary">
            Volver al libro
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = capitulosOrdenados.findIndex(c => c.orden === parseInt(numeroCapitulo));
  const prevChapter = capitulosOrdenados[currentIndex - 1];
  const nextChapter = capitulosOrdenados[currentIndex + 1];

  return (
    <div className="chapter-reader-container">
      {/* Header del capítulo */}
      <div className="chapter-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-auto">
              <Link to={`/book/${libroId}`} className="btn btn-outline-secondary btn-sm">
                <i className="fas fa-arrow-left me-1"></i> Volver al libro
              </Link>
            </div>
            <div className="col">
              <div className="d-flex align-items-center justify-content-center chapter-nav-buttons">
                {prevChapter && (
                  <Link 
                    to={`/capitulos/${libroId}/${prevChapter.orden}`} 
                    className="btn btn-sm me-2 btn-morado"
                    title={prevChapter.titulo}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </Link>

                )}
                <span className="chapter-progress">
                  Capítulo {numeroCapitulo} de {capitulosOrdenados.length}
                </span>
                {nextChapter && (
                  <Link 
                    to={`/capitulos/${libroId}/${nextChapter.orden}`} 
                    className="btn btn-sm ms-2 btn-morado"
                    title={nextChapter.titulo}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </Link>

                )}
              </div>
            </div>
            <div className="col-auto">
              {chapter.esGratuito ? (
                <span className="badge chapter-badge-free">
                  <i className="fas fa-unlock me-1"></i>Gratuito
                </span>
              ) : (
                <span className="badge chapter-badge-premium">
                  <i className="fas fa-crown me-1"></i>Premium
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container chapter-main-content">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            {chapter.esGratuito ? (
              <div>
                {/* Titulo del libro  */}
                <div className="chapter-title-section">
                  <h1 className="chapter-title">
                    {chapter.titulo}
                  </h1>
                  <div className="chapter-title-divider"></div>
                </div>
            {/* Contenido del capitulo */}
              <div className="chapter-content-card">
                <div 
                  dangerouslySetInnerHTML={{ __html: chapter.contenido }} 
                  className="chapter-content"
                />
              </div>

              </div>
            ) : (

              /* Contenido premium */
            <div>
                <div className="chapter-title-section">
                  <h1 className="chapter-title">
                    PDF
                  </h1>
                  <div className="chapter-title-divider"></div>
                </div>
              <div className="premium-content-card">
                <div className="premium-lock-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <h3 className="premium-title">Contenido en PDF</h3>
                <p className="premium-description">
                  Para continuar con el siguente capitulo por favor descargue el PDF.
                </p>
  {/*               <div className="premium-price-card">
                  <h5 className="premium-price">
                    ${chapter.precio || '2.99'}
                  </h5>
                  <small className="premium-access-note">Acceso permanente</small>
                </div> */}
                      {/* PDFDownloader */}
                 <div className="my-3">
                

                  </div>
                <div
                  className="d-flex justify-content-center"
                  /* onClick={handlePurchase} */
                >
                  <PDFDownloader 
                  libroId={libro.id}
                  titulo={libro.titulo} // o eliminar si no es requerido
                  usuarioRegistrado={true}
                  haPagado={true}
                  mostrarVisor={true}
                />
                </div>
                <div className="premium-guarantee">
                  <small>
                    <i className="fas fa-shield-alt me-1"></i>
                    Podra disfrutar del contenido sin limitaciones.
                  </small>
                </div>
              </div>
            </div>
              

            )}

            {/* Navegación entre capítulos */}
            <div className="d-flex justify-content-between align-items-center chapter-navigation">
              <div>
                {prevChapter ? (
                  <Link 
                    to={`/capitulos/${libroId}/${prevChapter.orden}`} 
                    className="btn chapter-nav-button"
                  >
                    <i className="fas fa-chevron-left me-2 mi-icono"></i>
                    <div className="chapter-nav-info text-start">
                      <small className="chapter-nav-label">Anterior</small>
                      <span className="chapter-nav-title">
                        {prevChapter.titulo.length > 25 
                          ? prevChapter.titulo.substring(0, 25) + '...' 
                          : prevChapter.titulo}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>

              <div>
                {nextChapter ? (
                  <Link 
                    to={`/capitulos/${libroId}/${nextChapter.orden}`} 
                    className="btn chapter-nav-button"
                  >
                    <div className="chapter-nav-info text-end">
                      <small className="chapter-nav-label">Siguiente</small>
                      <span className="chapter-nav-title">
                        {nextChapter.titulo.length > 25 
                          ? nextChapter.titulo.substring(0, 25) + '...' 
                          : nextChapter.titulo}
                      </span>
                    </div>
                    <i className="fas fa-chevron-right ms-2 mi-icono"></i>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}