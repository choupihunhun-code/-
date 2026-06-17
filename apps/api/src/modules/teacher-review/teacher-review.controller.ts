import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BatchPublishTeacherReviewDto } from './dto/batch-publish-teacher-review.dto';
import { PublishTeacherReviewDto } from './dto/publish-teacher-review.dto';
import { ReturnSubmissionDto } from './dto/return-submission.dto';
import { SaveTeacherReviewDto } from './dto/save-teacher-review.dto';
import { TeacherReviewService } from './teacher-review.service';

@Roles('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TeacherReviewController {
  constructor(private readonly teacherReviewService: TeacherReviewService) {}

  @Get('assignments/:assignmentId/review-workbench')
  getWorkbench(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.teacherReviewService.getWorkbench(user.sub, assignmentId);
  }

  @Get('submissions/:submissionId/review')
  getSubmissionReview(
    @CurrentUser() user: CurrentUserPayload,
    @Param('submissionId') submissionId: string,
  ) {
    return this.teacherReviewService.getSubmissionReview(user.sub, submissionId);
  }

  @Put('submissions/:submissionId/teacher-review')
  saveDraft(
    @CurrentUser() user: CurrentUserPayload,
    @Param('submissionId') submissionId: string,
    @Body() dto: SaveTeacherReviewDto,
  ) {
    return this.teacherReviewService.saveDraft(user.sub, submissionId, dto);
  }

  @Post('submissions/:submissionId/teacher-review/publish')
  publish(
    @CurrentUser() user: CurrentUserPayload,
    @Param('submissionId') submissionId: string,
    @Body() dto: PublishTeacherReviewDto,
  ) {
    return this.teacherReviewService.publish(user.sub, submissionId, dto);
  }

  @Post('submissions/:submissionId/return')
  returnSubmission(
    @CurrentUser() user: CurrentUserPayload,
    @Param('submissionId') submissionId: string,
    @Body() dto: ReturnSubmissionDto,
  ) {
    return this.teacherReviewService.returnSubmission(user.sub, submissionId, dto);
  }

  @Post('assignments/:assignmentId/teacher-reviews/publish-batch')
  publishBatch(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: BatchPublishTeacherReviewDto,
  ) {
    return this.teacherReviewService.publishBatch(user.sub, assignmentId, dto);
  }
}
