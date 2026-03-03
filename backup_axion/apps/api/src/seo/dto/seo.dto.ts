import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateSEOProjectDto {
    @IsString()
    name: string;

    @IsString()
    @IsUrl()
    domain: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateSEOProjectDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsUrl()
    @IsOptional()
    domain?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateSEOKeywordDto {
    @IsString()
    keyword: string;

    @IsString()
    @IsOptional()
    @IsUrl()
    targetUrl?: string;
}
