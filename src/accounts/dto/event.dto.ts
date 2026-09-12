import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export enum EventType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class EventDto {
  @ApiProperty({
    enum: EventType,
    description: 'Financial transaction event type (deposit, withdraw, transfer)',
    example: EventType.DEPOSIT,
  })
  @IsEnum(EventType)
  @IsNotEmpty()
  type!: EventType;

  @ApiPropertyOptional({
    description: 'Destination account ID (required for deposit and transfer)',
    example: '100',
  })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({
    description: 'Origin account ID (required for withdraw and transfer)',
    example: '100',
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiProperty({
    description: 'Monetary transaction amount (must be positive integer)',
    example: 10,
  })
  @IsInt()
  @IsPositive()
  amount!: number;
}
