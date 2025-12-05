use anchor_lang::prelude::*;

declare_id!("3V64EHasPzNu7pzFA2STpWJrSgEVAAdPbeuFQQ53SrqL");

#[program]
pub mod treasury_vault_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
