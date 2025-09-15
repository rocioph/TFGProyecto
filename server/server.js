// Importar dependencias
const express = require("express");
const cors = require("cors");

// Crear aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Para manejar JSON en el body

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando 🚀");
});

// Puerto
const PORT = process.env.PORT || 5000;

// Levantar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
