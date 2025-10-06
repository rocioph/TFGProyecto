import React, { useState, useRef } from "react";
import "./registrar.css";


const Registrar = () => {

    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelf] = useState("");
    const [fechaNac, setFechaNac] = useState("");
    const [password, setPassword] = useState("");
    
    const [error, setError] = useState(null);


    const handleSubmit = async (e) => {


        e.preventDefault(); 

        //si paso la validacion de edad, enviamos los datos al backend 
        const hoy = new Date();
        const nacimiento = new Date(fechaNac);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        if(edad<18)
        {
            setError("Debes tener al menos 18 años para registrarte");
            return;
        }

        try {

            const res = await fetch("http://localhost:5000/api/registro", {
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ nombre, apellidos, email,  telefono, fechaNac, password}), 
        });

        const data = await res.json(); 

        if (!res.ok) {

            setError(data.message || "Error en el registro");

        } else {

            setError(null);
            console.log("Registro correcto ✅", data);
            
            localStorage.setItem("token",data.token);
            localStorage.setItem("rol", data.user.rol);
            window.location.href = "/";

        }
    } catch (err) {
      setError("Error en el servidor");
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Crear Cuenta</h1>
        <form onSubmit={handleSubmit}> 

        <label htmlFor="nombre">Nombre:</label> 
          <input
            type="text"
            id="nombre"
            required
            value={nombre}
            maxLength={100}
            onChange={(e) => setNombre(e.target.value)} 
          />
          <br />

          <label htmlFor="apellidos">Apellidos:</label> 
          <input
            type="text"
            id="apellidos"
            required
            value={apellidos}
            maxLength={150}
            onChange={(e) => setApellidos(e.target.value)} 
          />
          <br />

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

          <label htmlFor="telefono">Telefono:</label> 
          <input
            type="tel"
            id="telefono"
            required
            value={telefono}
            maxLength={20}
            onChange={(e) => setTelf(e.target.value)} 
          />
          <br />

          <label htmlFor="fechaNac">Fecha de nacimiento:</label> 
          <input
            type="date"
            id="fechaNac"
            required
            value={fechaNac}
            onChange={(e) => setFechaNac(e.target.value)} 
          />
          <br />

          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            required
            value={password}
            maxLength={255}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />

          <p className="RecoverPassword-link">
            <a href="/RecoverPassword">¿Has olvidado tu contraseña?</a>
          </p>

          <button type="submit" className="btn-register-submit">
            Crear Cuenta
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="Login-link">
          ¿Tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
};

export default Registrar;
