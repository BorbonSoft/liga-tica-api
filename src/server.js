const express = require("express");
const cors = require("cors");
const { getAll, getPositions } = require("./service/TournamentService.mjs");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/api/tournaments/all", (req, res) => {
  let data = {}
  getAll()
    .then(response => {
      res.json(JSON.parse(response))
    })
    .catch(error => {
      console.info('Error | api/tournaments/all | Getting all data: ' + error.message)
      res.status(500).send("Error getting all data")
    })
});

app.get("/api/tournaments/positions", async (req, res) => {
  const data = await getPositions()
  if (typeof data === 'undefined' || data === null) {
    console.info('Error | /api/tornaments/positions | Getting positions')
    res.status(500).send("Error getting positions")
  }
  else {
    res.json(data)
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
