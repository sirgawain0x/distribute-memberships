"use client";
import { useEffect, useState } from "react";
import { useAccount } from "@account-kit/react";
import { Button, Card } from "./DemoComponents";
import { getOnrampBuyUrl } from "../utils/coinbaseOnramp";

// NOTE: To integrate Divvi referral, import getDataSuffix, submitReferral from '@divvi/referral-sdk' and useChainId from 'wagmi' when adding a custom transaction. See integration plan for details.

type FundProps = {
  setActiveTab: (tab: string) => void;
};

interface SessionTokenResponse {
  sessionToken: string;
  config: {
    assets: string[];
    blockchains: string[];
    fiatCurrency: string;
    defaultPaymentMethod: string;
    presetFiatAmount?: number;
    projectId: string;
  };
}

export function Fund({ setActiveTab }: FundProps) {
  const [sessionData, setSessionData] = useState<SessionTokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(30);
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const { address } = useAccount({ type: "LightAccount" });

  const amounts = [30, 100, 1000];
  const assets = ["USDC", "ETH"];

  useEffect(() => {
    async function fetchSessionToken() {
      if (!address) return;

      setLoading(true);

      try {
        const res = await fetch("/api/onramp-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
            assets: [selectedAsset],
            blockchains: ["base"],
            fiatCurrency: "USD",
            defaultPaymentMethod: "CRYPTO_ACCOUNT",
            presetFiatAmount: selectedAmount,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          // Log but don't hard fail - we'll fallback to direct URL
          console.warn("Session token fetch failed:", errorData);
          setSessionData(null);
        } else {
          const data: SessionTokenResponse = await res.json();
          setSessionData(data);
        }
      } catch (err) {
        console.error("Failed to fetch session token:", err);
        // Fallback to null sessionData
        setSessionData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSessionToken();
  }, [address, selectedAmount, selectedAsset]);

  // Listen for Onramp completion events
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure message is from Coinbase
      if (event.origin !== "https://pay.coinbase.com") return;

      // Check for success event
      // Based on Coinbase Onramp docs/patterns
      if (event.data === "success" || event.data?.eventName === "success" || event.data?.type === "success") {
        console.log("Onramp purchase successful:", event.data);
        setIsComplete(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Generate the Coinbase Onramp URL
  // Uses session token if available (secure), otherwise falls back to Project ID (public)
  const onrampBuyUrl = address
    ? getOnrampBuyUrl({
      address,
      defaultAsset: selectedAsset,
      defaultNetwork: "base",
      presetFiatAmount: selectedAmount,
      fiatCurrency: "USD",
      sessionToken: sessionData?.sessionToken,
    })
    : null;

  if (isComplete) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card title="Payment Successful">
          <div className="text-center py-6">
            <div className="text-green-500 mb-4 flex justify-center">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Funds Added!</h3>
            <p className="text-[var(--app-foreground-muted)] mb-6">
              Your transaction has been processed successfully.
            </p>
            <Button
              className="w-full"
              variant="primary"
              onClick={() => {
                setIsComplete(false);
                setActiveTab("home");
              }}
            >
              Back to Home
            </Button>
            <Button
              className="w-full mt-3"
              variant="outline"
              onClick={() => setIsComplete(false)}
            >
              Add More Funds
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Add Funds to Your Wallet" className="relative">
        {sessionData && (
          <div className="absolute top-3.5 right-4 flex items-center space-x-1 text-xs font-medium text-blue-600 bg-blue-100/50 px-2 py-1 rounded-full border border-blue-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Secure Session</span>
          </div>
        )}

        {/* Asset Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Select Asset{" "}
            <span className="text-[var(--app-accent)] text-sm">on Base</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <Button
                key={asset}
                variant={selectedAsset === asset ? "primary" : "outline"}
                onClick={() => setSelectedAsset(asset)}
                className="flex items-center justify-center space-x-2"
              >
                <span>{asset}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Amount (USD)</h3>
          <div className="grid grid-cols-3 gap-2">
            {amounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "primary" : "outline"}
                onClick={() => setSelectedAmount(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State - optional, non-blocking for fallback */}
        {loading && (
          <div className="py-2 text-center text-xs text-[var(--app-foreground-muted)]">
            Loading secure session...
          </div>
        )}

        {/* Fund Button */}
        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              if (onrampBuyUrl) {
                // Open in new window/popup with specific dimensions to match recipe feel
                window.open(
                  onrampBuyUrl,
                  "coinbase-onramp",
                  "width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
                );
              }
            }}
            disabled={!address}
          >
            {address ? "Add Funds" : "Connect Wallet to Add Funds"}
          </Button>
        </div>

        <Button
          className="mt-4"
          variant="outline"
          onClick={() => setActiveTab("home")}
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
}

