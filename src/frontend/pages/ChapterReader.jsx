/* eslint-disable no-cond-assign */
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

      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      console.log('Resaltado eliminado exitosamente');
    } catch (error) {
      console.error("Error al eliminar resaltado:", error);
    }
  };

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

    let currentNode = range.commonAncestorContainer;
    while (currentNode && currentNode !== container) {
      if (currentNode.classList && currentNode.classList.contains('text-highlight-mobile-unique')) {
        console.log('Selección dentro de un resaltado existente, ignorando...');
        selection.removeAllRanges();
        return;
      }
      currentNode = currentNode.parentNode;
    }

    setIsProcessingHighlight(true);

    try {
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

  const renderHighlightedContent = () => {
    if (!chapter || !chapter.contenido) return '';

    let content = chapter.contenido;
    
    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    sortedHighlights.forEach(highlight => {
      const before = content.substring(0, highlight.startOffset);
      const highlightedText = content.substring(highlight.startOffset, highlight.endOffset);
      const after = content.substring(highlight.endOffset);
      
      const escapedText = highlightedText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      content = before + 
        `<span class="text-highlight-mobile-unique" data-highlight-id="${highlight.id}" style="background-color: ${highlight.color}; cursor: pointer; padding: 2px 4px; border-radius: 3px; position: relative; z-index: 1;" title="Doble clic para eliminar">${escapedText}</span>` + 
        after;
    });

    return content;
  };

  const handleHighlightClick = (e) => {
    if (e.detail === 2) {
      e.preventDefault();
      e.stopPropagation();
      
      const highlightId = parseInt(e.target.dataset.highlightId);
      if (highlightId && window.confirm('¿Eliminar este resaltado?')) {
        deleteHighlight(highlightId);
      }
    }
  };

  useEffect(() => {
    if (chapter && contentRef.current) {
      const contentElement = contentRef.current;
      contentElement.innerHTML = renderHighlightedContent();
      
      const highlightElements = contentElement.querySelectorAll('.text-highlight-mobile-unique');
      
      const clickHandler = (e) => handleHighlightClick(e);
      
      highlightElements.forEach(el => {
        el.addEventListener('click', clickHandler);
        el.addEventListener('mousedown', (e) => {
          if (e.detail > 1) {
            e.preventDefault();
          }
        });
      });

      return () => {
        highlightElements.forEach(el => {
          el.removeEventListener('click', clickHandler);
        });
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, highlights]);

  if (loading) {
    return (
      <div id="chapter-loading-container-unique">
        <div id="chapter-loading-content-unique">
          <div id="chapter-loading-spinner-unique">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p id="chapter-loading-text-unique">Cargando capítulo...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div id="chapter-error-container-unique">
        <div id="chapter-error-content-unique">
          <h3 id="chapter-error-title-unique">Capítulo no encontrado</h3>
          <Link to={`/libros/${libroId}`} id="chapter-error-back-btn-unique">
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
    <div id="chapter-reader-page-unique">
      {/* Header del capítulo */}
      <div id="chapter-header-unique">
        <div id="chapter-header-container-unique">
          <div id="chapter-header-content-unique">
            <div id="chapter-back-btn-container-unique">
              <Link to={`/book/${libroId}`} id="chapter-back-btn-unique">
                <i className="fas fa-arrow-left"></i>
                <span>Volver</span>
              </Link>
            </div>
            
            <div id="chapter-nav-center-unique">
              <div id="chapter-nav-buttons-unique">
                {prevChapter && (
                  <Link 
                    to={`/capitulos/${libroId}/${prevChapter.orden}`} 
                    id="chapter-prev-btn-unique"
                    title={prevChapter.titulo}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </Link>
                )}
                <span id="chapter-progress-unique">
                  {numeroCapitulo} / {capitulosOrdenados.length}
                </span>
                {nextChapter && (
                  <Link 
                    to={`/capitulos/${libroId}/${nextChapter.orden}`} 
                    id="chapter-next-btn-unique"
                    title={nextChapter.titulo}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </Link>
                )}
              </div>
            </div>
            
            <div id="chapter-badge-container-unique">
              {chapter.esGratuito ? (
                <span id="chapter-badge-free-unique">
                  <i className="fas fa-unlock"></i>
                  <span>Gratuito</span>
                </span>
              ) : (
                <span id="chapter-badge-premium-unique">
                  <i className="fas fa-crown"></i>
                  <span>Premium</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div id="chapter-main-container-unique">
        <div id="chapter-content-wrapper-unique">
          {chapter.esGratuito ? (
            <div id="chapter-free-content-unique">
              <div id="chapter-title-section-unique">
                <h1 id="chapter-title-unique">
                  {chapter.titulo}
                </h1>
                <div id="chapter-title-divider-unique"></div>
              </div>

              {/* Toolbar de resaltado */}
              <div id="chapter-highlight-toolbar-unique">
                <div id="chapter-highlight-toolbar-content-unique">
                  <div id="chapter-highlight-instructions-unique">
                    <i className="fas fa-highlighter"></i>
                    <span>Selecciona texto para resaltar. Doble clic en resaltados para eliminar.</span>
                  </div>
                  <div id="chapter-highlight-stats-unique">
                    <span id="chapter-highlight-count-unique">
                      {highlights.length} resaltado{highlights.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido del capítulo */}
              <div id="chapter-content-card-unique">
                <div
                  ref={contentRef}
                  id="chapter-content-text-unique"
                  onMouseUp={handleTextSelection}
                  onSelectStart={(e) => {
                    if (isProcessingHighlight) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            /* Contenido premium */
            <div id="chapter-premium-content-unique">
              <div id="chapter-title-section-unique">
                <h1 id="chapter-title-unique">PDF</h1>
                <div id="chapter-title-divider-unique"></div>
              </div>
              
              <div id="chapter-premium-card-unique">
                <div id="chapter-premium-icon-unique">
                  <i className="fas fa-lock"></i>
                </div>
                <h3 id="chapter-premium-title-unique">Contenido en PDF</h3>
                <p id="chapter-premium-description-unique">
                  Para continuar con el siguiente capítulo por favor descargue el PDF.
                </p>
                
                <div id="chapter-premium-download-unique">
                  <PDFDownloader 
                    libroId={libro.id}
                    titulo={libro.titulo}
                    usuarioRegistrado={true}
                    haPagado={true}
                    mostrarVisor={true}
                  />
                </div>
                
                <div id="chapter-premium-guarantee-unique">
                  <small>
                    <i className="fas fa-shield-alt"></i>
                    Podrá disfrutar del contenido sin limitaciones.
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Navegación entre capítulos */}
          <div id="chapter-navigation-unique">
            <div id="chapter-nav-prev-unique">
              {prevChapter ? (
                <Link 
                  to={`/capitulos/${libroId}/${prevChapter.orden}`} 
                  id="chapter-nav-prev-link-unique"
                >
                  <i className="fas fa-chevron-left"></i>
                  <div id="chapter-nav-prev-info-unique">
                    <small>Anterior</small>
                    <span>
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

            <div id="chapter-nav-next-unique">
              {nextChapter ? (
                <Link 
                  to={`/capitulos/${libroId}/${nextChapter.orden}`} 
                  id="chapter-nav-next-link-unique"
                >
                  <div id="chapter-nav-next-info-unique">
                    <small>Siguiente</small>
                    <span>
                      {nextChapter.titulo.length > 25 
                        ? nextChapter.titulo.substring(0, 25) + '...' 
                        : nextChapter.titulo}
                    </span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}