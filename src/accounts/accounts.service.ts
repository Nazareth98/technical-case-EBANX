import { Injectable } from '@nestjs/common';
import { InMemoryAccountRepository } from './in-memory-account.repository.js';
import { EventDto, EventType } from './dto/event.dto.js';
import { Account } from './account.entity.js';

@Injectable()
export class AccountsService {
  constructor(private readonly accountRepository: InMemoryAccountRepository) {}

  reset(): void {
    this.accountRepository.reset();
  }

  getBalance(accountId: string): number | null {
    const account = this.accountRepository.findById(accountId);
    if (!account) {
      return null;
    }
    return account.balance;
  }

  handleEvent(dto: EventDto): Record<string, any> | null {
    switch (dto.type) {
      case EventType.DEPOSIT: {
        if (!dto.destination) {
          return null;
        }
        return this.deposit(dto.destination, dto.amount);
      }
      case EventType.WITHDRAW: {
        if (!dto.origin) {
          return null;
        }
        return this.withdraw(dto.origin, dto.amount);
      }
      case EventType.TRANSFER: {
        if (!dto.origin || !dto.destination) {
          return null;
        }
        return this.transfer(dto.origin, dto.destination, dto.amount);
      }
      default:
        return null;
    }
  }

  private deposit(destinationId: string, amount: number) {
    let account = this.accountRepository.findById(destinationId);
    if (!account) {
      account = new Account(destinationId, 0);
    }
    account.deposit(amount);
    this.accountRepository.save(account);

    return {
      destination: account.toJSON(),
    };
  }

  private withdraw(originId: string, amount: number) {
    const account = this.accountRepository.findById(originId);
    if (!account || !account.hasEnoughBalance(amount)) {
      return null;
    }
    account.withdraw(amount);
    this.accountRepository.save(account);

    return {
      origin: account.toJSON(),
    };
  }

  private transfer(originId: string, destinationId: string, amount: number) {
    const originAccount = this.accountRepository.findById(originId);
    if (!originAccount || !originAccount.hasEnoughBalance(amount)) {
      return null;
    }

    let destinationAccount = this.accountRepository.findById(destinationId);
    if (!destinationAccount) {
      destinationAccount = new Account(destinationId, 0);
    }

    originAccount.withdraw(amount);
    destinationAccount.deposit(amount);

    this.accountRepository.save(originAccount);
    this.accountRepository.save(destinationAccount);

    return {
      origin: originAccount.toJSON(),
      destination: destinationAccount.toJSON(),
    };
  }
}
