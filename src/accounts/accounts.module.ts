import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller.js';
import { AccountsService } from './accounts.service.js';
import { InMemoryAccountRepository } from './in-memory-account.repository.js';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, InMemoryAccountRepository],
  exports: [AccountsService, InMemoryAccountRepository],
})
export class AccountsModule {}
