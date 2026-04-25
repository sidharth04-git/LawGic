const chatWindow = $('#chat-window');
const messages = [];
let lastBotMessage = '';
let selectedLang = 'en-US';
let utterance = null;

function appendMessage(text, sender) {
  const msgDiv = $('<div>').addClass('message').addClass(sender).text(text);
  chatWindow.append(msgDiv);
  // Animate scroll to bottom
  chatWindow.stop().animate({ scrollTop: chatWindow[0].scrollHeight }, 300);
}

$('#language').on('change', function() {
  selectedLang = $(this).val();
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    $('#listen-btn').text('🔊 Listen');
  }
});

$('#listen-btn').click(() => {
  if (!lastBotMessage) return;

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    $('#listen-btn').text('🔊 Listen');
    return;
  }

  utterance = new SpeechSynthesisUtterance(lastBotMessage);
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(selectedLang)) || voices[0];
  utterance.voice = voice;

  utterance.lang = selectedLang;
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onend = () => {
    $('#listen-btn').text('🔊 Listen');
  };

  speechSynthesis.speak(utterance);
  $('#listen-btn').text('⏹ Stop');
});

$('#mic-btn').click(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported by your browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = selectedLang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    $('#mic-btn').text('⏹');
  };

  recognition.onend = () => {
    $('#mic-btn').text('🎙');
  };

  recognition.onerror = (event) => {
    alert('Speech recognition error: ' + event.error);
    $('#mic-btn').text('🎙');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // Detect language - great simplification here by checking unicode ranges, or default to current select:
    const isHindi = /[\u0900-\u097F]/.test(transcript);
    selectedLang = isHindi ? 'hi-IN' : 'en-US';
    $('#language').val(selectedLang);
    $('#user-input').val(transcript);
    $('#chat-form').submit();
  };

  recognition.start();
});

$('#chat-form').on('submit', function(e) {
  e.preventDefault();
  const userText = $('#user-input').val().trim();
  if (!userText) return;

  appendMessage(userText, 'user');
  messages.push({ role: 'user', parts: [{ text: userText }] });
  $('#user-input').val('');

  const languageInstruction = selectedLang === 'hi-IN' ? 
    'कृपया निम्नलिखित प्रश्न का उत्तर हिंदी में दें:' : 
    'Please answer the following question in English:';

  const payload = {
    contents: [
      ...messages.slice(0, -1),
      {
        role: 'user',
        parts: [{ text: languageInstruction + '\n' + userText }]
      },
      { role: 'model', parts: [{ text: '' }] }
    ],
  };

  $.ajax({
    async: true,
    crossDomain: true,
    url: 'https://gemini-pro-ai.p.rapidapi.com/',
    method: 'POST',
    headers: {
      'x-rapidapi-key': '98d788b2a9mshd51cb8d5daec6ebp1cb139jsnb444c608148f',
      'x-rapidapi-host': 'gemini-pro-ai.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    processData: false,
    data: JSON.stringify(payload),
    success: function(response) {
      const botText = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      appendMessage(botText, 'bot');
      messages.push({ role: 'model', parts: [{ text: botText }] });
      lastBotMessage = botText;
    },
    error: function(xhr, status, error) {
      appendMessage('Error: ' + error, 'bot');
      lastBotMessage = "";
    }
  });
});