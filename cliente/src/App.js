import './App.css';
import Navbar from './Componentes/navbar/navbar';
import { Routes, Route } from 'react-router-dom'; // ← Quita BrowserRouter
import Login from './Componentes/login/login';
import Registrar from './Componentes/registrar/registrar';
import RecoverPassword from './Componentes/recoverPassword/recoverPassword';
import ChangePassword from './Componentes/recoverPassword/changePassword';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/registro" element={<Registrar />} /> 
        <Route path="/recoverPassword" element={<RecoverPassword />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        {/* Añade más rutas aquí */}
        {/* Añade más rutas aquí */}
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <div className="home-container">
      <h1>Bienvenido a Zootropolis</h1>
      {/* Tu contenido principal aquí */}
    </div>
  );
}

export default App;