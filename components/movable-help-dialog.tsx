"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface MovableHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MovableHelpDialog({ isOpen, onClose }: MovableHelpDialogProps) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-2xl border border-gray-300"
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "400px",
          minHeight: "300px",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        {/* Header - Draggable area */}
        <div
          className="px-6 py-4 border-b border-gray-300 bg-gray-50 rounded-t-lg cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Help</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              style={{ width: "24px", height: "24px" }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content - Menu Items */}
        <div className="py-2">
          <Link
            href="/settings"
            className="block px-6 py-3 hover:bg-gray-100 transition-colors text-gray-800 text-sm"
            onClick={onClose}
          >
            Settings
          </Link>

          <Link
            href="/trash"
            className="block px-6 py-3 hover:bg-gray-100 transition-colors text-gray-800 text-sm"
            onClick={onClose}
          >
            Trash
          </Link>

          <button
            className="w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors text-gray-800 text-sm"
            onClick={() => setShowFeedback(true)}
          >
            Help & Feedback
          </button>

          <button
            className="w-full text-left px-6 py-3 hover:bg-gray-100 transition-colors text-gray-800 text-sm"
            onClick={onClose}
          >
            Keyboard shortcuts
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 bg-gray-50 rounded-b-lg">
          <p className="text-gray-800 font-medium text-sm">Resources</p>
          <div className="mt-2 space-y-1">
            <a
              href="https://support.google.com/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 text-xs"
            >
              Help Center
            </a>
            <a
              href="https://calendar.google.com/calendar/r/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 text-xs"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* Feedback Side Panel */}
      {showFeedback && (
        <div
          className="fixed right-0 top-0 h-full w-[480px] bg-[#202124] shadow-2xl z-50 animate-slide-in"
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-white text-xl font-normal">Send feedback to Google</h2>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-gray-400 hover:text-white text-2xl leading-none w-6 h-6 flex items-center justify-center"
            >
              &times;
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
            {/* Feedback Text Area */}
            <div className="mb-4">
              <label className="text-white text-sm font-normal mb-2 block">
                Describe your feedback (required)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what prompted this feedback..."
                className="w-full h-32 p-3 bg-[#303134] text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 resize-none text-sm"
                style={{ caretColor: 'white' }}
              />
            </div>

            {/* Sensitive Info Warning */}
            <div className="flex items-start gap-2 mb-6 text-gray-400 text-xs">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>Please don&apos;t include any sensitive information</span>
            </div>

            {/* Screenshot Upload */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">
                A screenshot will help us better understand your feedback.
              </p>
              <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload screenshot
              </button>
            </div>

            {/* Email Consent */}
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                checked={emailConsent}
                onChange={(e) => setEmailConsent(e.target.checked)}
                className="mt-1 w-4 h-4 bg-[#303134] border border-gray-600 rounded accent-blue-500"
              />
              <span className="text-gray-400 text-xs">
                We may email you for more information or updates
              </span>
            </div>

            {/* Privacy Policy */}
            <div className="text-gray-400 text-xs">
              <p className="mb-2">
                Some{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  account and system information
                </a>{" "}
                may be sent to Google. We will use it to fix problems and improve our services, subject to our{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </a>
                . We may email you for more information or updates. Go to{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Legal Help
                </a>{" "}
                to ask for content changes for legal reasons.
              </p>
            </div>
          </div>

          {/* Footer with Send Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-[#202124]">
            <button
              onClick={() => {
                // Handle send feedback
                console.log("Feedback sent:", feedback);
                setFeedback("");
                setEmailConsent(false);
                setShowFeedback(false);
              }}
              disabled={!feedback.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
