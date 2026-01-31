import {
    AlchemyAccountsUIConfig,
    createConfig,
} from "@account-kit/react";
import { base, alchemy } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
    illustrationStyle: "outline",
    auth: {
        sections: [
            [{ type: "email" as const }],
            [
                { type: "passkey" as const },
                { type: "social" as const, authProviderId: "google", mode: "popup" },
                { type: "social" as const, authProviderId: "facebook", mode: "popup" },
            ],
        ],
        addPasskeyOnSignup: false,
    },
};

export const config = createConfig({
    transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "YOUR_API_KEY" }),
    chain: base,
    ssr: true, // set to false if you're not using server-side rendering
    enablePopupOauth: true,
}, uiConfig);

export const queryClient = new QueryClient();
