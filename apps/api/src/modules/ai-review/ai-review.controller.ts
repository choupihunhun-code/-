import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AiReviewService } from './ai-review.service';
import { BatchAiReviewDto } from './dto/batch-ai-review.dto';

@Roles('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AiReviewController {
  constructor(private readonly aiReviewService: AiReviewService) {}

  @Post('submissions/:submissionId/ai-review')
  createForSubmission(
    @CurrentUser() user: CurrentUserPayload,
    @Param('submissionId') submissionId: string,
  ) {
    return this.aiReviewService.createForSubmission(user.sub, submissionId);
  }

  @Post('assignments/:assignmentId/ai-reviews/batch')
  batchCreate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: BatchAiReviewDto,
  ) {
    return this.aiReviewService.batchCreate(user.sub, assignmentId, dto);
  }

  @Get('ai-reviews/:aiReviewId')
  detail(
    @CurrentUser() user: CurrentUserPayload,
    @Param('aiReviewId') aiReviewId: string,
  ) {
    return this.aiReviewService.detail(user.sub, aiReviewId);
  }

  @Post('ai-reviews/:aiReviewId/regenerate')
  regenerate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('aiReviewId') aiReviewId: string,
  ) {
    return this.aiReviewService.regenerate(user.sub, aiReviewId);
  }

  @Post('ai-reviews/:aiReviewId/manual-required')
  markManualRequired(
    @CurrentUser() user: CurrentUserPayload,
    @Param('aiReviewId') aiReviewId: string,
  ) {
    return this.aiReviewService.markManualRequired(user.sub, aiReviewId);
  }
}
