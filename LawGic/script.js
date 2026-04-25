// Dark Mode
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Login Modal
document.getElementById('loginBtn').onclick = () =>
  document.getElementById('loginModal').style.display = 'flex';
document.getElementById('closeLogin').onclick = () =>
  document.getElementById('loginModal').style.display = 'none';

// Signup Modal
document.getElementById('signupBtn').onclick = () =>
  document.getElementById('signupModal').style.display = 'flex';
document.getElementById('closeSignup').onclick = () =>
  document.getElementById('signupModal').style.display = 'none';

// Chatbot Language Selection (placeholder functionality)
let selectedLang = 'en';
const langSelect = document.getElementById('langSelect');
langSelect?.addEventListener('change', () => {
  selectedLang = langSelect.value;
});

// Chatbot Send Message
const sendMessage = document.getElementById('sendMessage');
const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');

sendMessage.onclick = () => {
  const msg = chatInput.value.trim();
  if (!msg) return;
  const userMsg = document.createElement('div');
  userMsg.className = 'bot';
  userMsg.textContent = `[${selectedLang.toUpperCase()}] ${msg}`;
  chatLog.appendChild(userMsg);
  chatInput.value = '';
  chatLog.scrollTop = chatLog.scrollHeight;
};

// Voice Input (optional)
const voiceBtn = document.getElementById('voiceInput');
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN';

  voiceBtn?.addEventListener('click', () => {
    recognition.start();
  });

  recognition.onresult = function (event) {
    chatInput.value = event.results[0][0].transcript;
  };
}
