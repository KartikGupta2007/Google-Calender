// Offline Local Storage Database
// This replaces the Neon database with browser local storage

export interface OfflineEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  calendarId: string;
  calendarName: string;
  calendarColor: string;
  color: string | null; // Individual event color
  isAllDay?: boolean; // Whether event is all-day
  createdAt: string;
  updatedAt: string;
}

export interface OfflineUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export interface OfflineCalendar {
  id: string;
  name: string;
  color: string;
  description: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineContact {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface OfflineTask {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  listId: string;
  listName: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

class OfflineDatabase {
  private isSyncing: boolean = false;
  private isAutoLoading: boolean = false;

  // Helper to get current user ID for multi-user support
  private getUserPrefix(): string {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('current_user_id') || 'user_personal';
      return `${userId}_`;
    }
    return 'user_personal_';
  }

  // Dynamic keys that include user prefix for multi-user support
  private get EVENTS_KEY(): string {
    return `${this.getUserPrefix()}offline_calendar_events`;
  }

  private get USER_KEY(): string {
    return `${this.getUserPrefix()}offline_calendar_user`;
  }

  private get CALENDARS_KEY(): string {
    return `${this.getUserPrefix()}offline_calendar_calendars`;
  }

  private get CONTACTS_KEY(): string {
    return `${this.getUserPrefix()}offline_calendar_contacts`;
  }

  private get TASKS_KEY(): string {
    return `${this.getUserPrefix()}offline_calendar_tasks`;
  }

  private get TASK_LISTS_KEY(): string {
    return `${this.getUserPrefix()}offline_calendar_task_lists`;
  }

  // Helper to safely use localStorage (SSR-safe)
  private getStorage(): Storage | null {
    if (typeof window !== 'undefined') {
      return window.localStorage;
    }
    return null;
  }

  // User Management
  async getUser(): Promise<OfflineUser | null> {
    const storage = this.getStorage();
    if (!storage) return null;

    const userData = storage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  async setUser(user: OfflineUser): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;

    storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  async deleteUser(): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;

    storage.removeItem(this.USER_KEY);
  }

  // Event Management
  async getEvents(): Promise<OfflineEvent[]> {
    const storage = this.getStorage();
    if (!storage) return [];

    const eventsData = storage.getItem(this.EVENTS_KEY);
    const events = eventsData ? JSON.parse(eventsData) : [];
    const currentUser = this.getUserPrefix().replace('_', '');
    console.log(`[Get Events] User: ${currentUser}, Events: ${events.length}`);
    return events;
  }

  async getEvent(id: string): Promise<OfflineEvent | null> {
    const events = await this.getEvents();
    return events.find(event => event.id === id) || null;
  }

  async createEvent(event: Omit<OfflineEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfflineEvent> {
    const events = await this.getEvents();
    const now = new Date().toISOString();

    const newEvent: OfflineEvent = {
      ...event,
      color: event.color || null,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    events.push(newEvent);
    const storage = this.getStorage();
    if (storage) {
      const currentUser = this.getUserPrefix().replace('_', '');
      storage.setItem(this.EVENTS_KEY, JSON.stringify(events));
      console.log(`[Create Event] ✅ User: ${currentUser}, Event: "${newEvent.title}", Total events: ${events.length}`);
    }

    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<OfflineEvent>): Promise<OfflineEvent | null> {
    const events = await this.getEvents();
    const index = events.findIndex(event => event.id === id);

    if (index === -1) {
      console.log(`[Update Event] ❌ Event not found: ${id}`);
      return null;
    }

    const oldEvent = events[index];
    events[index] = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.EVENTS_KEY, JSON.stringify(events));
      console.log(`[Update Event] ✅ Updated ${id}:`, {
        title: events[index].title,
        oldDate: oldEvent.startDate,
        newDate: updates.startDate || oldEvent.startDate,
        oldEndDate: oldEvent.endDate,
        newEndDate: updates.endDate || oldEvent.endDate,
      });
    }

    return events[index];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const events = await this.getEvents();
    const filteredEvents = events.filter(event => event.id !== id);

    if (filteredEvents.length === events.length) return false;

    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.EVENTS_KEY, JSON.stringify(filteredEvents));
    }

    return true;
  }

  // Calendar Management
  async getCalendars(): Promise<OfflineCalendar[]> {
    const storage = this.getStorage();
    if (!storage) return this.getDefaultCalendars();

    const calendarsData = storage.getItem(this.CALENDARS_KEY);
    if (!calendarsData) {
      const defaultCalendars = this.getDefaultCalendars();
      storage.setItem(this.CALENDARS_KEY, JSON.stringify(defaultCalendars));
      return defaultCalendars;
    }
    return JSON.parse(calendarsData);
  }

  private getDefaultCalendars(): OfflineCalendar[] {
    return [
      {
        id: 'calendar_personal',
        name: 'Personal',
        color: '#039BE5',
        description: 'Personal events',
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'calendar_work',
        name: 'Work',
        color: '#3AA57A',
        description: 'Work events',
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'calendar_holidays',
        name: 'Holidays in India',
        color: '#0B8043',
        description: 'Indian national holidays',
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async updateCalendar(id: string, updates: Partial<OfflineCalendar>): Promise<OfflineCalendar | null> {
    const calendars = await this.getCalendars();
    const index = calendars.findIndex(cal => cal.id === id);

    if (index === -1) return null;

    calendars[index] = {
      ...calendars[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.CALENDARS_KEY, JSON.stringify(calendars));
    }

    return calendars[index];
  }

  // Contact Management
  async getContacts(): Promise<OfflineContact[]> {
    const storage = this.getStorage();
    if (!storage) return this.getDefaultContacts();

    const contactsData = storage.getItem(this.CONTACTS_KEY);
    if (!contactsData) {
      const defaultContacts = this.getDefaultContacts();
      storage.setItem(this.CONTACTS_KEY, JSON.stringify(defaultContacts));
      return defaultContacts;
    }
    return JSON.parse(contactsData);
  }

  private getDefaultContacts(): OfflineContact[] {
    return [
      {
        id: 'contact_1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '',
      },
      {
        id: 'contact_2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: '',
      },
      {
        id: 'contact_3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatar: '',
      },
    ];
  }

  async addContact(contact: Omit<OfflineContact, 'id'>): Promise<OfflineContact> {
    const contacts = await this.getContacts();
    const newContact: OfflineContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    contacts.push(newContact);
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    }

    return newContact;
  }

  // Task List Management
  async getTaskLists(): Promise<TaskList[]> {
    const storage = this.getStorage();
    if (!storage) return this.getDefaultTaskLists();

    const listsData = storage.getItem(this.TASK_LISTS_KEY);
    if (!listsData) {
      const defaultLists = this.getDefaultTaskLists();
      storage.setItem(this.TASK_LISTS_KEY, JSON.stringify(defaultLists));
      return defaultLists;
    }
    return JSON.parse(listsData);
  }

  private getDefaultTaskLists(): TaskList[] {
    return [
      {
        id: 'tasklist_default',
        name: 'My Tasks',
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createTaskList(list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskList> {
    const lists = await this.getTaskLists();
    const now = new Date().toISOString();

    const newList: TaskList = {
      ...list,
      id: `tasklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    lists.push(newList);
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.TASK_LISTS_KEY, JSON.stringify(lists));
    }

    return newList;
  }

  // Task Management
  async getTasks(): Promise<OfflineTask[]> {
    const storage = this.getStorage();
    if (!storage) return [];

    const tasksData = storage.getItem(this.TASKS_KEY);
    return tasksData ? JSON.parse(tasksData) : [];
  }

  async getTask(id: string): Promise<OfflineTask | null> {
    const tasks = await this.getTasks();
    return tasks.find(task => task.id === id) || null;
  }

  async createTask(task: Omit<OfflineTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfflineTask> {
    const tasks = await this.getTasks();
    const now = new Date().toISOString();

    const newTask: OfflineTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(newTask);
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    }

    return newTask;
  }

  async updateTask(id: string, updates: Partial<OfflineTask>): Promise<OfflineTask | null> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    }

    return tasks[index];
  }

  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);

    if (filteredTasks.length === tasks.length) return false;

    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.TASKS_KEY, JSON.stringify(filteredTasks));
    }

    return true;
  }

  async toggleTaskComplete(id: string): Promise<OfflineTask | null> {
    const task = await this.getTask(id);
    if (!task) return null;

    return this.updateTask(id, { completed: !task.completed });
  }

  // Generate sample events for a given month range
  generateSampleEvents(startYear: number, startMonth: number, monthCount: number = 6): OfflineEvent[] {
    const events: OfflineEvent[] = [];
    const eventTypes = [
      { title: 'Team Meeting', color: '#039BE5', calendar: 'calendar_work' },
      { title: 'Project Review', color: '#3AA57A', calendar: 'calendar_work' },
      { title: 'Client Call', color: '#039BE5', calendar: 'calendar_work' },
      { title: 'Dentist Appointment', color: '#7986CB', calendar: 'calendar_personal' },
      { title: 'Gym Session', color: '#7986CB', calendar: 'calendar_personal' },
      { title: 'Family Dinner', color: '#7986CB', calendar: 'calendar_personal' },
      { title: 'Code Review', color: '#3AA57A', calendar: 'calendar_work' },
      { title: 'Sprint Planning', color: '#039BE5', calendar: 'calendar_work' },
    ];

    for (let monthOffset = 0; monthOffset < monthCount; monthOffset++) {
      const currentMonth = startMonth + monthOffset;
      const year = startYear + Math.floor(currentMonth / 12);
      const month = currentMonth % 12;

      // Generate 8-12 events per month
      const eventsInMonth = 8 + Math.floor(Math.random() * 5);

      for (let i = 0; i < eventsInMonth; i++) {
        const day = 1 + Math.floor(Math.random() * 28); // Day 1-28 to avoid month-end issues
        const hour = 9 + Math.floor(Math.random() * 9); // 9 AM - 5 PM
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const duration = 1 + Math.floor(Math.random() * 2); // 1-2 hours

        const startDate = new Date(year, month, day, hour, 0, 0);
        const endDate = new Date(year, month, day, hour + duration, 0, 0);

        const eventId = `event_${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}_${i}`;

        events.push({
          id: eventId,
          title: `${eventType.title} - ${String(month + 1).padStart(2, '0')}/${day}`,
          description: `Auto-generated event for ${year}-${String(month + 1).padStart(2, '0')}`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: null,
          calendarId: eventType.calendar,
          calendarName: eventType.calendar === 'calendar_work' ? 'Work' : 'Personal',
          calendarColor: eventType.color,
          color: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return events;
  }

  // Check if we need to generate events for a given month
  async needsEventsForMonth(year: number, month: number): Promise<boolean> {
    const events = await this.getEvents();

    // Check if there are any events in this month (excluding holidays)
    const hasEventsInMonth = events.some(event => {
      if (event.id.startsWith('holiday_')) return false; // Ignore holidays

      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    return !hasEventsInMonth;
  }

  // Auto-load events when navigating to empty months
  async autoLoadEventsForMonth(year: number, month: number): Promise<void> {
    // Prevent concurrent auto-loads
    if (this.isAutoLoading) {
      return;
    }

    const storage = this.getStorage();
    if (!storage) return;

    this.isAutoLoading = true;

    try {
      // Check next and previous 2 months
      const monthsToCheck = [
        { year, month: month - 1 },
        { year, month },
        { year, month: month + 1 },
      ];

      let needsLoading = false;
      for (const { year: checkYear, month: checkMonth } of monthsToCheck) {
        const adjustedYear = checkYear + Math.floor(checkMonth / 12);
        const adjustedMonth = ((checkMonth % 12) + 12) % 12;

        if (await this.needsEventsForMonth(adjustedYear, adjustedMonth)) {
          needsLoading = true;
          break;
        }
      }

      if (!needsLoading) {
        console.log(`[AutoLoad] ℹ️ Month ${year}-${String(month + 1).padStart(2, '0')} already has events`);
        return;
      }

      console.log(`[AutoLoad] 🔄 Generating events for ${year}-${String(month + 1).padStart(2, '0')} and nearby months...`);

      // Generate events for 6 months: 2 before, current, 3 after
      const startMonth = month - 2;
      const newEvents = this.generateSampleEvents(year, startMonth, 6);

      // Get existing events and merge
      const existingEvents = await this.getEvents();
      const existingEventIds = new Set(existingEvents.map(e => e.id));

      // Only add events that don't already exist
      const eventsToAdd = newEvents.filter(e => !existingEventIds.has(e.id));

      if (eventsToAdd.length > 0) {
        const mergedEvents = [...existingEvents, ...eventsToAdd];
        storage.setItem(this.EVENTS_KEY, JSON.stringify(mergedEvents));
        console.log(`[AutoLoad] ✅ Added ${eventsToAdd.length} new events`);

        // Dispatch event to trigger UI refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('offline-event-created'));
        }
      }
    } finally {
      this.isAutoLoading = false;
    }
  }

  // Indian Holidays - Hardcoded for offline use
  getIndianHolidays2025(): OfflineEvent[] {
    const holidays = [
      { date: '2025-01-26', name: 'Republic Day' },
      { date: '2025-03-14', name: 'Holi' },
      { date: '2025-03-31', name: 'Id-Ul-Fitr (Ramadan)' },
      { date: '2025-04-10', name: 'Mahavir Jayanti' },
      { date: '2025-04-14', name: 'Dr. Ambedkar Jayanti' },
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-05-12', name: 'Buddha Purnima' },
      { date: '2025-06-07', name: 'Id-Ul-Zuha (Bakrid)' },
      { date: '2025-07-06', name: 'Muharram' },
      { date: '2025-08-15', name: 'Independence Day' },
      { date: '2025-08-16', name: 'Parsi New Year' },
      { date: '2025-08-27', name: 'Janmashtami' },
      { date: '2025-09-05', name: 'Milad-Un-Nabi' },
      { date: '2025-10-02', name: 'Mahatma Gandhi Jayanti' },
      { date: '2025-10-02', name: 'Dussehra' },
      { date: '2025-10-21', name: 'Diwali' },
      { date: '2025-11-05', name: 'Guru Nanak Jayanti' },
      { date: '2025-12-25', name: 'Christmas' },
    ];

    return holidays.map(holiday => ({
      id: `holiday_${holiday.date}`,
      title: holiday.name,
      description: 'National Holiday',
      startDate: `${holiday.date}T00:00:00`,
      endDate: `${holiday.date}T23:59:59`,
      location: null,
      calendarId: 'calendar_holidays',
      calendarName: 'Holidays in India',
      calendarColor: '#0B8043',
      color: null,
      isAllDay: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    const events = await this.getEvents();

    // Check if holidays already exist
    const hasHolidays = events.some(event => event.id.startsWith('holiday_'));

    if (!hasHolidays) {
      console.log('[Init] 🎄 Adding holiday events to localStorage');
      // Add Indian holidays for 2025
      const holidays = this.getIndianHolidays2025();

      // Merge with existing events (don't overwrite them)
      const mergedEvents = [...events, ...holidays];

      const storage = this.getStorage();
      if (storage) {
        storage.setItem(this.EVENTS_KEY, JSON.stringify(mergedEvents));
        console.log(`[Init] ✅ Added ${holidays.length} holidays to localStorage`);
      }
    } else {
      console.log('[Init] ℹ️ Holidays already exist in localStorage');
    }
  }

  // Sync from PostgreSQL database
  async syncFromDatabase(): Promise<void> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      console.log('[Sync] ⏭️ Sync already in progress, skipping...');
      return;
    }

    const storage = this.getStorage();
    if (!storage) return;

    this.isSyncing = true;
    console.log('[Sync] 🔄 Starting database sync...');

    try {
      // Fetch calendars from database
      const calendarsResponse = await fetch('/api/calendars');
      if (calendarsResponse.ok) {
        const dbCalendars = await calendarsResponse.json();
        const offlineCalendars: OfflineCalendar[] = dbCalendars.map((cal: any) => ({
          id: cal.id.toString(),
          name: cal.name,
          color: cal.color,
          description: cal.description || null,
          isVisible: cal.isVisible,
          createdAt: cal.createdAt || new Date().toISOString(),
          updatedAt: cal.updatedAt || new Date().toISOString(),
        }));
        storage.setItem(this.CALENDARS_KEY, JSON.stringify(offlineCalendars));
      }

      // Fetch events from database
      const eventsResponse = await fetch('/api/events');
      if (eventsResponse.ok) {
        const dbEvents = await eventsResponse.json();
        const dbOfflineEvents: OfflineEvent[] = dbEvents.map((event: any) => ({
          id: event.id.toString(),
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate || null,
          location: event.location || null,
          calendarId: event.calendarId ? event.calendarId.toString() : '',
          calendarName: '',  // Will be populated from calendar lookup
          calendarColor: '',  // Will be populated from calendar lookup
          color: event.color || null,  // Individual event color
          isAllDay: event.isAllDay || false,
          createdAt: event.createdAt || new Date().toISOString(),
          updatedAt: event.updatedAt || new Date().toISOString(),
        }));

        // Enrich events with calendar info
        const calendars = await this.getCalendars();
        const calendarMap = new Map(calendars.map(cal => [cal.id, cal]));

        dbOfflineEvents.forEach(event => {
          const calendar = calendarMap.get(event.calendarId);
          if (calendar) {
            event.calendarName = calendar.name;
            event.calendarColor = calendar.color;
          }
        });

        // IMPORTANT: Preserve ALL localStorage events and only add NEW events from database
        // Get existing events from localStorage
        const existingEvents = await this.getEvents();

        // Create a map of existing events by ID for quick lookup
        const existingEventsMap = new Map(existingEvents.map(event => [event.id, event]));

        // Log holiday events specifically
        const holidayEvents = existingEvents.filter(e => e.id.startsWith('holiday_'));
        console.log(`[Sync] 🎄 Found ${holidayEvents.length} holiday events in localStorage`);

        // Build merged list: prioritize localStorage versions over database versions
        const mergedEventsMap = new Map<string, OfflineEvent>();

        // First, add all existing localStorage events (these take precedence)
        existingEvents.forEach(event => {
          mergedEventsMap.set(event.id, event);
        });

        // Then, add database events ONLY if they don't already exist in localStorage
        // This prevents database from overwriting local modifications
        dbOfflineEvents.forEach(dbEvent => {
          if (!mergedEventsMap.has(dbEvent.id)) {
            mergedEventsMap.set(dbEvent.id, dbEvent);
            console.log(`[Sync] ➕ Adding new event from database: ${dbEvent.title} (${dbEvent.id})`);
          } else {
            // Event exists in localStorage - check if it's been modified
            const localEvent = existingEventsMap.get(dbEvent.id);
            if (localEvent && localEvent.updatedAt !== dbEvent.updatedAt) {
              console.log(`[Sync] 🔄 Preserving local changes for: ${localEvent.title} (${localEvent.id})`);
            }
          }
        });

        const mergedEvents = Array.from(mergedEventsMap.values());

        console.log(`[Sync] Database events: ${dbOfflineEvents.length}, Existing localStorage events: ${existingEvents.length}, Final merged: ${mergedEvents.length}`);

        storage.setItem(this.EVENTS_KEY, JSON.stringify(mergedEvents));
      }

      console.log('[Sync] ✅ Database sync completed successfully');
    } catch (error) {
      console.error('[Sync] ❌ Failed to sync from database:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;

    storage.removeItem(this.EVENTS_KEY);
    storage.removeItem(this.USER_KEY);
    storage.removeItem(this.CALENDARS_KEY);
    storage.removeItem(this.CONTACTS_KEY);
    storage.removeItem(this.TASKS_KEY);
    storage.removeItem(this.TASK_LISTS_KEY);
  }
}

export const offlineDb = new OfflineDatabase();
