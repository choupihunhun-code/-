import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SendSmsCodeDto } from './dto/send-sms-code.dto';
import { StudentDevLoginDto } from './dto/student-dev-login.dto';
import { TeacherLoginDto } from './dto/teacher-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  sendSmsCode(_dto: SendSmsCodeDto) {
    return {
      cooldownSeconds: 60,
      devCode: '123456',
    };
  }

  async teacherLogin(dto: TeacherLoginDto) {
    if (dto.smsCode !== '123456') {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    const teacher = await this.prisma.teacher.upsert({
      where: { phone: dto.phone },
      update: {},
      create: {
        phone: dto.phone,
        name: '新教师',
      },
    });

    const token = this.jwtService.sign({
      sub: teacher.id,
      role: 'teacher',
    });

    return {
      token,
      teacher,
    };
  }

  async studentDevLogin(dto: StudentDevLoginDto) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        studentNo: dto.studentNo,
      },
    });
    if (!student) {
      throw new UnauthorizedException('学生不存在');
    }

    const token = this.jwtService.sign({
      sub: student.id,
      role: 'student',
    });

    return {
      token,
      student,
      note: '开发期学生登录接口，仅用于 MVP 联调。',
    };
  }
}
