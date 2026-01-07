import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const MEMBERSHIPS = {
  Brand: {
    name: "Brand",
    price: "1000",
    description: "Curated creator partnerships and collaborations for brands.",
    color: "#fbbf24",
    gradient: "from-[#fbbf24] to-[#f59e42]",
  },
  Investor: {
    name: "Investor",
    price: "100",
    description: "Exclusive access to creative investment opportunities.",
    color: "#60a5fa",
    gradient: "from-[#60a5fa] to-[#2563eb]",
  },
  Creator: {
    name: "Creator",
    price: "30",
    description: "Unlock creative resources, mentorship, and community.",
    color: "#34d399",
    gradient: "from-[#34d399] to-[#059669]",
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const membershipName = searchParams.get("membership") || "Creator";

    const membership =
      MEMBERSHIPS[membershipName as keyof typeof MEMBERSHIPS] ||
      MEMBERSHIPS.Creator;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${membership.color} 0%, ${membership.color}dd 100%)`,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px",
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "120px",
                fontWeight: "bold",
                color: "white",
                marginBottom: "40px",
              }}
            >
              ⭐
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "72px",
                fontWeight: "bold",
                color: "white",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {membership.name} Membership
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "36px",
                color: "rgba(255, 255, 255, 0.9)",
                marginBottom: "40px",
                textAlign: "center",
                maxWidth: "900px",
              }}
            >
              {membership.description}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "20px 40px",
                borderRadius: "16px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {membership.price} USDC
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                color: "rgba(255, 255, 255, 0.8)",
                marginTop: "60px",
              }}
            >
              Creative Memberships
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.log(message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

