import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { MainContext } from "../context";

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "XMTP-Chat-App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

import { Client, Conversation } from "@xmtp/xmtp-js";
import { useProvider, useAccount, useSigner } from "wagmi";
import { useState, useRef } from "react";

export default function App({ Component, pageProps }) {
  const [client, setClient] = useState();
  const [currentConversation, setCurrentConversation] = useState();
  const profilesRef = useRef({});

  return (
    <MainContext.Provider
      value={{
        client,
        currentConversation,
        setCurrentConversation,
        profilesRef,
        setClient,
      }}
    >
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </MainContext.Provider>
  );
}
