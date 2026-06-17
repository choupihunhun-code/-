import { IsArray, IsOptional, IsString } from 'class-validator';

export class BatchAiReviewDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  submissionIds?: string[];
}
