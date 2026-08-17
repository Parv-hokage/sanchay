import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { KnowledgeSourceType, AuthorityLevel } from '../../types';

export class KnowledgeSearchDto {
  @IsString()
  @IsNotEmpty({ message: 'Search query is required' })
  @MaxLength(500)
  query!: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsEnum(KnowledgeSourceType)
  @IsNotEmpty()
  sourceType!: KnowledgeSourceType;

  @IsOptional()
  @IsEnum(AuthorityLevel)
  authorityLevel?: AuthorityLevel = AuthorityLevel.TIER_1_OFFICIAL_GOV;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
