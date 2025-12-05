use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL");

// =============================================================================
// FRCT Treasury Vault - Solana Program
// =============================================================================
// This program manages a USDC treasury vault on Solana as part of the FRCT
// cross-chain treasury system. It mirrors the TreasuryVaultBase contract on Base.
// =============================================================================

/// Seeds for PDA derivation
pub const VAULT_SEED: &[u8] = b"treasury_vault";
pub const VAULT_TOKEN_SEED: &[u8] = b"vault_token";

#[program]
pub mod treasury_vault_solana {
    use super::*;

    /// Initialize the treasury vault
    /// Creates the vault state PDA and associated token account for USDC
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        vault.authority = ctx.accounts.authority.key();
        vault.usdc_mint = ctx.accounts.usdc_mint.key();
        vault.vault_token_account = ctx.accounts.vault_token_account.key();
        vault.target_allocation_bps = 5000; // 50% default
        vault.bump = ctx.bumps.vault;
        vault.token_bump = ctx.bumps.vault_token_account;
        
        msg!("Treasury vault initialized");
        msg!("Authority: {}", vault.authority);
        msg!("USDC Mint: {}", vault.usdc_mint);
        msg!("Vault Token Account: {}", vault.vault_token_account);
        
        Ok(())
    }

    /// Deposit USDC into the vault
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);
        
        // Transfer USDC from depositor to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.depositor_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.depositor.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Deposited {} USDC to vault", amount);
        
        emit!(DepositEvent {
            depositor: ctx.accounts.depositor.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Withdraw USDC from the vault (authority only)
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);
        
        let vault = &ctx.accounts.vault;
        
        // Verify sufficient balance
        let vault_balance = ctx.accounts.vault_token_account.amount;
        require!(vault_balance >= amount, VaultError::InsufficientBalance);
        
        // Create signer seeds for PDA
        let seeds = &[
            VAULT_SEED,
            &[vault.bump],
        ];
        let signer_seeds = &[&seeds[..]];
        
        // Transfer USDC from vault to recipient
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Withdrew {} USDC from vault to {}", amount, ctx.accounts.recipient.key());
        
        emit!(WithdrawEvent {
            recipient: ctx.accounts.recipient.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Set target allocation (authority only)
    /// allocation_bps: Basis points (0-10000) representing this vault's share
    pub fn set_target_allocation(ctx: Context<SetAllocation>, allocation_bps: u16) -> Result<()> {
        require!(allocation_bps <= 10000, VaultError::InvalidAllocation);
        
        let vault = &mut ctx.accounts.vault;
        let old_allocation = vault.target_allocation_bps;
        vault.target_allocation_bps = allocation_bps;
        
        msg!(
            "Target allocation updated: {}% -> {}%",
            old_allocation / 100,
            allocation_bps / 100
        );
        
        emit!(AllocationUpdatedEvent {
            old_allocation_bps: old_allocation,
            new_allocation_bps: allocation_bps,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Transfer authority to a new owner
    pub fn transfer_authority(ctx: Context<TransferAuthority>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let old_authority = vault.authority;
        vault.authority = ctx.accounts.new_authority.key();
        
        msg!("Authority transferred: {} -> {}", old_authority, vault.authority);
        
        emit!(AuthorityTransferredEvent {
            old_authority,
            new_authority: vault.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Get vault balance (view function)
    pub fn get_balance(ctx: Context<GetBalance>) -> Result<u64> {
        let balance = ctx.accounts.vault_token_account.amount;
        msg!("Vault balance: {} USDC", balance);
        Ok(balance)
    }
}

// =============================================================================
// Account Structures
// =============================================================================

#[account]
#[derive(Default)]
pub struct Vault {
    /// The authority (owner) who can withdraw and manage the vault
    pub authority: Pubkey,
    /// The USDC mint address
    pub usdc_mint: Pubkey,
    /// The vault's token account for holding USDC
    pub vault_token_account: Pubkey,
    /// Target allocation in basis points (0-10000)
    pub target_allocation_bps: u16,
    /// Bump seed for vault PDA
    pub bump: u8,
    /// Bump seed for vault token account PDA
    pub token_bump: u8,
}

impl Vault {
    pub const LEN: usize = 8 +  // discriminator
        32 +  // authority
        32 +  // usdc_mint
        32 +  // vault_token_account
        2 +   // target_allocation_bps
        1 +   // bump
        1;    // token_bump
}

// =============================================================================
// Instruction Contexts
// =============================================================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = Vault::LEN,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault: Account<'info, Vault>,
    
    /// The USDC mint (devnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        seeds = [VAULT_TOKEN_SEED, vault.key().as_ref()],
        bump,
        token::mint = usdc_mint,
        token::authority = vault,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    #[account(
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = depositor_token_account.owner == depositor.key() @ VaultError::InvalidTokenAccount,
        constraint = depositor_token_account.mint == vault.usdc_mint @ VaultError::InvalidMint,
    )]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.vault_token_account @ VaultError::InvalidVaultTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        constraint = authority.key() == vault.authority @ VaultError::Unauthorized,
    )]
    pub authority: Signer<'info>,
    
    /// CHECK: Recipient can be any account
    pub recipient: UncheckedAccount<'info>,
    
    #[account(
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        mut,
        constraint = vault_token_account.key() == vault.vault_token_account @ VaultError::InvalidVaultTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = recipient_token_account.owner == recipient.key() @ VaultError::InvalidTokenAccount,
        constraint = recipient_token_account.mint == vault.usdc_mint @ VaultError::InvalidMint,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetAllocation<'info> {
    #[account(
        constraint = authority.key() == vault.authority @ VaultError::Unauthorized,
    )]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(
        constraint = authority.key() == vault.authority @ VaultError::Unauthorized,
    )]
    pub authority: Signer<'info>,
    
    /// CHECK: New authority can be any account
    pub new_authority: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct GetBalance<'info> {
    #[account(
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(
        constraint = vault_token_account.key() == vault.vault_token_account @ VaultError::InvalidVaultTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
}

// =============================================================================
// Events
// =============================================================================

#[event]
pub struct DepositEvent {
    pub depositor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct AllocationUpdatedEvent {
    pub old_allocation_bps: u16,
    pub new_allocation_bps: u16,
    pub timestamp: i64,
}

#[event]
pub struct AuthorityTransferredEvent {
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}

// =============================================================================
// Errors
// =============================================================================

#[error_code]
pub enum VaultError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    
    #[msg("Insufficient balance in vault")]
    InsufficientBalance,
    
    #[msg("Invalid allocation: must be between 0 and 10000 basis points")]
    InvalidAllocation,
    
    #[msg("Unauthorized: only the authority can perform this action")]
    Unauthorized,
    
    #[msg("Invalid token account owner")]
    InvalidTokenAccount,
    
    #[msg("Invalid mint: expected USDC")]
    InvalidMint,
    
    #[msg("Invalid vault token account")]
    InvalidVaultTokenAccount,
}
