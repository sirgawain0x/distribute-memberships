import { NextResponse } from "next/server";
import { CoinbaseAuthenticator } from "@coinbase/coinbase-sdk";

const CDP_API_KEY = process.env.CDP_API_KEY_NAME;
const CDP_API_SECRET = process.env.CDP_API_KEY_PRIVATE_KEY;
const CDP_PROJECT_ID = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

if (!CDP_API_KEY || !CDP_API_SECRET) {
    throw new Error(
        "CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY must be set in your environment variables.",
    );
}

if (!CDP_PROJECT_ID) {
    throw new Error(
        "NEXT_PUBLIC_CDP_PROJECT_ID must be set in your environment variables.",
    );
}

// Configure Coinbase SDK Logic manually since Onramp isn't in the high-level client yet
const auth = new CoinbaseAuthenticator(CDP_API_KEY, CDP_API_SECRET, "coinbase_onramp_app");

// POST: Generate a session token
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            address,
            assets = ["USDC"],
            blockchains = ["base"],
            fiatCurrency = "USD",
            defaultPaymentMethod = "CRYPTO_ACCOUNT",
            presetFiatAmount,
        } = body;

        if (!address) {
            return NextResponse.json(
                { error: "Missing required field: address" },
                { status: 400 },
            );
        }

        // Validate address format
        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
            return NextResponse.json(
                { error: "Invalid address format" },
                { status: 400 },
            );
        }

        // Prepare request body for session token
        // According to docs, only addresses, assets, and clientIp are supported in the session token request
        const requestBody = {
            addresses: [
                {
                    address,
                    blockchains,
                },
            ],
            assets,
        };


        const url = "https://api.developer.coinbase.com/onramp/v1/token";

        // Generate JWT using the SDK's authenticator
        // This ensures the correct signing algorithm (ES256) and claims are used
        const jwtToken = await auth.buildJWT(url, "POST");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Coinbase Onramp API Error:", response.status, errorText);

            // Try to parse JSON error
            let details = errorText;
            try {
                details = JSON.parse(errorText);
            } catch { }

            return NextResponse.json(
                { error: `Onramp API Error: ${response.status}`, details },
                { status: response.status }
            );
        }

        const data = await response.json();
        const sessionToken = data.token; // API returns { token: "..." }

        if (!sessionToken) {
            console.error("No token in response:", data);
            return NextResponse.json(
                { error: "No session token returned from Coinbase API" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            sessionToken,
            config: {
                assets,
                blockchains,
                fiatCurrency,
                defaultPaymentMethod,
                presetFiatAmount,
                projectId: CDP_PROJECT_ID,
            },
        });
    } catch (error) {
        console.error("Onramp session error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate session token",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
