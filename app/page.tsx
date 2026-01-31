"use client";

import { sdk } from "@farcaster/frame-sdk";
import {
  useAuthModal,
  useUser,
  useLogout
} from "@account-kit/react";
import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Home } from "./components/DemoComponents";
import { Features } from "./components/DemoComponents";
import { Fund } from "./components/Funds";
import { handleSplashScreen } from "./utils/farcaster";

export default function App() {
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [frameInitialized, setFrameInitialized] = useState(false);

  // Alchemy Account Kit hooks
  const { openAuthModal } = useAuthModal();
  const user = useUser();
  const { logout } = useLogout();

  useEffect(() => {
    async function initializeFrame() {
      if (!frameInitialized) {
        // Initialize Farcaster Frame SDK
        await handleSplashScreen({ delay: 50 });
        setFrameInitialized(true);
      }
    }

    initializeFrame();
  }, [frameInitialized]);

  const handleAddFrame = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();
      setFrameAdded(!!result);
    } catch (e) {
      console.error("Failed to add frame:", e);
    }
  }, []);

  const openUrl = useCallback((url: string) => {
    sdk.actions.openUrl(url);
  }, []);

  const saveFrameButton = useMemo(() => {
    // Check if added to client (this is approximate without full context check)
    if (!frameAdded) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    return (
      <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
        <Icon name="check" size="sm" className="text-[#0052FF]" />
        <span>Saved</span>
      </div>
    );
  }, [frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2 p-1 bg-white/5 rounded-full pr-3 border border-white/10">
                  {/* Avatar or Placeholder */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                    {/* We could use alchemy user data here if available */}
                    <span className="text-xs text-white font-bold">You</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/90 max-w-[100px] truncate">
                      {user.email || "User"}
                    </span>
                    <span className="text-[10px] text-white/50 cursor-pointer hover:text-white/80" onClick={() => logout()}>
                      Sign out
                    </span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={openAuthModal}
                  className="bg-white text-black hover:bg-gray-200 font-semibold"
                  size="sm"
                >
                  Log In
                </Button>
              )}
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          {activeTab === "home" && (
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <Home setActiveTab={setActiveTab} />
            </Suspense>
          )}
          {activeTab === "features" && <Features setActiveTab={setActiveTab} />}
          {activeTab === "fund" && <Fund setActiveTab={setActiveTab} />}
        </main>

        <footer className="mt-2 pt-4 flex justify-center text-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://creativeplatform.xyz")}
          >
            © {new Date().getFullYear()} Creative Organization DAO. All rights
            reserved.
          </Button>
        </footer>
      </div>
    </div>
  );
}
