import React, { useEffect, useState } from 'react';
import { CheckCircle, Trash2, Bell, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = "https://libreriabackend-production.up.railway.app";

const NotificationsPanel = () => {
  const { token } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [respuestaNotifId, setRespuestaNotifId] = useState(null);
  const [mensajeRespuesta, setMensajeRespuesta] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  useEffect(() => {
    if (token) fetchNotificaciones();
  }, [token]);

const fetchNotificaciones = async () => {
  
  try {
    const res = await fetch(`${API}/notificaciones`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Cantidad de notificaciones:', data.length);
      setNotificaciones(data);
    } else {
      const errorText = await res.text();
      console.error('❌ Error response:', errorText);
      setError(`Error del servidor: ${res.status} - ${errorText}`);
    }
  } catch (err) {
    console.error("❌ Error de red:", err);
    setError(`Error de conexión: ${err.message}`);
  }
};
  const marcarTodasComoLeidas = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/notificaciones/marcar-todas-leidas`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchNotificaciones();
    } catch (err) {
      console.error("Error al marcar todas como leídas");
    } finally {
      setLoading(false);
    }
  };

  const eliminarLeidas = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/notificaciones/leidas`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchNotificaciones();
    } catch (err) {
      console.error("Error al eliminar notificaciones leídas");
    } finally {
      setLoading(false);
    }
  };

  const abrirRespuesta = (notifId) => {
    if (respuestaNotifId === notifId) {
      setRespuestaNotifId(null);
      setMensajeRespuesta('');
    } else {
      setRespuestaNotifId(notifId);
      setMensajeRespuesta('');
    }
  };

const enviarRespuesta = async () => {
  if (!mensajeRespuesta.trim()) return;

  setEnviandoRespuesta(true);
  try {
    const res = await fetch(`${API}/notificaciones/${respuestaNotifId}/respuesta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ mensaje: mensajeRespuesta.trim() })
    });

    // Mejor manejo de erroresa
    if (!res.ok) {
      const errorData = await res.text();
      console.error('❌ Error del servidor:', {
        status: res.status,
        statusText: res.statusText,
        body: errorData,
        notificationId: respuestaNotifId,
        mensaje: mensajeRespuesta.trim()
      });
      
      // Mostrar error más específico al usuario
      if (res.status === 404) {
        setError("La notificación no fue encontrada");
      } else if (res.status === 403) {
        setError("No tienes permisos para responder esta notificación");
      } else if (res.status === 400) {
        setError(`Error en los datos enviados: ${errorData}`);
      } else {
        setError(`Error del servidor (${res.status}): ${errorData}`);
      }
      return;
    }

    // Éxito
    console.log('✅ Respuesta enviada correctamente');
    setRespuestaNotifId(null);
    setMensajeRespuesta('');
    setError(''); // Limpiar errores previos
    await fetchNotificaciones();
    
  } catch (err) {
    console.error('❌ Error de red:', err);
    setError(`Error de conexión: ${err.message}`);
  } finally {
    setEnviandoRespuesta(false);
  }
};

  const noLeidas = notificaciones.filter(n => !n.leida);

  return (
    <div className="container my-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Panel de Notificaciones</h5>
            <small className="text-muted">
              {noLeidas.length} sin leer de {notificaciones.length} total
            </small>
          </div>
          <div className="d-flex gap-2">
            {noLeidas.length > 0 && (
              <button
                onClick={marcarTodasComoLeidas}
                disabled={loading}
                className="btn btn-success btn-sm d-flex align-items-center"
              >
                <CheckCircle size={16} className="me-1" />
                Marcar leídas
              </button>
            )}
            {notificaciones.some(n => n.leida) && (
              <button
                onClick={eliminarLeidas}
                disabled={loading}
                className="btn btn-danger btn-sm d-flex align-items-center"
              >
                <Trash2 size={16} className="me-1" />
                Limpiar leídas
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {notificaciones.length === 0 ? (
            <p className="text-center text-muted">No hay notificaciones.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`card ${notif.leida ? 'bg-light' : 'bg-warning-subtle'} border`}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center mb-2 gap-2">
                          <Bell
                            size={16}
                            className={notif.leida ? 'text-secondary' : 'text-warning'}
                          />
                          <strong>{notif.titulo}</strong>
                          {!notif.leida && (
                            <span className="badge bg-danger">Nuevo</span>
                          )}
                        </div>
                        <p className="mb-1">{notif.contenido}</p>
                        <small className="text-muted">
                          {new Date(notif.fecha).toLocaleString()}
                        </small>
                      </div>
                      {!notif.leida && (
                        <button
                          onClick={() => abrirRespuesta(notif.id)}
                          className="btn btn-primary btn-sm ms-3 d-flex align-items-center"
                        >
                          <Send size={14} className="me-1" />
                          {respuestaNotifId === notif.id ? 'Cancelar' : 'Responder'}
                        </button>
                      )}
                    </div>

                    {respuestaNotifId === notif.id && (
                      <div className="mt-3">
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Escribe tu respuesta..."
                          value={mensajeRespuesta}
                          onChange={(e) => setMensajeRespuesta(e.target.value)}
                        />
                        <button
                          onClick={enviarRespuesta}
                          disabled={enviandoRespuesta || !mensajeRespuesta.trim()}
                          className="btn btn-info btn-sm mt-2"
                        >
                          {enviandoRespuesta ? 'Enviando...' : 'Enviar respuesta'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
