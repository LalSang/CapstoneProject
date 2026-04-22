const APPSTATE_CONFIG = {
  name: 'Appalachian State University',
  logoPath: 'images/AppStateLogo.png',
  emailDomain: '@appstate.edu'
};

let currentUserContext = null;

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function normalizeLower(value) {
  return value ? value.toString().trim().toLowerCase() : '';
}

function toAppStateEmail(username) {
  const normalized = username ? username.toString().trim() : '';
  if (!normalized) {
    return '';
  }

  if (/@appstate\.edu$/i.test(normalized)) {
    return normalized.toLowerCase();
  }

  const localPart = normalized.split('@')[0] || normalized;
  return `${localPart}@appstate.edu`.toLowerCase();
}

async function loadCurrentUserContext() {
  try {
    const response = await fetch('/api/me', {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    const user = await response.json();
    currentUserContext = user;
    return user;
  } catch (error) {
    console.error('Unable to load current user context:', error);
    return null;
  }
}

function hasAdminAccess() {
  return normalizeLower(currentUserContext && currentUserContext.role) === 'admin';
}

function getCurrentPageSlug() {
  const pathname = window.location.pathname || '';
  const currentPath = pathname.split('/').pop() || 'SO_DashBoard.html';
  return currentPath.toLowerCase();
}

function getCurrentUsername() {
  return currentUserContext && currentUserContext.username
    ? currentUserContext.username.toString().trim()
    : '';
}

function toTitleCaseLabel(value) {
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : '';
}

function getDisplayUsername() {
  const rawUsername = getCurrentUsername();
  if (!rawUsername) {
    return '';
  }

  return rawUsername.split('@')[0] || rawUsername;
}

function getDisplayName() {
  const displayUsername = getDisplayUsername();
  if (!displayUsername) {
    return 'StudyOver User';
  }

  const nameParts = displayUsername.split(/[._-]+/).filter(Boolean);
  if (!nameParts.length) {
    return 'StudyOver User';
  }

  return nameParts.map(toTitleCaseLabel).join(' ');
}

function getDisplayRoleLabel() {
  const rawRole = currentUserContext && currentUserContext.role
    ? currentUserContext.role.toString().trim()
    : '';
  return rawRole ? toTitleCaseLabel(rawRole) : 'Account';
}

function getPrimaryNavigationItems() {
  return [
    {
      label: 'Dashboard',
      href: 'SO_DashBoard.html',
      matchers: ['so_dashboard.html']
    },
    {
      label: 'My Sessions',
      href: 'SO_YourSessions.html',
      matchers: ['so_yoursessions.html']
    },
    {
      label: 'Browse Sessions',
      href: '/browse-sessions',
      matchers: ['so_browsesessions.html', 'browse-sessions', 'so_sessiondetails.html', 'so_rsvpconfrimation.html']
    },
    {
      label: 'Create Post',
      href: '/create-post',
      matchers: ['so_createnewpost.html', 'create-post']
    }
  ];
}

function initializeOfficialSiteNavigation() {
  const onLoginPage = Boolean(document.querySelector('form.login-form[action="/login"]'));
  const onSignupPage = Boolean(document.querySelector('#signup-form'));
  if (onLoginPage || onSignupPage) {
    return;
  }

  const header = document.querySelector('header');
  if (!header) {
    return;
  }

  const utilityLinkIsActive = getCurrentPageSlug() === 'so_profilepage.html';

  document.body.classList.add('app-shell');
  header.innerHTML = `
    <div class="site-header-inner">
      <a href="SO_DashBoard.html" class="site-brand-link" aria-label="StudyOver dashboard">
        <h1>StudyOver</h1>
      </a>

      <div class="site-header-tools">
        <div class="site-utility-actions">
          <a href="SO_ProfilePage.html" class="site-utility-link${utilityLinkIsActive ? ' active' : ''}">Profile</a>
          <button type="button" class="site-utility-button site-utility-button-primary logout-btn">Log Out</button>
        </div>
      </div>
    </div>
  `;

  let primaryNavigation = document.querySelector('.header-box');
  if (!primaryNavigation) {
    const main = document.querySelector('main');
    if (main && !main.classList.contains('rsvp-confirmation-main')) {
      primaryNavigation = document.createElement('nav');
      primaryNavigation.className = 'header-box';
      main.insertBefore(primaryNavigation, main.firstChild);
    }
  }

  if (!primaryNavigation) {
    return;
  }

  const currentPageSlug = getCurrentPageSlug();
  primaryNavigation.setAttribute('role', 'navigation');
  primaryNavigation.setAttribute('aria-label', 'Primary');
  primaryNavigation.innerHTML = getPrimaryNavigationItems()
    .map((item) => {
      const isActive = item.matchers.some((matcher) => currentPageSlug.includes(matcher));
      return `
        <a class="header-section${isActive ? ' active' : ''}" href="${item.href}">
          <h3>${item.label}</h3>
        </a>
      `;
    })
    .join('');
}

function initializeReadOnlyUsernameDisplays() {
  const username = getCurrentUsername();
  const displayUsername = getDisplayUsername();
  const displayName = getDisplayName();
  const displayRole = getDisplayRoleLabel();
  const appStateEmail = toAppStateEmail(username || displayUsername);
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : 'S';

  const createPostUsernameInput = document.querySelector('#user-name');
  if (createPostUsernameInput) {
    if (username) {
      createPostUsernameInput.value = username;
    }
  }

  const appStateEmailInput = document.querySelector('#app-state-email');
  if (appStateEmailInput) {
    if (appStateEmail) {
      appStateEmailInput.value = appStateEmail;
    }
  }

  const profileUsernameInput = document.querySelector('#profile-username');
  if (profileUsernameInput) {
    profileUsernameInput.value = displayUsername || 'studyover-user';
  }

  const profileRoleInput = document.querySelector('#profile-role');
  if (profileRoleInput) {
    profileRoleInput.value = displayRole;
  }

  const profileDisplayName = document.querySelector('#profile-display-name');
  if (profileDisplayName) {
    profileDisplayName.textContent = displayName;
  }

  const profileDisplayEmail = document.querySelector('#profile-display-email-text');
  if (profileDisplayEmail) {
    profileDisplayEmail.textContent = appStateEmail || 'No campus email available';
  }

  const profileDisplayRole = document.querySelector('#profile-display-role-text');
  if (profileDisplayRole) {
    profileDisplayRole.textContent = `${displayRole} access`;
  }

  const profileDisplayAvatar = document.querySelector('#profile-display-avatar');
  if (profileDisplayAvatar) {
    profileDisplayAvatar.textContent = displayInitial;
  }
}

function canDeleteSession(session) {
  if (hasAdminAccess()) {
    return true;
  }

  const owner = normalizeLower(session && session.ownerUsername);
  const currentUsername = normalizeLower(currentUserContext && currentUserContext.username);
  return owner && currentUsername && owner === currentUsername;
}

function initializeSchoolFooter() {
  const footer = document.querySelector('footer');
  if (!footer) {
    return;
  }

  const currentYear = new Date().getFullYear();
  footer.innerHTML = `
    <div class="site-footer-content">
      <section class="footer-brand">
        <h4>Appalachian StudyOver</h4>
        <p>Connect with classmates, discover study sessions, and stay on track throughout the semester.</p>
      </section>
      <section class="footer-support">
        <h5>Support</h5>
        <a href="mailto:support@appstate.edu">support@appstate.edu</a>
        <p>Boone, North Carolina</p>
      </section>
    </div>
    <div class="site-footer-bottom">
      <p>&copy; ${currentYear} Appalachian StudyOver. All rights reserved.</p>
      <p class="footer-note">Built for ${APPSTATE_CONFIG.name}</p>
    </div>
  `;
}

function applySchoolBranding() {
  const navTitle = 'StudyOver';

  const appHeaders = document.querySelectorAll('header h1');
  appHeaders.forEach((header) => {
    header.textContent = navTitle;
  });

  const loginLogo = document.querySelector('#school-login-logo');
  if (loginLogo) {
    loginLogo.src = APPSTATE_CONFIG.logoPath;
    loginLogo.alt = `${APPSTATE_CONFIG.name} logo`;
  }

  const signupLogo = document.querySelector('#school-signup-logo');
  if (signupLogo) {
    signupLogo.src = APPSTATE_CONFIG.logoPath;
    signupLogo.alt = `${APPSTATE_CONFIG.name} logo`;
  }

  const officialSchoolInfoHeading = document.querySelector('.account-info-section h5');
  if (officialSchoolInfoHeading) {
    const badge = officialSchoolInfoHeading.querySelector('.readonly-badge');
    officialSchoolInfoHeading.textContent = `Official ${APPSTATE_CONFIG.name} Information`;
    if (badge) {
      officialSchoolInfoHeading.appendChild(document.createTextNode(' '));
      officialSchoolInfoHeading.appendChild(badge);
    }
  }

  const schoolEmailLabel = document.querySelector('label[for="app-state-email"]');
  if (schoolEmailLabel) {
    schoolEmailLabel.textContent = `${APPSTATE_CONFIG.name} Email`;
  }

  const schoolEmailInput = document.querySelector('#app-state-email');
  if (schoolEmailInput && /@appstate\.edu$/i.test(schoolEmailInput.value)) {
    const username = schoolEmailInput.value.split('@')[0] || 'student';
    schoolEmailInput.value = `${username}${APPSTATE_CONFIG.emailDomain}`;
  }
}

function initializeH1Navigation() {
  const h1Element = document.querySelector('header h1');
  const onSignInPage = document.querySelector('.login-form');
  if (h1Element && !onSignInPage && !h1Element.closest('.site-brand-link')) {
    h1Element.style.cursor = 'pointer';
    h1Element.classList.add('universal-hover');

    h1Element.addEventListener('click', function() {
      window.location.href = 'SO_DashBoard.html';
    });
  }
}

function initializeHeaderNavigation() {
  const headerSections = document.querySelectorAll('.header-section');

  headerSections.forEach((section) => {
    const headerText = section.querySelector('h3');
    if (headerText) {
      const text = headerText.textContent.trim();

      section.addEventListener('click', function() {
        switch (text) {
          case 'Dashboard':
            window.location.href = 'SO_DashBoard.html';
            break;
          case 'My Sessions':
            window.location.href = 'SO_YourSessions.html';
            break;
          case 'Browse Sessions':
            window.location.href = '/browse-sessions';
            break;
          case 'Create Post':
            window.location.href = '/create-post';
            break;
          default:
            console.log('Unknown header section clicked:', text);
        }
      });
    }
  });
}

function initializeLoginForm() {
  const loginForm = document.querySelector('form.login-form[action="/login"]');
  const errorLabel = document.querySelector('#login-error');
  const query = getQueryParams();

  const showError = (message, color) => {
    if (errorLabel) {
      errorLabel.textContent = message;
      errorLabel.style.color = color || '#b00020';
    }
  };

  const queryError = query.get('error');
  if (queryError === 'invalid') {
    showError('Invalid username or password.');
  } else if (queryError === 'missing') {
    showError('Please enter both username and password');
  } else if (queryError === 'auth') {
    showError('Please log in to access this page.');
  } else if (query.get('signup') === 'success') {
    showError('Sign up complete. Please log in.', '#1b5e20');
  }

  const goToSignupButton = document.querySelector('#go-to-signup-button');
  if (goToSignupButton) {
    goToSignupButton.addEventListener('click', function() {
      window.location.href = '/signup';
    });
  }

  if (!loginForm) {
    return;
  }

  loginForm.addEventListener('submit', function(e) {
    const username = loginForm.querySelector('#username').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    if (!username.trim() || !password.trim()) {
      e.preventDefault();
      showError('Please enter both username and password');
      return;
    }
  });
}

function initializeSignupActions() {
  const backToLoginButton = document.querySelector('#back-to-login-button');
  if (backToLoginButton) {
    backToLoginButton.addEventListener('click', function() {
      window.location.href = '/SO_SignOnPage.html';
    });
  }

  const signupForm = document.querySelector('#signup-form');
  const signupError = document.querySelector('#signup-error');
  if (!signupForm || !signupError) {
    return;
  }

  const showSignupError = (message) => {
    signupError.textContent = message;
    signupError.style.color = '#b00020';
  };

  const signupStatus = getQueryParams().get('error');
  if (signupStatus === 'domain') {
    showSignupError(`Use a valid ${APPSTATE_CONFIG.emailDomain} email.`);
  } else if (signupStatus === 'mismatch') {
    showSignupError('Passwords do not match.');
  } else if (signupStatus === 'missing') {
    showSignupError('Please complete all required fields.');
  } else if (signupStatus === 'exists') {
    showSignupError('An account with that email already exists.');
  }

  signupForm.addEventListener('submit', function(event) {
    const firstName = document.querySelector('#signup-first-name').value.trim();
    const lastName = document.querySelector('#signup-last-name').value.trim();
    const email = document.querySelector('#signup-email').value.trim();
    const password = document.querySelector('#signup-password').value;
    const confirmPassword = document.querySelector('#signup-confirm-password').value;
    const status = document.querySelector('#signup-status').value;
    const gradYear = document.querySelector('#signup-grad-year').value.trim();
    const birthday = document.querySelector('#signup-birthday').value;
    const gender = document.querySelector('#signup-gender').value;

    if (!firstName || !lastName || !status || !gradYear || !birthday || !gender) {
      event.preventDefault();
      showSignupError('Please complete all required fields.');
      return;
    }

    if (!email.toLowerCase().endsWith(APPSTATE_CONFIG.emailDomain)) {
      event.preventDefault();
      showSignupError(`Use a valid ${APPSTATE_CONFIG.emailDomain} email.`);
      return;
    }

    if (!password || !confirmPassword) {
      event.preventDefault();
      showSignupError('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      showSignupError('Passwords do not match.');
    }
  });
}

function initializeLogoutButtons() {
  const logoutButtons = document.querySelectorAll('.logout-btn');
  if (!logoutButtons.length) {
    return;
  }

  logoutButtons.forEach((button) => {
    button.addEventListener('click', function() {
      window.location.href = '/logout';
    });
  });
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
    button.addEventListener('click', async function() {
      if (button.disabled) {
        return;
      }

      const sessionCard = button.closest('.session-card');
      if (!sessionCard) {
        return;
      }

      const sessionId = sessionCard.dataset.sessionId;
      if (!sessionId) {
        return;
      }

      try {
        const response = await fetch(`/api/sessions/${sessionId}/join`, {
          method: 'POST'
        });

        if (response.status === 403) {
          alert('You cannot join your own session.');
          return;
        }

        if (response.status === 409) {
          const errorBody = await response.json().catch(() => null);
          const message = errorBody && errorBody.error ? errorBody.error : 'Unable to join this session.';
          alert(message);
          return;
        }

        if (!response.ok) {
          alert('Unable to join session right now.');
          return;
        }

        await loadCreatedSessions();
        await loadMySessions();
        alert('RSVP confirmed!');
      } catch (error) {
        console.error('Unable to join session:', error);
        alert('Unable to join session right now.');
      }
    });
  });
}

function setBrowseSessionsEmptyStateVisible(isVisible) {
  const emptyState = document.querySelector('#browse-sessions-empty-state');
  if (!emptyState) {
    return;
  }

  emptyState.classList.toggle('hidden', !isVisible);
}

function setMySessionsEmptyStateVisible(isVisible) {
  const emptyState = document.querySelector('#my-sessions-empty-state');
  if (!emptyState) {
    return;
  }

  emptyState.classList.toggle('hidden', !isVisible);
}

function syncRenderedSessionEmptyStates() {
  const browseSessionsGrid = document.querySelector('#browse-sessions-grid');
  if (browseSessionsGrid) {
    setBrowseSessionsEmptyStateVisible(!browseSessionsGrid.childElementCount);
  }

  const mySessionsGrid = document.querySelector('#my-sessions-grid');
  if (mySessionsGrid) {
    setMySessionsEmptyStateVisible(!mySessionsGrid.childElementCount);
  }
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

function toComparableCampusUsername(value) {
  return toAppStateEmail(value);
}

function isSessionOwnedByCurrentUser(session) {
  const currentUsername = toComparableCampusUsername(currentUserContext && currentUserContext.username);
  if (!currentUsername) {
    return false;
  }

  const ownerUsername = toComparableCampusUsername(session && session.ownerUsername);
  const hostUsername = toComparableCampusUsername(session && session.userName);
  return ownerUsername === currentUsername || hostUsername === currentUsername;
}

function getSessionDateAtMidnight(value) {
  const normalized = value ? value.toString().trim() : '';
  if (!normalized) {
    return null;
  }

  const sessionDate = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(sessionDate.getTime())) {
    return null;
  }

  return sessionDate;
}

function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function matchesMySessionStatusFilter(session) {
  const activeFilter = document.querySelector('#active-filter');
  const selectedStatus = normalizeLower(activeFilter && activeFilter.value);
  if (!selectedStatus) {
    return true;
  }

  const sessionDate = getSessionDateAtMidnight(session && session.sessionDate);
  if (!sessionDate) {
    return false;
  }

  const today = getTodayAtMidnight();
  if (selectedStatus === 'completed') {
    return sessionDate < today;
  }
  if (selectedStatus === 'active') {
    return sessionDate.getTime() === today.getTime();
  }
  if (selectedStatus === 'upcoming') {
    return sessionDate > today;
  }

  return true;
}

function matchesMySessionLocationFilter(session) {
  const locationFilter = document.querySelector('#location-filter');
  const selectedLocation = normalizeLower(locationFilter && locationFilter.value);
  if (!selectedLocation) {
    return true;
  }

  const sessionLocation = normalizeLower(session && session.sessionLocation);
  if (selectedLocation === 'library') {
    return sessionLocation.includes('library');
  }
  if (selectedLocation === 'student-union') {
    return sessionLocation === 'student-union';
  }
  if (selectedLocation === 'academic-buildings') {
    return ['walker-hall', 'anne-belk-hall', 'rankin-science'].includes(sessionLocation);
  }
  if (selectedLocation === 'online') {
    return sessionLocation === 'online';
  }

  return true;
}

const MY_SESSION_COURSE_FILTER_MAP = {
  cs: ['computer-science', 'cs'],
  math: ['mathematics', 'math'],
  english: ['english', 'eng'],
  history: ['history', 'his'],
  biology: ['biology', 'bio'],
  chemistry: ['chemistry', 'chem']
};

function matchesMySessionCourseFilter(session) {
  const courseFilter = document.querySelector('#course-filter');
  const selectedCourse = normalizeLower(courseFilter && courseFilter.value);
  if (!selectedCourse) {
    return true;
  }

  const topic = normalizeLower(session && session.topic);
  const courseCode = normalizeLower(session && session.courseCode);
  const matchTokens = MY_SESSION_COURSE_FILTER_MAP[selectedCourse] || [selectedCourse];

  return matchTokens.some((token) => {
    return topic.includes(token) || courseCode.startsWith(token) || courseCode.includes(`${token} `);
  });
}

function matchesMySessionTimeFilter(session) {
  const timeFilter = document.querySelector('#time-filter');
  const selectedTime = normalizeLower(timeFilter && timeFilter.value);
  if (!selectedTime) {
    return true;
  }

  const sessionTime = normalizeLower(session && session.sessionTime);
  return sessionTime.startsWith(selectedTime);
}

function matchesMySessionFilters(session) {
  return matchesMySessionStatusFilter(session)
    && matchesMySessionLocationFilter(session)
    && matchesMySessionCourseFilter(session)
    && matchesMySessionTimeFilter(session);
}

function normalizeJoinedUsernames(session) {
  const joinedUsernames = session && Array.isArray(session.joinedUsernames)
    ? session.joinedUsernames
    : [];
  return joinedUsernames
    .map((value) => toComparableCampusUsername(value))
    .filter(Boolean);
}

function hasCurrentUserJoinedSession(session) {
  const currentUsername = toComparableCampusUsername(currentUserContext && currentUserContext.username);
  if (!currentUsername) {
    return false;
  }

  return normalizeJoinedUsernames(session).includes(currentUsername);
}

function resolveSessionCapacity(session) {
  const rawValue = session && session.maxParticipants
    ? session.maxParticipants.toString().trim()
    : '';
  if (!rawValue) {
    return 0;
  }

  const rangeValues = rawValue.split('-');
  const lastValue = rangeValues[rangeValues.length - 1].trim();
  const parsedValue = Number.parseInt(lastValue, 10);
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
}

function getSessionParticipantCount(session) {
  if (session && Number.isFinite(session.participantCount)) {
    return session.participantCount;
  }

  return normalizeJoinedUsernames(session).length;
}

function getSessionParticipantLabel(session) {
  const participantCount = getSessionParticipantCount(session);
  const capacity = resolveSessionCapacity(session);
  if (capacity > 0) {
    return `${participantCount}/${capacity}`;
  }

  return `${participantCount}`;
}

function isSessionFull(session) {
  const capacity = resolveSessionCapacity(session);
  return capacity > 0 && getSessionParticipantCount(session) >= capacity;
}

function getJoinButtonMarkup(session) {
  if (isSessionOwnedByCurrentUser(session)) {
    return '<button class="join-btn" type="button" disabled>Your Session</button>';
  }

  if (hasCurrentUserJoinedSession(session)) {
    return '<button class="join-btn" type="button" disabled>Joined</button>';
  }

  if (isSessionFull(session)) {
    return '<button class="join-btn" type="button" disabled>Session Full</button>';
  }

  return '<button class="join-btn" type="button">Join Session</button>';
}

function renderSessionsIntoGrid(sessionsGrid, sessions) {
  if (!sessionsGrid) {
    return;
  }

  sessionsGrid.innerHTML = '';
  sessions.forEach((session) => {
    sessionsGrid.appendChild(buildSessionCard(session));
  });
}

function buildSessionCard(session) {
  const hostUsername = session && session.userName && session.userName.toString().trim()
    ? session.userName.toString().trim()
    : 'Unknown';
  const participantLabel = getSessionParticipantLabel(session);
  const notesMarkup = session && session.sessionDescription && session.sessionDescription.toString().trim()
    ? `
      <div class="detail-item">
        <span class="detail-label">Notes:</span>
        <span>${escapeHtml(session.sessionDescription)}</span>
      </div>
    `
    : '';
  const deleteButtonMarkup = canDeleteSession(session)
    ? '<button class="delete-session-btn">End Session</button>'
    : '';
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
        <span class="detail-label">Time:</span>
        <span>${escapeHtml(session.sessionDate)} ${escapeHtml(session.sessionTime)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Location:</span>
        <span>${escapeHtml(humanizeValue(session.sessionLocation))}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Joined:</span>
        <span>${escapeHtml(participantLabel)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Host:</span>
        <span>${escapeHtml(hostUsername)}</span>
      </div>
      ${notesMarkup}
    </div>
    <div class="session-footer">
      ${deleteButtonMarkup}
      ${getJoinButtonMarkup(session)}
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
      if (!sessionCard) {
        return;
      }

      const sessionId = sessionCard.dataset.sessionId;
      if (!sessionId) {
        // Fallback for static cards that are not backed by an API record.
        if (hasAdminAccess()) {
          sessionCard.remove();
          syncRenderedSessionEmptyStates();
        }
        return;
      }

      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE'
        });

        if (response.status === 403) {
          alert('Only admins or the session creator can end this session.');
          return;
        }

        if (!response.ok) {
          alert('Unable to end session.');
          return;
        }

        sessionCard.remove();
        syncRenderedSessionEmptyStates();
      } catch (error) {
        console.error('Unable to end session:', error);
        alert('Unable to end session right now. Try again.');
      }
    });
  });
}

function ensureAdminCanEndAllVisibleSessions() {
  if (!hasAdminAccess()) {
    return;
  }

  const sessionCards = document.querySelectorAll('.sessions-grid .session-card');
  if (!sessionCards.length) {
    return;
  }

  sessionCards.forEach((card) => {
    const footer = card.querySelector('.session-footer');
    if (!footer) {
      return;
    }

    const existingDeleteButton = footer.querySelector('.delete-session-btn');
    if (existingDeleteButton) {
      existingDeleteButton.textContent = 'End Session';
      return;
    }

    const endButton = document.createElement('button');
    endButton.className = 'delete-session-btn';
    endButton.textContent = 'End Session';
    footer.insertBefore(endButton, footer.firstChild);
  });

  initializeDeleteSessionButtons();
}

async function loadCreatedSessions() {
  const sessionsGrid = document.querySelector('#browse-sessions-grid');
  if (!sessionsGrid) {
    return;
  }

  try {
    const response = await fetch('/api/sessions');
    if (!response.ok) {
      sessionsGrid.innerHTML = '';
      setBrowseSessionsEmptyStateVisible(true);
      return;
    }

    const sessions = await response.json();
    if (!Array.isArray(sessions) || !sessions.length) {
      sessionsGrid.innerHTML = '';
      setBrowseSessionsEmptyStateVisible(true);
      return;
    }

    renderSessionsIntoGrid(sessionsGrid, sessions);
    ensureAdminCanEndAllVisibleSessions();
    initializeJoinSessionButtons();
    initializeDeleteSessionButtons();
    syncRenderedSessionEmptyStates();
  } catch (error) {
    console.error('Unable to load created sessions:', error);
    sessionsGrid.innerHTML = '';
    setBrowseSessionsEmptyStateVisible(true);
  }
}

async function loadMySessions() {
  const sessionsGrid = document.querySelector('#my-sessions-grid');
  if (!sessionsGrid) {
    return;
  }

  try {
    const response = await fetch('/api/sessions');
    if (!response.ok) {
      sessionsGrid.innerHTML = '';
      setMySessionsEmptyStateVisible(true);
      return;
    }

    const sessions = await response.json();
    const mySessions = Array.isArray(sessions)
      ? sessions.filter((session) => isSessionOwnedByCurrentUser(session) && matchesMySessionFilters(session))
      : [];

    renderSessionsIntoGrid(sessionsGrid, mySessions);
    ensureAdminCanEndAllVisibleSessions();
    initializeJoinSessionButtons();
    initializeDeleteSessionButtons();
    syncRenderedSessionEmptyStates();
  } catch (error) {
    console.error('Unable to load your sessions:', error);
    sessionsGrid.innerHTML = '';
    setMySessionsEmptyStateVisible(true);
  }
}

function initializeMySessionsFilters() {
  const mySessionsGrid = document.querySelector('#my-sessions-grid');
  if (!mySessionsGrid) {
    return;
  }

  ['#active-filter', '#location-filter', '#course-filter', '#time-filter'].forEach((selector) => {
    const control = document.querySelector(selector);
    if (!control || control.dataset.mySessionsBound === 'true') {
      return;
    }

    control.dataset.mySessionsBound = 'true';
    control.addEventListener('change', function() {
      void loadMySessions();
    });
  });
}

function initializeCreatePostForm() {
  const createPostForm = document.querySelector('#create-post-form');
  if (!createPostForm) {
    return;
  }

  const sessionDateInput = createPostForm.querySelector('#session-date');
  if (sessionDateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    sessionDateInput.min = `${year}-${month}-${day}`;
  }

  createPostForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const userNameValue = document.querySelector('#user-name').value.trim();
    if (!userNameValue) {
      alert('Unable to find your username. Please log out and log back in.');
      return;
    }

    const sessionDescription = document.querySelector('#session-description').value.trim();
    
    // Check if a location has been selected on the map
    const sessionLocation = document.querySelector('#session-location').value;
    if (!sessionLocation || sessionLocation.trim() === '') {
      alert('Please select a meeting location on the map before creating your study session.');
      return;
    }

    const payload = {
      userName: userNameValue,
      topic: document.querySelector('#topic-select').value,
      courseCode: document.querySelector('#course-code').value.trim(),
      sessionTitle: document.querySelector('#session-title').value.trim(),
      sessionDate: document.querySelector('#session-date').value,
      sessionTime: document.querySelector('#session-time').value,
      sessionLocation: sessionLocation,
      maxParticipants: document.querySelector('#max-participants').value,
      difficultyLevel: '',
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

      window.location.href = '/SO_YourSessions.html';
    } catch (error) {
      console.error('Unable to create session:', error);
      alert('Unable to create session right now. Try again.');
    }
  });
}

function initializeAdminControls() {
  const adminControls = document.querySelector('#admin-controls');
  if (!adminControls) {
    return;
  }

  if (!hasAdminAccess()) {
    adminControls.classList.remove('visible');
    return;
  }

  adminControls.classList.add('visible');

  const createUserForm = document.querySelector('#admin-create-user-form');
  const statusLabel = document.querySelector('#admin-create-user-status');
  if (!createUserForm || !statusLabel) {
    return;
  }

  const showStatus = (message, color) => {
    statusLabel.textContent = message;
    statusLabel.style.color = color || '#b00020';
  };

  createUserForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.querySelector('#admin-new-username').value.trim();
    const password = document.querySelector('#admin-new-password').value.trim();
    const role = document.querySelector('#admin-new-role').value;

    if (!username || !password || !role) {
      showStatus('Role, username, and password are required.');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          role
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody && errorBody.error ? errorBody.error : 'Unable to create account.';
        showStatus(message);
        return;
      }

      createUserForm.reset();
      showStatus('User account created.', '#1b5e20');
    } catch (error) {
      console.error('Unable to create user account:', error);
      showStatus('Unable to create account right now. Try again.');
    }
  });
}

function getProfileSettingsStorageKey() {
  const username = normalizeLower(getDisplayUsername()) || 'guest';
  return `studyover.profile.settings.${username}`;
}

function getProfileSettingElements(settingsForm) {
  return Array.from(settingsForm.querySelectorAll('input, select, textarea')).filter((element) => {
    return element.name && !element.disabled && !element.readOnly;
  });
}

function serializeProfileSettings(settingsForm) {
  const settings = {};
  const processedRadioGroups = new Set();

  getProfileSettingElements(settingsForm).forEach((element) => {
    if (element.tagName === 'SELECT' && element.multiple) {
      settings[element.name] = Array.from(element.selectedOptions).map((option) => option.value);
      return;
    }

    if (element.type === 'checkbox') {
      settings[element.name] = element.checked;
      return;
    }

    if (element.type === 'radio') {
      if (processedRadioGroups.has(element.name)) {
        return;
      }

      const checkedOption = settingsForm.querySelector(`input[name="${element.name}"]:checked`);
      settings[element.name] = checkedOption ? checkedOption.value : '';
      processedRadioGroups.add(element.name);
      return;
    }

    settings[element.name] = element.value;
  });

  return settings;
}

function applyStoredProfileSettings(settingsForm, savedSettings) {
  const processedRadioGroups = new Set();

  getProfileSettingElements(settingsForm).forEach((element) => {
    const savedValue = savedSettings[element.name];
    if (typeof savedValue === 'undefined') {
      return;
    }

    if (element.tagName === 'SELECT' && element.multiple) {
      const selectedValues = Array.isArray(savedValue) ? savedValue : [];
      Array.from(element.options).forEach((option) => {
        option.selected = selectedValues.includes(option.value);
      });
      return;
    }

    if (element.type === 'checkbox') {
      element.checked = Boolean(savedValue);
      return;
    }

    if (element.type === 'radio') {
      if (processedRadioGroups.has(element.name)) {
        return;
      }

      const radioOptions = settingsForm.querySelectorAll(`input[name="${element.name}"]`);
      radioOptions.forEach((radioOption) => {
        radioOption.checked = radioOption.value === savedValue;
      });
      processedRadioGroups.add(element.name);
      return;
    }

    element.value = savedValue;
  });
}

function initializeProfileSettingsForm() {
  const settingsForm = document.querySelector('#account-settings-form');
  if (!settingsForm) {
    return;
  }

  const resetButton = document.querySelector('#profile-reset-button');
  const statusLabel = document.querySelector('#account-settings-status');
  const storageKey = getProfileSettingsStorageKey();

  const showStatus = (message, color) => {
    if (!statusLabel) {
      return;
    }

    statusLabel.textContent = message;
    statusLabel.style.color = color || '#1b5e20';
  };

  try {
    const savedSettings = window.localStorage.getItem(storageKey);
    if (savedSettings) {
      applyStoredProfileSettings(settingsForm, JSON.parse(savedSettings));
    }
  } catch (error) {
    console.error('Unable to load profile settings:', error);
    showStatus('Unable to load saved preferences.', '#b00020');
  }

  settingsForm.addEventListener('submit', function(event) {
    event.preventDefault();

    try {
      const serializedSettings = serializeProfileSettings(settingsForm);
      window.localStorage.setItem(storageKey, JSON.stringify(serializedSettings));
      showStatus('Preferences saved on this device.', '#1b5e20');
    } catch (error) {
      console.error('Unable to save profile settings:', error);
      showStatus('Unable to save preferences right now.', '#b00020');
    }
  });

  if (resetButton) {
    resetButton.addEventListener('click', function() {
      settingsForm.reset();

      try {
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Unable to clear profile settings:', error);
      }

      showStatus('Preferences reset to defaults.', '#1b5e20');
    });
  }
}

function initializeDashboardButtons() {
  const createPostCard = document.querySelector('#dashboard-create-post')
    || document.querySelector('.small-boxes.left');
  const browseSessionsCard = document.querySelector('#dashboard-browse-sessions')
    || document.querySelector('.small-boxes.right');

  if (createPostCard) {
    createPostCard.addEventListener('click', function() {
      window.location.href = '/create-post';
    });
  }

  if (browseSessionsCard) {
    browseSessionsCard.addEventListener('click', function() {
      window.location.href = '/browse-sessions';
    });
  }
}

// ==============================================
// INTERACTIVE MAP FUNCTIONALITY
// ==============================================

let campusMap = null;
let selectedLocationMarker = null;
let selectedLocation = null;

// Appalachian State University campus coordinates
const APP_STATE_CENTER = [36.2157, -81.6774];

// Campus building locations with their coordinates
const CAMPUS_BUILDINGS = [
  { name: 'Belk Library', coords: [36.2144, -81.6781], id: 'belk-library' },
  { name: 'Student Union', coords: [36.2166, -81.6753], id: 'student-union' },
  { name: 'Walker Hall', coords: [36.2142, -81.6798], id: 'walker-hall' },
  { name: 'Anne Belk Hall', coords: [36.2143, -81.6803], id: 'anne-belk-hall' },
  { name: 'Rankin Science', coords: [36.2158, -81.6806], id: 'rankin-science' },
  { name: 'Plemmons Student Union', coords: [36.2166, -81.6753], id: 'plemmons-union' },
  { name: 'Peacock Hall', coords: [36.2183, -81.6775], id: 'peacock-hall' },
  { name: 'Sanford Hall', coords: [36.2132, -81.6801], id: 'sanford-hall' },
  { name: 'Edwin Duncan Hall', coords: [36.2163, -81.6798], id: 'duncan-hall' }
];

function initializeCampusMap() {
  const mapContainer = document.getElementById('campus-map');
  if (!mapContainer) return;

  try {
    // Initialize map centered on App State campus
    campusMap = L.map('campus-map', {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: false
    }).setView(APP_STATE_CENTER, 16);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 14
    }).addTo(campusMap);

    // Add campus boundary (approximate)
    const campusBounds = [
      [36.2220, -81.6850], // Northwest corner (Further up toward Howard St/Downtown)
      [36.2220, -81.6700], // Northeast corner (Past the Student Union toward 105)
      [36.2090, -81.6700], // Southeast corner (Down toward State Farm/Greenway)
      [36.2090, -81.6850]
    ];
    
    L.polygon(campusBounds, {
      color: '#8b4513',
      weight: 2,
      opacity: 0.8,
      fillColor: '#f4f1e8',
      fillOpacity: 0.1
    }).addTo(campusMap);

    // Add building markers
    CAMPUS_BUILDINGS.forEach(building => {
      const marker = L.marker(building.coords, {
        icon: createBuildingIcon(building.name)
      }).addTo(campusMap);
      
      marker.bindPopup(`
        <strong>${building.name}</strong><br>
        <em>Click to select as meeting location</em>
      `);
      
      marker.on('click', function() {
        selectLocation(building.coords, building.name, building.id);
      });
    });

    // Allow clicking anywhere on campus to set custom location
    campusMap.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Check if click is within reasonable campus bounds
      if (lat >= 36.2100 && lat <= 36.2200 && lng >= -81.6850 && lng <= -81.6700) {
        selectLocation([lat, lng], 'Custom Location', 'custom');
      }
    });

    // Resize map when container changes
    setTimeout(() => {
      campusMap.invalidateSize();
    }, 250);

  } catch (error) {
    console.error('Error initializing campus map:', error);
    mapContainer.innerHTML = '<div class="map-loading">Map is temporarily unavailable</div>';
  }
}

function createBuildingIcon(buildingName) {
  // Extract first letter of each word
  const initials = buildingName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return L.divIcon({
    className: 'custom-marker building-marker',
    html: initials,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

function selectLocation(coords, name, id) {
  selectedLocation = { coords, name, id };
  
  // Remove previous selection marker
  if (selectedLocationMarker) {
    campusMap.removeLayer(selectedLocationMarker);
  }
  
  // Add new selection marker
  selectedLocationMarker = L.marker(coords, {
    icon: L.divIcon({
      className: 'custom-marker building-marker selected-marker',
      html: '📍',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }).addTo(campusMap);
  
  selectedLocationMarker.bindPopup(`
    <strong>Selected: ${name}</strong><br>
    <em>Meeting location confirmed</em>
  `).openPopup();
  
  // Update form fields
  updateLocationFields(name, id, coords);
  
  // Update display
  updateLocationDisplay(name);
}

function updateLocationFields(name, id, coords) {
  const locationField = document.getElementById('session-location');
  const coordinatesField = document.getElementById('location-coordinates');
  
  if (locationField) {
    locationField.value = id;
  }
  
  if (coordinatesField) {
    coordinatesField.value = `${coords[0]},${coords[1]}`;
  }
}

function updateLocationDisplay(name) {
  const display = document.getElementById('selected-location-display');
  if (display) {
    display.textContent = `Selected: ${name}`;
    display.className = 'selected-location has-selection';
  }
}

function resetLocationSelection() {
  selectedLocation = null;
  
  if (selectedLocationMarker && campusMap) {
    campusMap.removeLayer(selectedLocationMarker);
    selectedLocationMarker = null;
  }
  
  const locationField = document.getElementById('session-location');
  const coordinatesField = document.getElementById('location-coordinates');
  const display = document.getElementById('selected-location-display');
  
  if (locationField) locationField.value = '';
  if (coordinatesField) coordinatesField.value = '';
  
  if (display) {
    display.textContent = 'Click on the map to select a location';
    display.className = 'selected-location no-selection';
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const onLoginPage = Boolean(document.querySelector('form.login-form[action="/login"]'));
  const onSignupPage = Boolean(document.querySelector('#signup-form'));
  if (!onLoginPage && !onSignupPage) {
    await loadCurrentUserContext();
  }

  initializeOfficialSiteNavigation();
  applySchoolBranding();
  initializeReadOnlyUsernameDisplays();
  initializeSchoolFooter();
  initializeH1Navigation();
  initializeHeaderNavigation();
  initializeLoginForm();
  initializeSignupActions();
  initializeAdminControls();
  initializeProfileSettingsForm();
  initializeLogoutButtons();
  ensureAdminCanEndAllVisibleSessions();
  initializeJoinSessionButtons();
  initializeDashboardButtons();
  initializeCreatePostForm();
<<<<<<< HEAD
  initializeCampusMap();
=======
  initializeMySessionsFilters();
>>>>>>> dd4dedb (new changes)
  await loadCreatedSessions();
  await loadMySessions();
});
