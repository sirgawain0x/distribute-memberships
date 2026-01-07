"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Icon } from "./DemoComponents";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const typeStyles = {
    success: "bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-700",
    error: "bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700",
    info: "bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700",
    warning: "bg-yellow-500 dark:bg-yellow-600 border-yellow-600 dark:border-yellow-700",
  };

  const iconMap = {
    success: "check",
    error: "x",
    info: "info",
    warning: "alert",
  } as const;

  return (
    <div
      className={`
        pointer-events-auto
        ${typeStyles[toast.type]}
        text-white
        px-4 py-3
        rounded-lg
        shadow-lg
        border
        backdrop-blur-md
        animate-slide-in-right
        flex items-center gap-3
        min-w-[200px]
      `}
      role="alert"
    >
      {toast.type === "success" && (
        <div className="flex-shrink-0">
          <Icon name="check" size="sm" className="text-white" />
        </div>
      )}
      {toast.type === "error" && (
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label="Close"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

