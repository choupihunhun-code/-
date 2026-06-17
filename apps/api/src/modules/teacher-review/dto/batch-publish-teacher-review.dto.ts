import { IsArray, IsString } from 'class-validator';

export class BatchPublishTeacherReviewDto {
  @IsArray()
  @IsString({ each: true })
  submissionIds!: string[];
}
