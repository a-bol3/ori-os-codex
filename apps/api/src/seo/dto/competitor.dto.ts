import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateCompetitorDto {
  @IsNotEmpty()
  projectId: string;

  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  domain: string;

  @IsOptional()
  description?: string;
}

export class GetCompetitorsDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}

export class CheckCompetitorDto {
  @IsNotEmpty()
  competitorId: string;
}
