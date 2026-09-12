import { Injectable } from '@nestjs/common';
import { Account } from './account.entity.js';

@Injectable()
export class InMemoryAccountRepository {
  private readonly accounts = new Map<string, Account>();

  findById(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  save(account: Account): Account {
    this.accounts.set(account.id, account);
    return account;
  }

  reset(): void {
    this.accounts.clear();
  }
}
