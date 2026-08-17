import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentType, DocumentStatus } from '../../types';

export class UploadDocumentDto {
  @IsEnum(DocumentType, {
    message: 'documentType must be one of: IDENTITY_PROOF, ADDRESS_PROOF, EDUCATION_CERTIFICATE, PHOTOGRAPH, SIGNATURE, INCOME_CERTIFICATE, CATEGORY_CERTIFICATE, OTHER',
  })
  @IsNotEmpty()
  documentType!: DocumentType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;
}

export class DocumentQueryDto {
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}

export class AccessDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  purpose?: string;
}
