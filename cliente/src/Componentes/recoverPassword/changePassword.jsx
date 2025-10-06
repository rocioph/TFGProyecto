import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./changePassword.css";

const ChangePassword = () => {
    const [searchParams] = useSearchParams();
    const [pass, setPass] = useState("");
    const [passConfirmed, setPassConfirmed] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Obtener token desde los parámetros de la URL
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
        setSuccess(null);

        if (pass !== passConfirmed) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!token) {
            setError("Token no válido. Solicita un nuevo enlace.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token, // ✅ ENVIAR TOKEN EN EL BODY (así lo espera tu backend)
                    pass: pass,   // ✅ usar 'pass' (así lo espera tu backend)
                    passConfirmed: passConfirmed // ✅ usar 'passConfirmed' (así lo espera tu backend)
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Error al cambiar la contraseña");
            } else {
                setSuccess("¡Contraseña cambiada exitosamente! Redirigiendo al login...");
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }

        } catch (err) {
            console.error("Error completo:", err);
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-container">
            <div className="change-form">
                <h1>Cambiar Contraseña</h1>
                
                <form onSubmit={handleSubmit}>
                    <label htmlFor="pass">Nueva Contraseña:</label>
                    <input
                        type="password"
                        id="pass"
                        required
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                    <br />

                    <label htmlFor="passConfirmed">Confirmar Contraseña:</label>
                    <input
                        type="password"
                        id="passConfirmed"
                        required
                        value={passConfirmed}
                        onChange={(e) => setPassConfirmed(e.target.value)}
                    />
                    <br />

                    <button 
                        type="submit" 
                        className="btn-change-submit"
                    >
                        {loading ? "Cambiando contraseña..." : "Cambiar contraseña"}
                    </button>
                </form>

                {error && <p className="error">{error}</p>}

                
                {success && <p className="success">{success}</p>}
            </div>
        </div>
    );
};

export default ChangePassword;