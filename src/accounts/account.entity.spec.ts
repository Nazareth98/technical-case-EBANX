import { describe, it, expect } from 'vitest';
import { Account } from './account.entity.js';

describe('Account Entity Unit Tests', () => {
  it('should initialize with id and balance', () => {
    const account = new Account('100', 10);
    expect(account.id).toBe('100');
    expect(account.balance).toBe(10);
  });

  it('should default initial balance to 0 if not provided', () => {
    const account = new Account('100');
    expect(account.balance).toBe(0);
  });

  it('should deposit amount successfully', () => {
    const account = new Account('100', 10);
    account.deposit(15);
    expect(account.balance).toBe(25);
  });

  it('should throw error when depositing zero or negative amount', () => {
    const account = new Account('100', 10);
    expect(() => account.deposit(0)).toThrow('Deposit amount must be greater than zero');
    expect(() => account.deposit(-5)).toThrow('Deposit amount must be greater than zero');
  });

  it('should withdraw amount successfully when balance is sufficient', () => {
    const account = new Account('100', 20);
    account.withdraw(15);
    expect(account.balance).toBe(5);
  });

  it('should throw error when withdrawing amount greater than balance', () => {
    const account = new Account('100', 10);
    expect(() => account.withdraw(15)).toThrow('Insufficient balance');
    expect(account.balance).toBe(10);
  });

  it('should throw error when withdrawing zero or negative amount', () => {
    const account = new Account('100', 10);
    expect(() => account.withdraw(0)).toThrow('Withdrawal amount must be greater than zero');
    expect(() => account.withdraw(-5)).toThrow('Withdrawal amount must be greater than zero');
  });

  it('should correctly report if it has enough balance', () => {
    const account = new Account('100', 15);
    expect(account.hasEnoughBalance(15)).toBe(true);
    expect(account.hasEnoughBalance(10)).toBe(true);
    expect(account.hasEnoughBalance(20)).toBe(false);
  });

  it('should return correct JSON representation', () => {
    const account = new Account('100', 50);
    expect(account.toJSON()).toEqual({ id: '100', balance: 50 });
  });
});
