'use client'

import { createConfig, http } from 'wagmi'
import {  baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

// Zora-specific config that includes Base Sepolia for testing
const zoraConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http()
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
})

const zoraQueryClient = new QueryClient()

export function ZoraProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={zoraConfig}>
      <QueryClientProvider client={zoraQueryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 