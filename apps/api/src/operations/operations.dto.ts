import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  OPERATION_SEVERITIES,
  OPERATION_STATUSES,
  type OperationSeverity,
  type OperationStatus,
  type PanicCategory,
} from '@ori-os/core';

const PANIC_CATEGORIES: PanicCategory[] = [
  'safety',
  'missing_worker',
  'serious_conflict',
  'accommodation_transport',
  'documentation',
  'client_escalation',
  'payroll',
  'personal_overload',
  'operational',
];

export class OperationsListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(OPERATION_STATUSES)
  status?: OperationStatus;

  @IsOptional()
  @IsIn(OPERATION_SEVERITIES)
  severity?: OperationSeverity;
}

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsIn(OPERATION_SEVERITIES)
  severity?: OperationSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;
}

export class UpdateIncidentDto {
  @IsOptional()
  @IsIn(OPERATION_STATUSES)
  status?: OperationStatus;

  @IsOptional()
  @IsIn(OPERATION_SEVERITIES)
  severity?: OperationSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

export class CreateOperationsTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsIn(OPERATION_SEVERITIES)
  priority?: OperationSeverity;

  @IsOptional()
  @IsString()
  incidentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;
}

export class CreateCommitmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsDateString()
  dueAt!: string;

  @IsOptional()
  @IsString()
  incidentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;
}

export class CreateApprovalRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  actionType!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  summary!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  incidentId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;
}

export class ApprovalListQueryDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'expired'])
  status?: 'pending' | 'approved' | 'rejected' | 'expired';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 25;
}

export class DecideApprovalRequestDto {
  @IsIn(['approved', 'rejected'])
  decision!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class ActivatePanicProtocolDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsIn(PANIC_CATEGORIES)
  category!: PanicCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unknowns?: string[];

  @IsOptional()
  @IsString()
  incidentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;
}

export class CreateWorkLogDto {
  @IsDateString()
  startedAt!: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  minutes!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(24 * 60)
  travelMinutes?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  outsideHours?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;
}
