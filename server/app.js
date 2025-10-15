const path = require('path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database/db');
const axios = require('axios'); // 👈 para verificar con Google
require('dotenv').config();
const SECRET_RECAPTCHA = process.env.RECAPTCHA_SECRET; 
const app = express();
const JWT_SECRET = '17012002';
const { sendMail, generateRegistrationEmail } = require('./routes/sendEmail');

app.use(express.json());

// CORS para React
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ********************************************************************Ruta de login********************************************************************//
app.post('/api/login', async (req, res) => {

  const { email, password, recaptchaToken } = req.body;

  // Validar campos
  if (!email || !password || !recaptchaToken) {
    return res.status(400).json({ message: 'Faltan datos o reCAPTCHA' });
  }

  try {

    //Verificar token reCAPTCHA con Google
    console.log('Token reCAPTCHA recibido:', recaptchaToken);

    const googleRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_RECAPTCHA}&response=${recaptchaToken}`
    );

    console.log('Respuesta de Google reCAPTCHA:', googleRes.data);

    if (!googleRes.data.success) {
      return res.status(400).json({ 
        message: 'Error en reCAPTCHA, verifica que no eres un robot',
        errors: googleRes.data['error-codes'] || []
      });
    }

    //Buscar usuario en la BD 
    const [results] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Email incorrecto' });
    }

    const user = results[0];

    //Comparar contraseñas
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    //Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    //Responder al frontend
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// ********************************************************************Ruta de registro********************************************************************//
app.post('/api/registro', async (req, res) => {
  console.log('Petición de registro recibida:', req.body);

  const { nombre, apellidos, email, telefono, fechaNac, password } = req.body;

  // Validar campos obligatorios
  if (!nombre || !apellidos || !email || !telefono || !fechaNac || !password) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  // Validar edad mínima 18 años
  const hoy = new Date();
  const nacimiento = new Date(fechaNac);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  if (edad < 18) {
    return res.status(400).json({ message: "Debes tener al menos 18 años para registrarte" });
  }

  try {
    // Verificar que no exista el email
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Error buscando usuario en BD:', err.sqlMessage || err);
        return res.status(500).json({ message: 'Error al buscar usuario en la BD', error: err });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Ya existe un usuario con este email' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar usuario en la BD
      console.log("Datos a insertar en BD:", { nombre, apellidos, email, telefono, fechaNac });

      db.query(
        'INSERT INTO usuarios (nombre, apellidos, email, telef, fNac, password, rol, fRegistro) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [nombre, apellidos, email, telefono, fechaNac, hashedPassword, 'usuario'],
        (err, result) => {
          if (err) {
            console.error('Error insertando usuario en BD:', err.sqlMessage || err);
            return res.status(500).json({ message: 'Error al insertar usuario en la BD', error: err });
          }
            //generar token para el nuevo usuario
            const token = jwt.sign(
            { id: result.insertId, email, rol: "usuario" },
            JWT_SECRET,
            { expiresIn: '24h' }
            );

          res.status(201).json({
            message: 'Registro exitoso',
            token,
            user: {
              rol: "usuario",
            },
          });
        }
      );
    });

  } catch (error) {
    console.error("Error en ruta de registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ********************************************************************Ruta para solicitar el cambio de contraseña********************************************************************//
app.post('/api/recoverPassword', async (req, res) => {
  console.log('Petición de recuperación recibida:', req.body);

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Falta el email' });
  }
  
  // 1. Verificar si el usuario existe
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Error buscando usuario en BD:', err.sqlMessage || err);
      return res.status(500).json({ message: 'Error al buscar usuario en la BD', error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'No existe ningún usuario con ese email' });
    }

    const result = results[0];

    //generar token de recuperacion
    const recoveryToken = jwt.sign(
            { id: result.id, email, type:  'password_recovery'},
            JWT_SECRET,
            { expiresIn: '1h' }
    )

    // Enviar email con el token de recuperación CORREGIDO
    const recoveryLink = `http://localhost:3000/changePassword?token=${recoveryToken}`;

    try {

      const html = generateRegistrationEmail(
          "Recuperar contraseña",
          "Hemos recibido una solicitud para cambiar tu contraseña. Haz clic en el botón para establecer una nueva. Si no solicitaste este cambio, puedes ignorar este mensaje.",
          "CAMBIAR CONTRASEÑA",
          recoveryLink
      );

      // 3. Enviar el email
      await sendMail(email, "Recuperar contraseña", html);

      return res.json({ message: "Correo enviado correctamente " });

    } catch (error) {
      console.error("Error enviando correo:", error);
      return res.status(500).json({ message: "Error enviando el correo" });
    }
  });
});

// ********************************************************************Ruta para cambiar la contraseña********************************************************************//
app.post('/api/changePassword', async (req, res) => {

  console.log('Petición de cambio de contraseña recibida:', req.body);

  const { pass, passConfirmed, token} = req.body;

  // Validar campos obligatorios
  if (!pass || !passConfirmed || !token) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }


  if(pass!=passConfirmed)
  {
    return res.status(400).json({ message: "Las contraseñas no coinciden" });
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(pass, 10);

  try{
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const [userResults] = await db.promise().query('SELECT * FROM usuarios WHERE id = ?', [decoded.id]);

    if(userResults.length==0)
    {
      return res.status(404).json({message: 'Usuario no encontrado'});
    }

    const user = userResults[0];

    // Actualizar la contraseña en la base de datos
    await db.promise().query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );

    console.log(`Contraseña actualizada para usuario: ${user.email}`);

    res.json({ 
      message: 'Contraseña cambiada exitosamente',
      success: true 
    });

  }catch (error) {
    console.error('Error cambiando contraseña:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El token ha expirado' });
    }
    
    res.status(500).json({ message: 'Error del servidor al cambiar la contraseña' });
  }
})

// ********************************************************************Ruta para ver los animales pendiente de adopcion********************************************************************//
app.use("/img", express.static(path.join(process.cwd(), "img")));
app.get('/api/adoptar', async (req, res) => {

  try{
    
    // Consulta a la base de datos: animales en adopción (estado = 'disponible')
    const [rows] = await db
      .promise()
      .query("SELECT * FROM animales WHERE estado = 'disponible'");

     if (rows.length === 0) {
      return res.status(200).json([]); // Devuelve array vacío si no hay animales
    }

    // Mapea los datos y asegura ruta correcta a las fotos
    const animales = rows.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      tipo: a.tipo,
      genero: a.genero,
      tamano: a.tamano,
      raza: a.raza,
      fechaNac: a.fechaNac,
      fecha_ingreso: a.fecha_ingreso,
      historia: a.historia,
      fotos: a.fotos, 
      enfermedades: a.enfermedades,
      vacunado: a.vacunado, 
      castrado: a.castrado,
      necesidades_especiales: a.necesidades_especiales,
      personalidad: a.personalidad,
      requisitos_adopcion: a.requisitos_adopcion,
      estado: a.estado, 
      motivo: a.motivo,
      fecha_estimada_disponibilidad: a.fecha_estimada_disponibilidad,
      solicitudes_adopcion: a.solicitudes_adopcion,
      color: a.color, 
      peso: a.peso,
      urgente: a.urgente,
      nivel_energia: a.nivel_energia,
      buen_ninos: a.buen_ninos,
      buen_gatos: a.buen_gatos,
      buen_perros: a.buen_perros, 
      apto_piso: a.apto_piso, 
      necesita_jardin: a.necesita_jardin
    }));

    res.status(200).json(animales);

  }catch (error) {
    console.error("❌ Error obteniendo animales:", error);
    res.status(500).json({ message: "Error al obtener los animales" });
  }

});


// Inicia el servidor
app.listen(5000, () => console.log('Servidor escuchando en http://localhost:5000'));
