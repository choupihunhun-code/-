import { IsMobilePhone } from 'class-validator';

export class SendSmsCodeDto {
  @IsMobilePhone('zh-CN')
  phone!: string;
}
