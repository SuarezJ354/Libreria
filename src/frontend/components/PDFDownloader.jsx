import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../../assets/css/PDFDownloader.css';

// Función para manejo centralizado de errores de axios
const handleAxiosError = (error) => {
  if (error.response?.status === 403) {
    throw new Error('No tienes permisos para descargar este PDF');
  }
  if (error.response?.status === 404) {
    throw new Error('PDF no encontrado');
  }
  throw new Error('Error al descargar el PDF');
};

// Servicio para manejar la descarga de PDFs
export const pdfService = {
  descargarPDF: async (libroId, usuarioRegistrado = false, haPagado = false) => {
    try {
      const { data } = await axios.get(
        `https://libreriabackend-production.up.railway.app/libros/${libroId}/descargar`,
        {
          params: { usuarioRegistrado, haPagado },
          responseType: 'blob',
          headers: { Accept: 'application/pdf' },
        }
      );

      const pdfBlob = new Blob([data], { type: 'application/pdf' });
      return window.URL.createObjectURL(pdfBlob);
    } catch (error) {
      handleAxiosError(error);
    }
  },

  descargarYGuardar: async (libroId, nombreArchivo, usuarioRegistrado = false, haPagado = false) => {
    try {
      const { data } = await axios.get(
        `https://libreriabackend-production.up.railway.app/libros/${libroId}/descargar`,
        {
          params: { usuarioRegistrado, haPagado },
          responseType: 'blob',
        }
      );

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo || 'libro.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      handleAxiosError(error);
    }
  }
};

const PDFDownloader = ({
  libroId,
  titulo,
  usuarioRegistrado = false,
  haPagado = false,
  mostrarVisor = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Limpieza del URL cuando cambia o se desmonta el componente
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleDescargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await pdfService.descargarYGuardar(libroId, `${titulo}.pdf`, usuarioRegistrado, haPagado);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [libroId, titulo, usuarioRegistrado, haPagado]);

  const handleVisualizarPDF = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await pdfService.descargarPDF(libroId, usuarioRegistrado, haPagado);
      setPdfUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [libroId, usuarioRegistrado, haPagado]);

  const cerrarVisor = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return (
    <div className="pdf-downloader">
      <div className="pdf-actions">
        <button onClick={handleDescargar} disabled={loading} className="btn-download">
          {loading ? 'Descargando...' : 'Descargar PDF'}
        </button>

        {mostrarVisor && (
          <button onClick={handleVisualizarPDF} disabled={loading} className="btn-view">
            {loading ? 'Cargando...' : 'Ver PDF'}
          </button>
        )}
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {pdfUrl && (
        <div className="pdf-viewer-modal" role="dialog" aria-modal="true">
          <div className="pdf-viewer-content">
            <header className="pdf-viewer-header">
              <h3>{titulo}</h3>
              <button onClick={cerrarVisor} className="btn-close" aria-label="Cerrar visor PDF">
                ❌ Cerrar
              </button>
            </header>
            <iframe src={pdfUrl} width="100%" height="600px" title={`PDF: ${titulo}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export const usePDFDownload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const descargar = useCallback(async (libroId, titulo, usuarioRegistrado = false, haPagado = false) => {
    setLoading(true);
    setError(null);
    try {
      await pdfService.descargarYGuardar(libroId, `${titulo}.pdf`, usuarioRegistrado, haPagado);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { descargar, loading, error };
};

// Ejemplo de uso en un componente de lista de libros
export const LibroCard = ({ libro, usuarioRegistrado, haPagado }) => {
  const { descargar, loading, error } = usePDFDownload();

  return (
    <div className="libro-card">
      <h3>{libro.titulo}</h3>
      <p>Autor: {libro.autor}</p>
      <p>Año: {libro.anioPublicacion}</p>

      <button onClick={() => descargar(libro.id, libro.titulo, usuarioRegistrado, haPagado)} disabled={loading} className="download-btn">
        {loading ? 'Descargando...' : 'Descargar PDF'}
      </button>

      {error && <p className="error">{error}</p>}

      <PDFDownloader
        libroId={libro.id}
        titulo={libro.titulo}
        usuarioRegistrado={usuarioRegistrado}
        haPagado={haPagado}
        mostrarVisor={true}
      />
    </div>
  );
};

export default PDFDownloader;
