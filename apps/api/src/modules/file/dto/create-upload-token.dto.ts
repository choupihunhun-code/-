import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateUploadTokenDto {
  @IsIn(['assignment_attachment', 'submission_attachment', 'export_file'])
  scene!: 'assignment_attachment' | 'submission_attachment' | 'export_file';

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @MaxLength(100)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(50 * 1024 * 1024)
  fileSize!: number;

  @IsOptional()
  @IsString()
  assignmentId?: string;

  @IsOptional()
  @IsString()
  submissionId?: string;
}
