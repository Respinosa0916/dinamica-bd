const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const os = require('os');
const path = require('path');
const localtunnel = require('localtunnel');
const { initDB, runQuery, runMutation } = require('./database');
const missions = require('./questions');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Servir frontend compilado
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Inicializar BD
initDB();

// Obtener IP local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

let publicURL = null;

app.get('/api/info', async (req, res) => {
    try {
        const urlToUse = publicURL || `http://${getLocalIP()}:${PORT}`;
        const qr = await qrcode.toDataURL(urlToUse);
        res.json({ url: urlToUse, qrCode: qr });
    } catch (err) {
        res.status(500).json({ error: 'Error generating QR code' });
    }
});

// Registrar jugador
app.post('/api/players', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await runMutation('INSERT INTO jugadores (name) VALUES (?)', [name]);
        res.json({ id: result.id, name, score: 0 });
    } catch (err) {
        res.status(500).json({ error: 'Error registrando jugador' });
    }
});

// Obtener jugadores
app.get('/api/players', async (req, res) => {
    try {
        const players = await runQuery('SELECT * FROM jugadores ORDER BY score DESC');
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo jugadores' });
    }
});

// Obtener misiones (sin la respuesta correcta)
app.get('/api/missions', (req, res) => {
    const publicMissions = missions.map(m => {
        if (m.type === 'theory') {
            return { id: m.id, type: m.type, title: m.title, description: m.description, options: m.options };
        } else {
            return { id: m.id, type: m.type, title: m.title, description: m.description };
        }
    });
    res.json(publicMissions);
});

// Helper para comparar resultados SQL
function isResultEqual(resultA, resultB) {
    if (resultA.length !== resultB.length) return false;
    // Simplificación de comparación para propósitos educativos
    return JSON.stringify(resultA) === JSON.stringify(resultB);
}

// Validar misión
app.post('/api/missions/validate', async (req, res) => {
    const { missionId, answer, playerId } = req.body;
    const mission = missions.find(m => m.id === missionId);

    if (!mission) {
        return res.status(404).json({ error: 'Misión no encontrada' });
    }

    let isCorrect = false;
    let userResult = null;
    let expectedResult = null;
    let errorMsg = null;
    let correctAnswer = null;

    if (mission.type === 'theory') {
        isCorrect = parseInt(answer) === mission.correctOptionIndex;
        if (!isCorrect) {
            correctAnswer = mission.options[mission.correctOptionIndex];
        }
    } else if (mission.type === 'sql') {
        try {
            userResult = await runQuery(answer);
            expectedResult = await runQuery(mission.expectedSql);
            isCorrect = isResultEqual(userResult, expectedResult);
            if (!isCorrect) {
                correctAnswer = mission.expectedSql;
            }
        } catch (err) {
            errorMsg = err.message;
            correctAnswer = mission.expectedSql;
        }
    }

    if (isCorrect && playerId) {
        try {
            await runMutation('UPDATE jugadores SET score = score + 10 WHERE id = ?', [playerId]);
        } catch (err) {
            console.error("Error al actualizar score", err);
        }
    }

    return res.json({ correct: isCorrect, error: errorMsg, userResult, expectedResult, correctAnswer });
});

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Servidor backend corriendo en http://${getLocalIP()}:${PORT}`);
    try {
        const tunnel = await localtunnel({ port: PORT });
        publicURL = tunnel.url;
        console.log(`Público en: ${publicURL}`);
        tunnel.on('close', () => {
            console.log('El túnel se ha cerrado.');
        });
    } catch (err) {
        console.error("No se pudo iniciar localtunnel. Aún puedes usar la IP local.", err);
    }
});
