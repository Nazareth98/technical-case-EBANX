import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export enum EventType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class EventDto {
  @IsEnum(EventType)
  @IsNotEmpty()
  type!: EventType;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsInt()
  @IsPositive()
  amount!: number;
}
