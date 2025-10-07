import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./changePassword.css";

const ChangePassword = () => {
    const [searchParams] = useSearchParams();
    const [pass, setPass] = useState("");
    const [passConfirmed, setPassConfirmed] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false); 
    const [token, setToken] = useState(null);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        console.log("Token desde URL:", urlToken);
        
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError("Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.");
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (pass !== passConfirmed) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!token) {
            setError("Token no válido. Solicita un nuevo enlace.");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token,
                    pass: pass,
                    passConfirmed: passConfirmed
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Error al cambiar la contraseña");
            } else {
                setSuccess(true); // Cambiar a true
                
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }

        } catch (err) {
            console.error("Error completo:", err);
            setError("Error de conexión con el servidor");
        } 
    };

    return (
        <div className="change-container">
            <div className="change-form">
                <h1>Cambiar Contraseña</h1>
                
                {/* Mostrar formulario solo si no hay éxito */}
                {!success ? (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="pass">Nueva Contraseña:</label>
                        <input
                            type="password"
                            id="pass"
                            required
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                        />

                        <label htmlFor="passConfirmed">Confirmar Contraseña:</label>
                        <input
                            type="password"
                            id="passConfirmed"
                            required
                            value={passConfirmed}
                            onChange={(e) => setPassConfirmed(e.target.value)}
                        />

                        <button 
                            type="submit" 
                            className="btn-change-submit"
                        >
                            Cambiar Contraseña
                        </button>

                        {error && <p className="error">{error}</p>}
                    </form>
                ) : (
                    // Mostrar mensaje de éxito cuando success es true
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <div className="success-text">
                            ¡Contraseña cambiada exitosamente!<br />
                            Redirigiendo al login...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePassword;