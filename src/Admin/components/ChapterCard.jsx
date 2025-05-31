import React from 'react';

const ChapterCard = ({ chapter, index, onUpdate, onRemove, canRemove }) => {
  const handleInputChange = (field, value) => {
    onUpdate(chapter.id, field, value);
  };

  const handleToggleGratuito = () => {
    onUpdate(chapter.id, 'esGratuito', !chapter.esGratuito);
  };

  return (
    <div className="col-12 mb-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-book-open me-2"></i>
            Capítulo {chapter.numeroCapitulo}
          </h5>
          <div className="d-flex align-items-center gap-2">
            {/* Switch para capítulo gratuito */}
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`gratuito-${chapter.id}`}
                checked={chapter.esGratuito}
                onChange={handleToggleGratuito}
              />
              <label className="form-check-label text-white" htmlFor={`gratuito-${chapter.id}`}>
                Gratuito
              </label>
            </div>
            
            {/* Botón para eliminar */}
            {canRemove && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => onRemove(chapter.id)}
                title="Eliminar capítulo"
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          <div className="row">
            {/* Título del capítulo */}
            <div className="col-md-8 mb-3">
              <label className="form-label fw-bold">
                Título del Capítulo <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: La aventura comienza"
                value={chapter.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
              />
            </div>

            {/* Duración estimada */}
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Duración Estimada</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: 15 min"
                value={chapter.duracionEstimada}
                onChange={(e) => handleInputChange('duracionEstimada', e.target.value)}
              />
            </div>

            {/* Contenido del capítulo */}
            <div className="col-12 mb-3">
              <label className="form-label fw-bold">
                Contenido del Capítulo <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows="8"
                placeholder="Escribe el contenido completo del capítulo aquí..."
                value={chapter.contenido}
                onChange={(e) => handleInputChange('contenido', e.target.value)}
              />
              <div className="form-text">
                Caracteres: {chapter.contenido.length}
              </div>
            </div>

            {/* Información adicional */}
            <div className="col-12">
              <div className="row">
                <div className="col-md-4">
                  <div className="alert alert-info">
                    <strong>Número:</strong> {chapter.numeroCapitulo}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-secondary">
                    <strong>Orden:</strong> {chapter.orden}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={`alert ${chapter.esGratuito ? 'alert-success' : 'alert-warning'}`}>
                    <strong>Acceso:</strong> {chapter.esGratuito ? 'Gratuito' : 'Premium'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;