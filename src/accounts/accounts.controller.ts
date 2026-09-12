import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AccountsService } from './accounts.service.js';
import { EventDto } from './dto/event.dto.js';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain')
  reset(): string {
    this.accountsService.reset();
    return 'OK';
  }

  @Get('balance')
  getBalance(@Query('account_id') accountId: string, @Res() res: Response): Response {
    const balance = this.accountsService.getBalance(accountId);
    if (balance === null) {
      return res.status(HttpStatus.NOT_FOUND).type('text/plain').send('0');
    }
    return res.status(HttpStatus.OK).type('text/plain').send(balance.toString());
  }

  @Post('event')
  handleEvent(@Body() dto: EventDto, @Res() res: Response): Response {
    const result = this.accountsService.handleEvent(dto);
    if (!result) {
      return res.status(HttpStatus.NOT_FOUND).type('text/plain').send('0');
    }
    return res.status(HttpStatus.CREATED).json(result);
  }
}
