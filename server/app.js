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

// Ruta de login
app.post('/api/login', async (req, res) => {
  console.log('Petición login recibida:', req.body);

  const { email, password, recaptchaToken } = req.body;

  if (!email || !password || !recaptchaToken) {
    return res.status(400).json({ message: 'Faltan datos o reCAPTCHA' });
  }

  try {
    // 🔹 Paso 1: Validar el token con Google
    const googleVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`;
    const response = await axios.post(googleVerifyURL);

    if (!response.data.success) {
      return res.status(400).json({ message: 'Error en reCAPTCHA, verifica que no eres un robot' });
    }

    // 🔹 Paso 2: Buscar usuario en la BD
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Error en /api/login:', err);
        return res.status(500).json({ message: 'Error en la BD', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Email incorrecto' });
      }

      const user = results[0];

      // Comparar contraseña (ahora en texto plano, aunque lo ideal sería bcrypt.compare)
      if (user.password !== password) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          rol: user.rol,
        },
      });
    });

  } catch (error) {
    console.error("Error en verificación de reCAPTCHA:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Inicia el servidor
app.listen(5000, () => console.log('Servidor escuchando en http://localhost:5000'));
