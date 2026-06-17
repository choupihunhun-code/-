import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SaveTeacherReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  finalScore?: number;

  @IsOptional()
  @IsString()
  teacherComment?: string;

  @IsOptional()
  @IsBoolean()
  adoptedAiScore?: boolean;

  @IsOptional()
  @IsBoolean()
  adoptedAiComment?: boolean;

  @IsOptional()
  @IsIn(['draft_saved', 'manual_review', 'pending_review'])
  status?: 'draft_saved' | 'manual_review' | 'pending_review';
}
