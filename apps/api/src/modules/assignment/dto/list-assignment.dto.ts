import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAssignmentDto {
  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'closed', 'archived', 'deleted'])
  status?: 'draft' | 'published' | 'closed' | 'archived' | 'deleted';

  @IsOptional()
  @IsString()
  keyword?: string;

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
