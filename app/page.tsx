"use client";

import { sdk } from "@farcaster/frame-sdk";
import {
  useAuthModal,
  useUser,
  useLogout,
  useAccount,
} from "@account-kit/react";
import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Home } from "./components/DemoComponents";
import { Features } from "./components/DemoComponents";
import { Fund } from "./components/Funds";
import { handleSplashScreen, isFarcasterContext } from "./utils/farcaster";

export default function App() {
  const [isFarcaster, setIsFarcaster] = useState(false);

  useEffect(() => {
    setIsFarcaster(isFarcasterContext());
  }, []);

  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [frameInitialized, setFrameInitialized] = useState(false);

  // Alchemy Account Kit hooks
  const { openAuthModal } = useAuthModal();
  const user = useUser();
  const { logout } = useLogout();
  const { address } = useAccount({ type: "LightAccount" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const copyAddress = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
    }
  }, [address]);

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
    if (!isFarcaster) {
      return null;
    }

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
  }, [frameAdded, handleAddFrame, isFarcaster]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="relative profile-dropdown-container">
                  <div
                    className="flex items-center space-x-2 p-1 bg-black/60 backdrop-blur-md rounded-full pr-3 border border-white/10 cursor-pointer hover:bg-black/80 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {/* Avatar or Placeholder */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                      {/* We could use alchemy user data here if available */}
                      <span className="text-xs text-white font-bold">You</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white/90 max-w-[100px] truncate">
                        {user.email || "User"}
                      </span>
                    </div>
                    <Icon name={isDropdownOpen ? "x" : "arrow-right"} size="sm" className="text-white/50 w-3 h-3 rotate-90" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 p-2">
                      <div className="px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1">Account</p>
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/5">
                          <span className="text-xs text-white/90 font-mono truncate mr-2">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "No Address"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAddress();
                            }}
                            className="text-white/50 hover:text-white transition-colors"
                          >
                            <Icon name="check" size="sm" className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-1 mx-2" />

                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-2"
                        onClick={() => logout()}
                      >
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
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
      </div >
    </div >
  );
}
