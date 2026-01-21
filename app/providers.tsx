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
    // Note: In Next.js, NEXT_PUBLIC_* vars are embedded at build time
    // They should be available, but we check for both undefined and empty strings
    const projectId = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
    const paymasterEndpoint = process.env.NEXT_PUBLIC_PAYMASTER_ENDPOINT;

    // Debug: Log what we actually have (without exposing sensitive values)
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Environment variables check:", {
        hasProjectId: !!projectId,
        projectIdLength: projectId?.length || 0,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        hasPaymaster: !!paymasterEndpoint,
        paymasterLength: paymasterEndpoint?.length || 0,
      });
    }

    const missing: string[] = [];
    if (!projectId || projectId.trim() === "") {
      missing.push("NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID");
    }
    if (!apiKey || apiKey.trim() === "") {
      missing.push("NEXT_PUBLIC_ONCHAINKIT_API_KEY");
    }

    if (missing.length > 0) {
      const message = `Missing or empty required environment variables: ${missing.join(", ")}`;
      const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel");
      
      console.warn(
        message +
        "\n" +
        (isVercel
          ? "💡 In Vercel, make sure these variables are set for your current branch/environment:" +
            "\n   - Go to: Project Settings → Environment Variables" +
            "\n   - Ensure variables are added to 'Development', 'Preview', and 'Production'" +
            "\n   - Redeploy after adding variables"
          : "💡 Make sure these are set in your .env.local file and restart your dev server.")
      );
    } else if (process.env.NODE_ENV === "development") {
      console.log("✅ Required environment variables are set");
    }

    // Warn if paymaster is not configured (sponsored transactions won't work)
    if (!paymasterEndpoint || paymasterEndpoint.trim() === "") {
      console.warn(
        "⚠️ NEXT_PUBLIC_PAYMASTER_ENDPOINT is not set. Sponsored transactions will not work. " +
        "Get your paymaster endpoint from https://portal.cdp.coinbase.com/products/bundler-and-paymaster"
      );
    } else if (process.env.NODE_ENV === "development") {
      console.log("✅ Paymaster endpoint is configured");
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
          projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID || ""}
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
            apiKey={(process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "") as string}
            chain={base}
            projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID || ""}
            config={{
              ...(process.env.NEXT_PUBLIC_PAYMASTER_ENDPOINT && {
                paymaster: process.env.NEXT_PUBLIC_PAYMASTER_ENDPOINT,
              }),
            }}
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
