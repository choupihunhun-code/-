import { IsArray, IsOptional, IsString } from 'class-validator';

export class RemindNotSubmittedDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}
