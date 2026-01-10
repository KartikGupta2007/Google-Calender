import dayjs, { Dayjs } from "dayjs";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { getMonth } from "./getTime";

interface ViewStoreType {
  selectedView: string;
  setView: (value: string) => void;
}

interface DateStoreType {
  userSelectedDate: Dayjs;
  setDate: (value: Dayjs) => void;
  selectedEndDate?: Dayjs;
  setEndDate: (value: Dayjs | undefined) => void;
  twoDMonthArray: dayjs.Dayjs[][];
  selectedMonthIndex: number;
  selectedYear: number;
  setMonth: (index: number) => void;
  setYear: (year: number) => void;
}

export type CalendarEventType = {
  id: string;
  title: string;
  date: dayjs.Dayjs;
  description: string;
  location?: string;
  endDate?: dayjs.Dayjs;
  attendees?: string[];
  conferenceLink?: string;
  creator?: string;
  organizer?: string;
  calendarId?: string;
  calendarName?: string;
  calendarColor?: string;
  isAllDay?: boolean;
};

type EventStore = {
  events: CalendarEventType[];
  isPopoverOpen: boolean;
  isEventSummaryOpen: boolean;
  selectedEvent: CalendarEventType | null;
  setEvents: (events: CalendarEventType[]) => void;
  updateEvent: (event: CalendarEventType) => void;
  deleteEvent: (eventId: string) => void;
  openPopover: () => void;
  closePopover: () => void;
  openEventSummary: (event: CalendarEventType) => void;
  closeEventSummary: () => void;
};

interface ToggleSideBarType {
  isSideBarOpen: boolean;
  setSideBarOpen: () => void;
}

export const useViewStore = create<ViewStoreType>()(
  devtools(
    persist(
      (set) => ({
        selectedView: "month",
        setView: (value: string) => {
          set({ selectedView: value });
        },
      }),
      { name: "calendar_view", skipHydration: true },
    ),
  ),
);

export const useDateStore = create<DateStoreType>()(
  devtools(
    persist(
      (set, get) => ({
        userSelectedDate: dayjs(),
        selectedEndDate: undefined,
        twoDMonthArray: getMonth(),
        selectedMonthIndex: dayjs().month(),
        selectedYear: dayjs().year(),
        setDate: (value: Dayjs) => {
          set({ userSelectedDate: value });
        },
        setEndDate: (value: Dayjs | undefined) => {
          set({ selectedEndDate: value });
        },
        setMonth: (index) => {
          const { selectedYear } = get();
          set({ twoDMonthArray: getMonth(index, selectedYear), selectedMonthIndex: index });
        },
        setYear: (year: number) => {
          const { selectedMonthIndex } = get();
          set({ selectedYear: year, twoDMonthArray: getMonth(selectedMonthIndex, year) });
        },
      }),
      { name: "date_data", skipHydration: true },
    ),
  ),
);

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  isPopoverOpen: false,
  isEventSummaryOpen: false,
  selectedEvent: null,
  setEvents: (events) => set({ events }),
  updateEvent: (updatedEvent) => {
    console.log('[Store] Updating event:', {
      id: updatedEvent.id,
      title: updatedEvent.title,
      newDate: updatedEvent.date.format('YYYY-MM-DD HH:mm'),
      newEndDate: updatedEvent.endDate?.format('YYYY-MM-DD HH:mm'),
    });

    // Update in-memory store
    set((state) => ({
      events: state.events.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    }));

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      import('@/lib/offline-db').then(({ offlineDb }) => {
        offlineDb.updateEvent(updatedEvent.id, {
          title: updatedEvent.title,
          description: updatedEvent.description,
          startDate: updatedEvent.date.toISOString(),
          endDate: updatedEvent.endDate?.toISOString() || null,
          location: updatedEvent.location || null,
          calendarId: updatedEvent.calendarId || 'calendar_personal',
          calendarName: updatedEvent.calendarName || 'Personal',
          calendarColor: updatedEvent.calendarColor || '#039BE5',
        }).then(() => {
          console.log('[Store] ✅ Event persisted to localStorage');
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('offline-event-updated'));
        });
      });
    }
  },
  deleteEvent: (eventId) => {
    // Remove from in-memory store
    set((state) => ({
      events: state.events.filter(event => event.id !== eventId)
    }));

    // Remove from localStorage
    if (typeof window !== 'undefined') {
      import('@/lib/offline-db').then(({ offlineDb }) => {
        offlineDb.deleteEvent(eventId).then(() => {
          console.log('[Store] ✅ Event deleted from localStorage');
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('offline-event-deleted'));
        });
      });
    }
  },
  openPopover: () => set({ isPopoverOpen: true, isEventSummaryOpen: false, selectedEvent: null }),
  closePopover: () => set({ isPopoverOpen: false }),
  openEventSummary: (event) =>
    set({ isEventSummaryOpen: true, selectedEvent: event, isPopoverOpen: false }),
  closeEventSummary: () =>
    set({ isEventSummaryOpen: false, selectedEvent: null }),
}));

export const useToggleSideBarStore = create<ToggleSideBarType>()(
  (set, get) => ({
    isSideBarOpen: true,
    setSideBarOpen: () => {
      set({ isSideBarOpen: !get().isSideBarOpen });
    },
  }),
);

export type CalendarInfo = {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
};

interface CalendarListStore {
  calendars: CalendarInfo[];
  setCalendars: (calendars: CalendarInfo[]) => void;
  toggleCalendar: (calendarId: string) => void;
}

export const useCalendarListStore = create<CalendarListStore>()(
  devtools(
    persist(
      (set, get) => ({
        calendars: [],
        setCalendars: (calendars: CalendarInfo[]) => {
          // Deduplicate calendars by ID before setting
          const uniqueCalendars = Array.from(
            new Map(calendars.map(cal => [cal.id, cal])).values()
          );
          set({ calendars: uniqueCalendars });
        },
        toggleCalendar: (calendarId: string) => {
          const calendars = get().calendars.map(cal =>
            cal.id === calendarId ? { ...cal, isVisible: !cal.isVisible } : cal
          );
          set({ calendars });
        },
      }),
      {
        name: "calendar_list_v4", // Changed key name to force fresh start
        skipHydration: true,
      }
    )
  )
);
