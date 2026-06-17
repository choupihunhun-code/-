import { IsOptional, IsString } from 'class-validator';

export class StudentDevLoginDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  studentNo?: string;
}
