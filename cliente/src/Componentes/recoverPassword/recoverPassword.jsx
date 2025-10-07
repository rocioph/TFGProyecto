import React, { useState, useRef } from "react";
import "./recoverPassword.css";


const RecoverPassword = () => {

    const [email, setEmail] = useState("");

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false); 

    const handleSubmit = async (e) => {


        e.preventDefault(); 

        try {

            const res = await fetch("http://localhost:5000/api/recoverPassword", {
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ email }), 
        });

        const data = await res.json(); 

        if (!res.ok) {

            setError(data.message || "Error al introducir el email para recuperar la contraseña");

        } else {

            setError(null);
            console.log("Email correcto ✅", data);
            setSuccess(true); 
            setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);

        }
    } catch (err) {
      setError("Error en el servidor");
    }
  };

  return (
    <div className="recover-container">
      <div className="recover-form">
        <h1>¿Has olvidado tu contraseña?</h1>
        <h2>Te enviaremos las instrucciones a tu e-mail para que puedas restablecerla</h2>
        {!success ? (

          <form onSubmit={handleSubmit}> 

            <label htmlFor="email">Email:</label> 
            <input
              type="email"
              id="email" 
              required
              value={email}
              maxLength={150}
              onChange={(e) => setEmail(e.target.value)} 
            />
            <br />

            <button type="submit" className="btn-recover-submit">
              Reestablecer
            </button>

            {error && <p className="error">{error}</p>}

          </form>
        ) : (
                    // Mostrar mensaje de éxito cuando success es true
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div className="success-text">
                  El email ha sido enviado<br />
                   Redirigiendo al login...
              </div>
            </div>
          )}
        

      </div>
    </div>
  );
};

export default RecoverPassword;
