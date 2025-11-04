"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { HiOutlineUsers } from "react-icons/hi";

interface Contact {
  email: string;
  name?: string;
  avatar?: string;
}

interface EmailAutocompleteProps {
  name: string;
  placeholder?: string;
  onEmailsChange?: (emails: string[]) => void;
}

export default function EmailAutocomplete({
  name,
  placeholder = "Add guests",
  onEmailsChange,
}: EmailAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load contacts from offline storage on mount
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      try {
        // Import offline database
        const { offlineDb } = await import('@/lib/offline-db');
        const contacts = await offlineDb.getContacts();
        setAllContacts(contacts);
      } catch (error) {
        console.error("Error loading offline contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, []);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allContacts.filter(
        (contact) =>
          (contact.email.toLowerCase().includes(inputValue.toLowerCase()) ||
            contact.name?.toLowerCase().includes(inputValue.toLowerCase())) &&
          !selectedEmails.includes(contact.email)
      );
      setFilteredContacts(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, selectedEmails, allContacts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectContact = (contact: Contact) => {
    const newEmails = [...selectedEmails, contact.email];
    setSelectedEmails(newEmails);
    setInputValue("");
    setShowSuggestions(false);
    onEmailsChange?.(newEmails);
    inputRef.current?.focus();
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const newEmails = selectedEmails.filter((email) => email !== emailToRemove);
    setSelectedEmails(newEmails);
    onEmailsChange?.(newEmails);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputValue && selectedEmails.length > 0) {
      handleRemoveEmail(selectedEmails[selectedEmails.length - 1]);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() || "?";
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center space-x-3">
        <HiOutlineUsers className="size-5 text-slate-600 flex-shrink-0" />
        <div className="flex-1 flex flex-wrap gap-2 items-center rounded-lg border-0 bg-slate-100 p-2">
          {selectedEmails.map((email) => {
            const contact = allContacts.find((c) => c.email === email);
            return (
              <span
                key={email}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {contact?.name || email}
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="text-blue-600 hover:text-blue-800 ml-1"
                >
                  ×
                </button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            placeholder={selectedEmails.length === 0 ? placeholder : ""}
            className={cn(
              "flex-1 min-w-[120px] bg-transparent border-0 outline-none placeholder:text-slate-600",
              "focus:ring-0 focus:outline-none"
            )}
          />
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selectedEmails.join(",")} />

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute left-8 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <button
                key={contact.email}
                type="button"
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name || contact.email}
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {getInitials(contact.name, contact.email)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {contact.name && (
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {contact.name}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 truncate">
                    {contact.email}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              {isLoading ? "Loading contacts..." : "No contacts found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
