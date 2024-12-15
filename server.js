const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware pour capturer les informations des requêtes et enregistrer dans un fichier log
app.use((req, res, next) => {
  const logEntry = {
    date: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers['user-agent']
  };

  const logString = `${logEntry.date} - IP: ${logEntry.ip} - Méthode: ${logEntry.method} - URL: ${logEntry.url} - User-Agent: ${logEntry.userAgent}\n`;

  // Enregistrer les logs dans le fichier 'logs.txt'
  fs.appendFile('logs.txt', logString, (err) => {
    if (err) {
      console.error('Erreur lors de l\'enregistrement des logs:', err);
    }
  });

  next(); // Passer au prochain middleware ou à la route
});

// Route pour recevoir les informations de fin de partie
app.post('/game-over', express.json(), (req, res) => {
  const { score, totalCards, deviceInfo } = req.body;

  const gameLogEntry = {
    date: new Date().toISOString(),
    ip: req.ip,
    score: `${score}/${totalCards}`,
    deviceInfo,
    message: 'Jeu terminé'
  };

  const logString = `${gameLogEntry.date} - IP: ${gameLogEntry.ip} - Score: ${gameLogEntry.score} - Appareil: ${gameLogEntry.deviceInfo} - ${gameLogEntry.message}\n`;

  // Enregistrer les logs dans le fichier 'logs.txt'
  fs.appendFile('logs.txt', logString, (err) => {
    if (err) {
      console.error('Erreur lors de l\'enregistrement du log de fin de partie:', err);
      return res.status(500).send('Erreur lors de l\'enregistrement du log.');
    }

    res.send('Log de fin de partie enregistré avec succès.');
  });
});

// Route pour afficher les logs dans une page web
app.get('/logs', (req, res) => {
  fs.readFile('logs.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erreur lors de la lecture des logs.');
    }

    res.send(`<pre>${data}</pre>`);
  });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
