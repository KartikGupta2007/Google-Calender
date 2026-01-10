/**
 * Settings Module for Google Calendar Clone
 * Handles all settings behavior, state, routing, and persistence
 */

// ===== State Management =====
let settingsState = {
  language: 'en',
  region: 'us',
  dateFormat: 'DMY',
  timeFormat: '12',

  tzPrimary: 'Asia/Kolkata',
  tzSecondaryEnabled: false,
  tzSecondary: '',
  tzAskToUpdate: true,

  worldClockEnabled: false,
  worldClocks: [],

  defaultDuration: 30,
  defaultVisibility: 'default',
  autoAddInvites: 'when-respond',
  addUnknownInvitees: false,
  guestPermissions: {
    modify: false,
    inviteOthers: true,
    seeGuestList: true
  },

  notifyTimed: [
    { id: Date.now(), minutes: 30, method: 'notification' }
  ],
  notifyAllDay: [
    { id: Date.now() + 1, days: 1, method: 'notification' }
  ],

  viewShowWeekends: true,
  viewReducePast: true,
  viewShowDeclined: false,
  alternateCalendar: '',
  weekStartsOn: 'sun',
  defaultView: 'month',

  workingHoursEnabled: false,
  workingHours: {
    sun: { on: false, start: '09:00', end: '17:00' },
    mon: { on: true, start: '09:00', end: '17:00' },
    tue: { on: true, start: '09:00', end: '17:00' },
    wed: { on: true, start: '09:00', end: '17:00' },
    thu: { on: true, start: '09:00', end: '17:00' },
    fri: { on: true, start: '09:00', end: '17:00' },
    sat: { on: false, start: '09:00', end: '17:00' }
  },
  workingLocation: 'unspecified',
  workingOffice: '',

  shortcutsEnabled: true,
  a11yScreenReaderNotifs: false,
  a11yListView: false,

  calendars: [
    {
      id: 'cal-1',
      name: 'Kartik',
      color: '#039BE5',
      notificationsTimed: [],
      notificationsAllDay: []
    },
    {
      id: 'cal-2',
      name: 'Birthdays',
      color: '#0B8043',
      notificationsTimed: [],
      notificationsAllDay: []
    },
    {
      id: 'cal-3',
      name: 'Family',
      color: '#D50000',
      notificationsTimed: [],
      notificationsAllDay: []
    }
  ],

  trash: []
};

// ===== LocalStorage Persistence =====
const STORAGE_KEY = 'calendarSettings';
const STORAGE_VERSION = 1;

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === STORAGE_VERSION) {
        settingsState = { ...settingsState, ...parsed.data };
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

let saveTimeout;
function saveSettings() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        data: settingsState
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, 500); // Debounce
}

// ===== Event Emitters =====
function emitSettingsChanged(path, value) {
  document.dispatchEvent(new CustomEvent('settings:changed', {
    detail: { path, value },
    bubbles: true
  }));
  saveSettings();
}

function emitNavigate(sectionId) {
  document.dispatchEvent(new CustomEvent('settings:navigate', {
    detail: { sectionId },
    bubbles: true
  }));
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ===== Confirm Dialog =====
function confirmAction(message) {
  return confirm(message); // Simple confirm for now
}

// ===== Initialization =====
function init() {
  loadSettings();
  initNavigation();
  initSearch();
  initFormControls();
  initModals();
  initDynamicContent();
  hydrateFormFromState();
  setupEventListeners();

  // Handle initial hash
  if (window.location.hash) {
    navigateToSection(window.location.hash.substring(1));
  }
}

// ===== Navigation & Routing =====
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      navigateToSection(target);
    });
  });

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const sectionId = window.location.hash.substring(1);
    if (sectionId) {
      scrollToSection(sectionId);
      updateActiveNav(sectionId);
    }
  });

  // Scroll spy
  const content = document.getElementById('settingsContent');
  content.addEventListener('scroll', debounce(updateScrollSpy, 100));
}

function navigateToSection(sectionId) {
  window.location.hash = sectionId;
  scrollToSection(sectionId);
  updateActiveNav(sectionId);
  emitNavigate(sectionId);
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updateActiveNav(sectionId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.target === sectionId) {
      item.classList.add('active');
    }
  });
}

function updateScrollSpy() {
  const sections = document.querySelectorAll('.settings-section');
  const scrollPos = document.getElementById('settingsContent').scrollTop;

  let currentSection = '';
  sections.forEach(section => {
    const offsetTop = section.offsetTop - 100;
    if (scrollPos >= offsetTop) {
      currentSection = section.id;
    }
  });

  if (currentSection) {
    updateActiveNav(currentSection);
    if (window.location.hash !== `#${currentSection}`) {
      history.replaceState(null, '', `#${currentSection}`);
    }
  }
}

// ===== Search =====
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce(handleSearch, 300));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      handleSearch();
    }
  });
}

function handleSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const sections = document.querySelectorAll('.settings-section');

  if (!query) {
    // Show all sections
    sections.forEach(section => {
      section.style.display = '';
      section.style.opacity = '1';
    });
    return;
  }

  sections.forEach(section => {
    const title = section.querySelector('.section-title')?.textContent.toLowerCase() || '';
    const description = section.querySelector('.section-description')?.textContent.toLowerCase() || '';
    const labels = Array.from(section.querySelectorAll('label, .setting-label'))
      .map(el => el.textContent.toLowerCase())
      .join(' ');

    const matches = title.includes(query) || description.includes(query) || labels.includes(query);

    if (matches) {
      section.style.display = '';
      section.style.opacity = '1';
    } else {
      section.style.opacity = '0.3';
    }
  });
}

// ===== Form Controls =====
function initFormControls() {
  // Language & Region
  document.getElementById('language').addEventListener('change', (e) => {
    settingsState.language = e.target.value;
    emitSettingsChanged('general.language', e.target.value);
  });

  document.getElementById('region').addEventListener('change', (e) => {
    settingsState.region = e.target.value;
    emitSettingsChanged('general.region', e.target.value);
  });

  document.querySelectorAll('input[name="dateFormat"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      settingsState.dateFormat = e.target.value;
      emitSettingsChanged('general.dateFormat', e.target.value);
    });
  });

  document.querySelectorAll('input[name="timeFormat"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      settingsState.timeFormat = e.target.value;
      emitSettingsChanged('general.timeFormat', e.target.value);
    });
  });

  // Time Zone
  document.getElementById('primaryTz').addEventListener('change', (e) => {
    settingsState.tzPrimary = e.target.value;
    emitSettingsChanged('timezone.primary', e.target.value);
  });

  document.getElementById('secondaryTzEnabled').addEventListener('change', (e) => {
    settingsState.tzSecondaryEnabled = e.target.checked;
    document.getElementById('secondaryTzGroup').classList.toggle('hidden', !e.target.checked);
    emitSettingsChanged('timezone.secondaryEnabled', e.target.checked);
  });

  document.getElementById('secondaryTz').addEventListener('change', (e) => {
    settingsState.tzSecondary = e.target.value;
    emitSettingsChanged('timezone.secondary', e.target.value);
  });

  document.getElementById('askUpdateTz').addEventListener('change', (e) => {
    settingsState.tzAskToUpdate = e.target.checked;
    emitSettingsChanged('timezone.askToUpdate', e.target.checked);
  });

  // World Clock
  document.getElementById('worldClockEnabled').addEventListener('change', (e) => {
    settingsState.worldClockEnabled = e.target.checked;
    document.getElementById('worldClockList').classList.toggle('hidden', !e.target.checked);
    emitSettingsChanged('worldClock.enabled', e.target.checked);
  });

  document.getElementById('addWorldClock').addEventListener('click', addWorldClockRow);

  // Event Settings
  document.getElementById('defaultDuration').addEventListener('change', (e) => {
    settingsState.defaultDuration = parseInt(e.target.value);
    emitSettingsChanged('events.defaultDuration', parseInt(e.target.value));
  });

  document.getElementById('defaultVisibility').addEventListener('change', (e) => {
    settingsState.defaultVisibility = e.target.value;
    emitSettingsChanged('events.defaultVisibility', e.target.value);
  });

  document.getElementById('autoAddInvites').addEventListener('change', (e) => {
    settingsState.autoAddInvites = e.target.value;
    emitSettingsChanged('events.autoAddInvites', e.target.value);
  });

  document.getElementById('addUnknownInvitees').addEventListener('change', (e) => {
    settingsState.addUnknownInvitees = e.target.checked;
    emitSettingsChanged('events.addUnknownInvitees', e.target.checked);
  });

  ['guestModify', 'guestInvite', 'guestSeeList'].forEach(id => {
    document.getElementById(id).addEventListener('change', (e) => {
      const key = id.replace('guest', '').charAt(0).toLowerCase() + id.replace('guest', '').slice(1);
      settingsState.guestPermissions[key] = e.target.checked;
      emitSettingsChanged(`events.guestPermissions.${key}`, e.target.checked);
    });
  });

  // Notifications
  document.getElementById('addTimedNotification').addEventListener('click', () => addNotificationRow('timed'));
  document.getElementById('addAllDayNotification').addEventListener('click', () => addNotificationRow('allDay'));

  // View Options
  ['showWeekends', 'reducePast', 'showDeclined'].forEach(id => {
    document.getElementById(id).addEventListener('change', (e) => {
      const key = 'view' + id.charAt(0).toUpperCase() + id.slice(1);
      settingsState[key] = e.target.checked;
      emitSettingsChanged(`view.${id}`, e.target.checked);
    });
  });

  document.getElementById('alternateCalendarEnabled').addEventListener('change', (e) => {
    document.getElementById('alternateCalendarGroup').classList.toggle('hidden', !e.target.checked);
  });

  document.getElementById('alternateCalendar').addEventListener('change', (e) => {
    settingsState.alternateCalendar = e.target.value;
    emitSettingsChanged('view.alternateCalendar', e.target.value);
  });

  document.getElementById('weekStartsOn').addEventListener('change', (e) => {
    settingsState.weekStartsOn = e.target.value;
    emitSettingsChanged('view.weekStartsOn', e.target.value);
  });

  document.getElementById('defaultView').addEventListener('change', (e) => {
    settingsState.defaultView = e.target.value;
    emitSettingsChanged('view.defaultView', e.target.value);
  });

  // Working Hours
  document.getElementById('workingHoursEnabled').addEventListener('change', (e) => {
    settingsState.workingHoursEnabled = e.target.checked;
    document.getElementById('workingHoursGrid').classList.toggle('hidden', !e.target.checked);
    emitSettingsChanged('working.enabled', e.target.checked);
  });

  initWorkingHours();

  document.getElementById('workingLocation').addEventListener('change', (e) => {
    settingsState.workingLocation = e.target.value;
    const showOffice = e.target.value === 'office';
    document.getElementById('officeLocationGroup').classList.toggle('hidden', !showOffice);
    emitSettingsChanged('working.location', e.target.value);
  });

  document.getElementById('workingOffice').addEventListener('input', (e) => {
    settingsState.workingOffice = e.target.value;
    emitSettingsChanged('working.office', e.target.value);
  });

  // Keyboard Shortcuts
  document.getElementById('shortcutsEnabled').addEventListener('change', (e) => {
    settingsState.shortcutsEnabled = e.target.checked;
    emitSettingsChanged('shortcuts.enabled', e.target.checked);
  });

  // Accessibility
  document.getElementById('a11yScreenReaderNotifs').addEventListener('change', (e) => {
    settingsState.a11yScreenReaderNotifs = e.target.checked;
    emitSettingsChanged('a11y.screenReaderNotifs', e.target.checked);
  });

  document.getElementById('a11yListView').addEventListener('change', (e) => {
    settingsState.a11yListView = e.target.checked;
    emitSettingsChanged('a11y.listView', e.target.checked);
  });

  // Import & Export
  document.getElementById('importBtn').addEventListener('click', handleImport);
  document.getElementById('exportBtn').addEventListener('click', handleExport);

  // Trash
  document.getElementById('trashFilter').addEventListener('change', renderTrashList);
  document.getElementById('emptyTrashBtn').addEventListener('click', handleEmptyTrash);
}

// ===== Working Hours =====
function initWorkingHours() {
  const rows = document.querySelectorAll('.working-hours-row');
  rows.forEach(row => {
    const day = row.dataset.day;
    const checkbox = row.querySelector('input[type="checkbox"]');
    const selects = row.querySelectorAll('.time-select');

    checkbox.addEventListener('change', (e) => {
      settingsState.workingHours[day].on = e.target.checked;
      selects.forEach(select => select.disabled = !e.target.checked);
      emitSettingsChanged(`working.hours.${day}.on`, e.target.checked);
    });

    selects[0].addEventListener('change', (e) => {
      settingsState.workingHours[day].start = e.target.value;
      emitSettingsChanged(`working.hours.${day}.start`, e.target.value);
    });

    selects[1].addEventListener('change', (e) => {
      settingsState.workingHours[day].end = e.target.value;
      emitSettingsChanged(`working.hours.${day}.end`, e.target.value);
    });

    // Generate time options
    selects.forEach(select => {
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
          const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
          const period = h >= 12 ? 'PM' : 'AM';
          const label = `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          select.appendChild(option);
        }
      }
    });
  });
}

// ===== World Clock =====
function addWorldClockRow() {
  const container = document.getElementById('worldClockRows');
  const id = Date.now();

  const row = document.createElement('div');
  row.className = 'repeatable-row';
  row.dataset.id = id;
  row.innerHTML = `
    <select class="select-input">
      <option value="">Select time zone</option>
      <option value="America/New_York">Eastern Time - New York</option>
      <option value="America/Chicago">Central Time - Chicago</option>
      <option value="America/Los_Angeles">Pacific Time - Los Angeles</option>
      <option value="Asia/Kolkata">India Standard Time - Kolkata</option>
      <option value="Europe/London">London</option>
      <option value="Asia/Tokyo">Tokyo</option>
    </select>
    <input type="text" class="text-input" placeholder="Label (optional)">
    <button class="icon-btn" aria-label="Remove">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
      </svg>
    </button>
  `;

  container.appendChild(row);

  const select = row.querySelector('select');
  const input = row.querySelector('input');
  const removeBtn = row.querySelector('button');

  select.addEventListener('change', () => {
    updateWorldClocks();
  });

  input.addEventListener('input', () => {
    updateWorldClocks();
  });

  removeBtn.addEventListener('click', () => {
    row.remove();
    updateWorldClocks();
  });
}

function updateWorldClocks() {
  const rows = document.querySelectorAll('#worldClockRows .repeatable-row');
  settingsState.worldClocks = Array.from(rows).map(row => ({
    id: row.dataset.id,
    tz: row.querySelector('select').value,
    label: row.querySelector('input').value
  })).filter(wc => wc.tz);

  emitSettingsChanged('worldClock.clocks', settingsState.worldClocks);
}

// ===== Notifications =====
function addNotificationRow(type) {
  const containerId = type === 'timed' ? 'timedNotifications' : 'allDayNotifications';
  const container = document.getElementById(containerId);
  const id = Date.now();

  const row = document.createElement('div');
  row.className = 'repeatable-row';
  row.dataset.id = id;

  if (type === 'timed') {
    row.innerHTML = `
      <select class="select-input">
        <option value="0">At time of event</option>
        <option value="5">5 minutes before</option>
        <option value="10">10 minutes before</option>
        <option value="15">15 minutes before</option>
        <option value="30" selected>30 minutes before</option>
        <option value="60">1 hour before</option>
        <option value="120">2 hours before</option>
        <option value="1440">1 day before</option>
      </select>
      <select class="select-input">
        <option value="notification" selected>Notification</option>
        <option value="email">Email</option>
      </select>
      <button class="icon-btn" aria-label="Remove">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
        </svg>
      </button>
    `;
  } else {
    row.innerHTML = `
      <select class="select-input">
        <option value="0">On day of event</option>
        <option value="1" selected>1 day before</option>
        <option value="2">2 days before</option>
        <option value="7">1 week before</option>
      </select>
      <select class="select-input">
        <option value="notification" selected>Notification</option>
        <option value="email">Email</option>
      </select>
      <button class="icon-btn" aria-label="Remove">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
        </svg>
      </button>
    `;
  }

  container.appendChild(row);

  const selects = row.querySelectorAll('select');
  const removeBtn = row.querySelector('button');

  selects.forEach(select => {
    select.addEventListener('change', () => updateNotifications(type));
  });

  removeBtn.addEventListener('click', () => {
    row.remove();
    updateNotifications(type);
  });

  updateNotifications(type);
}

function updateNotifications(type) {
  const containerId = type === 'timed' ? 'timedNotifications' : 'allDayNotifications';
  const rows = document.querySelectorAll(`#${containerId} .repeatable-row`);
  const key = type === 'timed' ? 'notifyTimed' : 'notifyAllDay';
  const timeKey = type === 'timed' ? 'minutes' : 'days';

  settingsState[key] = Array.from(rows).map(row => {
    const selects = row.querySelectorAll('select');
    return {
      id: row.dataset.id,
      [timeKey]: parseInt(selects[0].value),
      method: selects[1].value
    };
  });

  emitSettingsChanged(`notifications.${type}`, settingsState[key]);
}

// ===== Dynamic Content =====
function initDynamicContent() {
  renderCalendarNav();
  renderNotifications();
  populateImportTarget();
  renderTrashList();
}

function renderCalendarNav() {
  const container = document.getElementById('calendarList');
  container.innerHTML = '';

  settingsState.calendars.forEach(cal => {
    const item = document.createElement('button');
    item.className = 'nav-item calendar-item';
    item.dataset.target = cal.id;
    item.textContent = cal.name;
    item.addEventListener('click', () => navigateToSection(cal.id));
    container.appendChild(item);

    // Create calendar section if not exists
    if (!document.getElementById(cal.id)) {
      createCalendarSection(cal);
    }
  });
}

function createCalendarSection(cal) {
  const content = document.getElementById('settingsContent');
  const section = document.createElement('section');
  section.id = cal.id;
  section.className = 'settings-section';
  section.innerHTML = `
    <h2 class="section-title">${cal.name}</h2>
    <p class="section-description">Settings for ${cal.name} calendar</p>

    <div class="setting-group">
      <label class="setting-label" for="${cal.id}-name">Calendar name</label>
      <input type="text" id="${cal.id}-name" class="text-input" value="${cal.name}">
    </div>

    <div class="setting-group">
      <label class="setting-label" for="${cal.id}-color">Calendar color</label>
      <input type="color" id="${cal.id}-color" class="text-input" value="${cal.color}">
    </div>

    <div class="setting-group">
      <h3 class="subsection-title">Calendar-specific notifications</h3>
      <div class="repeatable-list" id="${cal.id}-timed-notifications"></div>
      <button class="btn-secondary" onclick="addCalendarNotification('${cal.id}', 'timed')">Add notification</button>
    </div>

    <div class="setting-group">
      <button class="btn-destructive" onclick="removeCalendar('${cal.id}')">Remove calendar</button>
    </div>
  `;

  // Insert before import-export section
  const importExport = document.getElementById('import-export');
  content.insertBefore(section, importExport);
}

function renderNotifications() {
  const timedContainer = document.getElementById('timedNotifications');
  const allDayContainer = document.getElementById('allDayNotifications');

  timedContainer.innerHTML = '';
  allDayContainer.innerHTML = '';

  settingsState.notifyTimed.forEach(notif => {
    // Create row for timed notification
    addNotificationRow('timed');
    const row = timedContainer.lastElementChild;
    const selects = row.querySelectorAll('select');
    selects[0].value = notif.minutes;
    selects[1].value = notif.method;
    row.dataset.id = notif.id;
  });

  settingsState.notifyAllDay.forEach(notif => {
    // Create row for all-day notification
    addNotificationRow('allDay');
    const row = allDayContainer.lastElementChild;
    const selects = row.querySelectorAll('select');
    selects[0].value = notif.days;
    selects[1].value = notif.method;
    row.dataset.id = notif.id;
  });
}

function populateImportTarget() {
  const select = document.getElementById('importTarget');
  select.innerHTML = '';

  settingsState.calendars.forEach(cal => {
    const option = document.createElement('option');
    option.value = cal.id;
    option.textContent = cal.name;
    select.appendChild(option);
  });
}

function renderTrashList() {
  const container = document.getElementById('trashList');
  const filter = parseInt(document.getElementById('trashFilter').value);
  const now = Date.now();
  const cutoff = now - (filter * 24 * 60 * 60 * 1000);

  const filtered = settingsState.trash.filter(item => {
    const deletedAt = new Date(item.deletedAtISO).getTime();
    return deletedAt >= cutoff;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-state">No items in trash</p>';
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="trash-item">
      <div class="trash-item-info">
        <div class="trash-item-title">${item.title}</div>
        <div class="trash-item-meta">${item.whenISO} • ${item.calendarId}</div>
      </div>
      <div class="trash-item-actions">
        <button class="btn-secondary" onclick="restoreTrashItem('${item.id}')">Restore</button>
        <button class="btn-destructive" onclick="deleteTrashItem('${item.id}')">Delete forever</button>
      </div>
    </div>
  `).join('');
}

// ===== Import & Export =====
function handleImport() {
  const fileInput = document.getElementById('importFile');
  const targetCal = document.getElementById('importTarget').value;

  if (!fileInput.files.length) {
    showToast('Please select a file to import', 'error');
    return;
  }

  if (!targetCal) {
    showToast('Please select a target calendar', 'error');
    return;
  }

  const file = fileInput.files[0];

  // Emit event
  document.dispatchEvent(new CustomEvent('settings:import', {
    detail: { file, targetCalendarId: targetCal },
    bubbles: true
  }));

  showToast('Import started...', 'success');
}

function handleExport() {
  document.dispatchEvent(new CustomEvent('settings:export', {
    detail: { scope: 'all' },
    bubbles: true
  }));

  showToast('Exporting calendars...', 'success');
}

// ===== Trash Management =====
window.restoreTrashItem = function(eventId) {
  document.dispatchEvent(new CustomEvent('settings:trash:restore', {
    detail: { eventId },
    bubbles: true
  }));

  settingsState.trash = settingsState.trash.filter(item => item.id !== eventId);
  renderTrashList();
  saveSettings();
  showToast('Event restored', 'success');
};

window.deleteTrashItem = function(eventId) {
  if (!confirmAction('Delete this event forever? This cannot be undone.')) {
    return;
  }

  document.dispatchEvent(new CustomEvent('settings:trash:delete', {
    detail: { eventId },
    bubbles: true
  }));

  settingsState.trash = settingsState.trash.filter(item => item.id !== eventId);
  renderTrashList();
  saveSettings();
  showToast('Event deleted forever', 'success');
};

function handleEmptyTrash() {
  if (!confirmAction('Empty trash? All events will be permanently deleted. This cannot be undone.')) {
    return;
  }

  document.dispatchEvent(new CustomEvent('settings:trash:empty', {
    detail: {},
    bubbles: true
  }));

  settingsState.trash = [];
  renderTrashList();
  saveSettings();
  showToast('Trash emptied', 'success');
}

// ===== Modals =====
function initModals() {
  const modal = document.getElementById('shortcutsModal');
  const viewBtn = document.getElementById('viewShortcuts');
  const closeBtn = document.getElementById('closeModal');
  const backdrop = modal.querySelector('.modal-backdrop');

  viewBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    closeBtn.focus();
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    viewBtn.focus();
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // Trap focus in modal
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// ===== Header Actions =====
function setupEventListeners() {
  document.getElementById('backBtn').addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('closeBtn').addEventListener('click', () => {
    if (confirm('Close settings? Any unsaved changes will be lost.')) {
      window.close();
    }
  });

  document.getElementById('helpBtn').addEventListener('click', () => {
    window.open('https://support.google.com/calendar', '_blank');
  });
}

// ===== Hydrate Form from State =====
function hydrateFormFromState() {
  // Language & Region
  document.getElementById('language').value = settingsState.language;
  document.getElementById('region').value = settingsState.region;
  document.querySelector(`input[name="dateFormat"][value="${settingsState.dateFormat}"]`).checked = true;
  document.querySelector(`input[name="timeFormat"][value="${settingsState.timeFormat}"]`).checked = true;

  // Time Zone
  document.getElementById('primaryTz').value = settingsState.tzPrimary;
  document.getElementById('secondaryTzEnabled').checked = settingsState.tzSecondaryEnabled;
  document.getElementById('secondaryTz').value = settingsState.tzSecondary;
  document.getElementById('askUpdateTz').checked = settingsState.tzAskToUpdate;
  document.getElementById('secondaryTzGroup').classList.toggle('hidden', !settingsState.tzSecondaryEnabled);

  // World Clock
  document.getElementById('worldClockEnabled').checked = settingsState.worldClockEnabled;
  document.getElementById('worldClockList').classList.toggle('hidden', !settingsState.worldClockEnabled);

  // Event Settings
  document.getElementById('defaultDuration').value = settingsState.defaultDuration;
  document.getElementById('defaultVisibility').value = settingsState.defaultVisibility;
  document.getElementById('autoAddInvites').value = settingsState.autoAddInvites;
  document.getElementById('addUnknownInvitees').checked = settingsState.addUnknownInvitees;
  document.getElementById('guestModify').checked = settingsState.guestPermissions.modify;
  document.getElementById('guestInvite').checked = settingsState.guestPermissions.inviteOthers;
  document.getElementById('guestSeeList').checked = settingsState.guestPermissions.seeGuestList;

  // View Options
  document.getElementById('showWeekends').checked = settingsState.viewShowWeekends;
  document.getElementById('reducePast').checked = settingsState.viewReducePast;
  document.getElementById('showDeclined').checked = settingsState.viewShowDeclined;
  document.getElementById('alternateCalendar').value = settingsState.alternateCalendar;
  document.getElementById('weekStartsOn').value = settingsState.weekStartsOn;
  document.getElementById('defaultView').value = settingsState.defaultView;

  // Working Hours
  document.getElementById('workingHoursEnabled').checked = settingsState.workingHoursEnabled;
  document.getElementById('workingHoursGrid').classList.toggle('hidden', !settingsState.workingHoursEnabled);
  document.getElementById('workingLocation').value = settingsState.workingLocation;
  document.getElementById('workingOffice').value = settingsState.workingOffice;
  document.getElementById('officeLocationGroup').classList.toggle('hidden', settingsState.workingLocation !== 'office');

  // Keyboard Shortcuts
  document.getElementById('shortcutsEnabled').checked = settingsState.shortcutsEnabled;

  // Accessibility
  document.getElementById('a11yScreenReaderNotifs').checked = settingsState.a11yScreenReaderNotifs;
  document.getElementById('a11yListView').checked = settingsState.a11yListView;
}

// ===== Utilities =====
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ===== Initialize on DOM ready =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
