import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  classId!: string;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  description!: string;

  @IsDateString()
  dueAt!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['file', 'text', 'link'], { each: true })
  submitModes!: Array<'file' | 'text' | 'link'>;

  @IsIn(['percentage', 'level', 'pass_fail'])
  scoreType!: 'percentage' | 'level' | 'pass_fail';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxScore?: number;

  @IsBoolean()
  aiEnabled!: boolean;

  @ValidateIf((dto: CreateAssignmentDto) => dto.aiEnabled)
  @IsString()
  aiRubric?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  aiCommentStyle?: string;

  @IsOptional()
  @IsBoolean()
  allowLateSubmit?: boolean;
}
