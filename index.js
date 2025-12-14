const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const config = require("./config");
const { startBot, activeSessions } = require("./lib/bot");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- 1. PAIRING ENDPOINT ---
app.get("/pair", async (req, res) => {
    const phone = req.query.phone;
    if (!phone) return res.json({ status: false, error: "No number provided" });

    if (activeSessions.size >= config.maxBots) {
        return res.json({ status: false, error: "Server Full (Max 50). Try later." });
    }

    const sessionId = "session_" + phone.replace(/[^0-9]/g, "");
    await startBot(sessionId, phone, res);
});

// --- 2. KEEP ALIVE ENDPOINT (For UptimeRobot) ---
app.get("/live", (req, res) => {
    res.status(200).send(`Queen Selina Running... Active Bots: ${activeSessions.size}`);
});

// --- 3. ADMIN API ---
app.post("/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (email === config.adminEmail && password === config.adminPass) {
        res.json({ success: true, count: activeSessions.size });
    } else {
        res.json({ success: false });
    }
});

app.post("/admin/broadcast", (req, res) => {
    const { email, password, message } = req.body;
    if (email !== config.adminEmail || password !== config.adminPass) return res.sendStatus(401);
    
    // Broadcast to owner of every bot instance
    activeSessions.forEach(sock => {
        sock.sendMessage(sock.user.id, { text: `*ADMIN ANNOUNCEMENT:*\n${message}` }).catch(()=>{});
    });
    res.json({ success: true });
});

// --- STARTUP ---
fs.readdir("./sessions").then(files => {
    files.forEach(file => {
        if (file.startsWith("session_")) {
            console.log(`Resuming ${file}`);
            startBot(file);
        }
    });
}).catch(() => console.log("Created sessions folder"));

app.listen(PORT, () => {
    console.log(`Queen Selina running on port ${PORT}`);
});
