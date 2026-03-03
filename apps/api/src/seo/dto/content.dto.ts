import { IsNotEmpty, IsOptional, IsUrl, IsString } from 'class-validator';

export class AnalyzeContentDto {
  @IsNotEmpty()
  projectId: string;

  @IsUrl()
  @IsNotEmpty()
  pageUrl: string;

  @IsString()
  @IsNotEmpty()
  targetKeyword: string;

  @IsOptional()
  includeCompetitors?: boolean;
}

export class GetContentAnalysesDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
