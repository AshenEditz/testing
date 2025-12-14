const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const config = require("../config");
const { handleCommand } = require("./commands");

const activeSessions = new Map();

async function startBot(sessionId, phoneNumber = null, res = null) {
    const sessionDir = `./sessions/${sessionId}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Queen Selina", "Chrome", "3.0"],
        markOnlineOnConnect: true
    });

    // --- PAIRING CODE LOGIC ---
    if (!sock.authState.creds.registered && phoneNumber) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`Code for ${phoneNumber}: ${code}`);
                if (res && !res.headersSent) res.json({ status: true, code: code });
            } catch (err) {
                if (res && !res.headersSent) res.json({ status: false, error: "Connection Timed Out" });
            }
        }, 3000);
    }

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log(`[CONNECTED] ${sessionId}`);
            activeSessions.set(sessionId, sock);

            // 1. Auto React to Channel
            // 2. Auto Join Channel (Experimental)
            try {
               await sock.sendMessage(sock.user.id, { text: `*👸 Queen Selina Connected!*\nVersion: 3.0\nType .menu` });
            } catch (e) {}
        }

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot(sessionId);
            } else {
                console.log(`[LOGOUT] ${sessionId}`);
                activeSessions.delete(sessionId);
                fs.removeSync(sessionDir);
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
            if (type !== "notify") return;
            const m = messages[0];
            if (!m.message) return;

            const from = m.key.remoteJid;
            const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
            const isCmd = body.startsWith(config.prefix);
            const command = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : "";
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(" ");
            const sender = m.key.participant || from;

            // --- AUTO REACT (All Messages) ---
            // Can add logic to check if user turned it off, but requested as "Add Auto react"
            await sock.sendMessage(from, { react: { text: "💖", key: m.key } });

            if (isCmd) {
                await handleCommand(sock, from, command, text, m, sender);
            }

        } catch (e) {
            console.error(e);
        }
    });
}

module.exports = { startBot, activeSessions };
