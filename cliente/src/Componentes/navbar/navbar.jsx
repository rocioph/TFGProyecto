import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./navbar.css";

//Declararla como un compenente funcional 
const Navbar = () => {

    //recuperamos token y rol 
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    const [menuAdmin, setMenuAdmin] = useState(false);
    const [menuUsuario, setMenuUsuario] = useState(false);

    //funcion para cerrar sesion 
    const Logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        window.location.href="/";
    }

    return(
        <nav className="navbar"> 
            <div className="nav-container">

                {/* Logo */}
                 <Link to="/" className="logo-container">
                    <img 
                        src="/imagenes/logo.png"  
                        alt="Zootropolis - Protectora Animal" 
                        className="nav-logo"
                    />
                </Link>


                {/* Enlaces comunes para todos */}
                <ul className="nav-links"> 
                    <li><Link to="/adoptar">Adoptar</Link></li>
                    <li><Link to="/apadrinar">Apadrinar</Link></li>
                    <li><Link to="/futurasAdopciones">Futuras Adopciones</Link></li>
                    <li><Link to="/finalesFelices">Finales Felices</Link></li>
                    <li><Link to="/ayuda">¿Como ayudarnos?</Link></li>
                </ul>


                {/* Enlaces que solo ven los administradores */}
                {token && rol == "admin" && (
                    <div className="admin-menu">
                        <button
                            className="icon"
                            onClick={() => setMenuAdmin(!menuAdmin)}
                        >
                        <FaUserCircle size={32} />
                        </button>

                        {menuAdmin && (
                            <div className="dropdown">
                                <Link to="/gestionarAnimales">Gestionar animales</Link>
                                <Link to="/gestionarFinales">Gestionar finales felices</Link>
                                <Link to="/gestionarAdopciones">Gestionar adopciones</Link>
                                <Link to="/gestionarApadrinamientos">Gestionar apadrinamientos</Link>
                                <Link to="/gestionarCitas">Gestionar citas</Link>
                                <Link to="/gestionarAcogida">Gestionar casas de acogida</Link>
                                <Link to="/gestionarSolicitudes">Gestionar solicitudes</Link>
                                <Link to="/verDonaciones">Ver donaciones</Link>
                                <button onClick={Logout}>Cerrar sesión</button>
                        </div>
                        )}
                    </div>
                )}

                {/* Enlaces que solo ven los usuarios */}
                {token && rol == "usuario" && (
                    <div className="usuario-menu">
                        <button
                            className="icon"
                            onClick={() => setMenuAdmin(!menuAdmin)}
                        >
                        <FaUserCircle size={32} />
                        </button>

                        {menuAdmin && (
                            <div className="dropdown">
                                <Link to="/editarPerfil">Editar perfil</Link>
                                <Link to="/verMisApadrinamientos">Mis apadrinamientos</Link>
                                <Link to="/verMisSolicitudesCasaAcogida">Mis solicitudes para casa de acogida </Link>
                                <Link to="/verDonaciones">Mis donaciones</Link>
                                <Link to="/verMisSolicitudesAdoptar">Mis solicitudes de adopción</Link>
                                <Link to="/verMisCitas">Mis citas</Link>
                                <Link to="/verMisAdopciones">Mis adopciones</Link>
                                <button onClick={Logout}>Cerrar sesión</button>
                        </div>
                        )}
                    </div>
                )}

                {/* Botones que solo ven los no logueados */}
                {!token && (
                    <div className="nav-buttons"> 
                        <Link to="/login" className="btn btn-login">Iniciar Sesion</Link> 
                        <Link to="/registro" className="btn btn-register">Registrate</Link> 
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar;