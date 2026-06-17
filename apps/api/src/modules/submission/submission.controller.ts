import {
  Body,
  Controller,
  Get,
  Param,
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
import { ListSubmissionDto } from './dto/list-submission.dto';
import { RemindNotSubmittedDto } from './dto/remind-not-submitted.dto';
import { StudentSubmitAssignmentDto } from './dto/student-submit-assignment.dto';
import { SubmissionService } from './submission.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get('assignments/:assignmentId/submissions')
  @Roles('teacher')
  listByAssignment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
    @Query() query: ListSubmissionDto,
  ) {
    return this.submissionService.listByAssignment(user.sub, assignmentId, query);
  }

  @Get('submissions/:submissionId')
  @Roles('teacher')
  detail(
    @CurrentUser() user: CurrentUserPayload,
    @Param('submissionId') submissionId: string,
  ) {
    return this.submissionService.detailForTeacher(user.sub, submissionId);
  }

  @Post('assignments/:assignmentId/remind-not-submitted')
  @Roles('teacher')
  remindNotSubmitted(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RemindNotSubmittedDto,
  ) {
    return this.submissionService.remindNotSubmitted(user.sub, assignmentId, dto);
  }

  @Post('student/assignments/:assignmentId/submit')
  @Roles('student')
  studentSubmit(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: StudentSubmitAssignmentDto,
  ) {
    return this.submissionService.studentSubmit(user.sub, assignmentId, dto);
  }

  @Get('student/submissions/:submissionId')
  @Roles('student')
  studentSubmissionDetail(
    @CurrentUser() user: CurrentUserPayload,
    @Param('submissionId') submissionId: string,
  ) {
    return this.submissionService.detailForStudent(user.sub, submissionId);
  }
}
