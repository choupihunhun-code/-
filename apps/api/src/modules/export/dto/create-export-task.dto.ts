import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateExportTaskDto {
  @IsOptional()
  @IsIn(['xlsx'])
  exportFormat?: 'xlsx';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];
}
