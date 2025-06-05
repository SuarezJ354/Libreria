import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import '../../assets/css/Chapter.css';
import PDFDownloader from "../components/PDFDownloader";

export default function ChapterReader() {
  const { libroId, numeroCapitulo } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capitulosOrdenados, setCapitulosOrdenados] = useState([]);
  const [libro, setLibro] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [isProcessingHighlight, setIsProcessingHighlight] = useState(false);
  
  // Ref para el contenedor del contenido
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await axios.get(`https://libreriabackend-production.up.railway.app/capitulos/${libroId}/${numeroCapitulo}`);
        const chapterData = res.data;
        
        if (!chapterData) {
          setChapter(null);
          setCapitulosOrdenados([]);
          setLoading(false);
          return;
        }

        setChapter(chapterData);

        if (libroId) {
          const capsRes = await axios.get(`https://libreriabackend-production.up.railway.app/capitulos/${libroId}`);
          const sorted = capsRes.data.sort((a, b) => a.orden - b.orden);
          setCapitulosOrdenados(sorted);
        }
        
        if (libroId) {
          const libroRes = await axios.get(`https://libreriabackend-production.up.railway.app/libros/${libroId}`);
          setLibro(libroRes.data);
        }

        await loadUserHighlights(chapterData.id);

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

  const loadUserHighlights = async (chapterId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `https://libreriabackend-production.up.railway.app/highlights/${chapterId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHighlights(response.data || []);
    } catch (error) {
      console.error("Error al cargar resaltados:", error);
    }
  };

  const saveHighlight = async (highlightData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Debes iniciar sesión para guardar resaltados');
        return null;
      }

      const response = await axios.post(
        'https://libreriabackend-production.up.railway.app/highlights',
        {
          capituloId: chapter.id,
          texto: highlightData.text,
          startOffset: highlightData.startOffset,
          endOffset: highlightData.endOffset,
          color: highlightData.color || '#ffeb3b'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error("Error al guardar resaltado:", error);
      
      if (error.response?.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        alert('No tienes permisos para realizar esta acción.');
      } else {
        alert('Error al guardar el resaltado. Inténtalo de nuevo.');
      }
      return null;
    }
  };

  const deleteHighlight = async (highlightId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(
        `https://libreriabackend-production.up.railway.app/highlights/${highlightId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar el estado local
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      console.log('Resaltado eliminado exitosamente');
    } catch (error) {
      console.error("Error al eliminar resaltado:", error);
    }
  };

  // Función mejorada para calcular offsets correctos
  const getTextOffset = (container, node, offset) => {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent.length;
    }
    return textOffset;
  };

  // Manejo mejorado de selección de texto
  const handleTextSelection = async () => {
    if (isProcessingHighlight) return;
    
    const selection = window.getSelection();
    
    if (selection.rangeCount === 0 || selection.toString().trim() === '') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para guardar resaltados');
      selection.removeAllRanges();
      return;
    }

    const range = selection.getRangeAt(0);
    const container = contentRef.current;
    
    if (!container || !container.contains(range.commonAncestorContainer)) {
      return;
    }

    // Verificar que no estamos seleccionando dentro de un resaltado existente
    let currentNode = range.commonAncestorContainer;
    while (currentNode && currentNode !== container) {
      if (currentNode.classList && currentNode.classList.contains('text-highlight')) {
        console.log('Selección dentro de un resaltado existente, ignorando...');
        selection.removeAllRanges();
        return;
      }
      currentNode = currentNode.parentNode;
    }

    setIsProcessingHighlight(true);

    try {
      // Calcular offsets usando solo el texto plano
      const startOffset = getTextOffset(container, range.startContainer, range.startOffset);
      const endOffset = getTextOffset(container, range.endContainer, range.endOffset);

      const highlightData = {
        text: selection.toString().trim(),
        startOffset,
        endOffset,
        color: '#ffeb3b'
      };

      console.log('Guardando resaltado:', highlightData);

      const savedHighlight = await saveHighlight(highlightData);
      
      if (savedHighlight) {
        setHighlights(prev => [...prev, savedHighlight]);
        selection.removeAllRanges();
      }
    } catch (error) {
      console.error('Error procesando resaltado:', error);
    } finally {
      setIsProcessingHighlight(false);
    }
  };

  // Función mejorada para renderizar contenido con resaltados
  const renderHighlightedContent = () => {
    if (!chapter || !chapter.contenido) return '';

    let content = chapter.contenido;
    
    // Ordenar resaltados por posición (del final al inicio para evitar problemas de offset)
    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    // Aplicar resaltados
    sortedHighlights.forEach(highlight => {
      const before = content.substring(0, highlight.startOffset);
      const highlightedText = content.substring(highlight.startOffset, highlight.endOffset);
      const after = content.substring(highlight.endOffset);
      
      // Escapar el texto para evitar problemas de HTML
      const escapedText = highlightedText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      content = before + 
        `<span class="text-highlight" data-highlight-id="${highlight.id}" style="background-color: ${highlight.color}; cursor: pointer; padding: 2px 4px; border-radius: 3px; position: relative; z-index: 1;" title="Doble clic para eliminar">${escapedText}</span>` + 
        after;
    });

    return content;
  };

  // Manejo mejorado de clics en resaltados
  const handleHighlightClick = (e) => {
    // Prevenir la selección de texto en doble clic
    if (e.detail === 2) {
      e.preventDefault();
      e.stopPropagation();
      
      const highlightId = parseInt(e.target.dataset.highlightId);
      if (highlightId && window.confirm('¿Eliminar este resaltado?')) {
        deleteHighlight(highlightId);
      }
    }
  };

  // Efecto para actualizar el contenido cuando cambien los resaltados
  useEffect(() => {
    if (chapter && contentRef.current) {
      const contentElement = contentRef.current;
      contentElement.innerHTML = renderHighlightedContent();
      
      // Agregar event listeners a los resaltados
      const highlightElements = contentElement.querySelectorAll('.text-highlight');
      
      const clickHandler = (e) => handleHighlightClick(e);
      
      highlightElements.forEach(el => {
        el.addEventListener('click', clickHandler);
        // Prevenir selección en doble clic
        el.addEventListener('mousedown', (e) => {
          if (e.detail > 1) {
            e.preventDefault();
          }
        });
      });

      // Cleanup function
      return () => {
        highlightElements.forEach(el => {
          el.removeEventListener('click', clickHandler);
        });
      };
    }
  }, [chapter, highlights]);

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
                <div className="chapter-title-section">
                  <h1 className="chapter-title">
                    {chapter.titulo}
                  </h1>
                  <div className="chapter-title-divider"></div>
                </div>

                {/* Toolbar de resaltado */}
                <div className="highlight-toolbar mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-muted">
                      <i className="fas fa-highlighter me-1"></i>
                      Selecciona texto para resaltar. Doble clic en resaltados para eliminar.
                    </small>
                    <div className="highlight-stats">
                      <small className="text-muted">
                        {highlights.length} resaltado{highlights.length !== 1 ? 's' : ''}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Contenido del capitulo */}
                <div
                  ref={contentRef}
                  className="chapter-content web-friendly"
                  style={{ 
                    whiteSpace: 'pre-line',
                    userSelect: 'text',
                    cursor: 'text'
                  }}
                  onMouseUp={handleTextSelection}
                  // Prevenir la selección múltiple accidental
                  onSelectStart={(e) => {
                    if (isProcessingHighlight) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            ) : (
              /* Contenido premium */
              <div>
                <div className="chapter-title-section">
                  <h1 className="chapter-title">PDF</h1>
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
                  <div className="my-3"></div>
                  <div className="d-flex justify-content-center">
                    <PDFDownloader 
                      libroId={libro.id}
                      titulo={libro.titulo}
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