import React, { useState, useEffect } from "react";
import "./adoptar.css";

function formatearTamano(tamano) {
  const formatos = {
    'muy_grande': 'Muy grande',
    'muy_pequeno': 'Muy pequeño',
    'mediano': 'Mediano',
    'grande': 'Grande',
    'pequeño': 'Pequeño'
  };
  
  return formatos[tamano] || tamano;
}

function formatearGenero(genero) {
  const formatos = {
    'hembra': 'Hembra',
    'macho': 'Macho'
  };
  
  return formatos[genero] || genero;
}

function formatearEstado(estado) {
  const formatos = {
    'disponible': 'Disponible',
    'en_proceso': 'En proceso de adopción'
  };
  
  return formatos[estado] || estado;
}


function calcularEdad(fechaNac) {
  const nacimiento = new Date(fechaNac);
  const hoy = new Date();
  
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  let días = hoy.getDate() - nacimiento.getDate();
  
  // Ajustar si los días son negativos
  if (días < 0) {
    meses--;
    // Obtener los días del mes anterior
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    días += ultimoDiaMesAnterior;
  }
  
  // Ajustar si los meses son negativos
  if (meses < 0) {
    años--;
    meses += 12;
  }
  
  // Construir el string según los casos
  if (años === 0 && meses === 0) {
    return `${días} ${días === 1 ? 'día' : 'días'}`;
  } else if (años === 0) {
    if (días === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'} y ${días} ${días === 1 ? 'día' : 'días'}`;
    }
  } else if (años === 1 && meses === 0 && días === 0) {
    return '1 año';
  } else if (años === 1 && meses === 0) {
    return `1 año y ${días} ${días === 1 ? 'día' : 'días'}`;
  } else if (años === 1) {
    if (días === 0) {
      return `1 año y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      return `1 año, ${meses} ${meses === 1 ? 'mes' : 'meses'} y ${días} ${días === 1 ? 'día' : 'días'}`;
    }
  } else {
    if (meses === 0 && días === 0) {
      return `${años} años`;
    } else if (meses === 0) {
      return `${años} años y ${días} ${días === 1 ? 'día' : 'días'}`;
    } else if (días === 0) {
      return `${años} años y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      return `${años} años, ${meses} ${meses === 1 ? 'mes' : 'meses'} y ${días} ${días === 1 ? 'día' : 'días'}`;
    }
  }
}

function clasificarEdad(fechaNac) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNac);
  
  const edadEnMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + 
                     (hoy.getMonth() - nacimiento.getMonth());
  
  if (edadEnMeses < 12) {
    return 'cachorro';
  } else if (edadEnMeses <= 84) { // 7 años = 84 meses
    return 'adulto';
  } else {
    return 'senior';
  }
}

const Adoptar = () => {

    const [animales, setAnimales] = useState([]); //array vacio donde gaurdaremos la lista de animales a mostrar
    const [loading, setLoading] = useState(true); //estado booleano para mostrar el "Cargando..." hasta que llegue la respuesta
    const [error, setError] = useState(null); //Si ocurre un fallo se guarda un string con el mensaje de error 
    const [pagina, setPagina] = useState(0); //estado de paginacion, indice de la pagina actual --> 0
    const Por_Pagina = 4; //items por pagina

    /*************** FILTRO ***************/
    const [filtroTamano, setFiltroTamano] = useState("todos");
    const [filtroGenero, setFiltroGenero] = useState("todos");
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [filtroUrgente, setFiltroUrgente] = useState("todos");
    const [filtroEdad, setFiltroEdad] = useState("todos");
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    /****************Busqueda ************/
    const [busqueda, setBusqueda] = useState("");

    //no es necesario que el usuario haga click en nada, se ejecuta automaticamente 
    useEffect(() => {
        const fetchAnimales = async () => {

            setLoading(true);
            setError(null);

            try{

                const res = await fetch("http://localhost:5000/api/adoptar");

                if (!res.ok) throw new Error(`HTTP ${res.status}`); //Si hay una respuesta no adecuada, manda un error para entrar en el catch
                const data  = await res.json(); 

                const datosAleatorios = [...data].sort(() => Math.random() - 0.5);
                setAnimales(datosAleatorios);

                setError(null);
                
            }catch(err){

                console.error(err);
                setError("No se pudieron cargar los animales");

            }finally{
                setLoading(false);
            }
        };
        
        fetchAnimales();
    }, []);

    /*************Aplicamos filtros antes de paginar****************/
    const animalesFiltrados = animales.filter((a) => {
      const coincideTamano = filtroTamano === "todos" || a.tamano === filtroTamano;
      const coincideGenero = filtroGenero === "todos" || a.genero === filtroGenero;
      const coincideTipo = filtroTipo === "todos" || a.tipo === filtroTipo;
      const coincideUrgente = filtroUrgente === "todos" || 
                         (filtroUrgente === "urgente" && a.urgente === 1) ||
                         (filtroUrgente === "no_urgente" && a.urgente !== 1);
      const coincideEdad = filtroEdad === "todos" || 
                       clasificarEdad(a.fechaNac) === filtroEdad;

      const coincideBusqueda = busqueda === "" ||
        [a.nombre, a.raza, a.tamano, a.tipo, a.genero]
        .some(valor =>
         valor && valor.toString().toLowerCase().includes(busqueda.toLowerCase())
      );

      
      return coincideTamano && coincideGenero && coincideTipo && coincideUrgente && coincideEdad && coincideBusqueda;
    });


    //numero total de paginas redondeado hacia arriba
    const totalPaginas = Math.ceil(animalesFiltrados.length / Por_Pagina);
    //baja la pagina pero nunca <0
    const prevPagina = () => setPagina((p) => Math.max(0, p - 1));
    //sube la pagina pero nunca pasa del maximo 
    const nextPagina = () => setPagina((p) => Math.min(totalPaginas - 1, p + 1));

    // si carga devuelvo --> Cargando animales
    if (loading) return <div className="mensaje-cargando">Cargando animales…</div>;
    //si hay error muestro mensaje de error
    if (error) return <div className="mensaje-error">{error}</div>;
    //si la lista esta vaacia, muestro no hay animales disponibles 
    if (!animales.length) return <div className="mensaje-vacio">No hay animales disponibles</div>;

    //indice de la pagina
    const inicio = pagina * Por_Pagina;
    //array con animales que se deben de mostrar en la pagina actual 
    const animalesArray = animalesFiltrados.slice(inicio, inicio + Por_Pagina);


    return (
    <div className="adopcion-container">
      <header className="cabecera">
        <h1>Nuestros animales en adopción</h1>
      </header>

      <div className="contenedor-busqueda-filtro">

        {/* Botón con icono de filtros */}
        <div className="contenedor-filtro">
          <img
            src={`/imagenes/filtro-icon.png`}
            alt="Filtros"
            className="icono-filtros"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          />
        </div>

        {/* Campo de búsqueda con lupa */}
        <div className="buscador-con-lupa">
          <input
            type="text"
            placeholder="Buscar por nombre, raza, tamaño, género y tipo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="campo-busqueda"
          />
          <img 
            src="/imagenes/lupa-icon.png" 
            alt="Buscar" 
            className="lupa" 
          />
        </div>
        {/* Panel de filtros que aparece al hacer clic en el icono */}
        {mostrarFiltros && (
          <div className="filtros-panel">
            <div className="filtro">
              <label>Tamaño:</label>
              <select value={filtroTamano} onChange={(e) => setFiltroTamano(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="muy_pequeno">Muy pequeño</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
                <option value="muy_grande">Muy grande</option>
              </select>
            </div>

            <div className="filtro">
              <label>Género:</label>
              <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            <div className="filtro">
              <label>Tipo:</label>
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="perro">Perros</option>
                <option value="gato">Gatos</option>
              </select>
            </div>

            <div className="filtro">
              <label>Urgente:</label>
              <select value={filtroUrgente} onChange={(e) => setFiltroUrgente(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="urgente">Urgente</option>
                <option value="no_urgente">No urgente</option>
              </select>
            </div>

            <div className="filtro">
              <label>Edad:</label>
              <select value={filtroEdad} onChange={(e) => setFiltroEdad(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="cachorro">Cachorros</option>
                <option value="adulto">Adultos</option>
                <option value="senior">Seniors</option>
              </select>
            </div>

          </div>
        )}

      </div>
      

      

      {/*Un article es un elemento semantico que sirve para agrupar un bloque de contenido que tiene sentido por si mismo 
        animalesArray es un array probablemento y map recorre el array y devuelve un nuevo elemento jsx para cada perro 
        a representa a un animal individual
        Si animalesArray tiene 3 perros, se generaran 3 article por cada uno */}
      <div className="lista-animales">
        
        {animalesArray.map((a) => (
          <article className="card" key={a.id}> {/*Identificamos el perro por el id*/}

            {a.urgente == 1 && (
              <div className="indicador-urgente" title="Adopción urgente">
                ⚠️
              </div>
            )}

            <div className="foto-contenedor">
              <img
                src={`/imagenes/${a.fotos}`}  // ← Sin localhost:5000
                alt={a.nombre}
              />
            </div>

            <div className="info">
              <div className="cabecera-nombre">
                <h2 className="nombre">{a.nombre}</h2>
                  {a.urgente == 1 && (
                    <span className="badge-urgente">URGENTE</span>
                  )}
              </div>

              <div className="fila-datos">

                <div className="detalle-item">
                  <span className="detalle-label">Género: </span>
                  <span className="detalle-valor">{formatearGenero(a.genero)}</span>
                </div>

                <div className="detalle-item">
                  <span className="detalle-label">Tamaño: </span>
                  <span className="detalle-valor">{formatearTamano(a.tamano)}</span>
                </div>

                <div className="detalle-item">
                  <span className="detalle-label">Raza: </span>
                  <span className="detalle-valor">{a.raza || "Desconocida"}</span>
                </div>

                <div className="detalle-item">
                  <span className="detalle-label">Edad: </span>
                  <span className="detalle-valor">{calcularEdad(a.fechaNac)}</span>
                </div>

                <div className="detalle-item">
                  <span className="detalle-label">En refugio:</span>
                  <span className="detalle-valor">{calcularEdad(a.fecha_ingreso)}</span>
                </div>

              </div>

              <button className="btn-adoptar">
                Adoptar
              </button>

            </div>

          </article>
        ))}
      </div>
      <footer className="paginacion">
        <button onClick={prevPagina} disabled={pagina === 0}>←</button>
        <span>Página {pagina + 1} / {Math.max(1, totalPaginas)}</span>
        <button onClick={nextPagina} disabled={pagina >= totalPaginas - 1}>→</button>
      </footer>
    </div>
  );
};

export default Adoptar;