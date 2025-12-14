const axios = require('axios');
const config = require('../config');

const headers = { 'Authorization': `Bearer ${config.infinityApiKey}` };

// 1. Text to Image
async function c2i(color) {
    try {
        const res = await axios.get('https://api.infinityapi.org/c2i', {
            headers, params: { 'color': color }, responseType: 'arraybuffer'
        });
        return res.data;
    } catch (e) { return null; }
}

// 2. YTS Search
async function yts(query) {
    try {
        const res = await axios.get('https://api.infinityapi.org/ytssearch', {
            headers, params: { 'q': query }
        });
        return res.data;
    } catch (e) { return { error: "Not found" }; }
}

// 3. Movie Info
async function cineInfo(url) {
    try {
        const res = await axios.get('https://api.infinityapi.org/cine-minfo', {
            headers, params: { 'url': url }
        });
        return res.data;
    } catch (e) { return { error: "Invalid Link" }; }
}

// 4. Movie Download
async function cineDl(url) {
    try {
        const res = await axios.get('https://api.infinityapi.org/cine-direct-dl', {
            headers, params: { 'url': url }
        });
        return res.data;
    } catch (e) { return { error: "Download failed" }; }
}

// 5. AI Chat (Simulated)
async function aiChat(txt) {
    // In a real scenario, connect this to OpenAI or Gemini
    return `*🤖 Queen Selina AI:*\nI searched my database for "${txt}".\n\n(AI System Active)`;
}

module.exports = { c2i, yts, cineInfo, cineDl, aiChat };
