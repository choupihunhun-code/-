import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class PublishTeacherReviewDto {
  @IsNumber()
  @Min(0)
  @Max(1000)
  finalScore!: number;

  @IsOptional()
  @IsString()
  teacherComment?: string;
}
