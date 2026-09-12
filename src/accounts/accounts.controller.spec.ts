import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller.js';
import { AccountsService } from './accounts.service.js';
import { InMemoryAccountRepository } from './in-memory-account.repository.js';
import { EventType } from './dto/event.dto.js';
import type { Response } from 'express';

describe('AccountsController (EBANX Specs)', () => {
  let controller: AccountsController;
  let service: AccountsService;

  const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.type = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [AccountsService, InMemoryAccountRepository],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
    service.reset();
  });

  it('1. Reset state before starting', () => {
    expect(controller.reset()).toBe('OK');
  });

  it('2. Get balance for non-existing account', () => {
    const res = mockResponse();
    controller.getBalance('100', res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('0');
  });

  it('3. Create account with initial balance (deposit)', () => {
    const res = mockResponse();
    controller.handleEvent(
      { type: EventType.DEPOSIT, destination: '100', amount: 10 },
      res,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      destination: { id: '100', balance: 10 },
    });
  });

  it('4. Deposit into existing account', () => {
    const res1 = mockResponse();
    controller.handleEvent(
      { type: EventType.DEPOSIT, destination: '100', amount: 10 },
      res1,
    );

    const res2 = mockResponse();
    controller.handleEvent(
      { type: EventType.DEPOSIT, destination: '100', amount: 10 },
      res2,
    );
    expect(res2.status).toHaveBeenCalledWith(201);
    expect(res2.json).toHaveBeenCalledWith({
      destination: { id: '100', balance: 20 },
    });
  });

  it('5. Get balance for existing account', () => {
    const res1 = mockResponse();
    controller.handleEvent(
      { type: EventType.DEPOSIT, destination: '100', amount: 20 },
      res1,
    );

    const res2 = mockResponse();
    controller.getBalance('100', res2);
    expect(res2.status).toHaveBeenCalledWith(200);
    expect(res2.send).toHaveBeenCalledWith('20');
  });

  it('6. Withdraw from non-existing account', () => {
    const res = mockResponse();
    controller.handleEvent(
      { type: EventType.WITHDRAW, origin: '200', amount: 10 },
      res,
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('0');
  });

  it('7. Withdraw from existing account', () => {
    const res1 = mockResponse();
    controller.handleEvent(
      { type: EventType.DEPOSIT, destination: '100', amount: 20 },
      res1,
    );

    const res2 = mockResponse();
    controller.handleEvent(
      { type: EventType.WITHDRAW, origin: '100', amount: 5 },
      res2,
    );
    expect(res2.status).toHaveBeenCalledWith(201);
    expect(res2.json).toHaveBeenCalledWith({
      origin: { id: '100', balance: 15 },
    });
  });

  it('8. Transfer from existing account to new destination', () => {
    const res1 = mockResponse();
    controller.handleEvent(
      { type: EventType.DEPOSIT, destination: '100', amount: 15 },
      res1,
    );

    const res2 = mockResponse();
    controller.handleEvent(
      {
        type: EventType.TRANSFER,
        origin: '100',
        destination: '300',
        amount: 15,
      },
      res2,
    );
    expect(res2.status).toHaveBeenCalledWith(201);
    expect(res2.json).toHaveBeenCalledWith({
      origin: { id: '100', balance: 0 },
      destination: { id: '300', balance: 15 },
    });
  });

  it('9. Transfer from non-existing account', () => {
    const res = mockResponse();
    controller.handleEvent(
      {
        type: EventType.TRANSFER,
        origin: '200',
        destination: '300',
        amount: 15,
      },
      res,
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('0');
  });
});
