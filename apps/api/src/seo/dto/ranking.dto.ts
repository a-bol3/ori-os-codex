import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';

export class CheckRankingsDto {
  @IsNotEmpty()
  projectId: string;

  @IsOptional()
  @IsArray()
  keywordIds?: string[];
}

export class GetRankingsDto {
  @IsOptional()
  @IsArray()
  keywordIds?: string[];

  @IsOptional()
  @IsNumber()
  days?: number; // Last N days

  @IsOptional()
  @IsEnum(['desktop', 'mobile'])
  device?: 'desktop' | 'mobile';

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class GetRankingSummaryDto {
  @IsOptional()
  @IsNumber()
  days?: number; // Last N days for comparison
}
