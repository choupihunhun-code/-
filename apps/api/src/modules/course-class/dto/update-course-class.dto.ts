import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCourseClassDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  courseName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  className?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  term?: string;

  @IsOptional()
  @IsIn(['public', 'major', 'lab', 'other'])
  courseType?: 'public' | 'major' | 'lab' | 'other';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
