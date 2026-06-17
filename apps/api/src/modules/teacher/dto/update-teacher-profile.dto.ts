import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeacherProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  schoolName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departmentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  defaultAiCommentStyle?: string;
}
