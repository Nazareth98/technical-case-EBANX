export class Account {
  private balanceAmount: number;

  constructor(
    public readonly id: string,
    initialBalance: number = 0,
  ) {
    this.balanceAmount = initialBalance;
  }

  get balance(): number {
    return this.balanceAmount;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than zero');
    }
    this.balanceAmount += amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }
    if (!this.hasEnoughBalance(amount)) {
      throw new Error('Insufficient balance');
    }
    this.balanceAmount -= amount;
  }

  hasEnoughBalance(amount: number): boolean {
    return this.balanceAmount >= amount;
  }

  toJSON() {
    return {
      id: this.id,
      balance: this.balanceAmount,
    };
  }
}
