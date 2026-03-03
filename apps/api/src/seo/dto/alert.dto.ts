import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateAlertDto {
  @IsNotEmpty()
  projectId: string;

  @IsEnum([
    'rank_drop',
    'rank_gain',
    'new_issue',
    'backlink_lost',
    'competitor_change',
  ])
  @IsNotEmpty()
  type:
    | 'rank_drop'
    | 'rank_gain'
    | 'new_issue'
    | 'backlink_lost'
    | 'competitor_change';

  @IsEnum(['critical', 'warning', 'info'])
  @IsNotEmpty()
  severity: 'critical' | 'warning' | 'info';

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  message: string;

  @IsOptional()
  metadata?: any;
}

export class UpdateAlertDto {
  @IsOptional()
  @IsEnum(['read', 'unread', 'dismissed'])
  status?: 'read' | 'unread' | 'dismissed';
}

export class GetAlertsDto {
  @IsOptional()
  @IsEnum(['read', 'unread', 'dismissed'])
  status?: 'read' | 'unread' | 'dismissed';

  @IsOptional()
  @IsEnum(['critical', 'warning', 'info'])
  severity?: 'critical' | 'warning' | 'info';

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
