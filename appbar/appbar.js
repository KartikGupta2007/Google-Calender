/**
 * Google Calendar App Bar - Interactions
 * All visuals are handled by styles.css
 * This file only wires event handlers and dispatches custom events
 */

(function() {
  'use strict';

  // Get all interactive elements
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const todayBtn = document.getElementById('today-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dateLabel = document.getElementById('date-label');
  const searchBtn = document.getElementById('search-btn');
  const helpBtn = document.getElementById('help-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const viewSelectorBtn = document.getElementById('view-selector-btn');
  const viewMenu = document.getElementById('view-menu');
  const viewLabel = document.getElementById('view-label');
  const segmentCalendar = document.getElementById('segment-calendar');
  const segmentTasks = document.getElementById('segment-tasks');
  const appsBtn = document.getElementById('apps-btn');
  const avatarBtn = document.getElementById('avatar-btn');

  // Current state
  let currentView = 'day';
  let currentSegment = 'calendar';
  let isViewMenuOpen = false;

  /**
   * Dispatch a custom event that bubbles
   * @param {string} name - Event name (e.g., 'appbar:today')
   * @param {Object} detail - Event detail data
   */
  function dispatchEvent(name, detail = {}) {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail
    });
    document.dispatchEvent(event);
  }

  /**
   * Updates the date label without layout shift
   * @param {string} text - New date text
   */
  function setCurrentLabel(text) {
    if (dateLabel) {
      dateLabel.textContent = text;
    }
  }

  /**
   * Open the view menu
   */
  function openViewMenu() {
    if (!viewMenu || !viewSelectorBtn) return;

    isViewMenuOpen = true;
    viewMenu.removeAttribute('hidden');
    viewSelectorBtn.setAttribute('aria-expanded', 'true');

    // Focus first menu item
    const firstItem = viewMenu.querySelector('[role="menuitem"]');
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * Close the view menu
   */
  function closeViewMenu() {
    if (!viewMenu || !viewSelectorBtn) return;

    isViewMenuOpen = false;
    viewMenu.setAttribute('hidden', '');
    viewSelectorBtn.setAttribute('aria-expanded', 'false');
    viewSelectorBtn.focus();
  }

  /**
   * Toggle view menu
   */
  function toggleViewMenu() {
    if (isViewMenuOpen) {
      closeViewMenu();
    } else {
      openViewMenu();
    }
  }

  /**
   * Handle view selection
   * @param {string} view - Selected view (day, week, month, year)
   */
  function selectView(view) {
    currentView = view;
    if (viewLabel) {
      viewLabel.textContent = view.charAt(0).toUpperCase() + view.slice(1);
    }
    closeViewMenu();
    dispatchEvent('appbar:view-change', { view });
  }

  /**
   * Toggle segment control
   * @param {string} segment - Selected segment (calendar or tasks)
   */
  function selectSegment(segment) {
    currentSegment = segment;

    if (segment === 'calendar') {
      segmentCalendar?.setAttribute('aria-checked', 'true');
      segmentCalendar?.setAttribute('tabindex', '0');
      segmentTasks?.setAttribute('aria-checked', 'false');
      segmentTasks?.setAttribute('tabindex', '-1');
    } else {
      segmentTasks?.setAttribute('aria-checked', 'true');
      segmentTasks?.setAttribute('tabindex', '0');
      segmentCalendar?.setAttribute('aria-checked', 'false');
      segmentCalendar?.setAttribute('tabindex', '-1');
    }

    dispatchEvent('appbar:segment', { segment });
  }

  /**
   * Handle keyboard navigation in menu
   * @param {KeyboardEvent} e
   * @param {HTMLElement} menu
   */
  function handleMenuKeyboard(e, menu) {
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    const currentIndex = items.indexOf(document.activeElement);

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex]?.focus();
        break;

      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;

      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;

      case 'Escape':
        e.preventDefault();
        closeViewMenu();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        const view = document.activeElement.dataset.view;
        if (view) {
          selectView(view);
        }
        break;
    }
  }

  /**
   * Handle button keyboard activation (Enter/Space)
   * @param {KeyboardEvent} e
   * @param {Function} callback
   */
  function handleButtonKeyboard(e, callback) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }

  // ===== Event Listeners =====

  // Today button
  todayBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:today');
  });
  todayBtn?.addEventListener('keydown', (e) => {
    handleButtonKeyboard(e, () => dispatchEvent('appbar:today'));
  });

  // Previous button
  prevBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:prev');
  });
  prevBtn?.addEventListener('keydown', (e) => {
    handleButtonKeyboard(e, () => dispatchEvent('appbar:prev'));
  });

  // Next button
  nextBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:next');
  });
  nextBtn?.addEventListener('keydown', (e) => {
    handleButtonKeyboard(e, () => dispatchEvent('appbar:next'));
  });

  // Search button
  searchBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:search-open');
  });
  searchBtn?.addEventListener('keydown', (e) => {
    handleButtonKeyboard(e, () => dispatchEvent('appbar:search-open'));
  });

  // Help button
  helpBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:help');
  });

  // Settings button
  settingsBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:settings');
  });

  // View selector button
  viewSelectorBtn?.addEventListener('click', toggleViewMenu);
  viewSelectorBtn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleViewMenu();
    } else if (e.key === 'Escape' && isViewMenuOpen) {
      e.preventDefault();
      closeViewMenu();
    }
  });

  // View menu items
  viewMenu?.addEventListener('click', (e) => {
    const menuItem = e.target.closest('[role="menuitem"]');
    if (menuItem) {
      const view = menuItem.dataset.view;
      if (view) {
        selectView(view);
      }
    }
  });

  // View menu keyboard navigation
  viewMenu?.addEventListener('keydown', (e) => {
    handleMenuKeyboard(e, viewMenu);
  });

  // Segment control - Calendar
  segmentCalendar?.addEventListener('click', () => {
    selectSegment('calendar');
  });
  segmentCalendar?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectSegment('calendar');
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      segmentTasks?.focus();
    }
  });

  // Segment control - Tasks
  segmentTasks?.addEventListener('click', () => {
    selectSegment('tasks');
  });
  segmentTasks?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectSegment('tasks');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      segmentCalendar?.focus();
    }
  });

  // Google apps button
  appsBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:apps');
  });

  // Avatar button
  avatarBtn?.addEventListener('click', () => {
    dispatchEvent('appbar:account-menu');
  });
  avatarBtn?.addEventListener('keydown', (e) => {
    handleButtonKeyboard(e, () => dispatchEvent('appbar:account-menu'));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isViewMenuOpen && !viewSelectorBtn?.contains(e.target) && !viewMenu?.contains(e.target)) {
      closeViewMenu();
    }
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape closes any open menu
    if (e.key === 'Escape' && isViewMenuOpen) {
      closeViewMenu();
    }
  });

  // Expose public API
  window.appbar = {
    setCurrentLabel,
    selectView,
    selectSegment
  };

})();
