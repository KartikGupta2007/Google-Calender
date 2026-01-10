import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // Language & Region
  language: string;
  region: string;
  dateFormat: 'DMY' | 'MDY';
  timeFormat: '12' | '24';

  // Time Zone
  primaryTimeZone: string;
  askUpdateTimeZone: boolean;

  // World Clock
  worldClockEnabled: boolean;

  // Event Settings
  defaultDuration: number;
  defaultVisibility: 'default' | 'public' | 'private';
  autoAddInvites: 'all' | 'when-respond' | 'never';
  guestCanModify: boolean;
  guestCanInvite: boolean;
  guestCanSeeList: boolean;

  // Notifications
  defaultNotificationTime: number;
  defaultNotificationType: 'notification' | 'email';

  // View Options
  showWeekends: boolean;
  reducePastBrightness: boolean;
  showDeclinedEvents: boolean;
  alternateCalendarEnabled: boolean;
  alternateCalendar: string;
  weekStartsOn: 'sun' | 'mon' | 'sat';
  defaultView: 'day' | 'week' | 'month' | 'year';

  // Working Hours
  workingHoursEnabled: boolean;
  workingLocation: 'unspecified' | 'office' | 'home';

  // Keyboard Shortcuts
  shortcutsEnabled: boolean;

  // Accessibility
  screenReaderNotifications: boolean;
  listViewForScreenReaders: boolean;

  // Actions
  updateLanguage: (language: string) => void;
  updateRegion: (region: string) => void;
  updateDateFormat: (format: 'DMY' | 'MDY') => void;
  updateTimeFormat: (format: '12' | '24') => void;
  updatePrimaryTimeZone: (timezone: string) => void;
  updateAskUpdateTimeZone: (enabled: boolean) => void;
  updateWorldClockEnabled: (enabled: boolean) => void;
  updateDefaultDuration: (duration: number) => void;
  updateDefaultVisibility: (visibility: 'default' | 'public' | 'private') => void;
  updateAutoAddInvites: (option: 'all' | 'when-respond' | 'never') => void;
  updateGuestCanModify: (enabled: boolean) => void;
  updateGuestCanInvite: (enabled: boolean) => void;
  updateGuestCanSeeList: (enabled: boolean) => void;
  updateDefaultNotificationTime: (time: number) => void;
  updateDefaultNotificationType: (type: 'notification' | 'email') => void;
  updateShowWeekends: (enabled: boolean) => void;
  updateReducePastBrightness: (enabled: boolean) => void;
  updateShowDeclinedEvents: (enabled: boolean) => void;
  updateAlternateCalendarEnabled: (enabled: boolean) => void;
  updateAlternateCalendar: (calendar: string) => void;
  updateWeekStartsOn: (day: 'sun' | 'mon' | 'sat') => void;
  updateDefaultView: (view: 'day' | 'week' | 'month' | 'year') => void;
  updateWorkingHoursEnabled: (enabled: boolean) => void;
  updateWorkingLocation: (location: 'unspecified' | 'office' | 'home') => void;
  updateShortcutsEnabled: (enabled: boolean) => void;
  updateScreenReaderNotifications: (enabled: boolean) => void;
  updateListViewForScreenReaders: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      language: 'en',
      region: 'us',
      dateFormat: 'DMY',
      timeFormat: '12',
      primaryTimeZone: 'Asia/Kolkata',
      askUpdateTimeZone: true,
      worldClockEnabled: false,
      defaultDuration: 30,
      defaultVisibility: 'default',
      autoAddInvites: 'when-respond',
      guestCanModify: false,
      guestCanInvite: true,
      guestCanSeeList: true,
      defaultNotificationTime: 30,
      defaultNotificationType: 'notification',
      showWeekends: true,
      reducePastBrightness: true,
      showDeclinedEvents: false,
      alternateCalendarEnabled: false,
      alternateCalendar: '',
      weekStartsOn: 'sun',
      defaultView: 'month',
      workingHoursEnabled: false,
      workingLocation: 'unspecified',
      shortcutsEnabled: true,
      screenReaderNotifications: false,
      listViewForScreenReaders: false,

      // Actions
      updateLanguage: (language) => set({ language }),
      updateRegion: (region) => set({ region }),
      updateDateFormat: (dateFormat) => set({ dateFormat }),
      updateTimeFormat: (timeFormat) => set({ timeFormat }),
      updatePrimaryTimeZone: (primaryTimeZone) => set({ primaryTimeZone }),
      updateAskUpdateTimeZone: (askUpdateTimeZone) => set({ askUpdateTimeZone }),
      updateWorldClockEnabled: (worldClockEnabled) => set({ worldClockEnabled }),
      updateDefaultDuration: (defaultDuration) => set({ defaultDuration }),
      updateDefaultVisibility: (defaultVisibility) => set({ defaultVisibility }),
      updateAutoAddInvites: (autoAddInvites) => set({ autoAddInvites }),
      updateGuestCanModify: (guestCanModify) => set({ guestCanModify }),
      updateGuestCanInvite: (guestCanInvite) => set({ guestCanInvite }),
      updateGuestCanSeeList: (guestCanSeeList) => set({ guestCanSeeList }),
      updateDefaultNotificationTime: (defaultNotificationTime) => set({ defaultNotificationTime }),
      updateDefaultNotificationType: (defaultNotificationType) => set({ defaultNotificationType }),
      updateShowWeekends: (showWeekends) => set({ showWeekends }),
      updateReducePastBrightness: (reducePastBrightness) => set({ reducePastBrightness }),
      updateShowDeclinedEvents: (showDeclinedEvents) => set({ showDeclinedEvents }),
      updateAlternateCalendarEnabled: (alternateCalendarEnabled) => set({ alternateCalendarEnabled }),
      updateAlternateCalendar: (alternateCalendar) => set({ alternateCalendar }),
      updateWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
      updateDefaultView: (defaultView) => set({ defaultView }),
      updateWorkingHoursEnabled: (workingHoursEnabled) => set({ workingHoursEnabled }),
      updateWorkingLocation: (workingLocation) => set({ workingLocation }),
      updateShortcutsEnabled: (shortcutsEnabled) => set({ shortcutsEnabled }),
      updateScreenReaderNotifications: (screenReaderNotifications) => set({ screenReaderNotifications }),
      updateListViewForScreenReaders: (listViewForScreenReaders) => set({ listViewForScreenReaders }),
    }),
    {
      name: 'calendar-settings',
    }
  )
);
