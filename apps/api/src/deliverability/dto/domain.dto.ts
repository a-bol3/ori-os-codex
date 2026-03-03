import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  domain: string;
}

export class UpdateDomainDto {
  @IsOptional()
  @IsString()
  reputationStatus?: string;
}
