"use client";

import { type ReactNode, useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AlchemyAccountProvider } from "@account-kit/react";
import { config, queryClient } from "./config";
import { ToastProvider } from "./components/Toast";

export function Providers(props: {
  children: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Validate required environment variables
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    // Debug: Log what we actually have (without exposing sensitive values)
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Environment variables check:", {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
      });
    }

    if (!apiKey || apiKey.trim() === "YOUR_API_KEY" || apiKey.trim() === "") {
      console.warn(
        "⚠️ NEXT_PUBLIC_ALCHEMY_API_KEY is not set or is default. Wallet connection may fail."
      );
    } else if (process.env.NODE_ENV === "development") {
      console.log("✅ Alchemy API Key is configured");
    }
  }, []);

  // Don't render until we're on the client side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={config} queryClient={queryClient}>
        <ToastProvider>
          {props.children}
        </ToastProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}
