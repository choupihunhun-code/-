import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportStudentItemDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsString()
  @MaxLength(50)
  studentNo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayClassName?: string;
}

export class ImportStudentsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportStudentItemDto)
  students!: ImportStudentItemDto[];
}
