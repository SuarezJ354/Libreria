import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import "../../assets/css/register.css"

const API_BASE_URL = "http://localhost:8080"; // Ajusta según tu puerto

export default function Register() {
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const contra = useWatch({ control, name: "password" });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const formData = async (v) => {
        setLoading(true);
        setErrorMessage("");

        try {
            // Verificar si el correo ya existe
            const checkResponse = await fetch(`${API_BASE_URL}/usuarios/${v.correo}`);
            
            if (checkResponse.ok) {
                // Usuario ya existe
                setErrorMessage("El correo ya está registrado.");
                setLoading(false);
                return;
            }

            // Crear nuevo usuario
            const nuevoUsuario = {
                nombre: v.nombre,
                correo: v.correo,
                password: v.password,
                rol: "USUARIO",
            };

            const response = await fetch(`${API_BASE_URL}/usuarios/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoUsuario),
            });

            if (response.ok) {
                alert("Usuario registrado exitosamente");
                navigate("/login");
            } else {
                const errorData = await response.text();
                setErrorMessage("Error al registrar usuario: " + errorData);
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Error de conexión. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <div className="container-form register">
            <div className="information">
                <div className="info-childs">
                    <h2>Bienvenido</h2>
                    <p>Para unirte a nuestra comunidad registrate o si ya tienes una cuenta inicia sesión</p>
                    <input type="button" value="Iniciar Sesión" id="sign-in" onClick={() => navigate("/Login")} />
                </div>
            </div>
            <div className="form-information">
                <div className="form-information-childs">
                    <h2 className='mt-5'>Crear una Cuenta</h2>
                    
                    {/* Mostrar mensaje de error si existe */}
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit(formData)} className="form form-register" noValidate>
                        <div className="mb-3">
                            <label className="form-label">
                                <input
                                    placeholder="Nombre Usuario"
                                    {...register("nombre", { required: "Debes escribir un nombre de usuario" })}
                                    type="text"
                                    className="form-control"
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                {errors.nombre && <p className="text-danger">{errors.nombre.message}</p>}
                            </label>
                        </div>

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
                                    {...register("password", {
                                        required: "La contraseña debe ser obligatoria",
                                        minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                    })}
                                    type="password"
                                    className="form-control"
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                {errors.password && <p className="text-danger">{errors.password.message}</p>}
                            </label>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                <input
                                    placeholder="Confirma contraseña"
                                    {...register("confirmar_contrasena", {
                                        required: "Por favor confirma la contraseña",
                                        validate: (v) => v === contra || "La contraseña no coincide"
                                    })}
                                    type="password"
                                    className="form-control"
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                {errors.confirmar_contrasena && <p className="text-danger">{errors.confirmar_contrasena.message}</p>}
                            </label>
                        </div>

                        <input 
                            type="submit" 
                            value={loading ? "Registrando..." : "Registrarse"} 
                            disabled={loading}
                        />
                        <div className="alerta-error">Todos los campos son obligatorios</div>
                        <div className="alerta-exito">Te registraste correctamente</div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    );
}