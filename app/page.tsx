"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// OnchainKit wallet imports
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';

import {
  Avatar,
  Name,
  Identity,
  Address,
} from '@coinbase/onchainkit/identity';

export default function Home() {
  const [gasPrice, setGasPrice] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const rpcUrls = [
          "https://rpc.ankr.com/base",
          "https://mainnet.base.org",
          "https://base-mainnet.public.blastapi.io",
        ];

        let fee: bigint | null = null;

        for (const url of rpcUrls) {
          try {
            const provider = new ethers.JsonRpcProvider(url);
            const feeData = await provider.getFeeData();
            if (feeData.maxFeePerGas && feeData.maxFeePerGas > 0n) {
              fee = feeData.maxFeePerGas;
              break;
            }
          } catch (e) {
            // Silent fail, try next RPC
          }
        }

        if (fee) {
          const gwei = ethers.formatUnits(fee, "gwei");
          const value = parseFloat(gwei);
          setGasPrice(value.toFixed(3));
          setError(null);
        } else {
          throw new Error("No valid fee data");
        }
      } catch (err: any) {
        console.error("Gas fetch failed:", err);
        setError("Failed to fetch gas price");
        setGasPrice("Error");
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-green-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-green-800/30 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-green-400 tracking-wide">GLAWNET</h1>

        {/* Wallet Connect - full OnchainKit composable */}
        <Wallet>
          <ConnectWallet className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-md">
            <Avatar className="h-7 w-7" />
            <Name className="ml-2 font-semibold" />
          </ConnectWallet>

          <WalletDropdown>
            <Identity className="px-5 pt-4 pb-3" hasCopyAddressOnClick>
              <Avatar className="h-10 w-10" />
              <Name className="text-lg" />
              <Address className="text-sm text-gray-400" />
            </Identity>
            <WalletDropdownDisconnect className="text-red-400 hover:text-red-300" />
          </WalletDropdown>
        </Wallet>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-green-500/20 shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Base Network Gas</h2>
          <p className="text-sm opacity-70 mb-6">Real-time pricing • Powered by Base Mainnet</p>

          <div className="text-6xl font-bold font-mono text-green-400">
            {gasPrice} <span className="text-3xl">Gwei</span>
          </div>

          {error && <p className="text-red-400 mt-4 text-lg">{error}</p>}

          <p className="text-sm mt-4 opacity-60">Updates every 15 seconds</p>
        </div>
      </div>
    </main>
  );
}