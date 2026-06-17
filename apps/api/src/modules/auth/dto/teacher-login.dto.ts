import { IsMobilePhone, IsString, Length } from 'class-validator';

export class TeacherLoginDto {
  @IsMobilePhone('zh-CN')
  phone!: string;

  @IsString()
  @Length(6, 6)
  smsCode!: string;
}
