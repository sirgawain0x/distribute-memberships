import { Suspense } from "react";
import type { Metadata } from "next";
import SharePageClient from "./SharePageClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { membership?: string; referrer?: string };
}): Promise<Metadata> {
  const membershipName = searchParams?.membership || "Creator";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const membershipTitles = {
    Brand: "Brand Membership - Creative Memberships",
    Investor: "Investor Membership - Creative Memberships",
    Creator: "Creator Membership - Creative Memberships",
  };

  const membershipDescriptions = {
    Brand: "Curated creator partnerships and collaborations for brands. Join the Brand Membership for exclusive access to premium creative talent.",
    Investor: "Exclusive access to creative investment opportunities. Join the Investor Membership for priority access to emerging creative projects.",
    Creator: "Unlock creative resources, mentorship, and community. Join the Creator Membership for access to exclusive creative resources and events.",
  };

  const title =
    membershipTitles[membershipName as keyof typeof membershipTitles] ||
    membershipTitles.Creator;
  const description =
    membershipDescriptions[membershipName as keyof typeof membershipDescriptions] ||
    membershipDescriptions.Creator;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `${baseUrl}/api/og?membership=${encodeURIComponent(membershipName)}`,
          width: 1200,
          height: 630,
          alt: `${membershipName} Membership`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `${baseUrl}/api/og?membership=${encodeURIComponent(membershipName)}`,
      ],
    },
  };
}

export default function SharePage({
  searchParams,
}: {
  searchParams: { membership?: string; referrer?: string };
}) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 32 }}>Loading membership share...</div>
      }
    >
      <SharePageClient searchParams={searchParams} />
    </Suspense>
  );
}
