import React, { useState } from 'react';
import axios from 'axios';
import '../../assets/css/PDFDownloader.css'

// Servicio para manejar la descarga de PDFs
export const pdfService = {
  descargarPDF: async (libroId, usuarioRegistrado = false, haPagado = false) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/libros/${libroId}/descargar`,
        {
          params: {
            usuarioRegistrado,
            haPagado
          },
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      return pdfUrl;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para descargar este PDF');
      } else if (error.response?.status === 404) {
        throw new Error('PDF no encontrado');
      } else {
        throw new Error('Error al descargar el PDF');
      }
    }
  },

  descargarYGuardar: async (libroId, nombreArchivo, usuarioRegistrado = false, haPagado = false) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/libros/${libroId}/descargar`,
        {
          params: {
            usuarioRegistrado,
            haPagado
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo || 'libro.pdf';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para descargar este PDF');
      } else if (error.response?.status === 404) {
        throw new Error('PDF no encontrado');
      } else {
        throw new Error('Error al descargar el PDF');
      }
    }
  }
};


const PDFDownloader = ({ 
  libroId, 
  titulo, 
  usuarioRegistrado = false, 
  haPagado = false,
  mostrarVisor = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleDescargar = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await pdfService.descargarYGuardar(
        libroId, 
        `${titulo}.pdf`,
        usuarioRegistrado,
        haPagado
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarPDF = async () => {
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
  };

  const cerrarVisor = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return (
    <div className="pdf-downloader">
      <div className="pdf-actions">
        <button 
          onClick={handleDescargar}
          disabled={loading}
          className="btn-download"
        >
          {loading ? 'Descargando...' : ' Descargar PDF'}
        </button>
        
        {mostrarVisor && (
          <button 
            onClick={handleVisualizarPDF}
            disabled={loading}
            className="btn-view"
          >
            {loading ? 'Cargando...' : ' Ver PDF'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {pdfUrl && (
        <div className="pdf-viewer-modal">
          <div className="pdf-viewer-content">
            <div className="pdf-viewer-header">
              <h3>{titulo}</h3>
              <button onClick={cerrarVisor} className="btn-close">
                ❌ Cerrar
              </button>
            </div>
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              title={`PDF: ${titulo}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};


export const usePDFDownload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const descargar = async (libroId, titulo, usuarioRegistrado = false, haPagado = false) => {
    setLoading(true);
    setError(null);

    try {
      await pdfService.descargarYGuardar(
        libroId,
        `${titulo}.pdf`,
        usuarioRegistrado,
        haPagado
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { descargar, loading, error };
};

// Ejemplo de uso en un componente de lista de libros
export const LibroCard = ({ libro, usuarioRegistrado, haPagado }) => {
  const { descargar, loading, error } = usePDFDownload();

  const handleDownload = () => {
    descargar(libro.id, libro.titulo, usuarioRegistrado, haPagado);
  };

  return (
    <div className="libro-card">
      <h3>{libro.titulo}</h3>
      <p>Autor: {libro.autor}</p>
      <p>Año: {libro.anioPublicacion}</p>
      
      <button 
        onClick={handleDownload}
        disabled={loading}
        className="download-btn"
      >
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
