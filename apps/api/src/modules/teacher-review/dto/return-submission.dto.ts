import { IsString, MaxLength } from 'class-validator';

export class ReturnSubmissionDto {
  @IsString()
  @MaxLength(1000)
  returnReason!: string;
}
