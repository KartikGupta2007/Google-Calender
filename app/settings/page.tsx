"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/settings-store';
import './settings.css';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general-lang');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [worldClockZones, setWorldClockZones] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [notifications, setNotifications] = useState<{time: number, type: string}[]>([{time: 30, type: 'notification'}]);
  const [officeAddress, setOfficeAddress] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success'>('idle');
  const [workingHours, setWorkingHours] = useState({
    sun: { enabled: false, start: '09:00', end: '17:00' },
    mon: { enabled: true, start: '09:00', end: '17:00' },
    tue: { enabled: true, start: '09:00', end: '17:00' },
    wed: { enabled: true, start: '09:00', end: '17:00' },
    thu: { enabled: true, start: '09:00', end: '17:00' },
    fri: { enabled: true, start: '09:00', end: '17:00' },
    sat: { enabled: false, start: '09:00', end: '17:00' },
  });

  const settings = useSettingsStore();

  useEffect(() => {
    // Handle initial hash
    if (window.location.hash) {
      const section = window.location.hash.substring(1);
      setActiveSection(section);
      scrollToSection(section);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    window.location.hash = sectionId;
    scrollToSection(sectionId);
  };

  const addWorldClockZone = () => {
    setWorldClockZones([...worldClockZones, 'America/Los_Angeles']);
  };

  const removeWorldClockZone = (index: number) => {
    setWorldClockZones(worldClockZones.filter((_, i) => i !== index));
  };

  const updateWorldClockZone = (index: number, value: string) => {
    const updated = [...worldClockZones];
    updated[index] = value;
    setWorldClockZones(updated);
  };

  const addNotification = () => {
    setNotifications([...notifications, {time: 30, type: 'notification'}]);
  };

  const removeNotification = (index: number) => {
    if (notifications.length > 1) {
      setNotifications(notifications.filter((_, i) => i !== index));
    }
  };

  const updateNotification = (index: number, field: 'time' | 'type', value: string | number) => {
    const updated = [...notifications];
    updated[index] = { ...updated[index], [field]: value };
    setNotifications(updated);
  };

  const handleImport = () => {
    if (!importFile) {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
      return;
    }
    setImportStatus('importing');
    // Simulate import
    setTimeout(() => {
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    }, 1500);
  };

  const handleExport = () => {
    setExportStatus('exporting');
    // Simulate export
    setTimeout(() => {
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    }, 1000);
  };

  // Define all sections with searchable text
  const sections = [
    { id: 'general-lang', name: 'Language & region', keywords: 'language region country date format time format 12 24 hour dmy mdy' },
    { id: 'general-timezone', name: 'Time zone', keywords: 'time zone timezone primary location' },
    { id: 'general-worldclock', name: 'World clock', keywords: 'world clock timezone time zones' },
    { id: 'general-events', name: 'Event settings', keywords: 'event settings duration visibility guest permissions invitations default' },
    { id: 'general-notifications', name: 'Notifications', keywords: 'notifications alerts reminders email' },
    { id: 'general-view', name: 'View options', keywords: 'view options weekends declined events week starts default calendar display' },
    { id: 'general-working', name: 'Working hours & location', keywords: 'working hours location office home schedule' },
    { id: 'general-shortcuts', name: 'Keyboard shortcuts', keywords: 'keyboard shortcuts hotkeys keys' },
    { id: 'general-a11y', name: 'Accessibility', keywords: 'accessibility screen reader assistive' },
    { id: 'import-export', name: 'Import & export', keywords: 'import export ics file calendar data' },
    { id: 'trash', name: 'Trash', keywords: 'trash deleted events remove' },
  ];

  // Filter sections based on search query
  const filteredSections = searchQuery.trim()
    ? sections.filter(section => {
        const query = searchQuery.toLowerCase();
        return (
          section.name.toLowerCase().includes(query) ||
          section.keywords.toLowerCase().includes(query)
        );
      })
    : sections;

  // Check if a section should be visible
  const isSectionVisible = (sectionId: string) => {
    if (!searchQuery.trim()) return true;
    return filteredSections.some(s => s.id === sectionId);
  };

  return (
    <div className="settings-page">
      {/* Sticky Header */}
      <header className="settings-header">
        <div className="settings-header-left">
          <Link href="/" className="icon-btn" aria-label="Go back">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
            </svg>
          </Link>
          <h1 className="settings-title">Settings</h1>
        </div>
        <div className="settings-header-right">
          <div className="search-box">
            <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search settings"
              aria-label="Search settings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="icon-btn"
            aria-label="Help"
            onClick={() => alert('Settings Help\n\nUse the navigation on the left to browse different settings categories. Use the search box to quickly find specific settings. All changes are automatically saved.')}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" fill="currentColor"/>
            </svg>
          </button>
          <Link href="/" className="icon-btn" aria-label="Close settings">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </Link>
        </div>
      </header>

      {/* Two-pane body */}
      <div className="settings-body">
        {/* Left Sidebar Navigation */}
        <nav className="settings-nav" aria-label="Settings navigation">
          <div className="nav-list">
            <div className="nav-section">
              {isSectionVisible('general-lang') && (
                <button
                  className={`nav-item ${activeSection === 'general-lang' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-lang')}
                >
                  Language & region
                </button>
              )}
              {isSectionVisible('general-timezone') && (
                <button
                  className={`nav-item ${activeSection === 'general-timezone' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-timezone')}
                >
                  Time zone
                </button>
              )}
              {isSectionVisible('general-worldclock') && (
                <button
                  className={`nav-item ${activeSection === 'general-worldclock' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-worldclock')}
                >
                  World clock
                </button>
              )}
              {isSectionVisible('general-events') && (
                <button
                  className={`nav-item ${activeSection === 'general-events' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-events')}
                >
                  Event settings
                </button>
              )}
              {isSectionVisible('general-notifications') && (
                <button
                  className={`nav-item ${activeSection === 'general-notifications' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-notifications')}
                >
                  Notifications
                </button>
              )}
              {isSectionVisible('general-view') && (
                <button
                  className={`nav-item ${activeSection === 'general-view' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-view')}
                >
                  View options
                </button>
              )}
              {isSectionVisible('general-working') && (
                <button
                  className={`nav-item ${activeSection === 'general-working' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-working')}
                >
                  Working hours & location
                </button>
              )}
              {isSectionVisible('general-shortcuts') && (
                <button
                  className={`nav-item ${activeSection === 'general-shortcuts' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-shortcuts')}
                >
                  Keyboard shortcuts
                </button>
              )}
              {isSectionVisible('general-a11y') && (
                <button
                  className={`nav-item ${activeSection === 'general-a11y' ? 'active' : ''}`}
                  onClick={() => handleNavClick('general-a11y')}
                >
                  Accessibility
                </button>
              )}
            </div>

            {(isSectionVisible('import-export') || isSectionVisible('trash')) && (
              <div className="nav-section">
                {isSectionVisible('import-export') && (
                  <button
                    className={`nav-item ${activeSection === 'import-export' ? 'active' : ''}`}
                    onClick={() => handleNavClick('import-export')}
                  >
                    Import & export
                  </button>
                )}
                {isSectionVisible('trash') && (
                  <button
                    className={`nav-item ${activeSection === 'trash' ? 'active' : ''}`}
                    onClick={() => handleNavClick('trash')}
                  >
                    Trash
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right Content Panel */}
        <main className="settings-content" id="settingsContent">
          {/* Language & Region Section */}
          {isSectionVisible('general-lang') && (
          <section id="general-lang" className="settings-section">
            <h2 className="section-title">Language & region</h2>
            <p className="section-description">Customize how Calendar displays dates and times</p>

            <div className="setting-group">
              <label className="setting-label" htmlFor="language">Language</label>
              <select
                id="language"
                className="select-input"
                value={settings.language}
                onChange={(e) => settings.updateLanguage(e.target.value)}
              >
                <option value="en">English (United States)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label" htmlFor="region">Country/Region</label>
              <select
                id="region"
                className="select-input"
                value={settings.region}
                onChange={(e) => settings.updateRegion(e.target.value)}
              >
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="in">India</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
              </select>
            </div>

            <div className="setting-group">
              <fieldset className="radio-group">
                <legend className="setting-label">Date format</legend>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="dateFormat"
                    value="DMY"
                    checked={settings.dateFormat === 'DMY'}
                    onChange={(e) => settings.updateDateFormat(e.target.value as 'DMY')}
                  />
                  <span className="radio-text">Day/Month/Year (e.g., 02/11/2025)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="dateFormat"
                    value="MDY"
                    checked={settings.dateFormat === 'MDY'}
                    onChange={(e) => settings.updateDateFormat(e.target.value as 'MDY')}
                  />
                  <span className="radio-text">Month/Day/Year (e.g., 11/02/2025)</span>
                </label>
              </fieldset>
            </div>

            <div className="setting-group">
              <fieldset className="radio-group">
                <legend className="setting-label">Time format</legend>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="12"
                    checked={settings.timeFormat === '12'}
                    onChange={(e) => settings.updateTimeFormat(e.target.value as '12')}
                  />
                  <span className="radio-text">12-hour (3:00 PM)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="24"
                    checked={settings.timeFormat === '24'}
                    onChange={(e) => settings.updateTimeFormat(e.target.value as '24')}
                  />
                  <span className="radio-text">24-hour (15:00)</span>
                </label>
              </fieldset>
            </div>
          </section>
          )}

          {/* Time Zone Section */}
          {isSectionVisible('general-timezone') && (
          <section id="general-timezone" className="settings-section">
            <h2 className="section-title">Time zone</h2>
            <p className="section-description">Set your primary time zone</p>

            <div className="setting-group">
              <label className="setting-label" htmlFor="primaryTz">Primary time zone</label>
              <select
                id="primaryTz"
                className="select-input"
                value={settings.primaryTimeZone}
                onChange={(e) => settings.updatePrimaryTimeZone(e.target.value)}
              >
                <optgroup label="United States">
                  <option value="America/New_York">Eastern Time - New York (EST/EDT)</option>
                  <option value="America/Chicago">Central Time - Chicago (CST/CDT)</option>
                  <option value="America/Denver">Mountain Time - Denver (MST/MDT)</option>
                  <option value="America/Phoenix">Mountain Time - Phoenix (MST)</option>
                  <option value="America/Los_Angeles">Pacific Time - Los Angeles (PST/PDT)</option>
                  <option value="America/Anchorage">Alaska Time - Anchorage (AKST/AKDT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time - Honolulu (HST)</option>
                </optgroup>
                <optgroup label="Canada">
                  <option value="America/St_Johns">Newfoundland Time - St. John's</option>
                  <option value="America/Halifax">Atlantic Time - Halifax</option>
                  <option value="America/Toronto">Eastern Time - Toronto</option>
                  <option value="America/Winnipeg">Central Time - Winnipeg</option>
                  <option value="America/Edmonton">Mountain Time - Edmonton</option>
                  <option value="America/Vancouver">Pacific Time - Vancouver</option>
                </optgroup>
                <optgroup label="Latin America">
                  <option value="America/Mexico_City">Mexico City</option>
                  <option value="America/Sao_Paulo">São Paulo</option>
                  <option value="America/Buenos_Aires">Buenos Aires</option>
                  <option value="America/Caracas">Caracas</option>
                  <option value="America/Lima">Lima</option>
                  <option value="America/Bogota">Bogotá</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Dublin">Dublin</option>
                  <option value="Europe/Paris">Paris (CET/CEST)</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="Europe/Rome">Rome</option>
                  <option value="Europe/Madrid">Madrid</option>
                  <option value="Europe/Amsterdam">Amsterdam</option>
                  <option value="Europe/Brussels">Brussels</option>
                  <option value="Europe/Zurich">Zurich</option>
                  <option value="Europe/Vienna">Vienna</option>
                  <option value="Europe/Warsaw">Warsaw</option>
                  <option value="Europe/Athens">Athens (EET/EEST)</option>
                  <option value="Europe/Istanbul">Istanbul</option>
                  <option value="Europe/Moscow">Moscow</option>
                </optgroup>
                <optgroup label="Middle East">
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Asia/Jerusalem">Jerusalem</option>
                  <option value="Asia/Riyadh">Riyadh</option>
                  <option value="Asia/Tehran">Tehran</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="Asia/Kolkata">India Standard Time - Kolkata</option>
                  <option value="Asia/Karachi">Karachi</option>
                  <option value="Asia/Dhaka">Dhaka</option>
                  <option value="Asia/Bangkok">Bangkok</option>
                  <option value="Asia/Singapore">Singapore</option>
                  <option value="Asia/Hong_Kong">Hong Kong</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Seoul">Seoul</option>
                  <option value="Asia/Manila">Manila</option>
                </optgroup>
                <optgroup label="Australia & Pacific">
                  <option value="Australia/Perth">Perth</option>
                  <option value="Australia/Adelaide">Adelaide</option>
                  <option value="Australia/Darwin">Darwin</option>
                  <option value="Australia/Brisbane">Brisbane</option>
                  <option value="Australia/Sydney">Sydney</option>
                  <option value="Australia/Melbourne">Melbourne</option>
                  <option value="Pacific/Auckland">Auckland</option>
                  <option value="Pacific/Fiji">Fiji</option>
                </optgroup>
                <optgroup label="Africa">
                  <option value="Africa/Cairo">Cairo</option>
                  <option value="Africa/Johannesburg">Johannesburg</option>
                  <option value="Africa/Lagos">Lagos</option>
                  <option value="Africa/Nairobi">Nairobi</option>
                </optgroup>
              </select>
            </div>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.askUpdateTimeZone}
                  onChange={(e) => settings.updateAskUpdateTimeZone(e.target.checked)}
                />
                <span className="toggle-text">Ask to update my primary time zone to current location</span>
              </label>
            </div>
          </section>
          )}

          {/* World Clock Section */}
          {isSectionVisible('general-worldclock') && (
          <section id="general-worldclock" className="settings-section">
            <h2 className="section-title">World clock</h2>
            <p className="section-description">Show time zones for different locations</p>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.worldClockEnabled}
                  onChange={(e) => settings.updateWorldClockEnabled(e.target.checked)}
                />
                <span className="toggle-text">Show world clock</span>
              </label>
            </div>

            {settings.worldClockEnabled && (
              <div className="setting-group">
                <h3 className="subsection-title">Time zones</h3>
                {worldClockZones.map((zone, index) => (
                  <div key={index} className="repeatable-row" style={{ marginBottom: '8px' }}>
                    <select
                      className="select-input"
                      value={zone}
                      onChange={(e) => updateWorldClockZone(index, e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <optgroup label="United States">
                        <option value="America/New_York">Eastern Time - New York (EST/EDT)</option>
                        <option value="America/Chicago">Central Time - Chicago (CST/CDT)</option>
                        <option value="America/Denver">Mountain Time - Denver (MST/MDT)</option>
                        <option value="America/Phoenix">Mountain Time - Phoenix (MST)</option>
                        <option value="America/Los_Angeles">Pacific Time - Los Angeles (PST/PDT)</option>
                        <option value="America/Anchorage">Alaska Time - Anchorage (AKST/AKDT)</option>
                        <option value="Pacific/Honolulu">Hawaii Time - Honolulu (HST)</option>
                      </optgroup>
                      <optgroup label="Canada">
                        <option value="America/St_Johns">Newfoundland Time - St. John's</option>
                        <option value="America/Halifax">Atlantic Time - Halifax</option>
                        <option value="America/Toronto">Eastern Time - Toronto</option>
                        <option value="America/Winnipeg">Central Time - Winnipeg</option>
                        <option value="America/Edmonton">Mountain Time - Edmonton</option>
                        <option value="America/Vancouver">Pacific Time - Vancouver</option>
                      </optgroup>
                      <optgroup label="Latin America">
                        <option value="America/Mexico_City">Mexico City</option>
                        <option value="America/Sao_Paulo">São Paulo</option>
                        <option value="America/Buenos_Aires">Buenos Aires</option>
                        <option value="America/Caracas">Caracas</option>
                        <option value="America/Lima">Lima</option>
                        <option value="America/Bogota">Bogotá</option>
                      </optgroup>
                      <optgroup label="Europe">
                        <option value="Europe/London">London (GMT/BST)</option>
                        <option value="Europe/Dublin">Dublin</option>
                        <option value="Europe/Paris">Paris (CET/CEST)</option>
                        <option value="Europe/Berlin">Berlin</option>
                        <option value="Europe/Rome">Rome</option>
                        <option value="Europe/Madrid">Madrid</option>
                        <option value="Europe/Amsterdam">Amsterdam</option>
                        <option value="Europe/Brussels">Brussels</option>
                        <option value="Europe/Zurich">Zurich</option>
                        <option value="Europe/Vienna">Vienna</option>
                        <option value="Europe/Warsaw">Warsaw</option>
                        <option value="Europe/Athens">Athens (EET/EEST)</option>
                        <option value="Europe/Istanbul">Istanbul</option>
                        <option value="Europe/Moscow">Moscow</option>
                      </optgroup>
                      <optgroup label="Middle East">
                        <option value="Asia/Dubai">Dubai</option>
                        <option value="Asia/Jerusalem">Jerusalem</option>
                        <option value="Asia/Riyadh">Riyadh</option>
                        <option value="Asia/Tehran">Tehran</option>
                      </optgroup>
                      <optgroup label="Asia">
                        <option value="Asia/Kolkata">India Standard Time - Kolkata</option>
                        <option value="Asia/Karachi">Karachi</option>
                        <option value="Asia/Dhaka">Dhaka</option>
                        <option value="Asia/Bangkok">Bangkok</option>
                        <option value="Asia/Singapore">Singapore</option>
                        <option value="Asia/Hong_Kong">Hong Kong</option>
                        <option value="Asia/Shanghai">Shanghai</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                        <option value="Asia/Seoul">Seoul</option>
                        <option value="Asia/Manila">Manila</option>
                      </optgroup>
                      <optgroup label="Australia & Pacific">
                        <option value="Australia/Perth">Perth</option>
                        <option value="Australia/Adelaide">Adelaide</option>
                        <option value="Australia/Darwin">Darwin</option>
                        <option value="Australia/Brisbane">Brisbane</option>
                        <option value="Australia/Sydney">Sydney</option>
                        <option value="Australia/Melbourne">Melbourne</option>
                        <option value="Pacific/Auckland">Auckland</option>
                        <option value="Pacific/Fiji">Fiji</option>
                      </optgroup>
                      <optgroup label="Africa">
                        <option value="Africa/Cairo">Cairo</option>
                        <option value="Africa/Johannesburg">Johannesburg</option>
                        <option value="Africa/Lagos">Lagos</option>
                        <option value="Africa/Nairobi">Nairobi</option>
                      </optgroup>
                    </select>
                    <button
                      onClick={() => removeWorldClockZone(index)}
                      className="icon-btn"
                      aria-label="Remove time zone"
                      style={{ marginLeft: '8px' }}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                ))}
                <button onClick={addWorldClockZone} className="btn-secondary" style={{ marginTop: '8px' }}>
                  Add time zone
                </button>
              </div>
            )}
          </section>
          )}

          {/* Event Settings Section */}
          {isSectionVisible('general-events') && (
          <section id="general-events" className="settings-section">
            <h2 className="section-title">Event settings</h2>
            <p className="section-description">Default settings for new events</p>

            <div className="setting-group">
              <label className="setting-label" htmlFor="defaultDuration">Default duration</label>
              <select
                id="defaultDuration"
                className="select-input"
                value={settings.defaultDuration}
                onChange={(e) => settings.updateDefaultDuration(Number(e.target.value))}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label" htmlFor="defaultVisibility">Default visibility</label>
              <select
                id="defaultVisibility"
                className="select-input"
                value={settings.defaultVisibility}
                onChange={(e) => settings.updateDefaultVisibility(e.target.value as any)}
              >
                <option value="default">Default</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label" htmlFor="autoAddInvites">Automatically add invitations</label>
              <select
                id="autoAddInvites"
                className="select-input"
                value={settings.autoAddInvites}
                onChange={(e) => settings.updateAutoAddInvites(e.target.value as any)}
              >
                <option value="all">Add all invitations to my calendar</option>
                <option value="when-respond">Only when I respond to the invitation</option>
                <option value="never">Don't automatically add invitations</option>
              </select>
            </div>

            <div className="setting-group">
              <fieldset className="checkbox-group">
                <legend className="setting-label">Default guest permissions</legend>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={settings.guestCanModify}
                    onChange={(e) => settings.updateGuestCanModify(e.target.checked)}
                  />
                  <span className="checkbox-text">Modify event</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={settings.guestCanInvite}
                    onChange={(e) => settings.updateGuestCanInvite(e.target.checked)}
                  />
                  <span className="checkbox-text">Invite others</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={settings.guestCanSeeList}
                    onChange={(e) => settings.updateGuestCanSeeList(e.target.checked)}
                  />
                  <span className="checkbox-text">See guest list</span>
                </label>
              </fieldset>
            </div>
          </section>
          )}

          {/* Notifications Section */}
          {isSectionVisible('general-notifications') && (
          <section id="general-notifications" className="settings-section">
            <h2 className="section-title">Notifications</h2>
            <p className="section-description">Set default notifications for events</p>

            <div className="setting-group">
              <h3 className="subsection-title">Default event notifications</h3>
              {notifications.map((notif, index) => (
                <div key={index} className="repeatable-row" style={{ marginBottom: '8px' }}>
                  <select
                    className="select-input"
                    value={notif.time}
                    onChange={(e) => updateNotification(index, 'time', Number(e.target.value))}
                    style={{ flex: 1 }}
                  >
                    <option value="0">At time of event</option>
                    <option value="5">5 minutes before</option>
                    <option value="10">10 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="120">2 hours before</option>
                    <option value="1440">1 day before</option>
                  </select>
                  <select
                    className="select-input"
                    value={notif.type}
                    onChange={(e) => updateNotification(index, 'type', e.target.value)}
                    style={{ flex: 1, marginLeft: '8px' }}
                  >
                    <option value="notification">Notification</option>
                    <option value="email">Email</option>
                  </select>
                  {notifications.length > 1 && (
                    <button
                      onClick={() => removeNotification(index)}
                      className="icon-btn"
                      aria-label="Remove notification"
                      style={{ marginLeft: '8px' }}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addNotification} className="btn-secondary" style={{ marginTop: '8px' }}>
                Add notification
              </button>
            </div>
          </section>
          )}

          {/* View Options Section */}
          {isSectionVisible('general-view') && (
          <section id="general-view" className="settings-section">
            <h2 className="section-title">View options</h2>
            <p className="section-description">Customize how your calendar looks</p>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.showWeekends}
                  onChange={(e) => settings.updateShowWeekends(e.target.checked)}
                />
                <span className="toggle-text">Show weekends</span>
              </label>
            </div>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.reducePastBrightness}
                  onChange={(e) => settings.updateReducePastBrightness(e.target.checked)}
                />
                <span className="toggle-text">Reduce brightness of past events</span>
              </label>
            </div>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.showDeclinedEvents}
                  onChange={(e) => settings.updateShowDeclinedEvents(e.target.checked)}
                />
                <span className="toggle-text">Show declined events</span>
              </label>
            </div>

            <div className="setting-group">
              <label className="setting-label" htmlFor="weekStartsOn">Week starts on</label>
              <select
                id="weekStartsOn"
                className="select-input"
                value={settings.weekStartsOn}
                onChange={(e) => settings.updateWeekStartsOn(e.target.value as any)}
              >
                <option value="sun">Sunday</option>
                <option value="mon">Monday</option>
                <option value="sat">Saturday</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label" htmlFor="defaultView">Default view</label>
              <select
                id="defaultView"
                className="select-input"
                value={settings.defaultView}
                onChange={(e) => settings.updateDefaultView(e.target.value as any)}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.alternateCalendarEnabled}
                  onChange={(e) => settings.updateAlternateCalendarEnabled(e.target.checked)}
                />
                <span className="toggle-text">Show alternate calendar</span>
              </label>
            </div>

            {settings.alternateCalendarEnabled && (
              <div className="setting-group">
                <label className="setting-label" htmlFor="alternateCalendar">Alternate calendar</label>
                <select
                  id="alternateCalendar"
                  className="select-input"
                  value={settings.alternateCalendar}
                  onChange={(e) => settings.updateAlternateCalendar(e.target.value)}
                >
                  <option value="">Select calendar type</option>
                  <option value="hindu">Hindu calendar</option>
                  <option value="islamic">Islamic calendar (Hijri)</option>
                  <option value="hebrew">Hebrew calendar</option>
                  <option value="chinese">Chinese calendar</option>
                  <option value="persian">Persian calendar</option>
                </select>
              </div>
            )}
          </section>
          )}

          {/* Working Hours & Location Section */}
          {isSectionVisible('general-working') && (
          <section id="general-working" className="settings-section">
            <h2 className="section-title">Working hours & location</h2>
            <p className="section-description">Set your typical working schedule</p>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.workingHoursEnabled}
                  onChange={(e) => settings.updateWorkingHoursEnabled(e.target.checked)}
                />
                <span className="toggle-text">Enable working hours</span>
              </label>
            </div>

            {settings.workingHoursEnabled && (
              <div className="setting-group">
                <h3 className="subsection-title">Working hours</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label className="checkbox-label" style={{ minWidth: '100px', margin: 0 }}>
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={hours.enabled}
                          onChange={(e) => setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, enabled: e.target.checked }
                          })}
                        />
                        <span className="checkbox-text" style={{ textTransform: 'capitalize' }}>
                          {day === 'sun' ? 'Sunday' : day === 'mon' ? 'Monday' : day === 'tue' ? 'Tuesday' :
                           day === 'wed' ? 'Wednesday' : day === 'thu' ? 'Thursday' : day === 'fri' ? 'Friday' : 'Saturday'}
                        </span>
                      </label>
                      {hours.enabled && (
                        <>
                          <input
                            type="time"
                            className="select-input"
                            value={hours.start}
                            onChange={(e) => setWorkingHours({
                              ...workingHours,
                              [day]: { ...hours, start: e.target.value }
                            })}
                            style={{ width: '120px' }}
                          />
                          <span style={{ color: 'var(--gm3-sys-color-on-surface)' }}>to</span>
                          <input
                            type="time"
                            className="select-input"
                            value={hours.end}
                            onChange={(e) => setWorkingHours({
                              ...workingHours,
                              [day]: { ...hours, end: e.target.value }
                            })}
                            style={{ width: '120px' }}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="setting-group">
              <label className="setting-label" htmlFor="workingLocation">Working location</label>
              <select
                id="workingLocation"
                className="select-input"
                value={settings.workingLocation}
                onChange={(e) => settings.updateWorkingLocation(e.target.value as any)}
              >
                <option value="unspecified">Unspecified</option>
                <option value="office">Office</option>
                <option value="home">Home</option>
              </select>
            </div>

            {settings.workingLocation === 'office' && (
              <div className="setting-group">
                <label className="setting-label" htmlFor="officeAddress">Office address</label>
                <input
                  type="text"
                  id="officeAddress"
                  className="select-input"
                  placeholder="Enter office address"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                />
              </div>
            )}
          </section>
          )}

          {/* Keyboard Shortcuts Section */}
          {isSectionVisible('general-shortcuts') && (
          <section id="general-shortcuts" className="settings-section">
            <h2 className="section-title">Keyboard shortcuts</h2>
            <p className="section-description">Use keyboard shortcuts to navigate Calendar faster</p>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.shortcutsEnabled}
                  onChange={(e) => settings.updateShortcutsEnabled(e.target.checked)}
                />
                <span className="toggle-text">Enable keyboard shortcuts</span>
              </label>
            </div>

            {settings.shortcutsEnabled && (
              <div className="setting-group">
                <button onClick={() => setShowShortcutsModal(true)} className="btn-secondary">
                  View keyboard shortcuts
                </button>
              </div>
            )}
          </section>
          )}

          {/* Accessibility Section */}
          {isSectionVisible('general-a11y') && (
          <section id="general-a11y" className="settings-section">
            <h2 className="section-title">Accessibility</h2>
            <p className="section-description">Make Calendar easier to use with assistive technologies</p>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.screenReaderNotifications}
                  onChange={(e) => settings.updateScreenReaderNotifications(e.target.checked)}
                />
                <span className="toggle-text">Enable screen reader notifications</span>
              </label>
            </div>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={settings.listViewForScreenReaders}
                  onChange={(e) => settings.updateListViewForScreenReaders(e.target.checked)}
                />
                <span className="toggle-text">Use list view for screen readers</span>
              </label>
            </div>
          </section>
          )}

          {/* Import & Export Section */}
          {isSectionVisible('import-export') && (
          <section id="import-export" className="settings-section">
            <h2 className="section-title">Import & export</h2>
            <p className="section-description">Import events from other calendars or export your calendar data</p>

            <div className="setting-group">
              <h3 className="subsection-title">Import</h3>
              <label className="setting-label" htmlFor="importFile">Select file to import (.ics)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                <label
                  htmlFor="importFile"
                  className="btn-secondary"
                  style={{ cursor: 'pointer', margin: 0, display: 'inline-block' }}
                >
                  Choose file
                </label>
                <input
                  type="file"
                  id="importFile"
                  accept=".ics"
                  style={{ display: 'none' }}
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                {importFile && (
                  <span style={{ color: 'var(--gm3-sys-color-on-surface)', fontSize: '14px' }}>
                    {importFile.name}
                  </span>
                )}
              </div>

              <label className="setting-label" htmlFor="importTarget" style={{ marginTop: '16px' }}>Import to calendar</label>
              <select id="importTarget" className="select-input">
                <option value="">Select calendar</option>
                <option value="primary">Primary Calendar</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
              </select>

              <div style={{ marginTop: '16px' }}>
                <button
                  className="btn-primary"
                  onClick={handleImport}
                  disabled={importStatus === 'importing'}
                  style={{
                    opacity: importStatus === 'importing' ? 0.6 : 1,
                    cursor: importStatus === 'importing' ? 'not-allowed' : 'pointer'
                  }}
                >
                  {importStatus === 'importing' ? 'Importing...' : importStatus === 'success' ? 'Import successful!' : 'Import'}
                </button>
                {importStatus === 'error' && (
                  <p style={{ color: 'var(--gm3-sys-color-error)', fontSize: '14px', marginTop: '8px' }}>
                    Please select a file first
                  </p>
                )}
              </div>
            </div>

            <div className="setting-group">
              <h3 className="subsection-title">Export</h3>
              <p className="helper-text">Export all your calendar events to a .ics file</p>
              <button
                className="btn-secondary"
                onClick={handleExport}
                disabled={exportStatus === 'exporting'}
                style={{
                  opacity: exportStatus === 'exporting' ? 0.6 : 1,
                  cursor: exportStatus === 'exporting' ? 'not-allowed' : 'pointer'
                }}
              >
                {exportStatus === 'exporting' ? 'Exporting...' : exportStatus === 'success' ? 'Export successful!' : 'Export all calendars'}
              </button>
            </div>
          </section>
          )}

          {/* Trash Section */}
          {isSectionVisible('trash') && (
          <section id="trash" className="settings-section">
            <h2 className="section-title">Trash</h2>
            <p className="section-description">View and manage deleted events</p>

            <div className="setting-group">
              <label className="setting-label" htmlFor="trashFilter">Show events from</label>
              <select id="trashFilter" className="select-input">
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div className="setting-group">
              <div className="trash-list">
                <p className="empty-state">No items in trash</p>
              </div>
            </div>

            <div className="setting-group">
              <button className="btn-destructive">Empty trash</button>
            </div>
          </section>
          )}
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            style={{
              background: 'var(--gm3-sys-color-surface-container)',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              color: 'var(--gm3-sys-color-on-surface)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Keyboard shortcuts</h2>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="icon-btn"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Navigation</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Next period</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>k or n</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Previous period</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>j or p</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Go to today</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>t</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Views</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Day view</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>d</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Week view</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>w</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Month view</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>m</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Year view</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>y</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Actions</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Create event</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>c</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Search</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>/</kbd>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Settings</span>
                    <kbd style={{ padding: '2px 8px', background: 'var(--gm3-sys-color-surface)', borderRadius: '4px' }}>s</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
