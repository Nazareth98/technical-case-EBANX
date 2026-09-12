import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service.js';
import { InMemoryAccountRepository } from './in-memory-account.repository.js';
import { EventType } from './dto/event.dto.js';

describe('AccountsService Unit Tests', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService, InMemoryAccountRepository],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    service.reset();
  });

  it('should reset state completely', () => {
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 50,
    });
    expect(service.getBalance('100')).toBe(50);
    service.reset();
    expect(service.getBalance('100')).toBeNull();
  });

  it('should return balance for existing account and null for non-existing account', () => {
    expect(service.getBalance('999')).toBeNull();
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 20,
    });
    expect(service.getBalance('100')).toBe(20);
  });

  it('should deposit and create new account if non-existent', () => {
    const res = service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 10,
    });
    expect(res).toEqual({ destination: { id: '100', balance: 10 } });
    expect(service.getBalance('100')).toBe(10);
  });

  it('should deposit into existing account', () => {
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 10,
    });
    const res = service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 15,
    });
    expect(res).toEqual({ destination: { id: '100', balance: 25 } });
    expect(service.getBalance('100')).toBe(25);
  });

  it('should return null when withdrawing from non-existent account', () => {
    const res = service.handleEvent({
      type: EventType.WITHDRAW,
      origin: '200',
      amount: 10,
    });
    expect(res).toBeNull();
  });

  it('should withdraw from existing account with sufficient balance', () => {
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 20,
    });
    const res = service.handleEvent({
      type: EventType.WITHDRAW,
      origin: '100',
      amount: 5,
    });
    expect(res).toEqual({ origin: { id: '100', balance: 15 } });
    expect(service.getBalance('100')).toBe(15);
  });

  it('should return null and not modify state when withdrawing with insufficient balance', () => {
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 15,
    });
    const res = service.handleEvent({
      type: EventType.WITHDRAW,
      origin: '100',
      amount: 100,
    });
    expect(res).toBeNull();
    expect(service.getBalance('100')).toBe(15);
  });

  it('should transfer from existing account to new destination', () => {
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 15,
    });
    const res = service.handleEvent({
      type: EventType.TRANSFER,
      origin: '100',
      destination: '300',
      amount: 15,
    });
    expect(res).toEqual({
      origin: { id: '100', balance: 0 },
      destination: { id: '300', balance: 15 },
    });
    expect(service.getBalance('100')).toBe(0);
    expect(service.getBalance('300')).toBe(15);
  });

  it('should return null when transferring from non-existent origin', () => {
    const res = service.handleEvent({
      type: EventType.TRANSFER,
      origin: '200',
      destination: '300',
      amount: 15,
    });
    expect(res).toBeNull();
    expect(service.getBalance('300')).toBeNull();
  });

  it('should ensure transfer operation is atomic when origin has insufficient balance', () => {
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '100',
      amount: 10,
    });
    service.handleEvent({
      type: EventType.DEPOSIT,
      destination: '300',
      amount: 50,
    });

    const res = service.handleEvent({
      type: EventType.TRANSFER,
      origin: '100',
      destination: '300',
      amount: 100,
    });

    expect(res).toBeNull();
    expect(service.getBalance('100')).toBe(10);
    expect(service.getBalance('300')).toBe(50);
  });
});
