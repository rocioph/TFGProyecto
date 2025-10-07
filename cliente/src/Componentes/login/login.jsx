import React, { useState, useRef } from "react";
import "./login.css";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = "6LfBZ90rAAAAAC25LdoRUG4SJmpIJ5QKfgaAsQ_Q";

//declara un componente funcional llamado Login
const Login = () => {

  /*
    - Crea una variable de estado llamado email con valor inicial "" 
    - Crea una funcion setEmail para actualizar la variable 
    - Email contendra lo que se escribe en el input del email 
  */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  /*
    - Estado para guardar un mensaje de error (si ocurre) y mostrarlo 
    - Incialmente null (sin error)
  */
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  //no soy un robot//
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  
  //declara una funcion handleSubmit que se ejecuta al enviar el formulario 
  const handleSubmit = async (e) => {


    e.preventDefault(); // Evita que la página se recargue

    //no soy un robot//
    if (!recaptchaToken) {
      setError("Por favor, verifica que no eres un robot.");
      return;
    }

    try {

        //hace una peticion HTTP a tu backend usando fetch
        const res = await fetch("http://localhost:5000/api/login", {
            method: "POST", //indica que enviamos datoa
            headers: { "Content-Type": "application/json" }, //especifica que el cuerpo es JSON
            body: JSON.stringify({ email, password, recaptchaToken }), //convierte el email y password a texto JSON para enviarlo al servidor 
      });

      const data = await res.json(); //extrae el cuerpo JSON de la respuesta y lo gaurda en dato 

      //comprueba la respuesta
      if (!res.ok) {

        //Actualiza el estado de la variable error con el mensaje devuelto por el servidor o un texto por defecto
        setError(data.message || "Error en el login");
        // Reseteamos reCAPTCHA si falla
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);

      } else {

        setError(null);
        setSuccess(true);

        //guardar el token en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.user.rol);

        setTimeout(() => {
                    window.location.href = "/";
        }, 2000);

      }
    } catch (err) {
      setError("Error en el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Iniciar Sesión</h1>

        {!success ? (
          <form onSubmit={handleSubmit}> {/* Conecta el envio del formulario con la funcion que hicimos antes */}
            <label htmlFor="email">Email:</label> {/* Etiqueta para el input del email. htmlFor="email" enlaza la etiqueta con el inputo */}
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
            <br />

            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            {/* 🔹 reCAPTCHA - CENTRADO */}
            <div className="recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={SITE_KEY}
                onChange={(token) => {
                  setRecaptchaToken(token);
                  setError(null);
                }}
                onExpired={() => {
                  setRecaptchaToken(null);
                  if (recaptchaRef.current) recaptchaRef.current.reset();
                }}
              />
            </div>

            <p className="RecoverPassword-link">
              <a href="/recoverPassword">¿Has olvidado tu contraseña?</a>
            </p>

            <button type="submit" className="btn-login-submit">
              Iniciar Sesión
            </button>
          </form>
        ) : (
                    // Mostrar mensaje de éxito cuando success es true
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <div className="success-text">
                          Login realizado con éxito<br />
                        </div>
                    </div>
                )}
        {error && <p className="error">{error}</p>}

        <p className="Register-link">
          ¿No tienes cuenta? <a href="/registro">Regístrate</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
