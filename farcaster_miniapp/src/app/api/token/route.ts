import { NextRequest, NextResponse } from 'next/server';
import { createCoin, DeployCurrency, ValidMetadataURI } from "@zoralabs/coins-sdk";
import { createWalletClient, createPublicClient, http, Address, WriteContractParameters } from "viem";
import { base } from "viem/chains";

// Initialize clients
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
});

const walletClient = createWalletClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  account: process.env.NEXT_PUBLIC_CREATOR_ADDRESS as Address,
});

const buyAbi = [{
  name: "buy",
  type: "function",
  stateMutability: "payable",
  inputs: [
    { name: "recipient", type: "address" },
    { name: "minAmountOut", type: "uint256" },
  ],
  outputs: [{ name: "amountOut", type: "uint256" }],
}] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prompt, videoUrl, tokenAddress, amount } = body;

    if (action === 'create_token') {
      // Create coin parameters
      const coinParams = {
        name: `Video NFT: ${prompt.substring(0, 30)}...`,
        symbol: "VNFT",
        uri: `ipfs://your-ipfs-hash` as ValidMetadataURI, // You'll need to implement IPFS upload
        payoutRecipient: process.env.NEXT_PUBLIC_CREATOR_ADDRESS as Address,
        currency: DeployCurrency.ZORA,
        description: `AI Generated Video from prompt: ${prompt}`
      };

      // Create the coin
      const result = await createCoin(coinParams, walletClient, publicClient);

      return NextResponse.json({ 
        success: true, 
        tokenAddress: result.address,
        message: "Token created successfully" 
      });
    } else if (action === 'buy_token') {
      if (!tokenAddress || !amount) {
        return NextResponse.json({ 
          success: false, 
          message: "Token address and amount are required" 
        }, { status: 400 });
      }

      // Execute trade using the contract directly
      const writeParams: WriteContractParameters = {
        chain: base,
        account: process.env.NEXT_PUBLIC_CREATOR_ADDRESS as Address,
        address: tokenAddress as Address,
        abi: buyAbi,
        functionName: "buy",
        args: [
          process.env.NEXT_PUBLIC_CREATOR_ADDRESS as Address, // recipient
          BigInt(Math.floor(Number(amount) * 0.95)), // minAmountOut (5% slippage)
        ],
        value: BigInt(amount),
      };

      const txHash = await walletClient.writeContract(writeParams);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      return NextResponse.json({
        success: true,
        message: "Token purchased successfully",
        transactionHash: txHash
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: "Invalid action" 
    }, { status: 400 });

  } catch (error) {
    console.error('Error in token operations:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
} 