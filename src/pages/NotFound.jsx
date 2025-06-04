import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div 
      data-testid="not-found-page"
      className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-dark text-center p-4">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="h4 mb-3">Página no encontrada</p>
      <p className="mb-4">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="btn btn-custom px-4 py-2 text-white">
        Volver al inicio
      </Link>

      {/* Estilo personalizado para el botón */}
      <style>{`
        .btn-custom {
          background-color: #6a0dad;
          border: none;
        }
        .btn-custom:hover {
          background-color: #5800a5;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
