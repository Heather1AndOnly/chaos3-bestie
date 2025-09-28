const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/tts', async (req, res) => {
  try {
    const text = (req.body.text || '').toString().slice(0, 5000);
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    if (!apiKey) return res.status(400).json({ error: 'NO_API_KEY' });

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0`;
    const payload = {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true }
    };

    const elRes = await axios.post(url, payload, {
      headers: { 'accept': 'audio/mpeg', 'content-type': 'application/json', 'xi-api-key': apiKey },
      responseType: 'arraybuffer'
    });

    const base64Audio = Buffer.from(elRes.data, 'binary').toString('base64');
    res.json({ audio: `data:audio/mpeg;base64,${base64Audio}` });
  } catch (err) {
    console.error('TTS error:', err.response?.data || err.message);
    res.status(500).json({ error: 'TTS_FAILED' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Bestie running on http://localhost:${port}`));
