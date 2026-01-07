"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { encodeAbiParameters, parseUnits, type Abi, formatUnits, isAddress } from "viem";
import { erc20Abi } from "viem";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import unlockAbiJson from "../../lib/abis/Unlock.json";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getUnlockPaywallCheckoutUrl } from "../utils/unlockPaywall";
import { useToast } from "./Toast";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]",
    secondary:
      "bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]",
    outline:
      "border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]",
    ghost:
      "hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function Card({ title, children, className = "", onClick }: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

type FeaturesProps = {
  setActiveTab: (tab: string) => void;
};

export function Features({ setActiveTab }: FeaturesProps) {
  const [activeTier, setActiveTier] = useState(0);
  const tiers = [
    {
      name: "Creator",
      icon: "star" as const,
      features: [
        "Access to exclusive creative resources and events",
        "Media exposure opportunities",
        "Seasonal creative challenges and competitions",
        "Competitve revenue sharing and earning opportunities",
        "Access to creative Web3/AI software and tools",
        "Community feedback and collaboration spaces",
      ],
    },
    {
      name: "Investor",
      icon: "star" as const,
      features: [
        "Exclusive access to emerging creative talent",
        "Priority investment opportunities in creative projects",
        "Detailed market analysis and trend reports",
        "Direct connections with top-tier creators",
        "Portfolio diversification strategies",
        "Exclusive investor-only events and networking",
        "Advanced analytics and performance tracking",
      ],
    },
    {
      name: "Brand",
      icon: "star" as const,
      features: [
        "Curated creator partnerships and collaborations",
        "Custom brand integration and storytelling campaigns",
        "Access to premium creative talent pool",
        "Strategic marketing consultation and campaign planning",
        "Exclusive brand showcase and visibility opportunities",
        "Priority access to trending creators and influencers",
        "Comprehensive brand analytics and ROI tracking",
      ],
    },
  ];

  const nextTier = () => {
    setActiveTier((prev) => (prev + 1) % tiers.length);
  };

  const prevTier = () => {
    setActiveTier((prev) => (prev - 1 + tiers.length) % tiers.length);
  };

  const goToTier = (index: number) => {
    setActiveTier(index);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Membership Tiers & Features">
        <div className="space-y-6">
          {/* Tier Cards Container */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeTier * 100}%)` }}
              >
                {tiers.map((tier, index) => (
                  <div key={tier.name} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-br from-[var(--app-card-bg)] to-[var(--app-card-border)] rounded-xl p-6 border border-[var(--app-card-border)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-[var(--app-accent)] flex items-center">
                          <Icon name={tier.icon} className="mr-2" />
                          {tier.name} Tier
                        </h3>
                        <span className="text-sm text-[var(--app-foreground-muted)]">
                          {index + 1} of {tiers.length}
                        </span>
                      </div>

                      <ul className="space-y-3">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Icon
                              name="check"
                              className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                            />
                            <span className="text-[var(--app-foreground-muted)] text-sm">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTier}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-[var(--app-card-bg)] hover:bg-[var(--app-accent-light)] p-2 rounded-full shadow-lg border border-[var(--app-card-border)] transition-colors"
              aria-label="Previous tier"
            >
              <svg
                className="w-4 h-4 text-[var(--app-foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextTier}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--app-card-bg)] hover:bg-[var(--app-accent-light)] p-2 rounded-full shadow-lg border border-[var(--app-card-border)] transition-colors"
              aria-label="Next tier"
            >
              <svg
                className="w-4 h-4 text-[var(--app-foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2">
            {tiers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTier(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === activeTier
                    ? "bg-[var(--app-accent)]"
                    : "bg-[var(--app-foreground-muted)] hover:bg-[var(--app-foreground)]"
                }`}
                aria-label={`Go to ${tiers[index].name} tier`}
              />
            ))}
          </div>

          {/* Swipe Instructions */}
          <div className="text-center">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              Swipe or use arrows to explore different tiers
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setActiveTab("home")}
          className="mt-4"
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
}

type HomeProps = {
  setActiveTab: (tab: string) => void;
};

export function Home({ setActiveTab }: HomeProps) {
  const [selected, setSelected] = useState<(typeof MEMBERSHIPS)[0] | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // Get referrer from URL params
  const referrerAddress = searchParams.get("referrer");
  const referrer = referrerAddress && isAddress(referrerAddress) 
    ? (referrerAddress as `0x${string}`)
    : ZERO_ADDRESS;

  // Fetch USDC balance when wallet is connected
  useEffect(() => {
    async function fetchUSDCBalance() {
      if (!address || !publicClient) return;
      setBalanceLoading(true);
      try {
        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        });
        setUsdcBalance(BigInt(balance));
      } catch {
        setUsdcBalance(0n);
      }
      setBalanceLoading(false);
    }
    if (address && publicClient) {
      fetchUSDCBalance();
    }
  }, [address, publicClient]);

  async function checkAllowance(membership: (typeof MEMBERSHIPS)[0]) {
    if (!address || !membership || !publicClient) return;
    setChecking(true);
    try {
      const allowance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, membership.address],
      });
      setIsApproved(
        BigInt(allowance) >= parseUnits(membership.price, membership.decimals),
      );
    } catch {
      setIsApproved(false);
    }
    setChecking(false);
  }

  async function approveUSDC(membership: (typeof MEMBERSHIPS)[0]) {
    if (!walletClient || !membership) return;
    // Check if the current network is Base (8453)
    const baseChainIdHex = "0x2105"; // 8453 in hex
    if (walletClient.chain?.id !== 8453) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: baseChainIdHex }],
        });
      } catch (switchError: unknown) {
        // Check if the error is an object and has a 'code' property
        if (
          typeof switchError === "object" &&
          switchError !== null &&
          "code" in switchError &&
          (switchError as { code: number }).code === 4902
        ) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: baseChainIdHex,
                  chainName: "Base Mainnet",
                  rpcUrls: ["https://mainnet.base.org"],
                  nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://basescan.org"],
                },
              ],
            });
          } catch {
            showToast("Please add the Base network to your wallet to continue.", "error");
            return;
          }
        } else {
          showToast("Please switch to the Base network in your wallet to continue.", "error");
          return;
        }
      }
      // After switching, the user must re-try the transaction
      return;
    }
    await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [
        membership.address,
        parseUnits(membership.price, membership.decimals),
      ],
    });
    await checkAllowance(membership);
  }

  function handleCardClick(membership: (typeof MEMBERSHIPS)[0]) {
    // Prevent selection if wallet is not connected
    if (!address) {
      return;
    }
    setSelected(membership);
    setShowModal(true);
    setEmail("");
    setIsApproved(false);
    checkAllowance(membership);
  }

  function closeModal() {
    setShowModal(false);
    setSelected(null);
    setEmail("");
    setIsApproved(false);
  }

  // Helper to check if user has enough USDC for selected membership
  const hasEnoughUSDC = selected
    ? usdcBalance >= parseUnits(selected.price, selected.decimals)
    : true;

  // Share membership with referral code
  async function handleShareMembership(membership: (typeof MEMBERSHIPS)[0]) {
    if (!address) {
      showToast("Please connect your wallet to share a membership", "error");
      return;
    }

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    // Use Unlock paywall checkout URL with referrer
    const paywallUrl = getUnlockPaywallCheckoutUrl(
      address as `0x${string}`,
      `${baseUrl}/share?membership=${encodeURIComponent(membership.name)}&referrer=${address}`,
    );
    
    // Also create a share page URL for better social media previews
    const shareUrl = `${baseUrl}/share?membership=${encodeURIComponent(membership.name)}&referrer=${address}`;

    // Try to use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${membership.name} Membership`,
          text: `Check out the ${membership.name} Membership on Creative Memberships! Use my referral link to get started.`,
          url: shareUrl,
        });
        showToast("Share dialog opened", "success");
      } catch (err) {
        // User cancelled or error occurred, fall back to clipboard
        await navigator.clipboard.writeText(shareUrl);
        showToast("Share link copied to clipboard!", "success");
      }
    } else {
      // Fall back to clipboard
      await navigator.clipboard.writeText(shareUrl);
      showToast("Share link copied to clipboard!", "success");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Creative Memberships">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          <strong>Creative Memberships</strong> is your all-access pass to the
          cutting-edge Web3 and AI platforms and tools within the{" "}
          <a
            href="https://creativeplatform.xyz"
            className="text-[var(--app-accent)] underline hover:text-[var(--app-accent-hover)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Creative Platform
          </a>{" "}
          ecosystem.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setActiveTab("features")}
            icon={<Icon name="arrow-right" size="sm" />}
          >
            Explore Features
          </Button>
          <Button
            onClick={() => setActiveTab("fund")}
            variant="outline"
            icon={<Icon name="plus" size="sm" />}
          >
            Add Funds
          </Button>
        </div>
      </Card>

      <Card title="Choose Your Membership">
        {address && (
          <div className="flex items-center gap-3 mb-4">
            {/* USDC Icon */}
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2775CA]/10 border border-[#2775CA]/20">
              <Image
                src="/usd-coin-usdc-logo.svg"
                alt="USDC"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </span>
            <div>
              <div className="text-xs text-[var(--app-foreground-muted)] font-medium">
                USDC Balance
              </div>
              <div className="text-lg font-bold text-[#2775CA]">
                {balanceLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    {formatUnits(usdcBalance, 6)}{" "}
                    <span className="text-xs font-normal text-[var(--app-foreground-muted)]">
                      USDC
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        <p className="text-[var(--app-foreground-muted)] mb-4">
          {!address
            ? "Connect your wallet to select a membership:"
            : "Select your tier to get started:"}
        </p>
        <div className="grid grid-cols-1 gap-4">
          {MEMBERSHIPS.map((m) => (
            <div
              key={m.name}
              className={`rounded-xl shadow-md border border-[var(--app-card-border)] bg-gradient-to-r ${m.color} p-4 flex items-center justify-between transition-transform ${
                address
                  ? "hover:scale-[1.02] cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={(e) => {
                if (address && !(e.target as HTMLElement).closest("button")) {
                  handleCardClick(m);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <Icon name="star" size="md" className="text-white" />
                <div>
                  <h3 className="text-lg font-bold text-white">{m.name}</h3>
                  <p className="text-white/80 text-sm">{m.price} USDC {m.billingPeriod}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-white/90 text-xs mb-1">{m.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                      e?.stopPropagation();
                      handleShareMembership(m);
                    }}
                    disabled={!address}
                    icon={<Icon name="share" size="sm" />}
                  >
                    Share
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => handleCardClick(m)}
                    disabled={!address}
                  >
                    {address ? "Purchase" : "Connect Wallet"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <MyMemberships />

      {/* Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[var(--app-card-bg)] rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-600"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">
              Buy {selected.name} Membership
            </h2>
            <p className="mb-4 text-[var(--app-foreground-muted)]">
              {selected.description}
            </p>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#1A202C]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-lg text-[var(--app-foreground)] bg-[var(--app-card-bg)] border-[var(--app-card-border)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
              />
            </div>
            {/* USDC Balance Warning */}
            {selected && (
              <div className="mb-2 text-sm">
                {balanceLoading ? (
                  <span className="text-[var(--app-foreground-muted)]">
                    Checking USDC balance...
                  </span>
                ) : (
                  <span>
                    Your USDC balance:{" "}
                    {formatUnits(usdcBalance, selected.decimals)} USDC
                  </span>
                )}
                {!hasEnoughUSDC && !balanceLoading && (
                  <div className="text-red-500 mt-1">
                    Insufficient USDC balance for this membership.
                  </div>
                )}
              </div>
            )}
            {!isApproved ? (
              <Button
                variant="primary"
                size="md"
                className="w-full mb-2"
                onClick={() => approveUSDC(selected)}
                disabled={checking || !email || !hasEnoughUSDC}
              >
                {checking ? "Checking..." : `Approve ${selected.price} USDC ${selected.billingPeriod}`}
              </Button>
            ) : (
              <Transaction
                calls={[
                  {
                    address: selected.address,
                    abi: unlockAbiJson.abi as Abi,
                    functionName: "purchase",
                    args: [
                      [0], // values (for ERC20, always 0)
                      [address], // recipients
                      [referrer], // referrers (from URL or ZERO_ADDRESS)
                      [address], // keyManagers
                      [
                        encodeAbiParameters(
                          [{ type: "string", name: "email" }],
                          [email],
                        ),
                      ], // data
                    ],
                  },
                ]}
              >
                <TransactionButton disabled={!hasEnoughUSDC} />
                <TransactionStatus />
              </Transaction>
            )}
            <Button
              variant="outline"
              size="md"
              className="w-full mt-2"
              onClick={closeModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right" | "send" | "share" | "x";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    send: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Send</title>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    share: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Share</title>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    x: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Close</title>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}

// Predefined application addresses - Update these with actual addresses
const APPLICATION_ADDRESSES: Record<string, `0x${string}` | null> = {
  "Creative TV": null, // Update with actual Creative TV wallet address
  "Creative Bank": null, // Update with actual Creative Bank wallet address
};

function MyMemberships() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { showToast } = useToast();
  const [memberships, setMemberships] = useState<
    Array<{
      name: string;
      hasAccess: boolean;
      keyId?: string;
      expirationTime?: bigint;
      color: string;
      membershipAddress?: `0x${string}`;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<{
    name: string;
    keyId?: string;
    membershipAddress: `0x${string}`;
  } | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [checkingRecipient, setCheckingRecipient] = useState(false);
  const [recipientHasMembership, setRecipientHasMembership] = useState<boolean | null>(null);

  const checkMemberships = useCallback(async () => {
    if (!address || !publicClient) return;

    setLoading(true);
    try {
      const membershipChecks = await Promise.all(
        MEMBERSHIPS.map(async (membership) => {
          try {
            // Check if user has a valid key for this membership
            const hasAccess = await publicClient.readContract({
              address: membership.address,
              abi: unlockAbiJson.abi as Abi,
              functionName: "getHasValidKey",
              args: [address],
            });

            let keyId, expirationTime;
            if (hasAccess) {
              try {
                // Get key details if user has access
                keyId = await publicClient.readContract({
                  address: membership.address,
                  abi: unlockAbiJson.abi as Abi,
                  functionName: "getTokenIdFor",
                  args: [address],
                });

                expirationTime = (await publicClient.readContract({
                  address: membership.address,
                  abi: unlockAbiJson.abi as Abi,
                  functionName: "keyExpirationTimestampFor",
                  args: [address],
                })) as bigint;
              } catch (error) {
                console.log("Could not fetch key details:", error);
              }
            }

            return {
              name: membership.name,
              hasAccess: Boolean(hasAccess),
              keyId: keyId?.toString(),
              expirationTime: expirationTime as bigint | undefined,
              color: membership.color,
              membershipAddress: membership.address,
            };
          } catch (error) {
            console.error(
              `Error checking ${membership.name} membership:`,
              error,
            );
            return {
              name: membership.name,
              hasAccess: false,
              color: membership.color,
              membershipAddress: membership.address,
            };
          }
        }),
      );

      setMemberships(membershipChecks);
    } catch (error) {
      console.error("Error checking memberships:", error);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient]);

  // Check memberships when component mounts and when address changes
  useEffect(() => {
    if (address) {
      checkMemberships();
    }
  }, [address, checkMemberships]);

  const activeMemberships = memberships.filter((m) => m.hasAccess);
  const inactiveMemberships = memberships.filter((m) => !m.hasAccess);

  const formatExpirationDate = (timestamp?: bigint) => {
    if (!timestamp) return "Unknown";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  // Function to check memberships for any wallet address
  const checkMembershipsForAddress = useCallback(async (walletAddress: `0x${string}`) => {
    if (!walletAddress || !publicClient) return null;

    try {
      const membershipChecks = await Promise.all(
        MEMBERSHIPS.map(async (membership) => {
          try {
            const hasAccess = await publicClient.readContract({
              address: membership.address,
              abi: unlockAbiJson.abi as Abi,
              functionName: "getHasValidKey",
              args: [walletAddress],
            });
            return {
              name: membership.name,
              hasAccess: Boolean(hasAccess),
            };
          } catch (error) {
            return {
              name: membership.name,
              hasAccess: false,
            };
          }
        }),
      );
      return membershipChecks;
    } catch (error) {
      console.error("Error checking memberships for address:", error);
      return null;
    }
  }, [publicClient]);

  const handleSendClick = (membership: typeof activeMemberships[0]) => {
    if (!membership.keyId || !membership.membershipAddress) return;
    setSelectedMembership({
      name: membership.name,
      keyId: membership.keyId,
      membershipAddress: membership.membershipAddress,
    });
    setSendModalOpen(true);
    setRecipientAddress("");
    setSelectedApp("");
    setRecipientHasMembership(null);
    setCheckingRecipient(false);
  };

  const handleAppSelect = (appName: string) => {
    setSelectedApp(appName);
    // If app address is configured, use it; otherwise user can enter manually
    const appAddress = APPLICATION_ADDRESSES[appName];
    if (appAddress) {
      setRecipientAddress(appAddress);
    } else {
      setRecipientAddress("");
    }
    setRecipientHasMembership(null);
    setCheckingRecipient(false);
  };

  const handleAddressChange = (value: string) => {
    setRecipientAddress(value);
    setSelectedApp("");
    setRecipientHasMembership(null);
    setCheckingRecipient(false);
  };

  const handleCheckRecipient = async () => {
    const addressToCheck = selectedApp 
      ? APPLICATION_ADDRESSES[selectedApp as keyof typeof APPLICATION_ADDRESSES]
      : recipientAddress;

    if (!addressToCheck || !isAddress(addressToCheck)) {
      showToast("Please enter a valid wallet address", "error");
      return;
    }

    if (!selectedMembership || !publicClient) return;

    setCheckingRecipient(true);
    try {
      // Check if recipient has this specific membership
      const hasAccess = await publicClient.readContract({
        address: selectedMembership.membershipAddress,
        abi: unlockAbiJson.abi as Abi,
        functionName: "getHasValidKey",
        args: [addressToCheck as `0x${string}`],
      });
      setRecipientHasMembership(Boolean(hasAccess));
    } catch (error) {
      console.error("Error checking recipient membership:", error);
      setRecipientHasMembership(false);
    } finally {
      setCheckingRecipient(false);
    }
  };

  const handleCloseSendModal = () => {
    setSendModalOpen(false);
    setSelectedMembership(null);
    setRecipientAddress("");
    setSelectedApp("");
    setRecipientHasMembership(null);
    setCheckingRecipient(false);
  };

  const getRecipientAddress = (): `0x${string}` | null => {
    if (selectedApp) {
      const appAddress = APPLICATION_ADDRESSES[selectedApp];
      return appAddress || null;
    }
    if (recipientAddress && isAddress(recipientAddress)) {
      return recipientAddress as `0x${string}`;
    }
    return null;
  };

  // Share referral code for existing membership
  async function handleShareReferralCode(membership: typeof activeMemberships[0]) {
    if (!address) {
      showToast("Please connect your wallet to share your referral code", "error");
      return;
    }

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    // Use Unlock paywall checkout URL with referrer
    const paywallUrl = getUnlockPaywallCheckoutUrl(
      address as `0x${string}`,
      `${baseUrl}/share?membership=${encodeURIComponent(membership.name)}&referrer=${address}`,
    );
    
    // Create share page URL for better social media previews
    const shareUrl = `${baseUrl}/share?membership=${encodeURIComponent(membership.name)}&referrer=${address}`;

    // Try to use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${membership.name} Membership`,
          text: `Join the ${membership.name} Membership on Creative Memberships using my referral code!`,
          url: shareUrl,
        });
        showToast("Share dialog opened", "success");
      } catch (err) {
        // User cancelled or error occurred, fall back to clipboard
        await navigator.clipboard.writeText(shareUrl);
        showToast("Referral link copied to clipboard!", "success");
      }
    } else {
      // Fall back to clipboard
      await navigator.clipboard.writeText(shareUrl);
      showToast("Referral link copied to clipboard!", "success");
    }
  }

  return (
    <>
      <Card title="My Memberships">
        <div className="space-y-4">
          {!address ? (
            <p className="text-[var(--app-foreground-muted)] text-center py-4">
              Connect your wallet to view your memberships
            </p>
          ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
            <span className="ml-2 text-[var(--app-foreground-muted)]">
              Checking memberships...
            </span>
          </div>
        ) : (
          <>
            {activeMemberships.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-[var(--app-foreground)] mb-3 flex items-center">
                  <Icon
                    name="check"
                    size="sm"
                    className="text-green-500 mr-2"
                  />
                  Active Memberships
                </h4>
                <div className="space-y-2">
                  {activeMemberships.map((membership) => (
                    <div
                      key={membership.name}
                      className={`rounded-lg border border-[var(--app-card-border)] bg-gradient-to-r ${membership.color} p-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name="star" size="sm" className="text-white" />
                        <div>
                          <h5 className="font-medium text-white">
                            {membership.name} Member
                          </h5>
                          {membership.keyId && (
                            <p className="text-white/80 text-xs">
                              Key #{membership.keyId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-white text-xs">
                          Expires:{" "}
                          {formatExpirationDate(membership.expirationTime)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleShareReferralCode(membership)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            icon={<Icon name="share" size="sm" />}
                          >
                            Share
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSendClick(membership)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            icon={<Icon name="send" size="sm" />}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inactiveMemberships.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-[var(--app-foreground-muted)] mb-3 flex items-center">
                  <Icon
                    name="plus"
                    size="sm"
                    className="text-[var(--app-foreground-muted)] mr-2"
                  />
                  Available Memberships
                </h4>
                <div className="space-y-2">
                  {inactiveMemberships.map((membership) => (
                    <div
                      key={membership.name}
                      className="rounded-lg border border-[var(--app-card-border)] bg-[var(--app-card-bg)] p-3 flex items-center justify-between opacity-60"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          name="star"
                          size="sm"
                          className="text-[var(--app-foreground-muted)]"
                        />
                        <div>
                          <h5 className="font-medium text-[var(--app-foreground-muted)]">
                            {membership.name} Member
                          </h5>
                          <p className="text-[var(--app-foreground-muted)] text-xs">
                            Not owned
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memberships.length === 0 && (
              <p className="text-[var(--app-foreground-muted)] text-center py-4">
                No membership data available
              </p>
            )}

            <div className="pt-3 border-t border-[var(--app-card-border)]">
              <Button
                variant="outline"
                size="sm"
                onClick={checkMemberships}
                disabled={loading}
                className="w-full"
                icon={<Icon name="arrow-right" size="sm" />}
              >
                {loading ? "Refreshing..." : "Refresh Memberships"}
              </Button>
            </div>
          </>
        )}
      </div>
      </Card>

      {/* Send Membership Modal */}
      {sendModalOpen && selectedMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[var(--app-card-bg)] rounded-xl shadow-xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-600"
              onClick={handleCloseSendModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">
              Send {selectedMembership.name} Membership
            </h2>
            <p className="mb-4 text-[var(--app-foreground-muted)] text-sm">
              Transfer your membership NFT to another wallet address. You can send to a specific application or enter a custom address.
            </p>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-[var(--app-foreground)]">
                Select Application (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                {Object.keys(APPLICATION_ADDRESSES).map((appName) => (
                  <Button
                    key={appName}
                    variant={selectedApp === appName ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleAppSelect(appName)}
                    className="flex-1"
                  >
                    {appName}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-[var(--app-foreground-muted)] mb-2">
                Or enter a custom wallet address:
              </p>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder={selectedApp && !APPLICATION_ADDRESSES[selectedApp] ? `Enter ${selectedApp} wallet address...` : "0x..."}
                className="w-full px-3 py-2 border rounded-lg text-[var(--app-foreground)] bg-[var(--app-card-bg)] border-[var(--app-card-border)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
              />
              {selectedApp && !APPLICATION_ADDRESSES[selectedApp] && (
                <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
                  Please enter the {selectedApp} wallet address manually
                </p>
              )}
            </div>

            {getRecipientAddress() && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckRecipient}
                  disabled={checkingRecipient}
                  className="w-full mb-2"
                >
                  {checkingRecipient ? "Checking..." : "Check Recipient Membership"}
                </Button>
                {recipientHasMembership !== null && (
                  <div className={`p-3 rounded-lg ${
                    recipientHasMembership 
                      ? "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700"
                      : "bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700"
                  }`}>
                    <p className={`text-sm ${
                      recipientHasMembership 
                        ? "text-green-800 dark:text-green-200"
                        : "text-yellow-800 dark:text-yellow-200"
                    }`}>
                      {recipientHasMembership
                        ? "✓ Recipient already has this membership"
                        : "⚠ Recipient does not have this membership"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4 p-3 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
              <p className="text-xs text-[var(--app-foreground-muted)] mb-1">
                Membership: {selectedMembership.name}
              </p>
              <p className="text-xs text-[var(--app-foreground-muted)]">
                Token ID: {selectedMembership.keyId}
              </p>
            </div>

            {getRecipientAddress() && (
              <Transaction
                calls={[
                  {
                    address: selectedMembership.membershipAddress,
                    abi: unlockAbiJson.abi as Abi,
                    functionName: "safeTransferFrom",
                    args: [
                      address!, // from
                      getRecipientAddress()!, // to
                      BigInt(selectedMembership.keyId!), // tokenId
                    ],
                  },
                ]}
                onSuccess={() => {
                  handleCloseSendModal();
                  // Refresh memberships after successful transfer
                  setTimeout(() => checkMemberships(), 2000);
                }}
              >
                <TransactionButton 
                  disabled={!getRecipientAddress() || !isAddress(getRecipientAddress()!)}
                  className="w-full mb-2"
                />
                <TransactionStatus />
              </Transaction>
            )}

            <Button
              variant="outline"
              size="md"
              className="w-full mt-2"
              onClick={handleCloseSendModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Check Memberships for Any Address */}
      <CheckMembershipsForAddress 
        checkMembershipsForAddress={checkMembershipsForAddress}
      />
    </>
  );
}

// Component to check memberships for any wallet address
function CheckMembershipsForAddress({
  checkMembershipsForAddress,
}: {
  checkMembershipsForAddress: (address: `0x${string}`) => Promise<Array<{ name: string; hasAccess: boolean }> | null>;
}) {
  const [checkAddress, setCheckAddress] = useState("");
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; hasAccess: boolean }> | null>(null);
  const [showCheckSection, setShowCheckSection] = useState(false);

  const { showToast } = useToast();

  const handleCheck = async () => {
    if (!checkAddress || !isAddress(checkAddress)) {
      showToast("Please enter a valid wallet address", "error");
      return;
    }

    setChecking(true);
    try {
      const membershipResults = await checkMembershipsForAddress(checkAddress as `0x${string}`);
      setResults(membershipResults);
    } catch (error) {
      console.error("Error checking memberships:", error);
      setResults(null);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card title="Check Memberships for Any Wallet">
      <div className="space-y-4">
        {!showCheckSection ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCheckSection(true)}
            className="w-full"
            icon={<Icon name="arrow-right" size="sm" />}
          >
            Check Another Wallet
          </Button>
        ) : (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-[var(--app-foreground)]">
                Wallet Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={checkAddress}
                  onChange={(e) => setCheckAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-3 py-2 border rounded-lg text-[var(--app-foreground)] bg-[var(--app-card-bg)] border-[var(--app-card-border)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCheck}
                  disabled={checking || !checkAddress}
                >
                  {checking ? "Checking..." : "Check"}
                </Button>
              </div>
            </div>

            {results && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[var(--app-foreground)]">
                  Membership Status:
                </h4>
                {results.map((membership) => (
                  <div
                    key={membership.name}
                    className={`p-3 rounded-lg border ${
                      membership.hasAccess
                        ? "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--app-foreground)]">
                        {membership.name}
                      </span>
                      {membership.hasAccess ? (
                        <span className="text-green-600 dark:text-green-400 text-sm flex items-center">
                          <Icon name="check" size="sm" className="mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Not owned
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCheckSection(false);
                setCheckAddress("");
                setResults(null);
              }}
              className="w-full"
            >
              Close
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

// Keep the existing membership functionality as a separate component
const USDC_ADDRESS =
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as `0x${string}`;
const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;
const MEMBERSHIPS = [
  {
    name: "Brand",
    address: "0x9c3744c96200a52d05a630d4aec0db707d7509be" as `0x${string}`,
    price: "1000",
    decimals: 6,
    description: "Curated creator partnerships and collaborations for brands.",
    color: "from-[#fbbf24] to-[#f59e42]",
    billingPeriod: "per month",
  },
  {
    name: "Investor",
    address: "0x13b818daf7016b302383737ba60c3a39fef231cf" as `0x${string}`,
    price: "100",
    decimals: 6,
    description: "Exclusive access to creative investment opportunities.",
    color: "from-[#60a5fa] to-[#2563eb]",
    billingPeriod: "per month",
  },
  {
    name: "Creator",
    address: "0xf7c4cd399395d80f9d61fde833849106775269c6" as `0x${string}`,
    price: "30",
    decimals: 6,
    description: "Unlock creative resources, mentorship, and community.",
    color: "from-[#34d399] to-[#059669]",
    billingPeriod: "every 3 months",
  },
];
