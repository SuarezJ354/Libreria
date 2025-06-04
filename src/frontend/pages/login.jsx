import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import "../../assets/css/register.css";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");



const formData = async (data) => {
  setLoading(true);
  setErrorMessage("");

  try {
    const result = await login(data.correo, data.password);
    
    if (result.success) {
      const rol = result.usuario.rol;

      if (rol === "USUARIO") {
        navigate("/");
      } else if (rol === "ADMIN" || rol === "BIBLIOTECARIO") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } else {
      setErrorMessage(result.mensaje || "Credenciales incorrectas");
    }
  } catch (error) {
    console.error("Error en login:", error);
    setErrorMessage("Error de conexión. Intenta nuevamente.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="body">
      <div className="container-form login hide" data-testid="login-page">
        <div className="information">
          <div className="info-childs">
            <h2>¡¡Bienvenido!!</h2>
            <p>Para unirte a nuestra comunidad por favor Inicia Sesión con tus datos</p>
            <input type="button" value="Registrarse" id="sign-up" onClick={() => navigate("/Register")} />
          </div>
        </div>
        <div className="form-information">
          <div className="form-information-childs">
            <h2>Iniciar Sesión</h2>
            <p>o Iniciar Sesión con una cuenta</p>
            
            {/* Mostrar mensaje de error si existe */}
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit(formData)} className="form form-login" noValidate>
              <div className="mb-3">
                <label className="form-label">
                  <input
                    placeholder="Correo Electronico"
                    {...register("correo", { required: "Debes escribir un correo" })}
                    type="email"
                    className="form-control"
                    autoComplete='off'
                    disabled={loading}
                  />
                  {errors.correo && <p className="text-danger">{errors.correo.message}</p>}
                </label>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <input
                    placeholder="Contraseña"
                    {...register("password", { required: "La contraseña debe ser obligatoria" })}
                    type="password"
                    className="form-control"
                    autoComplete='off'
                    disabled={loading}
                  />
                  {errors.password && <p className="text-danger">{errors.password.message}</p>}
                </label>
              </div>
              <input 
                type="submit" 
                value={loading ? "Iniciando..." : "Iniciar Sesión"} 
                disabled={loading}
              />
              <div className="alerta-error">Todos los campos son obligatorios</div>
              <div className="alerta-exito">Sesión iniciada correctamente</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}