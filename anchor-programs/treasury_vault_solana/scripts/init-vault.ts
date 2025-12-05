// =============================================================================
// Initialize Vault Script
// =============================================================================
// Run this after deploying the program to create the vault PDA
// Usage: npx ts-node scripts/init-vault.ts
// =============================================================================

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Devnet USDC SPL Token mint
// Note: This is a test USDC on devnet
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

const PROGRAM_ID = new PublicKey("3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL");

async function main() {
  // Load wallet from default Solana CLI location
  const walletPath = process.env.ANCHOR_WALLET || 
    path.join(process.env.HOME || "", ".config/solana/id.json");
  
  if (!fs.existsSync(walletPath)) {
    console.error("Wallet not found at:", walletPath);
    console.error("Please create a wallet with: solana-keygen new");
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

  // Load the IDL
  const idlPath = path.join(__dirname, "../target/idl/treasury_vault_solana.json");
  if (!fs.existsSync(idlPath)) {
    console.error("IDL not found. Please run 'anchor build' first.");
    process.exit(1);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  
  // Create program interface
  const program = new anchor.Program(idl, provider);

  console.log("=".repeat(60));
  console.log("FRCT Treasury Vault - Initialization");
  console.log("=".repeat(60));
  console.log("Network: Devnet");
  console.log("Program ID:", PROGRAM_ID.toBase58());
  console.log("Authority:", wallet.publicKey.toBase58());
  console.log("USDC Mint:", DEVNET_USDC_MINT.toBase58());

  // Derive PDAs
  const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury_vault")],
    PROGRAM_ID
  );
  console.log("\nVault PDA:", vaultPda.toBase58());

  const [vaultTokenAccount, tokenBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_token"), vaultPda.toBuffer()],
    PROGRAM_ID
  );
  console.log("Vault Token Account:", vaultTokenAccount.toBase58());

  // Check if vault already exists
  try {
    const existingVault = await connection.getAccountInfo(vaultPda);
    if (existingVault) {
      console.log("\n⚠️  Vault already initialized!");
      console.log("Account data length:", existingVault.data.length, "bytes");
      return;
    }
  } catch {
    // Vault doesn't exist, proceed with initialization
  }

  console.log("\nInitializing vault...");

  try {
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: wallet.publicKey,
        vault: vaultPda,
        usdcMint: DEVNET_USDC_MINT,
        vaultTokenAccount: vaultTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("\n✅ Vault initialized successfully!");
    console.log("Transaction:", tx);
    console.log("Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

    console.log("\n=".repeat(60));
    console.log("Vault Created:");
    console.log("=".repeat(60));
    console.log("Vault PDA:", vaultPda.toBase58());
    console.log("Token Account:", vaultTokenAccount.toBase58());
    console.log("Authority:", wallet.publicKey.toBase58());
    
  } catch (err) {
    console.error("\n❌ Failed to initialize vault:");
    console.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
