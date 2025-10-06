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



// Inicia el servidor
app.listen(5000, () => console.log('Servidor escuchando en http://localhost:5000'));
