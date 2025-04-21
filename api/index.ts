const cors = require('cors');
const tournamentService = require('../src/service/TournamentService');
const express = require('express');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.resolve('./public')));
app.use(cors());
app.use(express.json())

app.get("/", (req, res) => res.send("Datos LigaTica.com"));

app.get("/api/tournaments/all", (req, res) => {
  tournamentService.getAllData()
    .then(response => {
      res.json(response)
    })
    .catch(error => {
      console.info('Error | api/tournaments/all | Getting all data: ' + error.message)
      res.status(500).send("Error getting all data")
    })
});

app.get("/api/tournaments/positions", async (req, res) => {
  const data = await tournamentService.getPositions()
  if (typeof data === 'undefined' || data === null) {
    console.info('Error | /api/tornaments/positions | Getting positions')
    res.status(500).send("Error getting positions")
  }
  else {
    res.json(data)
  }
});

app.post("/api/tournaments/positions/sort", async (req, res) => {
  const tournament = req.body
  let data = null
  if (tournament.key === 'firstTournament') {
    data = await tournamentService.sortPositionsForModifiedFirstTournament(tournament)
  }
  else {
    data = await tournamentService.sortPositionsForModifiedSecondTournament(tournament)
  }
  if (typeof data === 'undefined' || data === null) {
    console.info('Error | /api/tornaments/positions/sort | Sorting positions for tournament')
    res.status(500).send("Error sorting positions for tournament")
  }
  else {
    res.json(data)
  }
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
