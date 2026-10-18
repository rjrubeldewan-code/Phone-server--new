const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "my_phone_secret_key_2026";
const LOG_FILE = './security_logs.json';

const saveLog = (deviceId) => {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        try {
            const data = fs.readFileSync(LOG_FILE, 'utf8');
            logs = JSON.parse(data);
        } catch (e) {
            logs = [];
        }
    }
    const newLog = {
        id: logs.length + 1,
        deviceId: deviceId,
        timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    return newLog.id;
};

app.get('/', (req, res) => {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        try {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        } catch (e) {
            logs = [];
        }
    }

    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mobile Security Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; background: #121212; color: #fff; padding: 20px; margin: 0; }
            h2 { color: #00ffcc; text-align: center; }
            .card { background: #1e1e1e; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 5px solid #00ffcc; }
            .time { font-size: 12px; color: #888; }
        </style>
    </head>
    <body>
        <h2>🛡️ Mobile Security Dashboard</h2>
        <p style="text-align:center;">Server Status: <b>Active (Local)</b></p>
        <h3>Recent Security Logs:</h3>
    `;

    if (logs.length === 0) {
        html += `<p style="color: #aaa; text-align:center;">No logs recorded yet.</p>`;
    } else {
        logs.reverse().forEach(log => {
            html += `
            <div class="card">
                <strong>Device ID:</strong> ${log.deviceId} <br>
                <span class="time">Time: ${log.timestamp}</span>
            </div>`;
        });
    }

    html += `</body></html>`;
    res.send(html);
});

app.get('/api/logs', (req, res) => {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        try {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        } catch (e) {
            logs = [];
        }
    }
    res.json(logs);
});

app.post('/api/login', (req, res) => {
    const { deviceId } = req.body;
    if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
    }
    const logId = saveLog(deviceId);
    const token = jwt.sign({ deviceId, logId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
        success: true,
        message: "Token generated and saved to local file database!",
        token: token
    });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mobile Mini Server running on http://localhost:${PORT}`);
});
