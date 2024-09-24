import { Layout } from "@/components";
import "@/styles/globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import type { AppProps } from "next/app";
import "semantic-ui-css/semantic.min.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useEffect, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// 2. Configure wagmi client
const chains = [
  // localhost,
  // mainnet,
  // polygon,
  // avalanche,
  // arbitrum,
  // bscTestnet,
  // bsc,
  // optimism,
  // gnosis,
  // fantom,
  sepolia,
];

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [sepolia],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),

      [sepolia.id]: http(`https://ethereum-sepolia-rpc.publicnode.com`),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,

    // Required App Info
    appName: "Bridge Architecton",

    // Optional App Info
    appDescription: "Bridge Architecton",
    appUrl: "https://bridge.architecton.site", // your app's url
    appIcon: "https://ton.vote/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <TonConnectUIProvider
                manifestUrl={
                  process.env.NEXT_PUBLIC_TON_CONNECT_V2_MANIFEST_URL!
                }
              >
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </TonConnectUIProvider>
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      ) : null}
    </>
  );
};

export default App;
