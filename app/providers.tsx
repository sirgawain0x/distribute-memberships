"use client";

import { type ReactNode, useState, useEffect } from "react";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { type State, WagmiProvider } from "wagmi";
import { getConfig } from "@/wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { ToastProvider } from "./components/Toast";

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Validate required environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID",
      "NEXT_PUBLIC_ONCHAINKIT_API_KEY",
    ];

    const missing = requiredEnvVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      const message = `Missing required environment variables: ${missing.join(", ")}`;
      if (process.env.NODE_ENV === "production") {
        console.error(message);
      } else {
        console.warn(message);
      }
    }
  }, []);

  // Don't render until we're on the client side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
              theme: "mini-app-theme",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
              logo: process.env.NEXT_PUBLIC_ICON_URL,
            },
          }}
          notificationProxyUrl="/api/notification"
        >
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY as string}
            chain={base}
            projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID}
          >
            <ToastProvider>
              {props.children}
            </ToastProvider>
          </OnchainKitProvider>
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
