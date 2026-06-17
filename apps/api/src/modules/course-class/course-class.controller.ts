import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CourseClassService } from './course-class.service';
import { CreateCourseClassDto } from './dto/create-course-class.dto';
import { ImportStudentsDto } from './dto/import-students.dto';
import { ListCourseClassDto } from './dto/list-course-class.dto';
import { UpdateCourseClassDto } from './dto/update-course-class.dto';

@Roles('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-classes')
export class CourseClassController {
  constructor(private readonly courseClassService: CourseClassService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload, @Query() query: ListCourseClassDto) {
    return this.courseClassService.list(user.sub, query);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCourseClassDto,
  ) {
    return this.courseClassService.create(user.sub, dto);
  }

  @Get(':classId')
  detail(@CurrentUser() user: CurrentUserPayload, @Param('classId') classId: string) {
    return this.courseClassService.detail(user.sub, classId);
  }

  @Patch(':classId')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('classId') classId: string,
    @Body() dto: UpdateCourseClassDto,
  ) {
    return this.courseClassService.update(user.sub, classId, dto);
  }

  @Post(':classId/archive')
  archive(
    @CurrentUser() user: CurrentUserPayload,
    @Param('classId') classId: string,
  ) {
    return this.courseClassService.archive(user.sub, classId);
  }

  @Get(':classId/students')
  listStudents(
    @CurrentUser() user: CurrentUserPayload,
    @Param('classId') classId: string,
  ) {
    return this.courseClassService.listStudents(user.sub, classId);
  }

  @Post(':classId/students/import-json')
  importStudentsJson(
    @CurrentUser() user: CurrentUserPayload,
    @Param('classId') classId: string,
    @Body() dto: ImportStudentsDto,
  ) {
    return this.courseClassService.importStudentsJson(user.sub, classId, dto);
  }
}
