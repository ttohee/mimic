export function speakEN(text: string, rate = 0.96): void {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    u.pitch = 1.02;
    const vs = window.speechSynthesis.getVoices();
    const v =
      vs.find(x => /en-US/i.test(x.lang) && /female|samantha|google/i.test(x.name)) ||
      vs.find(x => /en/i.test(x.lang));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    // TTS not available
  }
}
