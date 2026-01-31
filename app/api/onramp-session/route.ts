import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

const CDP_API_KEY_SAFE = CDP_API_KEY as string;
const CDP_API_SECRET_SAFE = CDP_API_SECRET as string;

// Helper to generate JWT using HS256 (matching existing patterns in onramp-quote)
function generateJWT() {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: CDP_API_KEY_SAFE,
        sub: CDP_API_KEY_SAFE,
        aud: "coinbase-cloud",
        iat: now,
        exp: now + 60 * 5, // 5 minutes
    };
    return jwt.sign(payload, CDP_API_SECRET_SAFE, { algorithm: "HS256" });
}

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
            quoteId,
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

        // Generate JWT
        let jwtToken: string;
        try {
            jwtToken = generateJWT();
        } catch (jwtError) {
            console.error("Error generating JWT:", jwtError);
            return NextResponse.json(
                {
                    error: "Failed to generate JWT for CDP API authentication.",
                    details:
                        jwtError instanceof Error ? jwtError.message : "Unknown error",
                },
                { status: 500 },
            );
        }

        // Prepare request body for session token
        const requestBody: {
            addresses: Array<{ address: string; blockchains: string[] }>;
            assets: string[];
            fiatCurrency: string;
            defaultPaymentMethod: string;
            presetFiatAmount?: number;
            quoteId?: string;
        } = {
            addresses: [
                {
                    address,
                    blockchains,
                },
            ],
            assets,
            fiatCurrency,
            defaultPaymentMethod,
        };

        if (presetFiatAmount) {
            requestBody.presetFiatAmount = presetFiatAmount;
        }
        if (quoteId) {
            requestBody.quoteId = quoteId;
        }

        // Call Coinbase Onramp Session Token API
        const response = await fetch(
            "https://api.developer.coinbase.com/onramp/v1/token",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            },
        );

        const responseText = await response.text();
        if (!response.ok) {
            let errorDetails;
            try {
                errorDetails = JSON.parse(responseText);
            } catch {
                errorDetails = responseText;
            }
            console.error("Coinbase Session Token API error:", {
                status: response.status,
                body: errorDetails
            });

            if (response.status === 401) {
                return NextResponse.json(
                    {
                        error: "Authentication failed",
                        details: "Please verify your CDP API key and secret are correct.",
                        apiError: errorDetails,
                    },
                    { status: 401 },
                );
            }
            return NextResponse.json(
                {
                    error: `CDP API error: ${response.status} ${response.statusText}`,
                    details: errorDetails,
                },
                { status: response.status },
            );
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            return NextResponse.json(
                {
                    error: "Invalid response from CDP API",
                    details: responseText,
                },
                { status: 500 },
            );
        }

        const sessionToken = data.token || data.data?.token;
        if (!sessionToken) {
            return NextResponse.json(
                { error: "No session token returned from Coinbase API" },
                { status: 500 },
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
    } catch (mainError) {
        console.error("Onramp session error:", mainError);
        return NextResponse.json(
            {
                error: "Failed to generate session token",
                details:
                    mainError instanceof Error ? mainError.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
