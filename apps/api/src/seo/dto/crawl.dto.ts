import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class StartCrawlDto {
  @IsNotEmpty()
  projectId: string;

  @IsOptional()
  @IsNumber()
  maxPages?: number;
}

export class UpdateIssueDto {
  @IsEnum(['open', 'acknowledged', 'fixed', 'ignored'])
  status: 'open' | 'acknowledged' | 'fixed' | 'ignored';
}

export class GetCrawlsDto {
  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsEnum(['pending', 'running', 'completed', 'failed'])
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export class GetIssuesDto {
  @IsOptional()
  @IsEnum(['critical', 'warning', 'info'])
  severity?: 'critical' | 'warning' | 'info';

  @IsOptional()
  @IsEnum(['meta', 'links', 'images', 'performance', 'mobile', 'schema'])
  category?: 'meta' | 'links' | 'images' | 'performance' | 'mobile' | 'schema';

  @IsOptional()
  @IsEnum(['open', 'acknowledged', 'fixed', 'ignored'])
  status?: 'open' | 'acknowledged' | 'fixed' | 'ignored';

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class GetPagesDto {
  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @IsOptional()
  @IsBoolean()
  hasIssues?: boolean;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
