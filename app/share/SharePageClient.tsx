"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { Button } from "../components/DemoComponents";
import { Icon } from "../components/DemoComponents";
import { handleSplashScreen } from "../utils/farcaster";
import { getUnlockPaywallCheckoutUrl } from "../utils/unlockPaywall";

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

export default function SharePageClient({
  searchParams,
}: {
  searchParams: { membership?: string; referrer?: string };
}) {
  const router = useRouter();
  const { address } = useAccount();
  const [membershipName, setMembershipName] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);
  const [validReferrer, setValidReferrer] = useState<`0x${string}` | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await handleSplashScreen();
      const membership = searchParams?.membership || null;
      const referrerParam = searchParams?.referrer || null;
      setMembershipName(membership);
      setReferrer(referrerParam);
      
      // Validate referrer address
      const validatedReferrer = referrerParam && isAddress(referrerParam)
        ? (referrerParam as `0x${string}`)
        : null;
      setValidReferrer(validatedReferrer);
      
      setLoading(false);
    }
    init();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
      </div>
    );
  }

  const membership = MEMBERSHIPS.find((m) => m.name === membershipName);

  if (!membership) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Membership Not Found</h1>
        <p className="text-[var(--app-foreground-muted)] mb-4">
          The membership you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Join {membership.name} Membership
            </h1>
            {validReferrer && (
              <p className="text-[var(--app-foreground-muted)] text-sm">
                You've been invited to join by a member!
              </p>
            )}
          </div>

          <div
            className={`rounded-xl shadow-md border border-[var(--app-card-border)] bg-gradient-to-r ${membership.color} p-6 mb-6`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="star" size="lg" className="text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {membership.name} Membership
                </h2>
                <p className="text-white/80 text-sm">
                  {membership.price} USDC {membership.billingPeriod}
                </p>
              </div>
            </div>
            <p className="text-white/90 text-sm mb-4">
              {membership.description}
            </p>
          </div>

          <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-6">
            <h3 className="text-lg font-semibold mb-4">What's Included:</h3>
            <ul className="space-y-2">
              {membership.name === "Creator" && (
                <>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Access to exclusive creative resources and events
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Media exposure opportunities
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Access to creative Web3/AI software and tools
                    </span>
                  </li>
                </>
              )}
              {membership.name === "Investor" && (
                <>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Exclusive access to emerging creative talent
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Priority investment opportunities in creative projects
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Advanced analytics and performance tracking
                    </span>
                  </li>
                </>
              )}
              {membership.name === "Brand" && (
                <>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Curated creator partnerships and collaborations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Access to premium creative talent pool
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Icon
                      name="check"
                      className="text-[var(--app-accent)] mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-[var(--app-foreground-muted)] text-sm">
                      Comprehensive brand analytics and ROI tracking
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => {
                const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                const redirectUri = `${baseUrl}/?membership=${encodeURIComponent(membership.name)}${validReferrer ? `&referrer=${validReferrer}` : ""}`;
                
                // Use Unlock paywall checkout URL with referrer (only if valid)
                if (validReferrer) {
                  const paywallUrl = getUnlockPaywallCheckoutUrl(
                    validReferrer,
                    redirectUri,
                  );
                  window.location.href = paywallUrl;
                } else {
                  // No valid referrer, just redirect to home page
                  router.push(`/?membership=${encodeURIComponent(membership.name)}`);
                }
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

