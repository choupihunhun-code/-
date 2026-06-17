import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class StudentSubmitAssignmentDto {
  @IsOptional()
  @IsString()
  submitText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  submitLink?: string;

  @ValidateIf((dto: StudentSubmitAssignmentDto) => !dto.submitText && !dto.submitLink)
  @IsString({ message: '至少需要提交文本、链接或附件' })
  _atLeastOne?: string;
}
