import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateIcpProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  criteriaJson: any;

  @IsObject()
  @IsOptional()
  blacklistPersonasJson?: any;

  @IsObject()
  @IsOptional()
  regionsJson?: any;
}

export class UpdateIcpProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  criteriaJson?: any;

  @IsOptional()
  @IsObject()
  blacklistPersonasJson?: any;

  @IsOptional()
  @IsObject()
  regionsJson?: any;
}
