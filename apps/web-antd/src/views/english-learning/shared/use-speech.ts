import { ref } from 'vue';

export function useSpeech() {
  const isSpeaking = ref(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  function speak(text: string, rate = 0.9, pitch = 1.0) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => { isSpeaking.value = true; };
    utterance.onend = () => { isSpeaking.value = false; };
    utterance.onerror = () => { isSpeaking.value = false; };
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
  }

  return { isSpeaking, supported, speak, stop };
}
