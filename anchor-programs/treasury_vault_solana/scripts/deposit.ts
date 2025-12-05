// =============================================================================
// Deposit USDC to Solana Vault
// =============================================================================
// Usage: npx ts-node scripts/deposit.ts <amount>
// Example: npx ts-node scripts/deposit.ts 10
// =============================================================================

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Configuration
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const PROGRAM_ID = new PublicKey("3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL");
const VAULT_PDA = new PublicKey("J7c13sZsYs5dDXrFDpPMunZGLdjsQfSDFphA67XQaGJf");
const VAULT_TOKEN_ACCOUNT = new PublicKey("3tg7yaecTqDSRJufwcrbiSqtJzeyiKKmLQzdkr7sgikx");

async function main() {
  const amount = process.argv[2] ? parseFloat(process.argv[2]) : 1;
  const amountLamports = BigInt(Math.floor(amount * 1_000_000)); // USDC has 6 decimals

  console.log("=".repeat(60));
  console.log("FRCT Treasury Vault - Deposit USDC");
  console.log("=".repeat(60));
  console.log(`Amount: ${amount} USDC (${amountLamports} lamports)`);

  // Load wallet
  const walletPath = process.env.ANCHOR_WALLET || 
    path.join(process.env.HOME || "", ".config/solana/id.json");
  
  if (!fs.existsSync(walletPath)) {
    console.error("Wallet not found at:", walletPath);
    process.exit(1);
  }

  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  // Connect to devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  console.log("\nWallet:", wallet.publicKey.toBase58());

  // Get user's USDC token account
  const userTokenAccount = await getAssociatedTokenAddress(
    DEVNET_USDC_MINT,
    wallet.publicKey
  );

  console.log("User Token Account:", userTokenAccount.toBase58());
  console.log("Vault Token Account:", VAULT_TOKEN_ACCOUNT.toBase58());

  // Check user's USDC balance
  try {
    const userAccount = await getAccount(connection, userTokenAccount);
    console.log(`\nYour USDC Balance: ${Number(userAccount.amount) / 1_000_000} USDC`);
    
    if (userAccount.amount < amountLamports) {
      console.error("\n❌ Insufficient USDC balance!");
      console.log("\nTo get devnet USDC, you need to:");
      console.log("1. Find a devnet USDC faucet, or");
      console.log("2. Use a different test token mint");
      process.exit(1);
    }
  } catch (e) {
    console.log("\n⚠️  You don't have a USDC token account yet.");
    console.log("Creating one...");
    
    // Create token account
    const createAtaIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      userTokenAccount,
      wallet.publicKey,
      DEVNET_USDC_MINT
    );
    
    const tx = new anchor.web3.Transaction().add(createAtaIx);
    await provider.sendAndConfirm(tx);
    console.log("Token account created!");
    console.log("\nYou need to get some devnet USDC first.");
    process.exit(1);
  }

  // Load the IDL
  const idlPath = path.join(__dirname, "../target/idl/treasury_vault_solana.json");
  if (!fs.existsSync(idlPath)) {
    console.error("IDL not found. Please run 'anchor build' first.");
    process.exit(1);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  
  // Create program interface
  const program = new anchor.Program(idl, provider);

  console.log("\nDepositing to vault...");

  try {
    const tx = await program.methods
      .deposit(new anchor.BN(amountLamports.toString()))
      .accounts({
        depositor: wallet.publicKey,
        vault: VAULT_PDA,
        depositorTokenAccount: userTokenAccount,
        vaultTokenAccount: VAULT_TOKEN_ACCOUNT,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("\n✅ Deposit successful!");
    console.log("Transaction:", tx);
    console.log("Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

    // Check new vault balance
    const vaultAccount = await getAccount(connection, VAULT_TOKEN_ACCOUNT);
    console.log(`\nNew Vault Balance: ${Number(vaultAccount.amount) / 1_000_000} USDC`);

  } catch (err) {
    console.error("\n❌ Deposit failed:");
    console.error(err);
  }
}

main().catch(console.error);

