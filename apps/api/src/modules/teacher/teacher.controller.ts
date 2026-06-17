import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { TeacherService } from './teacher.service';

@Roles('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('me')
  getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.teacherService.getMe(user.sub);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateTeacherProfileDto,
  ) {
    return this.teacherService.updateMe(user.sub, dto);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: CurrentUserPayload) {
    return this.teacherService.getDashboard(user.sub);
  }
}
