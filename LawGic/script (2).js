const modeSelect = document.getElementById('mode-select');
const userModeSection = document.getElementById('user-mode');
const lawyerModeSection = document.getElementById('lawyer-mode');
const navLinksDiv = document.getElementById('nav-links');

// Check if elements exist before using them
if (modeSelect && userModeSection && lawyerModeSection && navLinksDiv) {
  const navItems = {
    user: [
      { text: 'About us', href: '#' },
      { text: 'NyayBot', href: '9_nyaybot.html' },
      { text: 'Document Summarizer', href: '7_docInt.html' },
      { text: 'Case Tracker', href: '3_casetracker.html' },
      { text: 'NGO Partners', href: '4_ngo.html' },
      { text: 'Blogs', href: '2_blog.html' },
      { buttonText: 'Login', href:'5_login.html' , icon: 'fas fa-sign-in-alt' },
      { buttonText: 'Sign Up', href: '5_signup.html', icon: 'fas fa-user-plus' },
    ],
    lawyer: [
      { text: 'Dashboard', href: '#' },
      { text: 'Clients', href: '#' },
      { text: 'Cases', href: '#' },
      { text: 'Documents', href: '#' },
      { text: 'Calendar', href: '#' },
      { text: 'Analytics', href: '#' },
      { buttonText: 'Logout', icon: 'fas fa-sign-out-alt' },
      { buttonText: 'Profile', icon: 'fas fa-user-circle' },
    ],
  };

  function renderNav(mode) {
    navLinksDiv.innerHTML = '';
    navItems[mode].forEach(item => {
      if (item.text) {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        navLinksDiv.appendChild(a);
      } else if (item.buttonText) {
        // Create button or link based on whether it has href
        if (item.href) {
          const a = document.createElement('a');
          a.href = item.href;
          a.className = 'nav-btn';
          
          if (item.icon) {
            const icon = document.createElement('i');
            icon.className = item.icon;
            a.appendChild(icon);
          }
          
          const span = document.createElement('span');
          span.textContent = item.buttonText;
          a.appendChild(span);
          
          navLinksDiv.appendChild(a);
        } else {
          const btn = document.createElement('button');
          btn.className = 'nav-btn';
          
          if (item.icon) {
            const icon = document.createElement('i');
            icon.className = item.icon;
            btn.appendChild(icon);
          }
          
          const span = document.createElement('span');
          span.textContent = item.buttonText;
          btn.appendChild(span);
          
          navLinksDiv.appendChild(btn);
        }
      }
    });
  }

  function switchMode(mode) {
    if (mode === 'user') {
      userModeSection.hidden = false;
      lawyerModeSection.hidden = true;
      document.body.style.background = 'linear-gradient(135deg, var(--light) 0%, #EDF2FF 100%)';
    } else if (mode === 'lawyer') {
      userModeSection.hidden = true;
      lawyerModeSection.hidden = false;
      document.body.style.background = 'var(--light)';
    }
    renderNav(mode);
    
    // Update the select value
    modeSelect.value = mode;
  }

  // Initialize mode to User on page load
  switchMode('user');

  modeSelect.addEventListener('change', e => {
    switchMode(e.target.value);
  });
}

// Chatbot toggle logic - only run if elements exist
const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotPanel = document.querySelector('.chatbot-panel');
const chatbotClose = document.querySelector('.chatbot-close');

if (chatbotToggle && chatbotPanel && chatbotClose) {
  chatbotToggle.addEventListener('click', () => {
    chatbotPanel.hidden = false;
    // Add a small delay to allow the hidden attribute to be removed before adding the class
    setTimeout(() => {
      chatbotPanel.classList.add('active');
    }, 10);
    chatbotToggle.style.opacity = '0';
    chatbotToggle.style.visibility = 'hidden';
  });

  chatbotClose.addEventListener('click', () => {
    chatbotPanel.classList.remove('active');
    // Wait for the transition to complete before hiding the panel
    setTimeout(() => {
      chatbotPanel.hidden = true;
      chatbotToggle.style.opacity = '1';
      chatbotToggle.style.visibility = 'visible';
    }, 300);
  });

  // Add quick reply functionality
  const quickReplies = document.querySelectorAll('.quick-reply');
  const chatInput = document.querySelector('.chat-input input');

  if (quickReplies.length && chatInput) {
    quickReplies.forEach(reply => {
      reply.addEventListener('click', () => {
        chatInput.value = reply.textContent;
        chatInput.focus();
      });
    });
  }

  // Add send message functionality
  const sendBtn = document.querySelector('.send-btn');

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => {
      if (chatInput.value.trim() !== '') {
        const message = chatInput.value;
        chatInput.value = '';
        
        // Create user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message';
        userMessage.style.alignSelf = 'flex-end';
        userMessage.style.background = 'var(--primary)';
        userMessage.style.color = 'var(--white)';
        
        const userText = document.createElement('p');
        userText.textContent = message;
        
        const userTime = document.createElement('span');
        userTime.className = 'time';
        userTime.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        userMessage.appendChild(userText);
        userMessage.appendChild(userTime);
        
        document.querySelector('.chatbot-body').appendChild(userMessage);
        
        // Scroll to bottom
        const chatBody = document.querySelector('.chatbot-body');
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Simulate bot response after a short delay
        setTimeout(() => {
          const botMessage = document.createElement('div');
          botMessage.className = 'message bot-message';
          
          const botText = document.createElement('p');
          botText.textContent = "I understand you're asking about '" + message + "'. Can you provide more details so I can assist you better?";
          
          const botTime = document.createElement('span');
          botTime.className = 'time';
          botTime.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          
          botMessage.appendChild(botText);
          botMessage.appendChild(botTime);
          
          document.querySelector('.chatbot-body').appendChild(botMessage);
          
          // Scroll to bottom again
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
      }
    });

    // Allow sending message with Enter key
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });
  }
}