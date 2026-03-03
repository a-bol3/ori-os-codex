import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { MailboxProvider } from '@ori-os/db';

export class CreateMailboxDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(MailboxProvider)
  provider: MailboxProvider;

  @IsString()
  @IsOptional()
  domainId?: string;
}

export class UpdateMailboxDto {
  @IsOptional()
  @IsNumber()
  dailyLimit?: number;

  @IsOptional()
  @IsNumber()
  hourlyLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
