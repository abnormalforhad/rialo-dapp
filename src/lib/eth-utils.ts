/**
 * Ethereum Utility Functions
 * Formatting, parsing, and display helpers for ETH amounts and addresses.
 */

import { formatEther, parseEther } from "viem";

/**
 * Format a wei amount to a human-readable ETH string.
 */
export function formatEthAmount(weiAmount: string | bigint): string {
  const value = formatEther(BigInt(weiAmount));
  const num = parseFloat(value);
  if (num === 0) return "0 ETH";
  if (num < 0.0001) return "<0.0001 ETH";
  return `${num.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`;
}

/**
 * Parse a human-readable ETH amount to wei string.
 */
export function parseEthToWei(ethAmount: number): string {
  return parseEther(ethAmount.toString()).toString();
}

/**
 * Format a wei amount with a specific token symbol.
 */
export function formatTokenAmount(weiAmount: string | bigint, token: string = "ETH"): string {
  if (token === "ETH") {
    return formatEthAmount(weiAmount);
  }
  // Fallback for any other token
  return `${formatEther(BigInt(weiAmount))} ${token}`;
}

/**
 * Shorten an Ethereum address for display.
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Validate an Ethereum address format.
 */
export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get Sepolia Etherscan URL for a transaction.
 */
export function getExplorerTxUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

/**
 * Get Sepolia Etherscan URL for an address.
 */
export function getExplorerAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}
