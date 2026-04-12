import { http, createConfig, createStorage, noopStorage } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()], // Generic injected wallet, usually MetaMask
  transports: {
    [sepolia.id]: http(), // Standard public RPC fallback
  },
  // Disable persistent storage so wagmi never auto-reconnects
  // to the last wallet. The user must explicitly click "Connect".
  storage: createStorage({ storage: noopStorage }),
});
