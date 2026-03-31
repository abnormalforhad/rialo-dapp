import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()], // Generic injected wallet, usually MetaMask
  transports: {
    [sepolia.id]: http(), // Standard public RPC fallback
  },
});
