import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListSubmissionDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsIn(['not_submitted', 'submitted', 'late_submitted', 'returned', 'resubmitted'])
  submissionStatus?:
    | 'not_submitted'
    | 'submitted'
    | 'late_submitted'
    | 'returned'
    | 'resubmitted';

  @IsOptional()
  @IsIn(['not_started', 'processing', 'completed', 'failed', 'manual_required'])
  aiStatus?: 'not_started' | 'processing' | 'completed' | 'failed' | 'manual_required';

  @IsOptional()
  @IsIn([
    'unreviewed',
    'pending_review',
    'manual_review',
    'draft_saved',
    'returned',
    'published',
  ])
  reviewStatus?:
    | 'unreviewed'
    | 'pending_review'
    | 'manual_review'
    | 'draft_saved'
    | 'returned'
    | 'published';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
