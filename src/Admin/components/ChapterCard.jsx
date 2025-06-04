import React from 'react';
import '../../assets/css/ChapterCard.css';

const ChapterCard = ({ chapter, onUpdate, onRemove, canRemove }) => {
  const handleInputChange = (field, value) => {
    onUpdate(chapter.id, field, value);
  };

  const handleToggleGratuito = () => {
    onUpdate(chapter.id, 'esGratuito', !chapter.esGratuito);
  };

  return (
    <div className="chapter-wrapper">
      <div className="chapter-card">
        <div className="chapter-card-header">
          <h5>
            <i className="fas fa-book-open"></i>
            Capítulo {chapter.numeroCapitulo}
          </h5>
          <div className="chapter-actions">
            <div className="form-check form-switch chapter-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`gratuito-${chapter.id}`}
                checked={chapter.esGratuito}
                onChange={handleToggleGratuito}
              />
              <label
                className="form-check-label"
                htmlFor={`gratuito-${chapter.id}`}
              >
                Gratuito
              </label>
            </div>

            {canRemove && (
              <button
                type="button"
                className="chapter-delete-btn"
                onClick={() => onRemove(chapter.id)}
                title="Eliminar capítulo"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        </div>

        <div className="chapter-card-body">
          <div className="form-group">
            <label>
              Título del Capítulo <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: La aventura comienza"
              value={chapter.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Contenido del Capítulo <span className="required">*</span>
            </label>
            <textarea
              rows="8"
              placeholder="Escribe el contenido completo del capítulo aquí..."
              value={chapter.contenido}
              onChange={(e) => handleInputChange('contenido', e.target.value)}
            />
            <small>Caracteres: {chapter.contenido.length}</small>
          </div>

          <div className="chapter-info">
            <div className="info-box">
              <strong>Número:</strong> {chapter.numeroCapitulo}
            </div>
            <div className="info-box">
              <strong>Orden:</strong> {chapter.orden}
            </div>
            <div className={`info-box ${chapter.esGratuito ? 'free' : 'premium'}`}>
              <strong>Acceso:</strong> {chapter.esGratuito ? 'Gratuito' : 'Premium'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
