const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const JSON_FILE = "./data.json";

app.use(express.json()); // Permite recibir JSON en las peticiones
app.use(cors()); // Permite acceso desde cualquier origen

// Leer el JSON
app.get("/data", (req, res) => {
  fs.readFile(JSON_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error al leer el archivo" });
    }
    res.json(JSON.parse(data));
  });
});

// Modificar el JSON
app.post("/update", (req, res) => {
  const newData = req.body;

  fs.writeFile(JSON_FILE, JSON.stringify(newData, null, 2), "utf8", (err) => {
    if (err) {
      return res.status(500).json({ error: "Error al escribir el archivo" });
    }
    res.json({ message: "JSON actualizado correctamente" });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
