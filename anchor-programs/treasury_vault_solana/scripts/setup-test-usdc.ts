// =============================================================================
// Setup Test USDC for Demo
// =============================================================================
// Creates a test USDC token and mints some to your wallet and the vault
// Usage: npx ts-node scripts/setup-test-usdc.ts
// =============================================================================

import { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const VAULT_TOKEN_ACCOUNT = new PublicKey("3tg7yaecTqDSRJufwcrbiSqtJzeyiKKmLQzdkr7sgikx");

async function main() {
  console.log("=".repeat(60));
  console.log("FRCT - Setup Test USDC");
  console.log("=".repeat(60));

  // Load wallet
  const walletPath = process.env.ANCHOR_WALLET || 
    path.join(process.env.HOME || "", ".config/solana/id.json");
  
  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  console.log("\nWallet:", walletKeypair.publicKey.toBase58());
  
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log("SOL Balance:", balance / 1e9, "SOL");

  if (balance < 0.1 * 1e9) {
    console.log("\n⚠️  Low SOL balance. Requesting airdrop...");
    try {
      const sig = await connection.requestAirdrop(walletKeypair.publicKey, 1e9);
      await connection.confirmTransaction(sig);
      console.log("Airdrop successful!");
    } catch (e) {
      console.log("Airdrop failed (rate limited). Please try again later.");
    }
  }

  // Create a new test USDC mint
  console.log("\n📝 Creating Test USDC Mint...");
  
  const mint = await createMint(
    connection,
    walletKeypair,      // Payer
    walletKeypair.publicKey, // Mint authority
    null,               // Freeze authority
    6                   // Decimals (USDC standard)
  );

  console.log("✅ Test USDC Mint created:", mint.toBase58());

  // Create token account for user
  console.log("\n📝 Creating your token account...");
  
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    walletKeypair,
    mint,
    walletKeypair.publicKey
  );

  console.log("✅ Your token account:", userTokenAccount.address.toBase58());

  // Mint 1000 USDC to user
  console.log("\n💰 Minting 1000 Test USDC to your wallet...");
  
  await mintTo(
    connection,
    walletKeypair,
    mint,
    userTokenAccount.address,
    walletKeypair,
    1000 * 1_000_000 // 1000 USDC with 6 decimals
  );

  console.log("✅ Minted 1000 Test USDC to your wallet!");

  // Now we need to send some to the vault
  // But the vault expects the original USDC mint, so for demo purposes,
  // let's just display the new mint address
  
  console.log("\n" + "=".repeat(60));
  console.log("IMPORTANT: Update your Anchor program!");
  console.log("=".repeat(60));
  console.log("\nThe vault was initialized with a different USDC mint.");
  console.log("For the demo, you have two options:");
  console.log("\n1. Re-initialize the vault with this new mint");
  console.log("2. Use the simulated balance feature on the Base contract");
  console.log("\nNew Test USDC Mint:", mint.toBase58());
  console.log("Your Token Account:", userTokenAccount.address.toBase58());
  console.log("Your Balance: 1000 USDC");
  
  console.log("\n" + "=".repeat(60));
  console.log("Quick Option: Update Base contract's simulated balance");
  console.log("=".repeat(60));
  console.log("\nRun this on Base Sepolia to simulate Solana having 500 USDC:");
  console.log(`\ncast send ${process.env.NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS || '0x36D4d2eaDE4BD7eC4aDa5660F1B5CCfe6a25f830'} \\`);
  console.log('  "setSimulatedSolanaBalance(uint256)" 500000000 \\');
  console.log('  --rpc-url https://sepolia.base.org \\');
  console.log('  --private-key $PRIVATE_KEY');
}

main().catch(console.error);

