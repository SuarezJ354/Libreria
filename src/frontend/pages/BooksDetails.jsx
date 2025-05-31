import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
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
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndChapters();
  }, [id]);

  if (loading) return <p>Cargando libro...</p>;
  if (!book) return <p>Libro no encontrado.</p>;

  return (
    <div className="container mt-4">
      <h1>{book.titulo || "Título no disponible"}</h1>

      {book.imagenPortada && (
        <img
          src={book.imagenPortada}
          alt={`Portada de ${book.titulo}`}
          style={{ maxWidth: "300px", width: "100%", marginBottom: "20px", borderRadius: "8px" }}
        />
      )}

      <p><strong>Autor:</strong> {book.autor || "Desconocido"}</p>
      <p><strong>Año:</strong> {book.anioPublicacion || "No disponible"}</p>
      <p><strong>Descripción:</strong></p>
      <p>{book.descripcion || "Sin descripción"}</p>

      <h3>Capítulos disponibles ({capitulos.length})</h3>
      {capitulos.length > 0 ? (
        <ul className="list-group">
          {capitulos.map((cap) => (
            <li key={cap.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                {cap.orden}. {cap.titulo}{" "}
                {cap.esGratuito ? (
                  <span className="badge bg-success ms-2">Gratis</span>
                ) : (
                  <span className="badge bg-secondary ms-2">De pago</span>
                )}
              </span>
              <Link to={`/capitulos/${id}/${cap.orden}`} className="btn btn-primary btn-sm">
                Leer
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay capítulos disponibles.</p>
      )}
    </div>
  );
}
