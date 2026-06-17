import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendSmsCodeDto } from './dto/send-sms-code.dto';
import { StudentDevLoginDto } from './dto/student-dev-login.dto';
import { TeacherLoginDto } from './dto/teacher-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sms-code')
  sendSmsCode(@Body() dto: SendSmsCodeDto) {
    return this.authService.sendSmsCode(dto);
  }

  @Post('teacher/login')
  teacherLogin(@Body() dto: TeacherLoginDto) {
    return this.authService.teacherLogin(dto);
  }

  @Post('student/dev-login')
  studentDevLogin(@Body() dto: StudentDevLoginDto) {
    return this.authService.studentDevLogin(dto);
  }
}
