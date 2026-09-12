import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { AccountsService } from './accounts.service.js';
import { EventDto } from './dto/event.dto.js';

@ApiTags('Accounts & Transactions')
@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain')
  @ApiOperation({
    summary: 'Reset in-memory state',
    description: 'Clears all in-memory accounts and balance records.',
  })
  @ApiResponse({
    status: 200,
    description: 'State reset successfully',
    schema: { type: 'string', example: 'OK' },
  })
  reset(): string {
    this.accountsService.reset();
    return 'OK';
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Get account balance',
    description: 'Retrieves current balance for the requested account ID.',
  })
  @ApiQuery({
    name: 'account_id',
    required: true,
    description: 'Account ID to query balance for',
    example: '100',
  })
  @ApiResponse({
    status: 200,
    description: 'Account found. Returns balance number',
    schema: { type: 'number', example: 20 },
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found. Returns 0',
    schema: { type: 'number', example: 0 },
  })
  getBalance(@Query('account_id') accountId: string, @Res() res: Response): Response {
    const balance = this.accountsService.getBalance(accountId);
    if (balance === null) {
      return res.status(HttpStatus.NOT_FOUND).type('text/plain').send('0');
    }
    return res.status(HttpStatus.OK).type('text/plain').send(balance.toString());
  }

  @Post('event')
  @ApiOperation({
    summary: 'Process financial event',
    description: 'Executes deposit, withdraw, or transfer transactions.',
  })
  @ApiBody({
    type: EventDto,
    examples: {
      deposit: {
        summary: 'Deposit event payload',
        description: 'Creates or deposits funds into destination account',
        value: {
          type: 'deposit',
          destination: '100',
          amount: 10,
        },
      },
      withdraw: {
        summary: 'Withdraw event payload',
        description: 'Debits funds from origin account',
        value: {
          type: 'withdraw',
          origin: '100',
          amount: 5,
        },
      },
      transfer: {
        summary: 'Transfer event payload',
        description: 'Transfers funds from origin account to destination account',
        value: {
          type: 'transfer',
          origin: '100',
          destination: '300',
          amount: 15,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Event processed successfully',
    schema: {
      oneOf: [
        {
          example: { destination: { id: '100', balance: 10 } },
        },
        {
          example: { origin: { id: '100', balance: 15 } },
        },
        {
          example: {
            origin: { id: '100', balance: 0 },
            destination: { id: '300', balance: 15 },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Origin account not found or insufficient balance',
    schema: { type: 'number', example: 0 },
  })
  handleEvent(@Body() dto: EventDto, @Res() res: Response): Response {
    const result = this.accountsService.handleEvent(dto);
    if (!result) {
      return res.status(HttpStatus.NOT_FOUND).type('text/plain').send('0');
    }
    return res.status(HttpStatus.CREATED).json(result);
  }
}
