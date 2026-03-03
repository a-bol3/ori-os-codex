import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum StepType {
  EMAIL = 'EMAIL',
  WAIT = 'WAIT',
  CONDITION = 'CONDITION',
}

export class SequenceStepDto {
  @IsEnum(StepType)
  stepType: StepType;

  @IsInt()
  order: number;

  @IsObject()
  configJson: any;

  @IsOptional()
  @IsString()
  templateId?: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  mailboxId?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsObject()
  sendWindowJson?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceStepDto)
  @IsOptional()
  sequenceSteps?: SequenceStepDto[];
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  mailboxId?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsObject()
  sendWindowJson?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceStepDto)
  @IsOptional()
  sequenceSteps?: SequenceStepDto[];
}
