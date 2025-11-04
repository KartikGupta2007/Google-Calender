import React, { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Image from "next/image";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoCloseSharp } from "react-icons/io5";
import { IoMdCalendar } from "react-icons/io";
import { FiClock } from "react-icons/fi";
import AddTime from "./add-time";
import AddDate from "./add-date";
import AddRepeat from "./add-repeat";
import { createEventOffline } from "@/app/actions/event-actions.offline";
import { cn } from "@/lib/utils";
import { useDateStore } from "@/lib/store";
import dayjs from "dayjs";

interface EventPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  initialTab?: TabType;
}

type TabType = "event" | "task" | "appointment";

export default function EventPopover({
  isOpen,
  onClose,
  date,
  initialTab = "event",
}: EventPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { selectedEndDate, setEndDate: clearEndDate, userSelectedDate } = useDateStore();
  const [selectedTab, setSelectedTab] = useState<TabType>(initialTab);
  
  // Initialize times from store when popover opens
  const initialStartTime = userSelectedDate.format('HH:mm');
  const initialEndTime = selectedEndDate 
    ? selectedEndDate.format('HH:mm')
    : userSelectedDate.add(1, 'hour').format('HH:mm');
  
  const [selectedTime, setSelectedTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(date);
  
  // Initialize times from userSelectedDate and selectedEndDate ONCE when popover opens
  useEffect(() => {
    if (isOpen) {
      // Set start time from userSelectedDate
      const startHour = userSelectedDate.hour().toString().padStart(2, '0');
      const startMinute = userSelectedDate.minute().toString().padStart(2, '0');
      const newStartTime = `${startHour}:${startMinute}`;
      setSelectedTime(newStartTime);
      
      // Set end time from selectedEndDate if available, otherwise default to start + 1 hour
      if (selectedEndDate) {
        const endHour = selectedEndDate.hour().toString().padStart(2, '0');
        const endMinute = selectedEndDate.minute().toString().padStart(2, '0');
        const newEndTime = `${endHour}:${endMinute}`;
        setEndTime(newEndTime);
        
        // If end date is different day, update endDate state
        if (!selectedEndDate.isSame(userSelectedDate, 'day')) {
          setEndDate(selectedEndDate.format("YYYY-MM-DD"));
        }
        
        // Clear the selectedEndDate after using it
        clearEndDate(undefined);
      } else {
        // Default to start time + 1 hour
        const defaultEnd = userSelectedDate.add(1, 'hour');
        const endHour = defaultEnd.hour().toString().padStart(2, '0');
        const endMinute = defaultEnd.minute().toString().padStart(2, '0');
        const newEndTime = `${endHour}:${endMinute}`;
        setEndTime(newEndTime);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only run when isOpen changes
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showGoogleMeet, setShowGoogleMeet] = useState(false);
  const [meetLink] = useState("meet.google.com/tis-vpvr-czn");
  const [title, setTitle] = useState("");
  const [repeat, setRepeat] = useState("Does not repeat");
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [description, setDescription] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [selectedGuests, setSelectedGuests] = useState<Array<{name: string; email: string}>>([]);
  const [guestInput, setGuestInput] = useState("");
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);
  const [attachments, setAttachments] = useState<Array<{name: string; type: string; size?: number}>>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const guestInputRef = useRef<HTMLInputElement>(null);

  // Sample people data (similar to sidebar search)
  const samplePeople = [
    { name: "Aaron Mitchell", email: "aaron.mitchell@example.com" },
    { name: "Abigail Foster", email: "abigail.foster@example.com" },
    { name: "Adam Reynolds", email: "adam.reynolds@example.com" },
    { name: "Alice Johnson", email: "alice.johnson@example.com" },
    { name: "Amanda Clarke", email: "amanda.clarke@example.com" },
    { name: "Andrew Barnes", email: "andrew.barnes@example.com" },
    { name: "Anna Mitchell", email: "anna.mitchell@example.com" },
    { name: "Anthony Davis", email: "anthony.davis@example.com" },
    { name: "Ashley Moore", email: "ashley.moore@example.com" },
    { name: "Benjamin Carter", email: "benjamin.carter@example.com" },
    { name: "Brian Thompson", email: "brian.thompson@example.com" },
    { name: "Charles Warren", email: "charles.warren@example.com" },
    { name: "Christopher Young", email: "christopher.young@example.com" },
    { name: "Daniel Brown", email: "daniel.brown@example.com" },
    { name: "David Miller", email: "david.miller@example.com" },
    { name: "Emily Rodriguez", email: "emily.rodriguez@example.com" },
    { name: "Emma Stone", email: "emma.stone@example.com" },
    { name: "Frank Thompson", email: "frank.thompson@example.com" },
    { name: "George Wilson", email: "george.wilson@example.com" },
    { name: "John Smith", email: "john.smith@example.com" },
  ];

  // Guest handling functions
  const handleGuestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGuestInput(value);
    setShowGuestSuggestions(true); // Always show suggestions when typing
  };

  const handleGuestInputFocus = () => {
    setShowGuestSuggestions(true); // Show suggestions on focus
  };

  const handleGuestInputBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => setShowGuestSuggestions(false), 200);
  };

  const handleSelectGuest = (person: {name: string; email: string}) => {
    if (!selectedGuests.find(g => g.email === person.email)) {
      setSelectedGuests([...selectedGuests, person]);
    }
    setGuestInput("");
    setShowGuestSuggestions(false);
    guestInputRef.current?.focus();
  };

  const handleRemoveGuest = (email: string) => {
    setSelectedGuests(selectedGuests.filter(g => g.email !== email));
  };

  const handleFileUpload = (files: FileList) => {
    const newAttachments = Array.from(files).map(file => ({
      name: file.name,
      type: file.type || 'unknown',
      size: file.size
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (fileName: string) => {
    setAttachments(attachments.filter(att => att.name !== fileName));
  };

  const filteredPeople = guestInput.trim() 
    ? samplePeople.filter(person =>
        !selectedGuests.find(g => g.email === person.email) &&
        (person.name.toLowerCase().includes(guestInput.toLowerCase()) ||
         person.email.toLowerCase().includes(guestInput.toLowerCase()))
      )
    : samplePeople.filter(person => !selectedGuests.find(g => g.email === person.email));

  // Drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Update end time when start time changes (1 hour later)
  const handleStartTimeChange = (time: string) => {
    setSelectedTime(time);
    const [hour, minute] = time.split(':').map(Number);
    const endHour = (hour + 1) % 24;
    setEndTime(`${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  };

  // Formatting functions for description editor
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    
    // Better list detection - check if we're inside a list element
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const node = selection.getRangeAt(0).startContainer;
        const parentElement = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
        
        if (parentElement) {
          const closestOL = parentElement.closest('ol');
          const closestUL = parentElement.closest('ul');
          
          if (closestOL) formats.add('insertOrderedList');
          if (closestUL) formats.add('insertUnorderedList');
        }
      }
    }
    
    setActiveFormats(formats);
  };

  const isFormatActive = (command: string) => {
    return activeFormats.has(command);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setDescription(content);
      setShowPlaceholder(content === '' || content === '<br>');
      updateActiveFormats();
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    // Prevent all keyboard shortcuts from bubbling up
    // This stops calendar shortcuts (d, m, y, w, etc.) from triggering
    e.stopPropagation();
    
    // Also prevent the event from reaching the global keyboard handler
    e.nativeEvent.stopImmediatePropagation?.();
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the title area
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input')) {
      return; // Don't start drag if clicking on input
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Reset position and tab when popover opens
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      setSelectedTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !isDragging
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isDragging]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await createEventOffline(formData);
        if ("error" in result) {
          setError(result.error);
        } else if (result.success) {
          setSuccess(result.success);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } catch (err) {
        console.error('Event creation error:', err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        ref={popoverRef}
        className="w-full max-w-[480px] shadow-2xl overflow-hidden"
        onClick={handlePopoverClick}
        style={{
          backgroundColor: '#202124',
          fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
          boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.20)',
          borderRadius: '28px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          cursor: isDragging ? 'grabbing' : 'default',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        <form action={onSubmit}>
          {/* Title input - at top - DRAGGABLE */}
          <div
            className="px-6 pt-4 pb-3"
            style={{
              borderBottom: '1px solid #3C4043',
              cursor: 'grab',
            }}
            onMouseDown={handleMouseDown}
          >
            <Input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              placeholder="Add title"
              className="border-0 bg-transparent text-white text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-[#9AA0A6]"
              style={{ fontSize: '20px', fontWeight: 500 }}
            />
          </div>

          {/* Tabs - Material Design Dark */}
          <div className="flex items-center px-6 pt-3 pb-3 gap-2" style={{ borderBottom: '1px solid #3C4043' }}>
            <button
              type="button"
              onClick={() => setSelectedTab("event")}
              className={cn(
                "px-3 py-1.5 rounded-full text-base font-medium transition-colors",
                selectedTab === "event"
                  ? "bg-[#1A73E8] text-white"
                  : "bg-transparent text-[#9AA0A6] hover:bg-[#3C4043]"
              )}
            >
              Event
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("task")}
              className={cn(
                "px-3 py-1.5 rounded-full text-base font-medium transition-colors",
                selectedTab === "task"
                  ? "bg-[#1A73E8] text-white"
                  : "bg-transparent text-[#9AA0A6] hover:bg-[#3C4043]"
              )}
            >
              Task
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("appointment")}
              className={cn(
                "px-3 py-1.5 rounded-full text-base font-medium transition-colors",
                selectedTab === "appointment"
                  ? "bg-[#1A73E8] text-white"
                  : "bg-transparent text-[#9AA0A6] hover:bg-[#3C4043]"
              )}
            >
              Appointment schedule
            </button>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-5 pt-3 space-y-2">

            {/* Date and Time Row */}
            <div className="flex items-start gap-3 py-1.5">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                <FiClock className="w-5 h-5 text-[#9AA0A6]" />
              </div>
              <div className="flex-1">
                {isAllDay ? (
                  <div className="flex items-center gap-3 text-base text-white mb-2">
                    <AddDate
                      onDateSelect={setStartDate}
                      defaultDate={startDate}
                      showFullFormat={false}
                    />
                    <span>-</span>
                    <AddDate
                      onDateSelect={setEndDate}
                      defaultDate={endDate}
                      showFullFormat={false}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-base text-white mb-2">
                    <AddDate
                      onDateSelect={setStartDate}
                      defaultDate={startDate}
                      showFullFormat={true}
                    />
                    {selectedTab !== "task" && (
                      <>
                        <span><AddTime onTimeSelect={handleStartTimeChange} defaultTime={selectedTime} /></span>
                        <span>-</span>
                        <span><AddTime onTimeSelect={setEndTime} defaultTime={endTime} /></span>
                      </>
                    )}
                  </div>
                )}

                {selectedTab !== "task" && (
                  <div className="flex items-center gap-3 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setIsAllDay(!isAllDay)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '2px',
                          border: isAllDay ? 'none' : '2px solid #9AA0A6',
                          backgroundColor: isAllDay ? '#1A73E8' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {isAllDay && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ color: '#FFFFFF', fontSize: '15px' }}>All day</span>
                    </label>
                  </div>
                )}

                {selectedTab !== "task" && (
                  <div className="mt-3" style={{ maxWidth: '280px' }}>
                    <AddRepeat
                      onRepeatSelect={setRepeat}
                      defaultRepeat={repeat}
                      selectedDate={isAllDay ? startDate : date}
                    />
                  </div>
                )}

                <input type="hidden" name="date" value={startDate} />
                <input type="hidden" name="endDate" value={isAllDay ? endDate : startDate} />
                <input type="hidden" name="time" value={selectedTime} />
                <input type="hidden" name="endTime" value={endTime} />
                <input type="hidden" name="isAllDay" value={isAllDay.toString()} />
                <input type="hidden" name="repeat" value={repeat} />
                <input type="hidden" name="eventType" value={selectedTab} />
              </div>
            </div>

            {/* Add guests Row */}
            {selectedTab === "event" && (
              <div className="flex items-start gap-3 py-1.5">
                <div className="flex items-center justify-center w-5 h-5 mt-1">
                  <svg focusable="false" width="20" height="20" viewBox="0 0 24 24" className="text-[#9AA0A6]" style={{ flexShrink: 0 }}>
                    <path fill="currentColor" d="M15 8c0-1.42-.5-2.73-1.33-3.76.42-.14.86-.24 1.33-.24 2.21 0 4 1.79 4 4s-1.79 4-4 4c-.43 0-.84-.09-1.23-.21-.03-.01-.06-.02-.1-.03A5.98 5.98 0 0 0 15 8zm1.66 5.13C18.03 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.58-3.47-6.34-3.87zM9 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 9c-2.7 0-5.8 1.29-6 2.01V18h12v-1c-.2-.71-3.3-2-6-2M9 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 9c2.67 0 8 1.34 8 4v3H1v-3c0-2.66 5.33-4 8-4z"></path>
                  </svg>
                </div>
                <div className="flex-1 relative">
                  {/* Selected guests chips */}
                  {selectedGuests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedGuests.map((guest) => (
                        <div
                          key={guest.email}
                          className="flex items-center gap-2 px-2 py-1 bg-[#3C4043] rounded-full text-sm"
                        >
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: `hsl(${guest.name.charCodeAt(0) * 10}, 60%, 50%)` }}
                          >
                            {guest.name.charAt(0)}
                          </div>
                          <span className="text-white">{guest.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveGuest(guest.email)}
                            className="text-[#9AA0A6] hover:text-white ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Guest input */}
                  <input
                    ref={guestInputRef}
                    type="text"
                    value={guestInput}
                    onChange={handleGuestInputChange}
                    onKeyDown={handleEditorKeyDown}
                    placeholder="Add guests"
                    onFocus={handleGuestInputFocus}
                    onBlur={handleGuestInputBlur}
                    className="w-full border-0 bg-transparent text-white text-base focus:ring-0 focus:outline-none px-0 placeholder:text-[#9AA0A6]"
                    style={{ borderBottom: '1px solid #3C4043', borderRadius: 0 }}
                  />
                  
                  {/* Guest suggestions dropdown */}
                  {showGuestSuggestions && filteredPeople.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#292a2d] rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {filteredPeople.slice(0, 8).map((person) => (
                        <div
                          key={person.email}
                          onClick={() => handleSelectGuest(person)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-[#3C4043] cursor-pointer"
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: `hsl(${person.name.charCodeAt(0) * 10}, 60%, 50%)` }}
                          >
                            {person.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium">{person.name}</div>
                            <div className="text-[#9AA0A6] text-xs">{person.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Hidden input for form submission */}
                  <input type="hidden" name="guests" value={selectedGuests.map(g => g.email).join(',')} />
                </div>
              </div>
            )}

            {/* Google Meet Row */}
            {selectedTab === "event" && !showGoogleMeet && (
              <div className="flex items-center gap-3 py-1.5">
                <div className="flex items-center justify-center w-5 h-5">
                  <Image
                    src="/img/gmeet-logo.png"
                    alt="Google Meet"
                    width={20}
                    height={20}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleMeet(true)}
                  className="flex-1 text-left text-base text-[#1A73E8] hover:bg-[#3C4043] px-3 py-1.5 -mx-3 rounded transition-colors"
                >
                  Add Google Meet video conferencing
                </button>
              </div>
            )}

            {/* Google Meet Link - when enabled */}
            {selectedTab === "event" && showGoogleMeet && (
              <div className="flex items-start gap-3 py-1.5">
                <div className="flex items-center justify-center w-5 h-5 mt-1">
                  <Image
                    src="/img/gmeet-logo.png"
                    alt="Google Meet"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="flex-1 bg-[#3C4043] rounded-lg px-4 py-3" style={{ border: '1px solid #3C4043' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-medium text-white">Join with Google Meet</span>
                    <button
                      type="button"
                      onClick={() => setShowGoogleMeet(false)}
                      className="text-[#9AA0A6] hover:text-white p-1 rounded-full hover:bg-[#3C4043]"
                    >
                      <IoCloseSharp className="h-4 w-4" />
                    </button>
                  </div>
                  <a
                    href={`https://${meetLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-[#1A73E8] hover:underline block mb-1"
                  >
                    {meetLink}
                  </a>
                  <p className="text-sm text-[#9AA0A6]">Up to 100 guest connections</p>
                </div>
              </div>
            )}

            {/* Add location Row */}
            {selectedTab === "event" && (
              <div className="flex items-center gap-3 py-1.5">
                <div className="flex items-center justify-center w-5 h-5">
                  <svg focusable="false" width="20" height="20" viewBox="0 0 24 24" className="text-[#9AA0A6]" style={{ flexShrink: 0 }}>
                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"></path>
                    <circle fill="currentColor" cx="12" cy="9" r="2.5"></circle>
                  </svg>
                </div>
                <Input
                  type="text"
                  name="location"
                  placeholder="Add location"
                  onKeyDown={handleEditorKeyDown}
                  className="flex-1 border-0 bg-transparent text-white text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-[#9AA0A6]"
                  style={{ borderBottom: '1px solid #3C4043', borderRadius: 0 }}
                />
              </div>
            )}

            {/* Add description Row */}
            <div className="flex items-start gap-3 py-1.5">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                <HiOutlineMenuAlt2 className="w-5 h-5 text-[#9AA0A6]" />
              </div>
              <div className="flex-1">
                {!showDescriptionEditor && !showAttachmentMenu ? (
                  <div className="text-base text-[#9AA0A6]">
                    <span
                      onClick={() => setShowDescriptionEditor(true)}
                      className="hover:underline cursor-pointer text-[#1A73E8]"
                    >
                      Add description
                    </span>
                    <span> or </span>
                    <span
                      onClick={() => setShowAttachmentMenu(true)}
                      className="hover:underline cursor-pointer text-[#1A73E8]"
                    >
                      attachment
                    </span>
                  </div>
                ) : showDescriptionEditor ? (
                  <div>
                    {/* Formatting Toolbar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 0',
                      borderBottom: '1px solid #3C4043',
                      marginBottom: '8px'
                    }}>
                      <button
                        type="button"
                        onClick={() => applyFormat('bold')}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isFormatActive('bold') ? '#3C4043' : 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: isFormatActive('bold') ? '#FFFFFF' : '#9AA0A6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isFormatActive('bold')) {
                            e.currentTarget.style.backgroundColor = '#3C4043';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFormatActive('bold')) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title="Bold"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormat('italic')}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isFormatActive('italic') ? '#3C4043' : 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: isFormatActive('italic') ? '#FFFFFF' : '#9AA0A6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isFormatActive('italic')) {
                            e.currentTarget.style.backgroundColor = '#3C4043';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFormatActive('italic')) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title="Italic"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormat('underline')}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isFormatActive('underline') ? '#3C4043' : 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: isFormatActive('underline') ? '#FFFFFF' : '#9AA0A6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isFormatActive('underline')) {
                            e.currentTarget.style.backgroundColor = '#3C4043';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFormatActive('underline')) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title="Underline"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
                        </svg>
                      </button>
                      <div style={{ width: '1px', height: '20px', backgroundColor: '#3C4043', margin: '0 4px' }} />
                      <button
                        type="button"
                        onClick={() => applyFormat('insertOrderedList')}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isFormatActive('insertOrderedList') ? '#3C4043' : 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: isFormatActive('insertOrderedList') ? '#FFFFFF' : '#9AA0A6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isFormatActive('insertOrderedList')) {
                            e.currentTarget.style.backgroundColor = '#3C4043';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFormatActive('insertOrderedList')) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title="Numbered list"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormat('insertUnorderedList')}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isFormatActive('insertUnorderedList') ? '#3C4043' : 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: isFormatActive('insertUnorderedList') ? '#FFFFFF' : '#9AA0A6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isFormatActive('insertUnorderedList')) {
                            e.currentTarget.style.backgroundColor = '#3C4043';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFormatActive('insertUnorderedList')) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title="Bulleted list"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
                        </svg>
                      </button>
                      <div style={{ width: '1px', height: '20px', backgroundColor: '#3C4043', margin: '0 4px' }} />
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Enter URL:');
                          if (url) applyFormat('createLink', url);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#9AA0A6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3C4043'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Insert link"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormat('removeFormat')}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#9AA0A6',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3C4043'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Remove formatting"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/>
                        </svg>
                      </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                      {showPlaceholder && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '0px',
                            color: '#9AA0A6',
                            fontSize: '14px',
                            pointerEvents: 'none',
                            userSelect: 'none'
                          }}
                        >
                          Add description
                        </div>
                      )}
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        onKeyDown={handleEditorKeyDown}
                        onKeyUp={updateActiveFormats}
                        onMouseUp={updateActiveFormats}
                        onFocus={() => {
                          editorRef.current?.focus();
                          updateActiveFormats();
                        }}
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '2px solid #1A73E8',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          padding: '8px 0',
                          fontFamily: 'inherit',
                          outline: 'none',
                          overflowY: 'auto'
                        }}
                      ></div>
                    </div>
                  </div>
                ) : showAttachmentMenu ? (
                  <div>
                    {/* Attachment Interface - Compact Design */}
                    <div style={{ 
                      borderBottom: '1px solid #3C4043',
                      backgroundColor: '#2D2E30'
                    }}>
                      {/* Header */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-600">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-blue-400 font-medium text-sm">Add attachment</span>
                        <button
                          type="button"
                          onClick={() => setShowAttachmentMenu(false)}
                          className="ml-auto text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="px-4 py-2">
                        {/* Google Drive */}
                        <div 
                          className="flex items-center gap-3 py-2 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                          onClick={() => {
                            console.log('Google Drive integration would go here');
                          }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-gray-300 text-sm">Google Drive</span>
                        </div>

                        {/* ADD-ONS Section */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-gray-500 text-xs font-medium mb-2 tracking-wide">ADD-ONS</div>
                          <div 
                            className="flex items-center gap-3 py-2 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept = '*/*';
                              input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files;
                                if (files) {
                                  handleFileUpload(files);
                                }
                              };
                              input.click();
                            }}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500">
                              <span className="text-white text-xs font-bold">C</span>
                            </div>
                            <span className="text-gray-300 text-sm">Add Canva Design to event</span>
                          </div>
                        </div>
                      </div>

                      {/* Attached Files Display */}
                      {attachments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#3C4043]">
                          <div style={{ color: '#9AA0A6', fontSize: '13px', marginBottom: '8px' }}>
                            Attached files ({attachments.length})
                          </div>
                          <div className="space-y-2">
                            {attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-[#3C4043] rounded">
                                <div className="flex items-center gap-2">
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    backgroundColor: '#1A73E8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <div style={{ color: '#FFFFFF', fontSize: '13px' }}>
                                      {attachment.name}
                                    </div>
                                    {attachment.size && (
                                      <div style={{ color: '#9AA0A6', fontSize: '11px' }}>
                                        {(attachment.size / 1024).toFixed(1)} KB
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttachment(attachment.name)}
                                  className="text-[#9AA0A6] hover:text-white"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
                <input type="hidden" name="description" value={description} />
                <input type="hidden" name="attachments" value={JSON.stringify(attachments)} />
              </div>
            </div>

            {/* Calendar/User Info Row */}
            <div className="flex items-start gap-3 py-1.5">
              <div className="flex items-center justify-center w-5 h-5">
                <IoMdCalendar className="w-5 h-5 text-[#9AA0A6]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-base text-white">
                  <span>Kartik Gupta</span>
                  <div className="w-3 h-3 rounded-full bg-[#F6BF26]"></div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#9AA0A6] mt-1">
                  <span>Busy</span>
                  <span>•</span>
                  <span>Default visibility</span>
                  <span>•</span>
                  <span>Notify 30 minutes before</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: '1px solid #3C4043', marginTop: '12px', paddingTop: '12px' }}>
              <button
                type="button"
                className="text-base text-[#1A73E8] hover:bg-[#3C4043] font-medium px-3 py-1.5 rounded transition-colors"
              >
                More options
              </button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#1A73E8] text-white hover:bg-[#1558B0] rounded px-5 h-8 text-base font-medium uppercase"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>

            {error && <p className="mt-2 text-[#D93025] text-base">{error}</p>}
            {success && <p className="mt-2 text-[#0D652D] text-base">Event created successfully!</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
