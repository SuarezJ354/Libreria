import React, { useEffect, useState } from 'react';
import { Send, User, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = "https://libreriabackend-production.up.railway.app";

const MessagesSection = () => {
  const { token, user } = useAuth();
  
  const [mensaje, setMensaje] = useState('');
  const [todosLosMensajes, setTodosLosMensajes] = useState([]);
  const [autor, setAutor] = useState('Usuario');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchMensajes();
    }
  }, [token]);

  // Establecer el autor basado en el usuario logueado
  useEffect(() => {
    if (user && user.nombre) {
      setAutor(user.nombre);
    } else if (user && user.username) {
      setAutor(user.username);
    }
  }, [user]);

  const fetchMensajes = async () => {
    try {
      const res = await fetch(`${API}/mensajes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setTodosLosMensajes(data);
      } else {
        const errorText = await res.text();
        console.error('Error al cargar mensajes:', errorText);
        setError('No se pudieron cargar los mensajes');
      }
    } catch (err) {
      console.error("Error cargando mensajes", err);
      setError("No se pudieron cargar los mensajes");
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim()) {
      setError('El mensaje es obligatorio');
      return;
    }

    // Verificar si hay token de autenticación
    if (!token) {
      setError('No puedes enviar mensajes sin iniciar sesión');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const safeAutor = autor?.trim() || "Anónimo";
      
      const datosAEnviar = {
        contenido: mensaje.trim(),
        autor: safeAutor,
        esRespuesta: false
      };

      const res = await fetch(`${API}/mensajes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosAEnviar)
      });

      console.log("Respuesta del servidor:", res.status, res.statusText);

      if (res.ok) {
        const responseData = await res.json();
        console.log("Mensaje enviado exitosamente:", responseData);
        setMensaje('');
        await fetchMensajes();
      } else {
        // Intentar obtener el mensaje de error específico
        const contentType = res.headers.get('content-type');
        let errorMessage;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (e) {
            errorMessage = 'Error JSON inválido';
          }
        } else {
          errorMessage = await res.text();
        }
        
        console.error('=== ERROR DEL SERVIDOR ===');
        console.error('Status:', res.status);
        console.error('Status Text:', res.statusText);
        console.error('Content-Type:', contentType);
        console.error('Error Message:', errorMessage);
        console.error('========================');
        
        setError(`Error ${res.status}: ${errorMessage || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ya no necesitamos filtros adicionales porque el backend ya filtra por usuario
  const mensajesPrincipales = todosLosMensajes.filter(m => !m.esRespuesta);
  
  const mensajesOrganizados = mensajesPrincipales.map(mensaje => ({
    ...mensaje,
    respuestas: todosLosMensajes.filter(r => 
      r.esRespuesta && r.mensajePadreId === mensaje.id
    ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="container my-4">
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Enviar Mensaje</h5>
          
          {!token ? (
            <div className="alert alert-warning">
              <strong>⚠️ Sesión requerida:</strong> No puedes enviar mensajes sin iniciar sesión
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Autor</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tu nombre..."
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  disabled={user && (user.nombre || user.username)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Mensaje</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Escribe tu mensaje..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </div>
              <button
                onClick={enviarMensaje}
                disabled={loading}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <Send size={16} />
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            {!token ? 'Mensajes' : `Mis Mensajes (${mensajesOrganizados.length})`}
          </h5>
          {token && (
            <small className="text-muted">
              {todosLosMensajes.filter(m => m.esRespuesta).length} respuestas en total
            </small>
          )}
        </div>
        <div className="card-body">
          {!token ? (
            <div className="text-center text-muted">
              <p>Inicia sesión para ver y enviar mensajes</p>
            </div>
          ) : mensajesOrganizados.length === 0 ? (
            <p className="text-center text-muted">No tienes mensajes aún.</p>
          ) : (
            mensajesOrganizados.map((mensaje) => (
              <div key={mensaje.id} className="mb-4">
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex align-items-start gap-3 mb-2">
                    <div className="bg-secondary-subtle rounded-circle p-2">
                      <User size={16} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <strong>{mensaje.autor}</strong>
                        {mensaje.respuestas.length > 0 && (
                          <span className="badge bg-success">
                            {mensaje.respuestas.length} respuesta{mensaje.respuestas.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="mb-1">{mensaje.contenido}</p>
                      <small className="text-muted">{new Date(mensaje.fecha).toLocaleString()}</small>
                    </div>
                  </div>
                </div>

                {/* Respuestas */}
                {mensaje.respuestas.map((respuesta) => (
                  <div
                    key={respuesta.id}
                    className="border rounded p-3 bg-info-subtle mt-2 ms-4"
                  >
                    <div className="d-flex align-items-start gap-3 mb-2">
                      <div className="bg-info rounded-circle p-2">
                        <Users size={16} color="#fff" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <strong>{respuesta.autor}</strong>
                          <span className="badge bg-info text-light">Respuesta</span>
                        </div>
                        <p className="mb-1">{respuesta.contenido}</p>
                        <small className="text-muted">{new Date(respuesta.fecha).toLocaleString()}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesSection;