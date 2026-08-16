import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Target Government Service ID or Slug' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty({ description: 'Target Service Capability ID or Slug (e.g. registration / pan-allotment)' })
  @IsString()
  @IsNotEmpty()
  capabilityId!: string;
}

export class UpdateDraftStepDto {
  @ApiProperty({ description: 'Current step in application wizard', example: 'PERSONAL_INFO' })
  @IsString()
  @IsNotEmpty()
  currentStep!: string;
}

export class FieldValueDto {
  @ApiProperty({ description: 'Field requirement key', example: 'fullName' })
  @IsString()
  @IsNotEmpty()
  fieldKey!: string;

  @ApiProperty({ description: 'Field value entered by user or auto-filled', example: 'Rahul Sharma' })
  @IsString()
  fieldValue!: string;
}

export class UpdateFieldsDto {
  @ApiProperty({ description: 'Array of field key-value pairs to update', type: [FieldValueDto] })
  fields!: FieldValueDto[];

  @ApiProperty({ description: 'Optional step advance identifier', required: false })
  @IsString()
  @IsOptional()
  currentStep?: string;
}

export class AutofillRequestDto {
  @ApiProperty({ description: 'List of field keys to auto-fill. If empty, auto-fills all eligible fields', required: false })
  @IsOptional()
  fields?: string[];
}
