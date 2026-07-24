const STORAGE_KEY = 'project-free-earth-submissions';
const ADMIN_PASSWORD = 'ProjectFreeEarth2026';
const CONTRIBUTOR_EMAIL = 'hswan002@odu.edu';
const CONTRIBUTOR_PASSWORD = 'ProjectFreeEarth2026';
const ADMIN_SESSION_KEY = 'project-free-earth-admin';
const CONTRIBUTOR_SESSION_KEY = 'project-free-earth-contributor';

function isAdminUnlocked() {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

function unlockAdmin() {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } catch (error) {
    console.warn('Unable to store admin session.', error);
  }
}

function lockAdmin() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    console.warn('Unable to clear admin session.', error);
  }
}

function isContributorLoggedIn() {
  try {
    return sessionStorage.getItem(CONTRIBUTOR_SESSION_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

function setContributorSession(email) {
  try {
    sessionStorage.setItem(CONTRIBUTOR_SESSION_KEY, 'true');
    sessionStorage.setItem(CONTRIBUTOR_SESSION_KEY + ':email', email.toLowerCase());
  } catch (error) {
    console.warn('Unable to store contributor session.', error);
  }
}

function clearContributorSession() {
  try {
    sessionStorage.removeItem(CONTRIBUTOR_SESSION_KEY);
    sessionStorage.removeItem(CONTRIBUTOR_SESSION_KEY + ':email');
  } catch (error) {
    console.warn('Unable to clear contributor session.', error);
  }
}

function getContributorEmail() {
  try {
    return sessionStorage.getItem(CONTRIBUTOR_SESSION_KEY + ':email') || '';
  } catch (error) {
    return '';
  }
}

function getSeedSubmissions() {
  return [
    {
      id: 'seed-approved',
      title: 'Climate Education in Coastal Communities',
      author: 'Maya Chen',
      email: 'maya@example.com',
      type: 'Story',
      category: 'Education',
      summary: 'A community-led overview of how local schools can teach climate adaptation with place-based examples and student-led projects.',
      link: '',
      status: 'approved',
      submittedAt: '2026-07-20'
    },
    {
      id: 'seed-pending',
      title: 'Research Note: Community Air Quality Monitoring',
      author: 'Jordan Alvarez',
      email: 'jordan@example.com',
      type: 'Paper',
      category: 'Research',
      summary: 'A short paper outlining how neighborhood air monitoring can help communities document environmental risk and advocate for change.',
      link: '',
      status: 'pending',
      submittedAt: '2026-07-21'
    }
  ];
}

function getStoredSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getSeedSubmissions();
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getSeedSubmissions();
  } catch (error) {
    console.warn('Unable to read saved submissions.', error);
    return getSeedSubmissions();
  }
}

function saveSubmissions(submissions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.warn('Unable to save submissions.', error);
  }
}

function formatDate(value) {
  if (!value) {
    return 'Pending';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function renderSubmissionDeck() {
  const pendingList = document.getElementById('pending-list');
  const approvedList = document.getElementById('approved-list');
  const rejectedList = document.getElementById('rejected-list');
  const messageEl = document.getElementById('submission-message');
  const contributorList = document.getElementById('my-submissions-list');
  const contributorStatus = document.getElementById('contributor-status');

  if (!pendingList || !approvedList || !rejectedList) {
    return;
  }

  const submissions = getStoredSubmissions();
  const pending = submissions.filter((item) => item.status === 'pending');
  const approved = submissions.filter((item) => item.status === 'approved');
  const rejected = submissions.filter((item) => item.status === 'rejected');

  pendingList.innerHTML = buildItemMarkup(pending, 'Awaiting review', true);
  approvedList.innerHTML = buildItemMarkup(approved, 'Approved for publication', false);
  rejectedList.innerHTML = buildItemMarkup(rejected, 'Rejected', false);

  if (contributorList) {
    if (isContributorLoggedIn()) {
      const mine = submissions.filter((item) => item.email && item.email.toLowerCase() === getContributorEmail().toLowerCase());
      contributorList.innerHTML = buildItemMarkup(mine, 'You have no submissions yet.', false);
      if (contributorStatus) {
        contributorStatus.textContent = 'Showing submissions for ' + getContributorEmail();
      }
    } else {
      contributorList.innerHTML = '<div class="empty-state">Log in with your email and password to view your submissions.</div>';
      if (contributorStatus) {
        contributorStatus.textContent = '';
      }
    }
  }

  if (messageEl) {
    messageEl.textContent = '';
  }
}

function buildItemMarkup(items, emptyMessage, showActions) {
  if (!items.length) {
    return '<div class="empty-state">' + emptyMessage + '</div>';
  }

  return items.map((item) => {
    const badgeClass = item.status === 'approved' ? 'status-approved' : item.status === 'rejected' ? 'status-rejected' : 'status-pending';
    const actions = showActions && isAdminUnlocked()
      ? '<div class="review-actions"><button type="button" class="review-button approve" data-action="approve" data-id="' + item.id + '">Approve</button><button type="button" class="review-button reject" data-action="reject" data-id="' + item.id + '">Reject</button></div>'
      : showActions
        ? '<div class="review-actions"><span class="empty-state">Admin password required</span></div>'
        : '';

    const linkMarkup = item.link
      ? '<a class="review-link" href="' + item.link + '" target="_blank" rel="noopener">Open resource</a>'
      : '';

    return '<article class="review-card">' +
      '<div class="review-header">' +
      '<div>' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<p class="review-meta">' + escapeHtml(item.author) + ' • ' + escapeHtml(item.type) + ' • ' + escapeHtml(item.category) + '</p>' +
      '</div>' +
      '<span class="status-pill ' + badgeClass + '">' + escapeHtml(item.status.charAt(0).toUpperCase() + item.status.slice(1)) + '</span>' +
      '</div>' +
      '<p class="review-summary">' + escapeHtml(item.summary) + '</p>' +
      '<div class="review-footer">' +
      '<span>Submitted ' + escapeHtml(formatDate(item.submittedAt)) + '</span>' +
      linkMarkup +
      '</div>' +
      actions +
      '</article>';
  }).join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function updateSubmissionStatus(id, status) {
  if (!isAdminUnlocked()) {
    const messageEl = document.getElementById('admin-status');
    if (messageEl) {
      messageEl.textContent = 'Please unlock the review tools with the admin password first.';
    }
    return;
  }

  const submissions = getStoredSubmissions();
  const updated = submissions.map((item) => (item.id === id ? { ...item, status } : item));
  saveSubmissions(updated);
  renderSubmissionDeck();
}

function handleSubmission(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const newSubmission = {
    id: 'submission-' + Date.now(),
    title: formData.get('title').toString().trim(),
    author: formData.get('name').toString().trim(),
    email: formData.get('email').toString().trim(),
    type: formData.get('type').toString().trim(),
    category: formData.get('category').toString().trim(),
    summary: formData.get('summary').toString().trim(),
    link: formData.get('link').toString().trim(),
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  if (!newSubmission.title || !newSubmission.author || !newSubmission.summary) {
    return;
  }

  const submissions = getStoredSubmissions();
  submissions.unshift(newSubmission);
  saveSubmissions(submissions);
  form.reset();
  renderSubmissionDeck();

  const messageEl = document.getElementById('submission-message');
  if (messageEl) {
    messageEl.textContent = 'Thanks for contributing. Your submission is now waiting for review.';
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input[name="adminPassword"]');
  const statusEl = document.getElementById('admin-status');

  if (!input) {
    return;
  }

  if (input.value === ADMIN_PASSWORD) {
    unlockAdmin();
    if (statusEl) {
      statusEl.textContent = 'Review tools unlocked.';
    }
    renderSubmissionDeck();
  } else {
    lockAdmin();
    if (statusEl) {
      statusEl.textContent = 'Incorrect password.';
    }
    renderSubmissionDeck();
  }

  form.reset();
}

function handleContributorLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');
  const statusEl = document.getElementById('contributor-status');

  if (!emailInput || !passwordInput) {
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (email.toLowerCase() === CONTRIBUTOR_EMAIL && password === CONTRIBUTOR_PASSWORD) {
    setContributorSession(email);
    if (statusEl) {
      statusEl.textContent = 'Signed in successfully.';
    }
    renderSubmissionDeck();
  } else {
    clearContributorSession();
    if (statusEl) {
      statusEl.textContent = 'Email or password was incorrect.';
    }
    renderSubmissionDeck();
  }

  form.reset();
}

window.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('submission-form');
  if (form) {
    form.addEventListener('submit', handleSubmission);
  }

  const adminForm = document.getElementById('admin-login-form');
  if (adminForm) {
    adminForm.addEventListener('submit', handleAdminLogin);
  }

  const contributorForm = document.getElementById('contributor-login-form');
  if (contributorForm) {
    contributorForm.addEventListener('submit', handleContributorLogin);
  }

  const logoutButton = document.getElementById('contributor-logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', function () {
      clearContributorSession();
      renderSubmissionDeck();
      const statusEl = document.getElementById('contributor-status');
      if (statusEl) {
        statusEl.textContent = 'You have been logged out.';
      }
    });
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }

    const action = button.getAttribute('data-action');
    const id = button.getAttribute('data-id');
    if (!action || !id) {
      return;
    }

    if (action === 'approve') {
      updateSubmissionStatus(id, 'approved');
    }

    if (action === 'reject') {
      updateSubmissionStatus(id, 'rejected');
    }
  });

  renderSubmissionDeck();
});
