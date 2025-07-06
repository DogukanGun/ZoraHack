import { createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
import { createWalletClient, createPublicClient, http } from "viem";
import {  baseSepolia } from "viem/chains";
 
// Set up viem clients
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://base-sepolia.drpc.org"),
});
 
const walletClient = createWalletClient({
  account: "<your coin address>",
  chain: baseSepolia,
  transport: http("https://base-sepolia.drpc.org"),
});

// Define coin parameters
const coinParams = {
  name: "Video Coin",
  symbol: "VIDEO",
  uri: "https://harlequin-remarkable-manatee-695.mypinata.cloud/ipfs/bafybeiazc472at4d3rubhtswi6vnbkg3sululmul5oh46ufmwp3sdwe24a",
  payoutRecipient: "<your coin address>",
  chainId: baseSepolia.id, // Optional: defaults to base.id
  currency: DeployCurrency.ZORA, // Optional: ZORA or ETH
};
 
// Create the coin
async function createMyCoin() {
  try {
    const result = await createCoin(coinParams, walletClient, publicClient, {
      gasMultiplier: 120, // Optional: Add 20% buffer to gas (defaults to 100%)
      // account: customAccount, // Optional: Override the wallet client account
    });
    
    console.log("Transaction hash:", result.hash);
    console.log("Coin address:", result.address);
    console.log("Deployment details:", result.deployment);
    
    return result;
  } catch (error) {
    console.error("Error creating coin:", error);
    throw error;
  }
}
createMyCoin()