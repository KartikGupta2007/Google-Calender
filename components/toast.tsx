"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const styles = {
      success: {
        icon: CheckCircle,
        color: "#33b679",
        bg: "#e6f4ea",
      },
      error: {
        icon: XCircle,
        color: "#d50000",
        bg: "#fce8e6",
      },
      warning: {
        icon: AlertCircle,
        color: "#f9ab00",
        bg: "#fef7e0",
      },
      info: {
        icon: Info,
        color: "#1a73e8",
        bg: "#e8f0fe",
      },
    };
    return styles[type];
  };

  const styles = getToastStyles();
  const IconComponent = styles.icon;

  if (!isVisible) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.color}`,
        minWidth: "300px",
        maxWidth: "500px",
        transform: isExiting ? "translateX(400px)" : "translateX(0)",
        opacity: isExiting ? 0 : 1,
      }}
    >
      <IconComponent className="h-5 w-5 flex-shrink-0" style={{ color: styles.color }} />
      <p
        className="flex-1"
        style={{
          fontSize: "14px",
          color: "var(--text)",
          lineHeight: "1.4",
        }}
      >
        {message}
      </p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="rounded-full hover:bg-black hover:bg-opacity-10 p-1 transition-colors flex-shrink-0"
        style={{ color: styles.color }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast Container Component
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add this function to window so it can be called from anywhere
  useEffect(() => {
    (window as any).showToast = (message: string, type: ToastType = "info") => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
    };

    return () => {
      delete (window as any).showToast;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2"
      style={{ pointerEvents: "none" }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Helper functions
export const showToast = (message: string, type: ToastType = "info") => {
  if (typeof window !== "undefined" && (window as any).showToast) {
    (window as any).showToast(message, type);
  }
};
