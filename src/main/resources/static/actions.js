// App State Inspirational Quotes and Fun Facts
const appStateContent = [
  "🏔️ Fun Fact: Appalachian State University sits at 3,333 feet above sea level in beautiful Boone, North Carolina!",
  "💪 'Mountaineers are Always Free' - The spirit of independence runs deep in our Appalachian roots.",
  "🌟 Did you know? App State has been recognized as one of the top public universities in the South!",
  "🏈 Legendary Moment: The Mountaineers shocked Michigan 34-32 in 2007 - one of college football's greatest upsets!",
  "📚 'Education is the most powerful weapon which you can use to change the world.' - Nelson Mandela",
  "🌲 App State Fact: Our campus is home to over 290 species of birds - making it a birdwatcher's paradise!",
  "⭐ 'Success is not final, failure is not fatal: it is the courage to continue that counts.' - Winston Churchill",
  "🏔️ The Blue Ridge Mountains provide the perfect backdrop for both learning and adventure at App State!",
  "💡 'The only way to do great work is to love what you do.' - Steve Jobs",
  "🎓 App State Pride: We've graduated over 100,000 alumni who are making a difference worldwide!",
  "🌟 'Believe you can and you're halfway there.' - Theodore Roosevelt",
  "🏞️ Fun Fact: Grandfather Mountain, just 20 minutes from campus, is home to the famous Mile High Swinging Bridge!",
  "📈 'Don't watch the clock; do what it does. Keep going.' - Sam Levenson",
  "🏫 App State was founded in 1899 and has been fostering Mountaineer excellence for over 125 years!",
  "🎯 'The future belongs to those who believe in the beauty of their dreams.' - Eleanor Roosevelt",
  "❄️ Boone Fact: We're one of the few universities where you might need a winter coat in April!",
  "🌱 Growth begins at the end of your comfort zone.",
  "🏔️ App State's motto 'Esse Quam Videri' means 'To Be Rather Than To Seem' - authenticity matters here!",
  "💎 'What lies behind us and what lies before us are tiny matters compared to what lies within us.' - Ralph Waldo Emerson",
  "🎵 Did you know? Our fight song 'Hi Hi Yikas' has been energizing Mountaineers since the early 1900s!"
];

// Footer content management
class AppStateFooter {
  constructor() {
    this.quotes = appStateContent;
    this.currentIndex = 0;
    this.displayDuration = 10000; // 10 seconds 
    this.fadeTime = 500; // 0.5 seconds for fade transition
  }

  // Initialize the footer with dynamic content
  initialize(footerElement) {
    if (!footerElement) {
      console.error('Footer element not found');
      return;
    }

    // Create the dynamic content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'app-state-content';
    contentContainer.style.cssText = `
      transition: opacity ${this.fadeTime}ms ease-in-out;
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 10px;
      font-style: italic;
      color: #666;
    `;

    // Replace footer content
    footerElement.innerHTML = '';
    footerElement.appendChild(contentContainer);

    // Start the rotation
    this.showContent(contentContainer);
    this.startRotation(contentContainer);
  }

  // Display current content
  showContent(container) {
    container.textContent = this.quotes[this.currentIndex];
    container.style.opacity = '1';
  }

  // Start the automatic rotation
  startRotation(container) {
    setInterval(() => {
      // Fade out
      container.style.opacity = '0';
      
      setTimeout(() => {
        // Change content
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        this.showContent(container);
      }, this.fadeTime);
    }, this.displayDuration);
  }
}

// Global initialization function
function initializeAppStateFooter() {
  const footer = document.querySelector('footer');
  if (footer) {
    const appFooter = new AppStateFooter();
    appFooter.initialize(footer);
  }
}

// H1 Navigation functionality
function initializeH1Navigation() {
  const h1Element = document.querySelector('header h1');
  if (h1Element) {
    // Add cursor pointer style and hover effect
    h1Element.style.cursor = 'pointer';
    h1Element.classList.add('universal-hover');
    
    // Add click event listener to redirect to dashboard
    h1Element.addEventListener('click', function() {
      window.location.href = 'SO_DashBoard.html';
    });
  }
}

// Header sections navigation functionality
function initializeHeaderNavigation() {
  const headerSections = document.querySelectorAll('.header-section');
  
  headerSections.forEach((section, index) => {
    const headerText = section.querySelector('h3');
    if (headerText) {
      const text = headerText.textContent.trim();
      
      // Add click event listener based on section content
      section.addEventListener('click', function() {
        switch(text) {
          case 'My Sessions':
            window.location.href = 'SO_YourSessions.html';
            break;
          case 'Browse Sessions':
            window.location.href = 'SO_BrowseSessions.html';
            break;
          case 'Create Post':
            window.location.href = 'SO_CreateNewPost.html';
            break;
          default:
            console.log('Unknown header section clicked:', text);
        }
      });
    }
  });
}

// Login form functionality
function initializeLoginForm() {
  const loginForm = document.querySelector('.login-form');
  const errorLabel = document.querySelector('#login-error');

  const showError = (message) => {
    if (errorLabel) {
      errorLabel.textContent = message;
    }
  };

  const queryError = new URLSearchParams(window.location.search).get('error');
  if (queryError === 'domain') {
    showError('Only @appstate.edu emails are allowed');
  } else if (queryError === 'missing') {
    showError('Please enter both username and password');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      // Get the input values
      const username = loginForm.querySelector('#username').value;
      const password = loginForm.querySelector('input[type="password"]').value;

      // Validate username and password
      if (!username.trim() || !password.trim()) {
        e.preventDefault();
        showError('Please enter both username and password');
        return;
      }

      // Check if username ends with @appstate.edu (case insensitive)
      if (!username.toLowerCase().endsWith('@appstate.edu')) {
        e.preventDefault();
        showError('Username must end with @appstate.edu');
        return;
      }
    });
  }
}

function initializeJoinSessionButtons() {
  const joinButtons = document.querySelectorAll('.join-btn');
  if (!joinButtons.length) {
    return;
  }

  joinButtons.forEach((button) => {
    if (button.dataset.joinBound === 'true') {
      return;
    }

    button.dataset.joinBound = 'true';
    button.addEventListener('click', function() {
      window.location.href = 'SO_RSVPConfrimation.html';
    });
  });
}

function humanizeValue(value) {
  if (!value) {
    return '';
  }

  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSessionCard(session) {
  const card = document.createElement('div');
  card.className = 'session-card';
  card.dataset.sessionId = String(session.id);
  card.innerHTML = `
    <div class="session-header">
      <h4>${escapeHtml(session.sessionTitle)}</h4>
      <span class="course-tag">${escapeHtml(humanizeValue(session.topic))} | ${escapeHtml(session.courseCode)}</span>
    </div>
    <div class="session-details">
      <div class="detail-item">
        <span class="icon">🕐</span>
        <span>${escapeHtml(session.sessionDate)} ${escapeHtml(session.sessionTime)}</span>
      </div>
      <div class="detail-item">
        <span class="icon">📍</span>
        <span>${escapeHtml(humanizeValue(session.sessionLocation))}</span>
      </div>
      <div class="detail-item">
        <span class="icon">👥</span>
        <span>1/${escapeHtml(humanizeValue(session.maxParticipants))}</span>
      </div>
      <div class="detail-item">
        <span class="icon">🎯</span>
        <span>${escapeHtml(humanizeValue(session.difficultyLevel))} | Host: ${escapeHtml(session.userName)}</span>
      </div>
      <div class="detail-item">
        <span class="icon">📝</span>
        <span>${escapeHtml(session.sessionDescription)}</span>
      </div>
    </div>
    <div class="session-footer">
      <button class="delete-session-btn">Delete Session</button>
      <button class="join-btn">Join Session</button>
    </div>
  `;

  return card;
}

function initializeDeleteSessionButtons() {
  const deleteButtons = document.querySelectorAll('.delete-session-btn');
  if (!deleteButtons.length) {
    return;
  }

  deleteButtons.forEach((button) => {
    if (button.dataset.deleteBound === 'true') {
      return;
    }

    button.dataset.deleteBound = 'true';
    button.addEventListener('click', async function() {
      const sessionCard = button.closest('.session-card');
      if (!sessionCard || !sessionCard.dataset.sessionId) {
        return;
      }

      const sessionId = sessionCard.dataset.sessionId;

      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          alert('Unable to delete session.');
          return;
        }

        sessionCard.remove();
      } catch (error) {
        console.error('Unable to delete session:', error);
        alert('Unable to delete session right now. Try again.');
      }
    });
  });
}

async function loadCreatedSessions() {
  const sessionsGrid = document.querySelector('.sessions-grid');
  if (!sessionsGrid) {
    return;
  }

  try {
    const response = await fetch('/api/sessions');
    if (!response.ok) {
      return;
    }

    const sessions = await response.json();
    if (!Array.isArray(sessions) || !sessions.length) {
      return;
    }

    sessions.forEach((session) => {
      const sessionCard = buildSessionCard(session);
      sessionsGrid.prepend(sessionCard);
    });

    initializeJoinSessionButtons();
    initializeDeleteSessionButtons();
  } catch (error) {
    console.error('Unable to load created sessions:', error);
  }
}

function initializeCreatePostForm() {
  const createPostForm = document.querySelector('#create-post-form');
  if (!createPostForm) {
    return;
  }

  createPostForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const sessionDescription = document.querySelector('#session-description').value.trim();
    if (sessionDescription.length < 50) {
      alert('Additional information must be at least 50 characters.');
      return;
    }

    const payload = {
      userName: document.querySelector('#user-name').value.trim(),
      topic: document.querySelector('#topic-select').value,
      courseCode: document.querySelector('#course-code').value.trim(),
      sessionTitle: document.querySelector('#session-title').value.trim(),
      sessionDate: document.querySelector('#session-date').value,
      sessionTime: document.querySelector('#session-time').value,
      sessionLocation: document.querySelector('#session-location').value,
      maxParticipants: document.querySelector('#max-participants').value,
      difficultyLevel: document.querySelector('#difficulty-level').value,
      sessionDescription: sessionDescription
    };

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody && errorBody.error ? errorBody.error : 'Unable to create session.';
        alert(message);
        return;
      }

      window.location.href = 'SO_BrowseSessions.html';
    } catch (error) {
      console.error('Unable to create session:', error);
      alert('Unable to create session right now. Try again.');
    }
  });
}

function initializeDashboardButtons() {
  const createPostCard = document.querySelector('.small-boxes.left');
  const browseSessionsCard = document.querySelector('.small-boxes.right');

  if (createPostCard) {
    createPostCard.addEventListener('click', function() {
      window.location.href = 'SO_CreateNewPost.html';
    });
  }

  if (browseSessionsCard) {
    browseSessionsCard.addEventListener('click', function() {
      window.location.href = 'SO_BrowseSessions.html';
    });
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeAppStateFooter();
  initializeH1Navigation();
  initializeHeaderNavigation();
  initializeLoginForm();
  initializeJoinSessionButtons();
  initializeDashboardButtons();
  initializeCreatePostForm();
  loadCreatedSessions();
});
