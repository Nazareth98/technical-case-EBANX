import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Account API E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Reset state before starting', async () => {
    const res = await request(app.getHttpServer()).post('/reset');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('2. Get balance for non-existing account', async () => {
    const res = await request(app.getHttpServer()).get(
      '/balance?account_id=99999',
    );
    expect(res.status).toBe(404);
    expect(res.text).toBe('0');
  });

  it('3. Create account with initial balance (deposit)', async () => {
    const res = await request(app.getHttpServer())
      .post('/event')
      .send({ type: 'deposit', destination: '100', amount: 10 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      destination: { id: '100', balance: 10 },
    });
  });

  it('4. Deposit into existing account', async () => {
    const res = await request(app.getHttpServer())
      .post('/event')
      .send({ type: 'deposit', destination: '100', amount: 10 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      destination: { id: '100', balance: 20 },
    });
  });

  it('5. Get balance for existing account', async () => {
    const res = await request(app.getHttpServer()).get(
      '/balance?account_id=100',
    );
    expect(res.status).toBe(200);
    expect(res.text).toBe('20');
  });

  it('6. Withdraw from non-existing account', async () => {
    const res = await request(app.getHttpServer())
      .post('/event')
      .send({ type: 'withdraw', origin: '200', amount: 10 });
    expect(res.status).toBe(404);
    expect(res.text).toBe('0');
  });

  it('7. Withdraw from existing account', async () => {
    const res = await request(app.getHttpServer())
      .post('/event')
      .send({ type: 'withdraw', origin: '100', amount: 5 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      origin: { id: '100', balance: 15 },
    });
  });

  it('8. Transfer from existing account to new destination', async () => {
    const res = await request(app.getHttpServer()).post('/event').send({
      type: 'transfer',
      origin: '100',
      destination: '300',
      amount: 15,
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      origin: { id: '100', balance: 0 },
      destination: { id: '300', balance: 15 },
    });
  });

  it('9. Transfer from non-existing account', async () => {
    const res = await request(app.getHttpServer()).post('/event').send({
      type: 'transfer',
      origin: '200',
      destination: '300',
      amount: 15,
    });
    expect(res.status).toBe(404);
    expect(res.text).toBe('0');
  });

  it('10. Concurrency: must handle simultaneous withdrawals without allowing negative balance', async () => {
    await request(app.getHttpServer())
      .post('/event')
      .send({ type: 'deposit', destination: 'account-race', amount: 50 });

    const withdrawRequests = Array.from({ length: 50 }).map(() =>
      request(app.getHttpServer())
        .post('/event')
        .send({ type: 'withdraw', origin: 'account-race', amount: 10 }),
    );

    const responses = await Promise.all(withdrawRequests);

    const successCount = responses.filter((r) => r.status === 201).length;
    const failedCount = responses.filter((r) => r.status === 404).length;

    expect(successCount).toBe(5);
    expect(failedCount).toBe(45);

    const finalBalance = await request(app.getHttpServer()).get(
      '/balance?account_id=account-race',
    );
    expect(finalBalance.text).toBe('0');
  });

  it('11. Concurrency: simultaneous deposits and withdrawals must calculate final balance accurately', async () => {
    await request(app.getHttpServer()).post('/event').send({
      type: 'deposit',
      destination: 'account-concurrent-mix',
      amount: 100,
    });

    const deposits = Array.from({ length: 10 }).map(() =>
      request(app.getHttpServer()).post('/event').send({
        type: 'deposit',
        destination: 'account-concurrent-mix',
        amount: 10,
      }),
    );

    const withdrawals = Array.from({ length: 10 }).map(() =>
      request(app.getHttpServer()).post('/event').send({
        type: 'withdraw',
        origin: 'account-concurrent-mix',
        amount: 10,
      }),
    );

    await Promise.all([...deposits, ...withdrawals]);

    const finalBalance = await request(app.getHttpServer()).get(
      '/balance?account_id=account-concurrent-mix',
    );
    expect(finalBalance.text).toBe('100');
  });

  describe('Edge Cases', () => {
    it('should return 404 when withdrawing amount greater than available balance and preserve state', async () => {
      const resWithdraw = await request(app.getHttpServer())
        .post('/event')
        .send({ type: 'withdraw', origin: '300', amount: 100 });
      expect(resWithdraw.status).toBe(404);
      expect(resWithdraw.text).toBe('0');

      const resBalance = await request(app.getHttpServer()).get(
        '/balance?account_id=300',
      );
      expect(resBalance.status).toBe(200);
      expect(resBalance.text).toBe('15');
    });

    it('should ensure GET /balance calls have no side effects on repeated invocations', async () => {
      for (let i = 0; i < 3; i++) {
        const res = await request(app.getHttpServer()).get(
          '/balance?account_id=300',
        );
        expect(res.status).toBe(200);
        expect(res.text).toBe('15');
      }
    });
  });
});
