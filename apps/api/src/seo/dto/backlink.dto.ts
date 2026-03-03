import {
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateBacklinkDto {
  @IsNotEmpty()
  projectId: string;

  @IsUrl()
  @IsNotEmpty()
  sourceUrl: string;

  @IsUrl()
  @IsNotEmpty()
  targetUrl: string;

  @IsOptional()
  @IsEnum(['dofollow', 'nofollow'])
  linkType?: 'dofollow' | 'nofollow';

  @IsOptional()
  @IsNumber()
  domainAuthority?: number;

  @IsOptional()
  anchorText?: string;
}

export class UpdateBacklinkDto {
  @IsOptional()
  @IsEnum(['active', 'lost', 'broken'])
  status?: 'active' | 'lost' | 'broken';

  @IsOptional()
  @IsNumber()
  domainAuthority?: number;
}

export class GetBacklinksDto {
  @IsOptional()
  @IsEnum(['active', 'lost', 'broken'])
  status?: 'active' | 'lost' | 'broken';

  @IsOptional()
  @IsEnum(['dofollow', 'nofollow'])
  linkType?: 'dofollow' | 'nofollow';

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
