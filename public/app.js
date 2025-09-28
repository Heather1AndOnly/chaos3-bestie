const face = document.getElementById('face');
const statusEl = document.getElementById('status');
const textEl = document.getElementById('text');
const speakBtn = document.getElementById('speakBtn');

const setState = (name) => {
  face.classList.remove('calm','smile','think','sad','alert');
  if (name) face.classList.add(name);
};
face.classList.add('blinking','calm');

document.getElementById('calmBtn').onclick  = () => setState('calm');
document.getElementById('smileBtn').onclick = () => setState('smile');
document.getElementById('thinkBtn').onclick = () => setState('think');
document.getElementById('sadBtn').onclick   = () => setState('sad');
document.getElementById('alertBtn').onclick = () => setState('alert');

async function playAudio(dataUrl) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = dataUrl;
    audio.onplay = () => { face.classList.add('talking'); statusEl.textContent = 'speaking…'; };
    audio.onended = () => { face.classList.remove('talking'); statusEl.textContent = 'ready'; resolve(); };
    audio.onerror = (e) => { face.classList.remove('talking'); statusEl.textContent = 'audio error'; reject(e); };
    audio.play();
  });
}

async function speakWithBrowser(text) {
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => { face.classList.add('talking'); statusEl.textContent = 'speaking…'; };
    utter.onend   = () => { face.classList.remove('talking'); statusEl.textContent = 'ready'; resolve(); };
    window.speechSynthesis.speak(utter);
  });
}

speakBtn.onclick = async () => {
  const text = (textEl.value || '').trim();
  if (!text) { textEl.focus(); return; }

  setState('smile');
  statusEl.textContent = 'preparing…';

  try {
    const res = await fetch('/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      const data = await res.json();
      await playAudio(data.audio);
    } else {
      await speakWithBrowser(text);
    }
  } catch {
    await speakWithBrowser(text);
  }
};
