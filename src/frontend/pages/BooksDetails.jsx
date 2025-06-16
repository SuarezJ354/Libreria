import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/BooksDetails.css"
import PDFDownloader from "../components/PDFDownloader";

export default function BooksDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [capitulos, setCapitulos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookAndChapters = async () => {
      try {
        const libroRes = await axios.get(`https://libreriabackend-production.up.railway.app/libros/${id}`);
        const capsRes = await axios.get(`https://libreriabackend-production.up.railway.app/capitulos/${id}`);
        setBook(libroRes.data);
        setCapitulos(capsRes.data);
      } catch (error) {
        console.error("Error al cargar el libro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndChapters();
  }, [id]);

  if (loading) {
    return (
      <div id="book-details-page-unique">
        <div id="loading-message-unique">
          <p>Cargando libro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div id="book-details-page-unique">
        <div id="error-message-unique">
          <p>Libro no encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="book-details-page-unique">
      <div id="container-unique">
        <div id="book-main-info-unique">
          <h1 id="book-title-unique">{book.titulo || "Título no disponible"}</h1>
          
          {book.imagenPortada && (
            <div id="book-cover-container-unique">
              <img
                src={book.imagenPortada}
                alt={`Portada de ${book.titulo}`}
                id="book-cover-unique"
              />
            </div>
          )}

          <div id="book-info-unique">
            <div className="book-info-item-unique">
              <div className="book-info-label-unique">Autor</div>
              <p className="book-info-value-unique">{book.autor || "Desconocido"}</p>
            </div>

            <div className="book-info-item-unique">
              <div className="book-info-label-unique">Año de Publicación</div>
              <p className="book-info-value-unique">{book.anioPublicacion || "No disponible"}</p>
            </div>
          </div>

          {book.descripcion && (
            <div id="book-description-unique">
              <h4>Descripción</h4>
              <p>{book.descripcion}</p>
            </div>
          )}
        </div>

        <div id="book-content-unique">
          <div id="chapters-section-unique">
            <h3 id="chapters-title-unique">
              Capítulos disponibles 
              <span id="chapters-count-unique">({capitulos.length})</span>
            </h3>

            {capitulos.length > 0 ? (
              <ul id="chapters-list-unique">
                {capitulos.map((cap) => (
                  <li key={cap.id} className="chapter-item-unique">
                    <div className="chapter-info-unique">
                      <div className="chapter-title-unique">
                        {cap.orden}. {cap.titulo}
                      </div>
                      <div className="chapter-badges-unique">
                        {cap.esGratuito ? (
                          <span className="badge-unique badge-free-unique">Gratis</span>
                        ) : (
                          <span className="badge-unique badge-paid-unique">De pago</span>
                        )}
                      </div>
                    </div>
                    <Link 
                      to={`/capitulos/${id}/${cap.orden}`} 
                      className="read-button-unique"
                    >
                      Leer
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div id="no-chapters-message-unique">
                <p>No hay capítulos disponibles.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}