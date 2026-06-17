import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchAiReviewDto } from './dto/batch-ai-review.dto';

@Injectable()
export class AiReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createForSubmission(teacherId: string, submissionId: string) {
    const submission = await this.ensureSubmissionOwner(teacherId, submissionId);
    if (submission.status === 'not_submitted') {
      throw new BadRequestException('学生尚未提交，不能进行 AI 初评');
    }
    if (!submission.assignment.aiEnabled) {
      throw new BadRequestException('该作业未启用 AI 初评');
    }

    const result = this.generateMockReview(
      submission.submitText || '',
      submission.assignment.aiRubric || '',
    );

    const aiReview = await this.prisma.aiReview.upsert({
      where: { submissionId },
      update: {
        status: result.status,
        suggestedScore: result.suggestedScore,
        suggestedComment: result.suggestedComment,
        strengths: result.strengths,
        issues: result.issues,
        scoringBasis: result.scoringBasis,
        confidence: result.confidence,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        modelName: 'mock-ai-review',
        promptVersion: 'mock-v1',
        rawInput: {
          rubric: submission.assignment.aiRubric,
          submitText: submission.submitText,
        },
        rawOutput: result,
        startedAt: new Date(),
        completedAt: new Date(),
      },
      create: {
        submissionId,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        status: result.status,
        suggestedScore: result.suggestedScore,
        suggestedComment: result.suggestedComment,
        strengths: result.strengths,
        issues: result.issues,
        scoringBasis: result.scoringBasis,
        confidence: result.confidence,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        modelName: 'mock-ai-review',
        promptVersion: 'mock-v1',
        rawInput: {
          rubric: submission.assignment.aiRubric,
          submitText: submission.submitText,
        },
        rawOutput: result,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    if (aiReview.status === 'completed') {
      await this.prisma.teacherReview.upsert({
        where: { submissionId },
        update: {
          aiReviewId: aiReview.id,
          status: 'pending_review',
        },
        create: {
          submissionId,
          assignmentId: submission.assignmentId,
          studentId: submission.studentId,
          teacherId,
          aiReviewId: aiReview.id,
          status: 'pending_review',
        },
      });
    }

    return aiReview;
  }

  async batchCreate(
    teacherId: string,
    assignmentId: string,
    dto: BatchAiReviewDto,
  ) {
    await this.ensureAssignmentOwner(teacherId, assignmentId);
    const submissions = await this.prisma.submission.findMany({
      where: {
        assignmentId,
        id: dto.submissionIds ? { in: dto.submissionIds } : undefined,
        status: { in: ['submitted', 'late_submitted', 'resubmitted'] },
      },
      select: { id: true },
    });

    const results = [];
    for (const submission of submissions) {
      results.push(await this.createForSubmission(teacherId, submission.id));
    }

    return {
      createdCount: results.length,
      items: results,
    };
  }

  async detail(teacherId: string, aiReviewId: string) {
    const aiReview = await this.prisma.aiReview.findFirst({
      where: {
        id: aiReviewId,
        assignment: { teacherId },
      },
    });
    if (!aiReview) {
      throw new NotFoundException('AI 初评不存在');
    }
    return aiReview;
  }

  async regenerate(teacherId: string, aiReviewId: string) {
    const aiReview = await this.detail(teacherId, aiReviewId);
    return this.createForSubmission(teacherId, aiReview.submissionId);
  }

  async markManualRequired(teacherId: string, aiReviewId: string) {
    const aiReview = await this.detail(teacherId, aiReviewId);
    const updated = await this.prisma.aiReview.update({
      where: { id: aiReview.id },
      data: { status: 'manual_required' },
    });

    await this.prisma.teacherReview.upsert({
      where: { submissionId: aiReview.submissionId },
      update: { status: 'manual_review' },
      create: {
        submissionId: aiReview.submissionId,
        assignmentId: aiReview.assignmentId,
        studentId: aiReview.studentId,
        teacherId,
        aiReviewId: aiReview.id,
        status: 'manual_review',
      },
    });

    return updated;
  }

  private generateMockReview(submitText: string, rubric: string) {
    const textLength = submitText.trim().length;
    if (textLength < 30) {
      return {
        status: 'failed' as const,
        suggestedScore: null,
        suggestedComment: null,
        strengths: null,
        issues: '提交内容过短，无法形成可靠初评。',
        scoringBasis: null,
        confidence: 0,
        errorCode: 'CONTENT_TOO_SHORT',
        errorMessage: '提交内容过短',
      };
    }

    const baseScore = Math.min(92, Math.max(68, Math.round(textLength / 20)));
    return {
      status: 'completed' as const,
      suggestedScore: baseScore,
      suggestedComment:
        '整体完成度较好，结构基本清晰。建议进一步补充论证细节，并检查引用格式是否统一。',
      strengths: '观点较明确，能够围绕作业主题展开。',
      issues: '部分论证略显概括，结论部分可以更充分。',
      scoringBasis: rubric || '根据作业说明、内容完整性、论证逻辑和表达规范综合判断。',
      confidence: 0.72,
      errorCode: null,
      errorMessage: null,
    };
  }

  private async ensureSubmissionOwner(teacherId: string, submissionId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        assignment: { teacherId },
      },
      include: {
        assignment: true,
      },
    });
    if (!submission) {
      throw new NotFoundException('提交记录不存在');
    }
    return submission;
  }

  private async ensureAssignmentOwner(teacherId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, teacherId },
    });
    if (!assignment) {
      throw new NotFoundException('作业不存在');
    }
    return assignment;
  }
}
