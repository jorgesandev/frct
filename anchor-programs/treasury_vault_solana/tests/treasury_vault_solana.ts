import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TreasuryVaultSolana } from "../target/types/treasury_vault_solana";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";

describe("treasury_vault_solana", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TreasuryVaultSolana as Program<TreasuryVaultSolana>;
  
  // Test accounts
  let usdcMint: anchor.web3.PublicKey;
  let vaultPda: anchor.web3.PublicKey;
  let vaultBump: number;
  let vaultTokenAccount: anchor.web3.PublicKey;
  let vaultTokenBump: number;
  let depositorTokenAccount: anchor.web3.PublicKey;
  let recipientTokenAccount: anchor.web3.PublicKey;
  
  const authority = provider.wallet;
  const depositor = anchor.web3.Keypair.generate();
  const recipient = anchor.web3.Keypair.generate();
  
  // USDC has 6 decimals
  const USDC_DECIMALS = 6;
  const ONE_USDC = 1_000_000;

  before(async () => {
    // Airdrop SOL to test accounts
    const airdropTx1 = await provider.connection.requestAirdrop(
      depositor.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx1);
    
    const airdropTx2 = await provider.connection.requestAirdrop(
      recipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx2);

    // Create mock USDC mint
    usdcMint = await createMint(
      provider.connection,
      (authority as any).payer,
      authority.publicKey,
      null,
      USDC_DECIMALS
    );
    console.log("USDC Mint:", usdcMint.toBase58());

    // Derive vault PDA
    [vaultPda, vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_vault")],
      program.programId
    );
    console.log("Vault PDA:", vaultPda.toBase58());

    // Derive vault token account PDA
    [vaultTokenAccount, vaultTokenBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_token"), vaultPda.toBuffer()],
      program.programId
    );
    console.log("Vault Token Account:", vaultTokenAccount.toBase58());

    // Create depositor's USDC token account
    depositorTokenAccount = await createAccount(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      depositor.publicKey
    );
    console.log("Depositor Token Account:", depositorTokenAccount.toBase58());

    // Create recipient's USDC token account
    recipientTokenAccount = await createAccount(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      recipient.publicKey
    );
    console.log("Recipient Token Account:", recipientTokenAccount.toBase58());

    // Mint USDC to depositor (100 USDC)
    await mintTo(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      depositorTokenAccount,
      authority.publicKey,
      100 * ONE_USDC
    );
    console.log("Minted 100 USDC to depositor");
  });

  describe("initialize", () => {
    it("initializes the vault", async () => {
      const tx = await program.methods
        .initialize()
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
          usdcMint: usdcMint,
          vaultTokenAccount: vaultTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
      
      console.log("Initialize tx:", tx);

      // Verify vault state
      const vaultAccount = await program.account.vault.fetch(vaultPda);
      expect(vaultAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(vaultAccount.usdcMint.toBase58()).to.equal(usdcMint.toBase58());
      expect(vaultAccount.vaultTokenAccount.toBase58()).to.equal(vaultTokenAccount.toBase58());
      expect(vaultAccount.targetAllocationBps).to.equal(5000); // 50% default
    });
  });

  describe("deposit", () => {
    it("deposits USDC into the vault", async () => {
      const depositAmount = 10 * ONE_USDC; // 10 USDC

      // Get initial balances
      const depositorBalanceBefore = (await getAccount(provider.connection, depositorTokenAccount)).amount;
      const vaultBalanceBefore = (await getAccount(provider.connection, vaultTokenAccount)).amount;

      const tx = await program.methods
        .deposit(new anchor.BN(depositAmount))
        .accounts({
          depositor: depositor.publicKey,
          vault: vaultPda,
          depositorTokenAccount: depositorTokenAccount,
          vaultTokenAccount: vaultTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([depositor])
        .rpc();

      console.log("Deposit tx:", tx);

      // Verify balances
      const depositorBalanceAfter = (await getAccount(provider.connection, depositorTokenAccount)).amount;
      const vaultBalanceAfter = (await getAccount(provider.connection, vaultTokenAccount)).amount;

      expect(Number(depositorBalanceAfter)).to.equal(Number(depositorBalanceBefore) - depositAmount);
      expect(Number(vaultBalanceAfter)).to.equal(Number(vaultBalanceBefore) + depositAmount);
    });

    it("rejects zero amount deposits", async () => {
      try {
        await program.methods
          .deposit(new anchor.BN(0))
          .accounts({
            depositor: depositor.publicKey,
            vault: vaultPda,
            depositorTokenAccount: depositorTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([depositor])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (err: any) {
        expect(err.error.errorCode.code).to.equal("ZeroAmount");
      }
    });
  });

  describe("withdraw", () => {
    it("withdraws USDC from the vault (authority only)", async () => {
      const withdrawAmount = 5 * ONE_USDC; // 5 USDC

      // Get initial balances
      const vaultBalanceBefore = (await getAccount(provider.connection, vaultTokenAccount)).amount;
      const recipientBalanceBefore = (await getAccount(provider.connection, recipientTokenAccount)).amount;

      const tx = await program.methods
        .withdraw(new anchor.BN(withdrawAmount))
        .accounts({
          authority: authority.publicKey,
          recipient: recipient.publicKey,
          vault: vaultPda,
          vaultTokenAccount: vaultTokenAccount,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Withdraw tx:", tx);

      // Verify balances
      const vaultBalanceAfter = (await getAccount(provider.connection, vaultTokenAccount)).amount;
      const recipientBalanceAfter = (await getAccount(provider.connection, recipientTokenAccount)).amount;

      expect(Number(vaultBalanceAfter)).to.equal(Number(vaultBalanceBefore) - withdrawAmount);
      expect(Number(recipientBalanceAfter)).to.equal(Number(recipientBalanceBefore) + withdrawAmount);
    });

    it("rejects unauthorized withdrawals", async () => {
      try {
        await program.methods
          .withdraw(new anchor.BN(ONE_USDC))
          .accounts({
            authority: depositor.publicKey, // Wrong authority
            recipient: recipient.publicKey,
            vault: vaultPda,
            vaultTokenAccount: vaultTokenAccount,
            recipientTokenAccount: recipientTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([depositor])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (err: any) {
        expect(err.error.errorCode.code).to.equal("Unauthorized");
      }
    });
  });

  describe("set_target_allocation", () => {
    it("updates target allocation", async () => {
      const newAllocation = 7000; // 70%

      const tx = await program.methods
        .setTargetAllocation(newAllocation)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      console.log("Set allocation tx:", tx);

      // Verify
      const vaultAccount = await program.account.vault.fetch(vaultPda);
      expect(vaultAccount.targetAllocationBps).to.equal(newAllocation);
    });

    it("rejects invalid allocation (> 10000)", async () => {
      try {
        await program.methods
          .setTargetAllocation(15000)
          .accounts({
            authority: authority.publicKey,
            vault: vaultPda,
          })
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (err: any) {
        expect(err.error.errorCode.code).to.equal("InvalidAllocation");
      }
    });
  });

  describe("get_balance", () => {
    it("returns the vault balance", async () => {
      const balance = await program.methods
        .getBalance()
        .accounts({
          vault: vaultPda,
          vaultTokenAccount: vaultTokenAccount,
        })
        .view();

      console.log("Vault balance:", balance.toNumber() / ONE_USDC, "USDC");
      
      // Should have 5 USDC remaining (10 deposited - 5 withdrawn)
      expect(balance.toNumber()).to.equal(5 * ONE_USDC);
    });
  });

  describe("transfer_authority", () => {
    it("transfers authority to new owner", async () => {
      const newAuthority = anchor.web3.Keypair.generate();

      const tx = await program.methods
        .transferAuthority()
        .accounts({
          authority: authority.publicKey,
          newAuthority: newAuthority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      console.log("Transfer authority tx:", tx);

      // Verify
      const vaultAccount = await program.account.vault.fetch(vaultPda);
      expect(vaultAccount.authority.toBase58()).to.equal(newAuthority.publicKey.toBase58());

      // Transfer back for other tests
      await program.methods
        .transferAuthority()
        .accounts({
          authority: newAuthority.publicKey,
          newAuthority: authority.publicKey,
          vault: vaultPda,
        })
        .signers([newAuthority])
        .rpc();
    });
  });
});
